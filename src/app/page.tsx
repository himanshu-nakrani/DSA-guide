import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ArticleStatus } from "@/generated/prisma";
import { ArrowRight, BookOpen, Map, Code2 } from "lucide-react";
import { BFSHero } from "@/components/hero/BFSHero";

export const revalidate = 3600;

export default async function HomePage() {
  const [articleCount, moduleCount, problemCount] = await Promise.all([
    prisma.article.count({ where: { status: ArticleStatus.PUBLISHED } }),
    prisma.module.count(),
    prisma.problem.count(),
  ]);

  return (
    <div className="min-h-screen relative">
      {/* Hero — manuscript title page */}
      <section className="relative px-6 md:px-12 pt-16 md:pt-24 pb-12 max-w-6xl mx-auto grid lg:grid-cols-[1fr_auto] gap-12 items-center">
        <div className="bloom max-w-2xl">
          <div className="eyebrow mb-5" style={{ ["--i" as string]: 0 }}>
            <span className="text-[color:var(--ink-blue)] mr-2">§</span>
            An Open Manuscript · {articleCount} Essays
          </div>
          <h1
            className="font-display text-[clamp(2.25rem,5.6vw,4.25rem)] leading-[1.05] font-medium text-[color:var(--ink)]"
            style={{ ["--i" as string]: 1 }}
          >
            Data structures &amp; algorithms,{" "}
            <span
              className="text-[color:var(--ink-blue)] italic"
              style={{ fontVariationSettings: '"SOFT" 50, "WONK" 1' }}
            >
              annotated.
            </span>
          </h1>
          <p
            className="text-[1.1rem] mt-6 max-w-2xl leading-relaxed text-[color:var(--ink-soft)]"
            style={{ ["--i" as string]: 2 }}
          >
            A printed-feeling curriculum drawn from CLRS, Sedgewick &amp; Wayne,
            and Laaksonen — paired with interactive figures that make every
            algorithm tangible. No videos. No fluff. Just essays you read once
            and remember.
          </p>
          <div
            className="flex flex-wrap items-center gap-3 mt-9"
            style={{ ["--i" as string]: 3 }}
          >
            <Link href="/learn" className="btn-ink">
              Start reading
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/roadmap" className="btn-ghost">
              See the table of contents
            </Link>
            <span className="ml-1 text-xs font-mono text-muted-foreground tracking-[0.08em] hidden md:inline-flex items-center gap-1.5">
              <kbd className="px-1.5 py-0.5 rounded-[2px] border border-[color:var(--rule)] bg-[color:var(--surface-2)] text-[0.62rem]">⌘</kbd>
              <kbd className="px-1.5 py-0.5 rounded-[2px] border border-[color:var(--rule)] bg-[color:var(--surface-2)] text-[0.62rem]">K</kbd>
              <span>search</span>
            </span>
          </div>
        </div>
        <div className="hidden lg:block text-[color:var(--ink-blue-soft)]">
          <BFSHero />
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-6 md:px-12">
        <div className="rule-section with-ornament" />
      </div>

      {/* Stats strip — typeset like a colophon */}
      <section className="relative px-6 md:px-12 max-w-6xl mx-auto">
        <div
          className="grid grid-cols-3 border-y border-[color:var(--rule-strong)] bloom"
          style={{ background: "var(--surface-1)" }}
        >
          <Stat value={moduleCount} label="Modules" i={0} />
          <Stat value={articleCount} label="Essays" i={1} divided />
          <Stat value={`${problemCount}+`} label="Problems" i={2} divided />
        </div>
      </section>

      {/* Three feature cards — ruled folios */}
      <section className="relative px-6 md:px-12 py-16 md:py-20 max-w-6xl mx-auto">
        <div className="mb-9 max-w-2xl">
          <div className="eyebrow mb-3">Contents</div>
          <h2 className="font-display text-3xl md:text-4xl font-medium text-[color:var(--ink)]">
            Three places to spend your time
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          <FeatureCard
            icon={BookOpen}
            title="Learn"
            blurb="Thirty-two essays from asymptotic notation to shortest paths, each with embedded figures and traced to primary sources."
            cta="Read the essays"
            href="/learn"
          />
          <FeatureCard
            icon={Map}
            title="Roadmap"
            blurb="A sixteen-module path through the curriculum, ordered foundations-first the way the classic textbooks teach the discipline."
            cta="Study the path"
            href="/roadmap"
          />
          <FeatureCard
            icon={Code2}
            title="Problems"
            blurb="A workspace for solving problems alongside the theory. Currently in development — every essay still carries practice problems at the foot."
            cta="Coming soon"
            href="/problems"
            soon
          />
        </div>
      </section>
    </div>
  );
}

function Stat({
  value,
  label,
  i,
  divided,
}: {
  value: number | string;
  label: string;
  i: number;
  divided?: boolean;
}) {
  return (
    <div
      className={`px-6 py-7 text-center ${divided ? "border-l border-[color:var(--rule)]" : ""}`}
      style={{ ["--i" as string]: i + 1 }}
    >
      <div className="font-display text-[2.25rem] leading-none font-medium tabular-nums text-[color:var(--ink)]">
        {value}
      </div>
      <div className="eyebrow mt-3">{label}</div>
    </div>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  blurb,
  cta,
  href,
  soon,
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  title: string;
  blurb: string;
  cta: string;
  href: string;
  soon?: boolean;
}) {
  return (
    <Link
      href={href}
      className="group block p-6 border border-[color:var(--rule)] bg-[color:var(--surface-1)] rounded-sm transition-colors hover:border-[color:var(--ink-blue)]"
    >
      <div className="flex items-center justify-between mb-5">
        <div
          className="h-10 w-10 grid place-items-center text-[color:var(--ink-blue)] border border-[color:var(--rule-strong)] rounded-sm"
          style={{ background: "var(--surface-2)" }}
        >
          <Icon className="h-5 w-5" strokeWidth={1.6} />
        </div>
        {soon && (
          <span className="pill">Soon</span>
        )}
      </div>
      <h3 className="font-display text-[1.35rem] font-medium text-[color:var(--ink)] group-hover:text-[color:var(--ink-blue)] transition-colors">
        {title}
      </h3>
      <p className="text-[0.92rem] mt-2 leading-relaxed text-[color:var(--ink-soft)]">
        {blurb}
      </p>
      <div className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-[color:var(--ink-blue)]">
        {cta}
        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
      </div>
    </Link>
  );
}
