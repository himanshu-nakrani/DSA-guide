"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@/generated/prisma";
import { getCurrentUser } from "@/lib/auth";
import { BOOKMARK_LIST_NAME } from "@/lib/lists";
import { publicProblemWhere } from "@/lib/publication";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rate-limit";

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.slice(0, 4096).trim() : "";
}

function safeReturnPath(value: string) {
  if (!value || value.length > 512 || !value.startsWith("/") || value.startsWith("//") || value.includes("\\")) {
    return null;
  }
  return value;
}

async function getProblemId(slug: string) {
  const problem = await prisma.problem.findFirst({
    where: publicProblemWhere(slug),
    select: { id: true },
  });
  return problem?.id ?? null;
}

function revalidateListSurfaces(returnTo: string) {
  revalidatePath("/lists");
  revalidatePath("/dashboard");
  revalidatePath("/problems");
  const safePath = safeReturnPath(returnTo);
  if (safePath) revalidatePath(safePath);
}

function rateLimitFormData(userId: string) {
  const formData = new FormData();
  formData.append("userId", userId);
  return formData;
}

async function serializable<T>(operation: (tx: Prisma.TransactionClient) => Promise<T>): Promise<T> {
  const retryCount = 3;
  for (let attempt = 0; attempt < retryCount; attempt += 1) {
    try {
      return await prisma.$transaction(operation, {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      });
    } catch (error) {
      const retryable = error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2034";
      if (!retryable || attempt === retryCount - 1) throw error;
    }
  }
  throw new Error("Serializable transaction retry limit reached.");
}

async function nextListOrder(tx: Prisma.TransactionClient, listId: string) {
  const last = await tx.customListItem.findFirst({
    where: { listId },
    orderBy: { order: "desc" },
    select: { order: true },
  });
  return (last?.order ?? 0) + 1;
}

export async function createListAction(
  formData: FormData,
): Promise<{ ok: boolean }> {
  const user = await getCurrentUser();
  if (!user) return { ok: false };

  const rateLimit = await checkRateLimit("list_mutate", rateLimitFormData(user.id));
  if (rateLimit.limited) return { ok: false };

  const name = getString(formData, "name");
  const description = getString(formData, "description");
  if (!name || name.length > 255 || description.length > 1024) return { ok: false };

  // A duplicate submission becomes a no-op rather than surfacing a unique-key error.
  await prisma.customList.upsert({
    where: { userId_name: { userId: user.id, name } },
    update: {},
    create: {
      userId: user.id,
      name,
      description: description || null,
    },
  });

  revalidatePath("/lists");
  return { ok: true };
}

export async function toggleBookmarkAction(
  formData: FormData,
): Promise<{ ok: true; saved: boolean } | { ok: false }> {
  const user = await getCurrentUser();
  if (!user) return { ok: false };

  const rateLimit = await checkRateLimit("bookmark", rateLimitFormData(user.id));
  if (rateLimit.limited) return { ok: false };

  const problemSlug = getString(formData, "problemSlug");
  const returnTo = getString(formData, "returnTo");
  const problemId = await getProblemId(problemSlug);
  if (!problemId) return { ok: false };

  let saved = false;
  await serializable(async (tx) => {
    const list = await tx.customList.upsert({
      where: { userId_name: { userId: user.id, name: BOOKMARK_LIST_NAME } },
      update: {},
      create: {
        userId: user.id,
        name: BOOKMARK_LIST_NAME,
        description: "Problems you want to revisit.",
      },
    });
    const existing = await tx.customListItem.findUnique({
      where: { listId_problemId: { listId: list.id, problemId } },
      select: { id: true },
    });

    if (existing) {
      await tx.customListItem.delete({ where: { id: existing.id } });
      saved = false;
      return;
    }

    await tx.customListItem.create({
      data: {
        listId: list.id,
        problemId,
        order: await nextListOrder(tx, list.id),
      },
    });
    saved = true;
  });

  revalidateListSurfaces(returnTo);
  return { ok: true, saved };
}

export async function addProblemToListAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) return;

  const rateLimit = await checkRateLimit("list_mutate", rateLimitFormData(user.id));
  if (rateLimit.limited) return;

  const listId = getString(formData, "listId");
  const problemSlug = getString(formData, "problemSlug");
  const returnTo = getString(formData, "returnTo");
  const problemId = await getProblemId(problemSlug);
  if (!listId || !problemId) return;

  await serializable(async (tx) => {
    const list = await tx.customList.findFirst({
      where: { id: listId, userId: user.id },
      select: { id: true },
    });
    if (!list) return;

    const existing = await tx.customListItem.findUnique({
      where: { listId_problemId: { listId, problemId } },
      select: { id: true },
    });
    if (existing) return;

    await tx.customListItem.create({
      data: {
        listId,
        problemId,
        order: await nextListOrder(tx, listId),
      },
    });
  });

  revalidateListSurfaces(returnTo);
}

