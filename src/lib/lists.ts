import "server-only";

import { cache } from "react";
import { prisma } from "@/lib/prisma";

export const BOOKMARK_LIST_NAME = "Bookmarks";

/**
 * Return the user's bookmark list, creating it if it doesn't exist.
 *
 * The schema declares `@@unique([userId, name])` on `CustomList`, so the
 * compound key (`userId`, `name`) is a stable identity we can upsert on.
 * This avoids the previous check-then-create race where two concurrent
 * bookmark toggles could both observe a missing list and both attempt to
 * create it, producing duplicate "Bookmarks" entries.
 */
export async function getOrCreateBookmarkList(userId: string) {
  return prisma.customList.upsert({
    where: {
      userId_name: {
        userId,
        name: BOOKMARK_LIST_NAME,
      },
    },
    update: {},
    create: {
      userId,
      name: BOOKMARK_LIST_NAME,
      description: "Problems you want to revisit.",
    },
  });
}

/**
 * Per-request memoization: dashboard, problems page, and the problem card
 * bookmark indicator all call this in the same render. Sharing one query
 * keeps a hot page render down to a single round-trip.
 */
export const getBookmarkProblemIds = cache(async (userId: string) => {
  const list = await prisma.customList.findUnique({
    where: {
      userId_name: {
        userId,
        name: BOOKMARK_LIST_NAME,
      },
    },
    select: {
      items: {
        where: { problem: { status: "PUBLISHED" } },
        select: { problemId: true },
      },
    },
  });

  return new Set(list?.items.map((item) => item.problemId) ?? []);
});
