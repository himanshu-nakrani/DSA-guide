import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ArticleStatus, ArticleLevel } from "@/generated/prisma";
import { ArrowRight } from "lucide-react";
import { BFSHero } from "@/components/hero/BFSHero";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [articleCount, moduleCount, firstArticle] = await Promise.all([
    prisma.article.count({ where: { status: ArticleStatus.PUBLISHED } }),
    prisma.module.count(),
    prisma.article.findFirst({
      where: { status: ArticleStatus.PUBLISHED, level: ArticleLevel.FOUNDATION },
      orderBy: [
        { topic: { module: { order: "asc" } } },
        { topic: { order: "asc" } },
        { order: "asc" },
      ],
      select: { slug: true, title: true },
    }),
  ]);

  const startHref = firstArticle ? `/learn/${firstArticle.slug}` : "/learn";

  return (
    <div className="relative min-h-[calc(100vh-1px)] overflow-hidden flex items-center">
      {/* The only ambient element. A single warm wash anchored top-left so the
         hero copy reads with light coming from the gutter. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(40% 60% at 22% 18%, color-mix(in srgb, var(--primary) 16%, transparent), transparent 70%)",
        }}
      />

      <section className="w-full max-w-6xl mx-auto px-6 md:px-12 py-16 lg:py-24 grid lg:grid-cols-[1.1fr_1fr] gap-12 lg:gap-20 items-center">
        {/* Left column — the statement */}
        <div className="bloom max-w-xl">
          <div className="eyebrow mb-6" style={{ ["--i" as string]: 0 }}>
            <span
              aria-hidden
              className="inline-block h-1.5 w-1.5 rounded-full bg-primary mr-2 align-middle"
              style={{
                boxShadow:
                  "0 0 0 4px color-mix(in srgb, var(--primary) 18%, transparent)",
              }}
            />
            Open curriculum · {articleCount} essays · {moduleCount} modules
          </div>

          <h1
            className="font-display text-[clamp(2.75rem,6.5vw,5.25rem)] leading-[0.98] tracking-[-0.025em]"
            style={{ ["--i" as string]: 1 }}
          >
            Data structures and algorithms,{" "}
            <span
              className="font-display italic text-primary"
              style={{ fontVariationSettings: '"SOFT" 60, "WONK" 1' }}
            >
              taught the way they were meant to be.
            </span>
          </h1>

          <p
            className="text-lg md:text-xl text-muted-foreground mt-7 leading-relaxed max-w-prose"
            style={{ ["--i" as string]: 2 }}
          >
            A structured course in {articleCount} essays, drawn from CLRS,
            Sedgewick &amp; Wayne, and Laaksonen. Every algorithm interactive.
            Every claim cited.
          </p>

          <div
            className="mt-9 flex items-center gap-5 flex-wrap"
            style={{ ["--i" as string]: 3 }}
          >
            <Link
              href={startHref}
              className="group inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-lg font-medium text-sm transition-shadow"
              style={{
                boxShadow:
                  "0 8px 24px -12px color-mix(in srgb, var(--primary) 60%, transparent)",
                transitionDuration: "var(--dur-base)",
                transitionTimingFunction: "var(--ease-out)",
              }}
            >
              Start with the foundations
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/roadmap"
              className="text-sm text-foreground/70 hover:text-foreground transition-colors underline underline-offset-4 decoration-border hover:decoration-foreground/40"
              style={{
                textUnderlineOffset: "5px",
                transitionDuration: "var(--dur-fast)",
                transitionTimingFunction: "var(--ease-out)",
              }}
            >
              or browse the roadmap
            </Link>
          </div>

          <div
            className="mt-16 lg:mt-24 font-mono text-[0.62rem] uppercase tracking-[0.16em] text-muted-foreground/80"
            style={{ ["--i" as string]: 4 }}
          >
            <span
              aria-hidden
              className="inline-block w-6 h-px bg-border align-middle mr-3"
            />
            Maintained by Himanshu Nakrani · 2026
          </div>
        </div>

        {/* Right column — the visualization */}
        <div className="bloom flex flex-col items-center lg:items-end">
          <div
            className="w-full max-w-[560px] text-foreground/55"
            style={{ ["--i" as string]: 2 }}
          >
            <BFSHero />
          </div>
          <div
            className="mt-3 font-mono text-[0.62rem] uppercase tracking-[0.12em] text-muted-foreground flex items-center gap-2"
            style={{ ["--i" as string]: 3 }}
          >
            <span
              aria-hidden
              className="inline-block h-1 w-1 rounded-full bg-primary"
              style={{
                animation: "pulse-dot 1.8s var(--ease-out) infinite",
              }}
            />
            Breadth-first search · live
          </div>
          <style>{`
            @keyframes pulse-dot {
              0%, 100% { opacity: 0.45; transform: scale(1); }
              50%      { opacity: 1;    transform: scale(1.4); }
            }
          `}</style>
        </div>
      </section>
    </div>
  );
}
