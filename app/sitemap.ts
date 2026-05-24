import type { MetadataRoute } from "next";
import { unstable_noStore as noStore } from "next/cache";
import { getPublishedCourses } from "@/lib/courses";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const BASE = process.env.NEXTAUTH_URL ?? "https://akademia.expertflow.hu";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  noStore();
  const now = new Date();

  let courses: Awaited<ReturnType<typeof getPublishedCourses>> = [];
  try {
    courses = await getPublishedCourses();
  } catch (err) {
    console.error("[sitemap] getPublishedCourses failed", err);
  }

  const courseEntries: MetadataRoute.Sitemap = courses.map((c) => ({
    url: `${BASE}/courses/${c.slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [
    { url: `${BASE}/`,        lastModified: now, changeFrequency: "monthly", priority: 1.0 },
    { url: `${BASE}/courses`, lastModified: now, changeFrequency: "weekly",  priority: 0.9 },
    { url: `${BASE}/login`,   lastModified: now, changeFrequency: "yearly",  priority: 0.3 },
    ...courseEntries,
  ];
}
