import { NextResponse } from "next/server";
import { ProgressStatus } from "@/generated/prisma";
import { getCurrentUser } from "@/lib/auth";
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
  if (!Object.values(ProgressStatus).includes(body.status)) {
    return NextResponse.json({ error: "Invalid status." }, { status: 400 });
  }

  const rateLimit = await checkRateLimit("progress", {
    get: (key: string) => (key === "slug" ? body.slug : null),
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

  const problem = await prisma.problem.findUnique({
    where: { slug: body.slug },
    select: { id: true },
  });
  if (!problem) {
    return NextResponse.json({ error: "Problem not found." }, { status: 404 });
  }

  await prisma.userProblemProgress.upsert({
    where: {
      userId_problemId: {
        userId: user.id,
        problemId: problem.id,
      },
    },
    update: {
      status: body.status,
      attempts:
        body.status === ProgressStatus.NEW
          ? 0
          : {
              increment: 1,
            },
      lastAttemptedAt: body.status === ProgressStatus.NEW ? null : new Date(),
      solvedAt:
        body.status === ProgressStatus.SOLVED || body.status === ProgressStatus.MASTERED
          ? new Date()
          : null,
    },
    create: {
      userId: user.id,
      problemId: problem.id,
      status: body.status,
      attempts: body.status === ProgressStatus.NEW ? 0 : 1,
      lastAttemptedAt: body.status === ProgressStatus.NEW ? null : new Date(),
      solvedAt:
        body.status === ProgressStatus.SOLVED || body.status === ProgressStatus.MASTERED
          ? new Date()
          : null,
    },
  });

  return NextResponse.json({ ok: true });
}
