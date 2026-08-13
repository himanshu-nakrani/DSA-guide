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

export async function createListAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) return;

  const rateLimit = await checkRateLimit("list_mutate", rateLimitFormData(user.id));
  if (rateLimit.limited) return;

  const name = getString(formData, "name");
  const description = getString(formData, "description");
  if (!name || name.length > 255 || description.length > 1024) return;

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
}

export async function toggleBookmarkAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) return;

  const rateLimit = await checkRateLimit("bookmark", rateLimitFormData(user.id));
  if (rateLimit.limited) return;

  const problemSlug = getString(formData, "problemSlug");
  const returnTo = getString(formData, "returnTo");
  const problemId = await getProblemId(problemSlug);
  if (!problemId) return;

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
      return;
    }

    await tx.customListItem.create({
      data: {
        listId: list.id,
        problemId,
        order: await nextListOrder(tx, list.id),
      },
    });
  });

  revalidateListSurfaces(returnTo);
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
