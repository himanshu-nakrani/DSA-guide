import { prisma } from "@/lib/prisma";
import { ArticleStatus } from "@/generated/prisma";

const SITE = process.env.SITE_URL?.replace(/\/$/, "") || "https://dsa.guide";

export const dynamic = "force-dynamic";

/**
 * RSS 2.0 feed for new articles. Standard reader compatibility (Feedly,
 * NetNewsWire, Reeder). Returns the 50 most-recently-updated published
 * articles ordered by updatedAt desc.
 */
export async function GET() {
  const articles = await prisma.article.findMany({
    where: { status: ArticleStatus.PUBLISHED },
    select: {
      slug: true,
      title: true,
      summary: true,
      updatedAt: true,
      createdAt: true,
      topic: { select: { name: true, module: { select: { name: true } } } },
    },
    orderBy: { updatedAt: "desc" },
    take: 50,
  });

  const updated = articles[0]?.updatedAt ?? new Date();

  const items = articles
    .map((a) => {
      const link = `${SITE}/learn/${a.slug}`;
      return [
        "  <item>",
        `    <title>${esc(a.title)}</title>`,
        `    <link>${esc(link)}</link>`,
        `    <guid isPermaLink="true">${esc(link)}</guid>`,
        `    <pubDate>${a.createdAt.toUTCString()}</pubDate>`,
        `    <category>${esc(a.topic.module.name)}</category>`,
        `    <description>${esc(a.summary)}</description>`,
        "  </item>",
      ].join("\n");
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
  <title>DSA Guide — Manuscript Edition</title>
  <link>${esc(SITE)}</link>
  <atom:link href="${esc(SITE)}/feed.xml" rel="self" type="application/rss+xml"/>
  <description>A structured curriculum of data structures and algorithms — drawn from CLRS, Sedgewick &amp; Wayne, and Laaksonen.</description>
  <language>en</language>
  <lastBuildDate>${updated.toUTCString()}</lastBuildDate>
${items}
</channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=600, s-maxage=600",
    },
  });
}

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
