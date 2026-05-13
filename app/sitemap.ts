import type { MetadataRoute } from "next";

const BASE = "https://expertflow-aios.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: `${BASE}/`,             lastModified: now, changeFrequency: "monthly", priority: 1.0 },
    { url: `${BASE}/szolgaltatas`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE}/araink`,       lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE}/rolam`,        lastModified: now, changeFrequency: "monthly", priority: 0.8 },
  ];
}
