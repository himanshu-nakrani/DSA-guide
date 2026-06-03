import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ArticleStatus } from "@/generated/prisma";
import { ArrowRight, BookOpen, Map, Code2 } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [articleCount, moduleCount, problemCount] = await Promise.all([
    prisma.article.count({ where: { status: ArticleStatus.PUBLISHED } }),
    prisma.module.count(),
    prisma.problem.count(),
  ]);

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="px-12 pt-24 pb-16 max-w-6xl mx-auto">
        <div className="bloom max-w-3xl">
          <div className="eyebrow mb-5" style={{ ["--i" as string]: 0 }}>
            Open curriculum · 32 articles
          </div>
          <h1
            className="font-display text-[clamp(2.5rem,5.5vw,4.25rem)] leading-[1.05] tracking-tight font-semibold"
            style={{ ["--i" as string]: 1 }}
          >
            Learn data structures and algorithms{" "}
            <span className="text-primary">the way they were meant to be taught.</span>
          </h1>
          <p
            className="text-lg text-muted-foreground mt-6 max-w-2xl leading-relaxed"
            style={{ ["--i" as string]: 2 }}
          >
            A structured curriculum drawn from CLRS, Sedgewick &amp; Wayne, and
            Laaksonen, paired with interactive visualizations that make every
            algorithm tangible. No fluff. No videos. Just essays you read once
            and remember.
          </p>
          <div
            className="flex flex-wrap items-center gap-3 mt-8"
            style={{ ["--i" as string]: 3 }}
          >
            <Link
              href="/learn"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-lg font-medium text-sm shadow-sm hover:opacity-95 transition-opacity"
            >
              Start learning
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/roadmap"
              className="inline-flex items-center gap-2 bg-background text-foreground border border-border px-4 py-2.5 rounded-lg font-medium text-sm hover:bg-accent transition-colors"
            >
              View the roadmap
            </Link>
          </div>
        </div>
      </section>

      {/* Stats strip */}
      <section className="px-12 max-w-6xl mx-auto">
        <div className="grid grid-cols-3 gap-px bg-border rounded-xl overflow-hidden border border-border bloom">
          <Stat value={moduleCount} label="Modules" i={0} />
          <Stat value={articleCount} label="Articles" i={1} />
          <Stat value={`${problemCount}+`} label="Problems" i={2} />
        </div>
      </section>

      {/* Three feature cards */}
      <section className="px-12 py-20 max-w-6xl mx-auto">
        <div className="mb-10">
          <div className="eyebrow mb-3">What&rsquo;s inside</div>
          <h2 className="font-display text-3xl font-semibold tracking-tight">
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
      className="bg-background px-6 py-7 text-center"
      style={{ ["--i" as string]: i + 1 }}
    >
      <div className="font-display text-3xl font-semibold tabular-nums">{value}</div>
      <div className="text-sm text-muted-foreground mt-1">{label}</div>
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
      className="group block rounded-xl border border-border bg-card p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
          <Icon className="h-5 w-5" strokeWidth={1.75} />
        </div>
        {soon && (
          <span className="text-[0.65rem] font-mono uppercase tracking-[0.04em] text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
            Soon
          </span>
        )}
      </div>
      <h3 className="font-display text-lg font-semibold tracking-tight">
        {title}
      </h3>
      <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
        {blurb}
      </p>
      <div className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary">
        {cta}
        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
      </div>
    </Link>
  );
}
