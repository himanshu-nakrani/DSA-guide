import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ArticleStatus } from "@/generated/prisma";
import { ArrowRight, BookOpen, Map, Code2 } from "lucide-react";
import { BFSHero } from "@/components/hero/BFSHero";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [articleCount, moduleCount, problemCount] = await Promise.all([
    prisma.article.count({ where: { status: ArticleStatus.PUBLISHED } }),
    prisma.module.count(),
    prisma.problem.count(),
  ]);

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Ambient background: graph paper + a quiet light source */}
      <BackgroundField />

      {/* Hero */}
      <section className="relative px-6 md:px-12 pt-20 md:pt-28 pb-16 max-w-6xl mx-auto grid lg:grid-cols-[1fr_auto] gap-12 items-center">
        <div className="bloom max-w-2xl">
          <div className="eyebrow mb-5" style={{ ["--i" as string]: 0 }}>
            <span
              aria-hidden
              className="inline-block h-1.5 w-1.5 rounded-full bg-primary mr-2 align-middle"
              style={{ boxShadow: "0 0 0 4px color-mix(in srgb, var(--primary) 18%, transparent)" }}
            />
            Open curriculum · {articleCount} articles
          </div>
          <h1
            className="font-display text-[clamp(2.5rem,6vw,4.75rem)] leading-[1.02] font-medium tracking-[-0.02em]"
            style={{ ["--i" as string]: 1 }}
          >
            Data structures and algorithms,{" "}
            <span className="text-primary italic font-display" style={{ fontVariationSettings: '"SOFT" 50, "WONK" 1' }}>
              taught the way they were meant to be.
            </span>
          </h1>
          <p
            className="text-lg md:text-xl text-muted-foreground mt-6 max-w-2xl leading-relaxed"
            style={{ ["--i" as string]: 2 }}
          >
            A structured curriculum drawn from CLRS, Sedgewick &amp; Wayne, and
            Laaksonen, paired with interactive visualizations that make every
            algorithm tangible. No fluff. No videos. Just essays you read once
            and remember.
          </p>
          <div
            className="flex flex-wrap items-center gap-3 mt-9"
            style={{ ["--i" as string]: 3 }}
          >
            <Link
              href="/learn"
              className="group inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-lg font-medium text-sm shadow-[0_8px_24px_-12px_color-mix(in_srgb,var(--primary)_60%,transparent)] hover:shadow-[0_12px_32px_-12px_color-mix(in_srgb,var(--primary)_70%,transparent)] transition-shadow"
            >
              Start learning
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/roadmap"
              className="inline-flex items-center gap-2 bg-[color:var(--surface-1,var(--card))] text-foreground border border-border px-5 py-2.5 rounded-lg font-medium text-sm hover:bg-accent transition-colors"
            >
              View the roadmap
            </Link>
            <span className="ml-1 text-xs font-mono text-muted-foreground tracking-[0.04em] hidden md:inline-flex items-center gap-1.5">
              <kbd className="px-1.5 py-0.5 rounded border border-border bg-muted text-[0.65rem]">⌘</kbd>
              <kbd className="px-1.5 py-0.5 rounded border border-border bg-muted text-[0.65rem]">\</kbd>
              <span>toggle sidebar</span>
            </span>
          </div>
        </div>
        <div className="hidden lg:block text-foreground/60">
          <BFSHero />
        </div>
      </section>

      {/* Stats strip */}
      <section className="relative px-6 md:px-12 max-w-6xl mx-auto">
        <div
          className="grid grid-cols-3 gap-px bg-border rounded-2xl overflow-hidden border border-border bloom"
          style={{ boxShadow: "var(--shadow-card)" }}
        >
          <Stat value={moduleCount} label="Modules" i={0} />
          <Stat value={articleCount} label="Articles" i={1} />
          <Stat value={`${problemCount}+`} label="Problems" i={2} />
        </div>
      </section>

      {/* Three feature cards */}
      <section className="relative px-6 md:px-12 py-20 md:py-24 max-w-6xl mx-auto">
        <div className="mb-10 max-w-2xl">
          <div className="eyebrow mb-3">What&rsquo;s inside</div>
          <h2 className="font-display text-3xl md:text-4xl font-medium tracking-[-0.015em]">
            Three places to spend your time
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          <FeatureCard
            icon={BookOpen}
            title="Learn"
            blurb="Thirty-two essays from asymptotic notation to shortest paths, each with embedded interactive visualizations and traced to primary sources."
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
            blurb="An interactive workspace for solving problems alongside the theory. Currently in development — every essay carries practice problems at the foot."
            cta="Coming soon"
            href="/problems"
            soon
          />
        </div>
      </section>
    </div>
  );
}

function Stat({ value, label, i }: { value: number | string; label: string; i: number }) {
  return (
    <div
      className="bg-[color:var(--surface-1,var(--card))] px-6 py-8 text-center"
      style={{ ["--i" as string]: i + 1 }}
    >
      <div className="font-display text-4xl font-medium tabular-nums tracking-[-0.02em]">{value}</div>
      <div className="text-xs uppercase tracking-[0.08em] font-mono text-muted-foreground mt-2">{label}</div>
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
      className="surface-card group block p-6 hover:-translate-y-0.5 hover:border-[color:color-mix(in_srgb,var(--primary)_45%,var(--border))] transition-all duration-300"
      style={{ transitionTimingFunction: "var(--ease-out)" }}
    >
      <div className="flex items-center justify-between mb-5">
        <div
          className="h-10 w-10 rounded-lg grid place-items-center text-primary"
          style={{
            background:
              "linear-gradient(180deg, color-mix(in srgb, var(--primary) 18%, transparent) 0%, color-mix(in srgb, var(--primary) 6%, transparent) 100%)",
            border: "1px solid color-mix(in srgb, var(--primary) 25%, transparent)",
          }}
        >
          <Icon className="h-5 w-5" strokeWidth={1.75} />
        </div>
        {soon && (
          <span className="text-[0.6rem] font-mono uppercase tracking-[0.08em] text-muted-foreground bg-muted px-2 py-0.5 rounded-full border border-border">
            Soon
          </span>
        )}
      </div>
      <h3 className="font-display text-xl font-medium tracking-[-0.01em]">
        {title}
      </h3>
      <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
        {blurb}
      </p>
      <div className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-primary">
        {cta}
        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
      </div>
    </Link>
  );
}

/**
 * Ambient background — a faint graph-paper grid plus a soft radial spotlight
 * tinted with the accent. Renders behind the page and adapts to both themes
 * via opacity blending.
 */
function BackgroundField() {
  return (
    <>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          backgroundImage:
            "linear-gradient(to right, color-mix(in srgb, var(--foreground) 5%, transparent) 1px, transparent 1px), linear-gradient(to bottom, color-mix(in srgb, var(--foreground) 5%, transparent) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
          maskImage:
            "radial-gradient(ellipse at 30% 0%, black 30%, transparent 75%)",
          WebkitMaskImage:
            "radial-gradient(ellipse at 30% 0%, black 30%, transparent 75%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[480px] -z-10"
        style={{
          background:
            "radial-gradient(60% 100% at 30% 0%, color-mix(in srgb, var(--primary) 18%, transparent) 0%, transparent 70%)",
        }}
      />
    </>
  );
}
