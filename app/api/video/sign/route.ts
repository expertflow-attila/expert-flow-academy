import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { signStreamToken, streamIframeUrl, streamManifestUrl } from "@/lib/cloudflare-stream";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const session = await auth();
  const body = await req.json().catch(() => ({}));
  const lessonId = (body?.lesson_id as string) ?? null;
  if (!lessonId) {
    return NextResponse.json({ error: "lesson_id kötelező" }, { status: 400 });
  }

  const { data: lesson, error } = await supabaseAdmin
    .from("course_lessons")
    .select("id, is_preview, cloudflare_stream_uid, module_id, course_modules(course_id)")
    .eq("id", lessonId)
    .maybeSingle();
  if (error || !lesson || !lesson.cloudflare_stream_uid) {
    return NextResponse.json({ error: "Videó nem található" }, { status: 404 });
  }

  const courseId = (lesson.course_modules as unknown as { course_id: string } | null)?.course_id;
  if (!courseId) {
    return NextResponse.json({ error: "Course id hiányzik" }, { status: 500 });
  }

  // Access check: member OR preview lesson
  if (!lesson.is_preview) {
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Belépés szükséges" }, { status: 401 });
    }
    const { data: m } = await supabaseAdmin
      .from("memberships")
      .select("id")
      .eq("user_id", session.user.id)
      .eq("course_id", courseId)
      .maybeSingle();
    if (!m) return NextResponse.json({ error: "Nincs hozzáférés" }, { status: 403 });
  }

  try {
    const token = await signStreamToken({ videoUid: lesson.cloudflare_stream_uid });
    return NextResponse.json({
      token,
      manifestUrl: streamManifestUrl(token),
      iframeUrl: streamIframeUrl(token),
      expiresIn: 4 * 60 * 60,
    });
  } catch (err) {
    return NextResponse.json(
      { error: `Token aláírás hiba: ${(err as Error).message}` },
      { status: 500 },
    );
  }
}
