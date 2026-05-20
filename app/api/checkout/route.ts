import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { auth } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const contentType = req.headers.get("content-type") ?? "";
  let courseId: string | null = null;
  if (contentType.includes("application/json")) {
    const body = await req.json().catch(() => ({}));
    courseId = (body?.course_id as string) ?? null;
  } else {
    const form = await req.formData();
    courseId = (form.get("course_id") as string) ?? null;
  }
  if (!courseId) {
    return NextResponse.json({ error: "course_id kötelező" }, { status: 400 });
  }

  const { data: course, error } = await supabaseAdmin
    .from("courses")
    .select("id, slug, title, stripe_price_id, price_huf, published")
    .eq("id", courseId)
    .maybeSingle();

  if (error || !course || !course.published) {
    return NextResponse.json({ error: "Kurzus nem található" }, { status: 404 });
  }
  if (!course.stripe_price_id) {
    return NextResponse.json({ error: "A kurzushoz még nincs Stripe ár" }, { status: 400 });
  }

  const session = await auth();
  const baseUrl =
    process.env.NEXTAUTH_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

  const checkout = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [{ price: course.stripe_price_id, quantity: 1 }],
    success_url: `${baseUrl}/learn/welcome?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}/courses/${course.slug}`,
    customer_email: session?.user?.email ?? undefined,
    locale: "hu",
    metadata: { course_id: course.id, course_slug: course.slug },
    payment_intent_data: {
      metadata: { course_id: course.id },
    },
  });

  if (!checkout.url) {
    return NextResponse.json({ error: "Stripe URL hiányzik" }, { status: 500 });
  }

  return NextResponse.redirect(checkout.url, { status: 303 });
}