export async function renameListAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) return;

  const listId = getString(formData, "listId");
  const name = getString(formData, "name");
  const description = getString(formData, "description");
  if (!listId || !name) return;

  const list = await prisma.customList.findFirst({
    where: { id: listId, userId: user.id },
    select: { id: true, name: true },
  });
  if (!list) return;

  await prisma.customList.update({
    where: { id: listId },
    data: {
      name,
      description: description || null,
    },
  });

  revalidatePath("/lists");
}

export async function deleteListAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) return;

  const listId = getString(formData, "listId");
  if (!listId) return;

  const list = await prisma.customList.findFirst({
    where: { id: listId, userId: user.id },
    select: { id: true, name: true },
  });
  // The bookmark list is structural — it can be emptied but not deleted.
  if (!list || list.name === BOOKMARK_LIST_NAME) return;

  await prisma.customList.delete({ where: { id: listId } });

  revalidatePath("/lists");
}

export async function removeProblemFromListAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) return;

  const rateLimit = await checkRateLimit("list_mutate", rateLimitFormData(user.id));
  if (rateLimit.limited) return;

  const listId = getString(formData, "listId");
  const problemSlug = getString(formData, "problemSlug");
  const returnTo = getString(formData, "returnTo");
  const problemId = await getProblemId(problemSlug);
  if (!listId || !problemId) return;

  await serializable(async (tx) => {
    const list = await tx.customList.findFirst({
      where: { id: listId, userId: user.id },
      select: { id: true },
    });
    if (!list) return;

    await tx.customListItem.deleteMany({ where: { listId, problemId } });
  });

  revalidateListSurfaces(returnTo);
}

function getStringList(formData: FormData, key: string) {
  return formData
    .getAll(key)
    .filter((value): value is string => typeof value === "string")
    .map((value) => value.slice(0, 256).trim())
    .filter(Boolean)
    .slice(0, 100);
}

export async function bulkRemoveFromListAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) return;

  const rateLimit = await checkRateLimit("list_mutate", rateLimitFormData(user.id));
  if (rateLimit.limited) return;

  const listId = getString(formData, "listId");
  const returnTo = getString(formData, "returnTo");
  const problemIds = getStringList(formData, "problemIds");
  if (!listId || problemIds.length === 0) return;

  const list = await prisma.customList.findFirst({
    where: { id: listId, userId: user.id },
    select: { id: true },
  });
  if (!list) return;

  await prisma.customListItem.deleteMany({
    where: { listId, problemId: { in: problemIds } },
  });

  revalidateListSurfaces(returnTo);
}

export async function bulkMoveToListAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) return;

  const rateLimit = await checkRateLimit("list_mutate", rateLimitFormData(user.id));
  if (rateLimit.limited) return;

  const fromListId = getString(formData, "fromListId");
  const toListId = getString(formData, "toListId");
  const returnTo = getString(formData, "returnTo");
  const problemIds = getStringList(formData, "problemIds");
  if (!fromListId || !toListId || fromListId === toListId || problemIds.length === 0) return;

  await serializable(async (tx) => {
    const owned = await tx.customList.findMany({
      where: { id: { in: [fromListId, toListId] }, userId: user.id },
      select: { id: true },
    });
    if (owned.length !== 2) return;

    await tx.customListItem.deleteMany({
      where: { listId: fromListId, problemId: { in: problemIds } },
    });

    for (const problemId of problemIds) {
      const existing = await tx.customListItem.findUnique({
        where: { listId_problemId: { listId: toListId, problemId } },
        select: { id: true },
      });
      if (existing) continue;
      await tx.customListItem.create({
        data: {
          listId: toListId,
          problemId,
          order: await nextListOrder(tx, toListId),
        },
      });
    }
  });

  revalidateListSurfaces(returnTo);
}

export async function toggleListPublicAction(
  formData: FormData,
): Promise<{ isPublic: boolean } | undefined> {
  const user = await getCurrentUser();
  if (!user) return undefined;

  const listId = getString(formData, "listId");
  if (!listId) return undefined;

  const list = await prisma.customList.findFirst({
    where: { id: listId, userId: user.id },
    select: { id: true, isPublic: true },
  });
  if (!list) return undefined;

  const updated = await prisma.customList.update({
    where: { id: listId },
    data: { isPublic: !list.isPublic },
    select: { isPublic: true },
  });

  revalidatePath("/lists");
  return { isPublic: updated.isPublic };
}
