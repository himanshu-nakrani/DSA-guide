import type { MetadataRoute } from "next";

const SITE = process.env.SITE_URL?.replace(/\/$/, "") || "https://dsa.guide";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${SITE}/sitemap.xml`,
    host: SITE,
  };
}
