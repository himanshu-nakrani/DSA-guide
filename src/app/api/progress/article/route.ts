import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { checkRateLimit } from "@/lib/rate-limit";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as { slug?: string } | null;
  if (!body?.slug) {
    return NextResponse.json({ error: "Missing article slug." }, { status: 400 });
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

  const article = await prisma.article.findUnique({
    where: { slug: body.slug },
    select: { id: true },
  });
  if (!article) {
    return NextResponse.json({ error: "Article not found." }, { status: 404 });
  }

  await prisma.userArticleProgress.upsert({
    where: {
      userId_articleId: {
        userId: user.id,
        articleId: article.id,
      },
    },
    update: { readAt: new Date() },
    create: {
      userId: user.id,
      articleId: article.id,
    },
  });

  return NextResponse.json({ ok: true });
}
