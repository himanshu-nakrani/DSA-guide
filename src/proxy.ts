import { ArticleStatus, ProblemStatus } from "@/generated/prisma";
import { prisma } from "@/lib/prisma";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
/**
 * Some dynamic pages stream their shell before `notFound()` is thrown, which
 * renders the 404 UI but leaves the HTTP status at 200. Check the small
 * published-slug existence query before the page starts streaming so crawlers
 * and clients receive a real 404 response.
 */
export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  const learnMatch = /^\/learn\/([^/]+)\/?$/.exec(pathname);
  if (learnMatch) {
    let slug: string;
    try {
      slug = decodeURIComponent(learnMatch[1]);
    } catch {
      return notFoundResponse();
    }

    const article = await prisma.article.findFirst({
      where: { slug, status: ArticleStatus.PUBLISHED },
      select: { slug: true },
    });

    if (!article) return notFoundResponse();
    return NextResponse.next();
  }
  const problemMatch = /^\/problems\/([^/]+)\/?$/.exec(pathname);
  if (problemMatch) {
    let slug: string;
    try {
      slug = decodeURIComponent(problemMatch[1]);
    } catch {
      return notFoundResponse();
    }

    const problem = await prisma.problem.findFirst({
      where: { slug, status: ProblemStatus.PUBLISHED },
      select: { slug: true },
    });

    if (!problem) return notFoundResponse();
    return NextResponse.next();
  }

  // Public share links resolve only for public lists; anything else is a
  // real 404 (the page itself calls `notFound()`, which would otherwise
  // leave the status at 200 — see above).
  const listMatch = /^\/lists\/([^/]+)\/?$/.exec(pathname);
  if (listMatch) {
    let id: string;
    try {
      id = decodeURIComponent(listMatch[1]);
    } catch {
      return notFoundResponse();
    }

    const list = await prisma.customList.findFirst({
      where: { id, isPublic: true },
      select: { id: true },
    });

    if (!list) return notFoundResponse();
  }
  return NextResponse.next();
}

function notFoundResponse(cacheable = false): Response {
  return new Response("Not Found", {
    status: 404,
    headers: {
      "content-type": "text/plain; charset=utf-8",
      ...(!cacheable ? { "cache-control": "no-store" } : {}),
    },
  });
}

export const config = {
  matcher: ["/learn/:slug", "/lists/:id", "/problems/:slug"],
};
