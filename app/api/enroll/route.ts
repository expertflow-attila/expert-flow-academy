import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { enrollNewsletterSubscriber, type EnrollSource } from "@/lib/mailerlite";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Ingyenes (price_huf = 0) kurzusokra szóló önkiszolgáló beiratkozás.
// A magic-link belépés UTÁN hívódik callbackUrl-ként: /api/enroll?course=business-start
// Belépett user kell (session.user.id) → membership upsert Stripe NÉLKÜL →
// MailerLite enroll → redirect a zárt felületre.
//
// Biztonság: csak published ÉS ingyenes (price_huf = 0) kurzusra enged be — fizetős
// kurzusra ezen az úton NEM lehet beiratkozni (az a Stripe checkout + webhook útja marad).

// Mely free-kurzus slug-okhoz tartozik melyik MailerLite forrás-csoport.
const MAILERLITE_SOURCE_BY_SLUG: Record<string, EnrollSource | undefined> = {
  "business-start": "course-business-start",
};

async function enrollFreeCourse(courseSlug: string, req: Request): Promise<NextResponse> {
  const session = await auth();

  // Nincs belépve → magic-link login, utána visszajön ide
  if (!session?.user?.id) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", `/api/enroll?course=${encodeURIComponent(courseSlug)}`);
    return NextResponse.redirect(loginUrl, { status: 303 });
  }

  const { data: course, error: cErr } = await supabaseAdmin
    .from("courses")
    .select("id, slug, price_huf, published")
    .eq("slug", courseSlug)
    .maybeSingle();

  if (cErr || !course || !course.published) {
    return NextResponse.redirect(new URL("/courses", req.url), { status: 303 });
  }

  // Fizetős kurzus NEM mehet az ingyenes úton
  if (course.price_huf && course.price_huf > 0) {
    return NextResponse.redirect(new URL(`/courses/${course.slug}`, req.url), { status: 303 });
  }

  const { error: mErr } = await supabaseAdmin
    .from("memberships")
    .upsert(
      { user_id: session.user.id, course_id: course.id },
      { onConflict: "user_id,course_id" },
    );
  if (mErr) {
    console.error("[enroll] membership upsert hiba", mErr.message);
    return NextResponse.redirect(new URL(`/courses/${course.slug}`, req.url), { status: 303 });
  }

  // MailerLite nurture (best-effort, ne blokkolja a beiratkozást)
  const mlSource = MAILERLITE_SOURCE_BY_SLUG[course.slug];
  if (mlSource && session.user.email) {
    await enrollNewsletterSubscriber({
      email: session.user.email,
      name: session.user.name ?? "",
      source: mlSource,
    }).catch(() => {});
  }

  return NextResponse.redirect(new URL(`/learn/${course.slug}/1`, req.url), { status: 303 });
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const courseSlug = (url.searchParams.get("course") ?? "business-start").trim();
  return enrollFreeCourse(courseSlug, req);
}

export async function POST(req: Request) {
  let courseSlug = "business-start";
  const contentType = req.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    const body = await req.json().catch(() => ({}));
    courseSlug = (body?.course as string)?.trim() || courseSlug;
  } else if (contentType.includes("form")) {
    const form = await req.formData().catch(() => null);
    courseSlug = (form?.get("course") as string)?.trim() || courseSlug;
  }
  return enrollFreeCourse(courseSlug, req);
}
