import "server-only";

import { prisma } from "@/lib/prisma";

export async function getUserReadArticleSlugs(userId: string) {
  const rows = await prisma.userArticleProgress.findMany({
    where: { userId },
    select: { article: { select: { slug: true } } },
  });

  return rows.map((row) => row.article.slug);
}
