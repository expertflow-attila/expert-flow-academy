import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/" }],
    sitemap: "https://expertflow-aios.vercel.app/sitemap.xml",
    host: "https://expertflow-aios.vercel.app",
  };
}
