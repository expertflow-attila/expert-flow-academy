import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Belépés szükséges" }, { status: 401 });
  }

  const form = await req.formData();
  const lessonId = (form.get("lesson_id") as string) ?? null;
  const redirectTo = (form.get("redirect_to") as string) ?? "/learn";
  if (!lessonId) {
    return NextResponse.json({ error: "lesson_id kötelező" }, { status: 400 });
  }

  // Verify the user has membership for the course containing this lesson
  const { data: lesson, error: lErr } = await supabaseAdmin
    .from("course_lessons")
    .select("id, module_id, course_modules(course_id)")
    .eq("id", lessonId)
    .maybeSingle();
  if (lErr || !lesson) {
    return NextResponse.json({ error: "Lecke nem található" }, { status: 404 });
  }
  const courseId = (lesson.course_modules as unknown as { course_id: string } | null)?.course_id;
  if (!courseId) {
    return NextResponse.json({ error: "Course id hiányzik" }, { status: 500 });
  }

  const { data: membership } = await supabaseAdmin
    .from("memberships")
    .select("id")
    .eq("user_id", session.user.id)
    .eq("course_id", courseId)
    .maybeSingle();
  if (!membership) {
    return NextResponse.json({ error: "Nincs hozzáférés" }, { status: 403 });
  }

  await supabaseAdmin.from("lesson_progress").upsert(
    {
      user_id: session.user.id,
      lesson_id: lessonId,
      completed_at: new Date().toISOString(),
    },
    { onConflict: "user_id,lesson_id" },
  );

  return NextResponse.redirect(new URL(redirectTo, req.url), { status: 303 });
}
