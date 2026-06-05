import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ArticleStatus } from "@/generated/prisma";
import { ArrowRight } from "lucide-react";

export const revalidate = 3600;

export default async function HomePage() {
  const modules = await prisma.module.findMany({
    where: { topics: { some: { articles: { some: { status: ArticleStatus.PUBLISHED } } } } },
    orderBy: { order: "asc" },
    include: {
      topics: {
        where: { articles: { some: { status: ArticleStatus.PUBLISHED } } },
        orderBy: { order: "asc" },
        include: {
          articles: {
            where: { status: ArticleStatus.PUBLISHED },
            orderBy: [{ level: "asc" }, { order: "asc" }],
            select: { slug: true },
          },
        },
      },
    },
  });

  const essayCount = modules.reduce(
    (n, m) => n + m.topics.reduce((t, topic) => t + topic.articles.length, 0),
    0,
  );
  const firstSlug =
    modules[0]?.topics[0]?.articles[0]?.slug ?? "";

  return (
    <div className="min-h-screen">
      {/* Frontispiece — hardcover title page */}
      <section className="relative px-6 md:px-12 pt-20 md:pt-32 pb-20 md:pb-24 max-w-3xl mx-auto text-center bloom">
        <div className="eyebrow mb-7" style={{ ["--i" as string]: 0 }}>
          <span className="text-[color:var(--ink-blue)] mr-2">§</span>
          Volume I · MMXXVI
        </div>

        <h1
          className="font-display text-[clamp(2.5rem,7vw,5rem)] leading-[1.04] font-medium text-[color:var(--ink)]"
          style={{ ["--i" as string]: 1 }}
        >
          Data Structures
          <br />
          &amp; Algorithms
        </h1>

        <div
          className="mt-4 font-display text-[clamp(1.4rem,3vw,2rem)] italic text-[color:var(--ink-blue)]"
          style={{
            ["--i" as string]: 2,
            fontVariationSettings: '"SOFT" 50, "WONK" 1',
          }}
        >
          — annotated —
        </div>

        <div
          className="mt-10 max-w-md mx-auto rule-section with-ornament"
          style={{ ["--i" as string]: 3 }}
        />

        <p
          className="mt-9 text-[0.78rem] font-mono uppercase tracking-[0.18em] text-[color:var(--pencil)]"
          style={{ ["--i" as string]: 4 }}
        >
          Drawn from CLRS · Sedgewick &amp; Wayne · Laaksonen
        </p>

        <div
          className="mt-12 flex flex-wrap items-center justify-center gap-3"
          style={{ ["--i" as string]: 5 }}
        >
          {firstSlug && (
            <Link href={`/learn/${firstSlug}`} className="btn-ink">
              Open to the first essay
              <ArrowRight className="h-4 w-4" />
            </Link>
          )}
          <Link href="/learn" className="btn-ghost">
            Browse the manuscript
          </Link>
        </div>
      </section>

      {/* Contents — table of contents in printed-index style */}
      <section className="relative px-6 md:px-12 pb-24 max-w-3xl mx-auto bloom">
        <div className="text-center mb-10" style={{ ["--i" as string]: 0 }}>
          <div className="eyebrow mb-3">Contents</div>
          <p className="text-[0.82rem] font-pencil text-[color:var(--pencil)]">
            {numberWord(modules.length)} modules · {numberWord(essayCount)} essays
          </p>
        </div>

        <ol className="border-t border-[color:var(--rule-strong)]">
          {modules.map((m, i) => {
            const count = m.topics.reduce((t, topic) => t + topic.articles.length, 0);
            return (
              <li key={m.id} style={{ ["--i" as string]: i + 1 }}>
                <Link
                  href={`/learn#mod-${m.slug}`}
                  className="group grid grid-cols-[2.5rem_1fr_auto] items-baseline gap-4 py-4 border-b border-[color:var(--rule)] transition-colors hover:bg-[color:var(--ink-blue-wash)]"
                >
                  <span className="font-mono text-[0.78rem] tabular-nums text-[color:var(--pencil)] group-hover:text-[color:var(--ink-blue)] transition-colors">
                    {String(m.order).padStart(2, "0")}
                  </span>
                  <span className="toc-row min-w-0">
                    <span className="font-display text-[1.05rem] text-[color:var(--ink)] group-hover:text-[color:var(--ink-blue)] transition-colors">
                      {m.name}
                    </span>
                    <span aria-hidden className="toc-leader" />
                  </span>
                  <span className="font-mono text-[0.74rem] tabular-nums text-[color:var(--pencil)] whitespace-nowrap">
                    {count} {count === 1 ? "essay" : "essays"}
                  </span>
                </Link>
              </li>
            );
          })}
        </ol>

        <div className="mt-10 text-center">
          <Link
            href="/roadmap"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[color:var(--ink-blue)] link-quill"
          >
            Study the full roadmap
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </section>
    </div>
  );
}

/**
 * Spell out small counts manuscript-style ("Sixteen modules" reads more
 * like print than "16 modules" on the colophon line). Falls back to digits
 * past twenty.
 */
function numberWord(n: number): string {
  const words = [
    "Zero", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
    "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen",
    "Seventeen", "Eighteen", "Nineteen", "Twenty",
    "Twenty-one", "Twenty-two", "Twenty-three", "Twenty-four", "Twenty-five",
    "Twenty-six", "Twenty-seven", "Twenty-eight", "Twenty-nine", "Thirty",
    "Thirty-one", "Thirty-two", "Thirty-three", "Thirty-four", "Thirty-five",
  ];
  return words[n] ?? String(n);
}
