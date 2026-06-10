import "server-only";

import { prisma } from "@/lib/prisma";

export const BOOKMARK_LIST_NAME = "Bookmarks";

export async function getOrCreateBookmarkList(userId: string) {
  const existing = await prisma.customList.findFirst({
    where: { userId, name: BOOKMARK_LIST_NAME },
  });
  if (existing) return existing;

  return prisma.customList.create({
    data: {
      userId,
      name: BOOKMARK_LIST_NAME,
      description: "Problems you want to revisit.",
    },
  });
}

export async function getBookmarkProblemIds(userId: string) {
  const list = await prisma.customList.findFirst({
    where: { userId, name: BOOKMARK_LIST_NAME },
    select: {
      items: {
        select: { problemId: true },
      },
    },
  });

  return new Set(list?.items.map((item) => item.problemId) ?? []);
}

