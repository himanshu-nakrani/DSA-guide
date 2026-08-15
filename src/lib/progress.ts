import "server-only";

import { cache } from "react";
import { prisma } from "@/lib/prisma";

/**
 * Per-request memoization: within a single server render, multiple components
 * (e.g. `ReadTally`, `ReadBadge`, dashboard) call this with the same `userId`
 * and now share a single Prisma query. Resets at the end of the request.
 */
export const getUserReadArticleSlugs = cache(async (userId: string) => {
  const rows = await prisma.userArticleProgress.findMany({
    where: { userId },
    select: { article: { select: { slug: true } } },
  });

  return rows.map((row) => row.article.slug);
});
