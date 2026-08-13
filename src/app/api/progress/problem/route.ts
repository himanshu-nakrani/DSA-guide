import { NextResponse } from "next/server";
import { ProgressStatus } from "@/generated/prisma";
import { getCurrentUser } from "@/lib/auth";
import { transitionProblemProgress } from "@/lib/problem-progress";
import { publicProblemWhere } from "@/lib/publication";
import { checkRateLimit } from "@/lib/rate-limit";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as {
    slug?: string;
    status?: ProgressStatus;
  } | null;

  if (!body?.slug || !body.status) {
    return NextResponse.json({ error: "Missing problem slug or status." }, { status: 400 });
  }

  if (typeof body.slug !== "string" || body.slug.length > 255) {
    return NextResponse.json({ error: "Invalid problem slug." }, { status: 400 });
  }

  if (!Object.values(ProgressStatus).includes(body.status)) {
    return NextResponse.json({ error: "Invalid status." }, { status: 400 });
  }

  const rateLimit = await checkRateLimit("progress", {
    get: (key: string) => (key === "userId" ? user.id : null),
  } as unknown as FormData);
  if (rateLimit.limited) {
    return NextResponse.json(
      { error: "Too many requests." },
      {
        status: 429,
        headers: { "Retry-After": String(rateLimit.retryAfterSeconds) },
      },
    );
  }

  const problem = await prisma.problem.findFirst({
    where: publicProblemWhere(body.slug),
    select: { id: true },
  });
  if (!problem) {
    // Return the same response for unknown and unpublished records so this
    // endpoint cannot be used as a draft-slug existence oracle.
    return NextResponse.json({ error: "Problem not found." }, { status: 404 });
  }

  const progressKey = {
    userId_problemId: {
      userId: user.id,
      problemId: problem.id,
    },
  };
  const existing = await prisma.userProblemProgress.findUnique({
    where: progressKey,
    select: {
      status: true,
      attempts: true,
      solvedAt: true,
      lastAttemptedAt: true,
    },
  });
  const { changed, ...nextProgress } = transitionProblemProgress(existing, body.status);

  if (!existing) {
    await prisma.userProblemProgress.create({
      data: {
        userId: user.id,
        problemId: problem.id,
        ...nextProgress,
      },
    });
  } else if (changed) {
    await prisma.userProblemProgress.update({
      where: progressKey,
      data: nextProgress,
    });
  }

  return NextResponse.json({ ok: true });
}
