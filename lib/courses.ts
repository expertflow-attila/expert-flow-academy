import { supabaseAdmin, type Course, type CourseLesson, type CourseModule } from "./supabase-admin";

export async function getPublishedCourses(): Promise<Course[]> {
  const { data, error } = await supabaseAdmin
    .from("courses")
    .select("*")
    .eq("published", true)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Course[];
}

export async function getCourseBySlug(slug: string): Promise<Course | null> {
  const { data, error } = await supabaseAdmin
    .from("courses")
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();
  if (error) throw error;
  return (data as Course) ?? null;
}

export async function getCourseModulesWithLessons(courseId: string): Promise<
  Array<CourseModule & { lessons: CourseLesson[] }>
> {
  const { data: modules, error: mErr } = await supabaseAdmin
    .from("course_modules")
    .select("*")
    .eq("course_id", courseId)
    .order("position", { ascending: true });
  if (mErr) throw mErr;

  const ids = (modules ?? []).map((m) => m.id);
  if (ids.length === 0) return [];

  const { data: lessons, error: lErr } = await supabaseAdmin
    .from("course_lessons")
    .select("*")
    .in("module_id", ids)
    .order("position", { ascending: true });
  if (lErr) throw lErr;

  const byModule = new Map<string, CourseLesson[]>();
  for (const l of lessons ?? []) {
    const arr = byModule.get(l.module_id) ?? [];
    arr.push(l as CourseLesson);
    byModule.set(l.module_id, arr);
  }

  return (modules ?? []).map((m) => ({
    ...(m as CourseModule),
    lessons: byModule.get(m.id) ?? [],
  }));
}

export async function userHasMembership(userId: string, courseId: string): Promise<boolean> {
  const { data, error } = await supabaseAdmin
    .from("memberships")
    .select("id")
    .eq("user_id", userId)
    .eq("course_id", courseId)
    .maybeSingle();
  if (error) throw error;
  return Boolean(data);
}

export async function getLessonByPosition(
  courseSlug: string,
  position: number,
): Promise<{ course: Course; lesson: CourseLesson; module: CourseModule } | null> {
  const course = await getCourseBySlug(courseSlug);
  if (!course) return null;

  const modules = await getCourseModulesWithLessons(course.id);
  const flat: Array<{ lesson: CourseLesson; module: CourseModule }> = [];
  for (const m of modules) {
    for (const l of m.lessons) {
      flat.push({ lesson: l, module: m });
    }
  }
  const found = flat[position - 1];
  if (!found) return null;
  return { course, lesson: found.lesson, module: found.module };
}
