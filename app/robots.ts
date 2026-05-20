import type { MetadataRoute } from "next";

const BASE = process.env.NEXTAUTH_URL ?? "https://akademia.solobusiness.hu";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/learn", "/api/"] },
    ],
    sitemap: `${BASE}/sitemap.xml`,
    host: BASE,
  };
}
