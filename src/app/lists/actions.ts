"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import { getOrCreateBookmarkList } from "@/lib/lists";
import { prisma } from "@/lib/prisma";

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

async function getProblemId(slug: string) {
  const problem = await prisma.problem.findUnique({
    where: { slug },
    select: { id: true },
  });
  return problem?.id ?? null;
}

function revalidateListSurfaces(returnTo: string) {
  revalidatePath("/lists");
  revalidatePath("/dashboard");
  revalidatePath("/problems");
  if (returnTo) revalidatePath(returnTo);
}

export async function createListAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) return;

  const name = getString(formData, "name");
  const description = getString(formData, "description");
  if (!name) return;

  await prisma.customList.create({
    data: {
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

  const problemSlug = getString(formData, "problemSlug");
  const returnTo = getString(formData, "returnTo");
  const problemId = await getProblemId(problemSlug);
  if (!problemId) return;

  const list = await getOrCreateBookmarkList(user.id);
  const existing = await prisma.customListItem.findUnique({
    where: {
      listId_problemId: {
        listId: list.id,
        problemId,
      },
    },
  });

  if (existing) {
    await prisma.customListItem.delete({ where: { id: existing.id } });
  } else {
    const last = await prisma.customListItem.findFirst({
      where: { listId: list.id },
      orderBy: { order: "desc" },
      select: { order: true },
    });
    await prisma.customListItem.create({
      data: {
        listId: list.id,
        problemId,
        order: (last?.order ?? 0) + 1,
      },
    });
  }

  revalidateListSurfaces(returnTo);
}

export async function addProblemToListAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) return;

  const listId = getString(formData, "listId");
  const problemSlug = getString(formData, "problemSlug");
  const returnTo = getString(formData, "returnTo");
  const problemId = await getProblemId(problemSlug);
  if (!listId || !problemId) return;

  const list = await prisma.customList.findFirst({
    where: { id: listId, userId: user.id },
    select: { id: true },
  });
  if (!list) return;

  const last = await prisma.customListItem.findFirst({
    where: { listId },
    orderBy: { order: "desc" },
    select: { order: true },
  });

  await prisma.customListItem.upsert({
    where: {
      listId_problemId: {
        listId,
        problemId,
      },
    },
    update: {},
    create: {
      listId,
      problemId,
      order: (last?.order ?? 0) + 1,
    },
  });

  revalidateListSurfaces(returnTo);
}

export async function removeProblemFromListAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) return;

  const listId = getString(formData, "listId");
  const problemSlug = getString(formData, "problemSlug");
  const returnTo = getString(formData, "returnTo");
  const problemId = await getProblemId(problemSlug);
  if (!listId || !problemId) return;

  const list = await prisma.customList.findFirst({
    where: { id: listId, userId: user.id },
    select: { id: true },
  });
  if (!list) return;

  await prisma.customListItem.deleteMany({
    where: { listId, problemId },
  });

  revalidateListSurfaces(returnTo);
}

