import type { MetadataRoute } from "next";
import { getPublishedCourses } from "@/lib/courses";

export const dynamic = "force-dynamic";

const BASE = process.env.NEXTAUTH_URL ?? "https://akademia.solobusiness.hu";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const courses = await getPublishedCourses().catch(() => []);
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
