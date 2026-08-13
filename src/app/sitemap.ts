import type { MetadataRoute } from "next";
import { ArticleStatus, ProblemStatus } from "@/generated/prisma";
import { prisma } from "@/lib/prisma";

const SITE = process.env.SITE_URL?.replace(/\/$/, "") || "https://dsa.guide";

export const revalidate = 86400;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [articles, problems] = await Promise.all([
    prisma.article.findMany({
      where: { status: ArticleStatus.PUBLISHED },
      select: { slug: true, updatedAt: true },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.problem.findMany({
      where: { status: ProblemStatus.PUBLISHED },
      select: { slug: true, updatedAt: true },
      orderBy: { updatedAt: "desc" },
    }),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE}/`, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${SITE}/learn`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE}/roadmap`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE}/problems`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
  ];

  const articleRoutes: MetadataRoute.Sitemap = articles.map((article) => ({
    url: `${SITE}/learn/${article.slug}`,
    lastModified: article.updatedAt,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));
  const problemRoutes: MetadataRoute.Sitemap = problems.map((problem) => ({
    url: `${SITE}/problems/${problem.slug}`,
    lastModified: problem.updatedAt,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [...staticRoutes, ...articleRoutes, ...problemRoutes];
}
