import { ArticleStatus } from "@/generated/prisma";
import { prisma } from "@/lib/prisma";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

/**
 * Dynamic article pages can stream their shell before `notFound()` is thrown,
 * which correctly renders the 404 UI but necessarily leaves the HTTP status at
 * 200. Check the small published-slug existence query before the page starts
 * streaming so crawlers and clients receive a real 404 response.
 */
export async function proxy(request: NextRequest) {
  const match = /^\/learn\/([^/]+)\/?$/.exec(request.nextUrl.pathname);
  if (!match) return NextResponse.next();

  let slug: string;
  try {
    slug = decodeURIComponent(match[1]);
  } catch {
    return new Response("Not Found", {
      status: 404,
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  }

  const article = await prisma.article.findFirst({
    where: { slug, status: ArticleStatus.PUBLISHED },
    select: { slug: true },
  });

  if (!article) {
    return new Response("Not Found", {
      status: 404,
      headers: {
        "cache-control": "no-store",
        "content-type": "text/plain; charset=utf-8",
      },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/learn/:slug",
};
