import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { ArticleStatus } from "@/generated/prisma";
import { ArrowRight, BookOpen, ChevronDown, Code2, LineChart } from "lucide-react";
import { BFSHero } from "@/components/hero/BFSHero";
import { HomeProgressTeaser } from "@/components/progress/HomeProgressTeaser";
import { getSiteUrl } from "@/lib/site-url";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "DSA Guide — Data structures and algorithms, explained clearly",
  description:
    "A structured, free DSA curriculum from foundations to advanced topics. Cited articles, live visualizations, guided roadmap, and curated practice.",
};

const STEPS = [
  {
    icon: BookOpen,
    title: "Learn the idea",
    body: "Read short, cited articles in roadmap order — from complexity analysis to dynamic programming.",
    href: "/learn",
    cta: "Browse articles",
  },
  {
    icon: Code2,
    title: "Practice the pattern",
    body: "Solve curated problems with hints and editorials, then mark your status as you go.",
    href: "/problems",
    cta: "Open problems",
  },
  {
    icon: LineChart,
    title: "Track momentum",
    body: "Watch reading and solving progress pile up on your dashboard and pick up where you left off.",
    href: "/dashboard",
    cta: "See dashboard",
  },
];

const FAQS = [
  {
    q: "Do I need an account?",
    a: "No. Every article and visualization is free to read without signing in. An optional free account syncs your reading progress, problem statuses, bookmarks, and lists across devices.",
  },
  {
    q: "What are the articles based on?",
    a: "Trusted sources: CLRS (Introduction to Algorithms), Sedgewick & Wayne's Algorithms, Laaksonen's Competitive Programmer's Handbook, MIT OpenCourseWare, and cp-algorithms. Every article lists its sources.",
  },
  {
    q: "Where do I write code?",
    a: "Practice problems link out to external judges such as LeetCode, where you solve in a real editor. DSA Guide keeps your status, hints, and editorials organized around the same roadmap.",
  },
  {
    q: "Is it free?",
    a: "Yes. The full curriculum — articles, visualizations, roadmap, and practice tracking — is free.",
  },
  {
    q: "How should I follow the roadmap?",
    a: "Work through modules in order: read the articles, solve the linked practice problems, and mark each problem's status. Your dashboard always shows the next unfinished step.",
  },
];

export default async function HomePage() {
  const modules = await prisma.module.findMany({
    where: { topics: { some: { articles: { some: { status: ArticleStatus.PUBLISHED } } } } },
    orderBy: { order: "asc" },
    include: {
      topics: {
        where: { articles: { some: { status: ArticleStatus.PUBLISHED } } },
        orderBy: { order: "asc" },
        select: {
          name: true,
          articles: {
            where: { status: ArticleStatus.PUBLISHED },
            orderBy: [{ level: "asc" }, { order: "asc" }],
            select: { slug: true },
          },
        },
      },
    },
  });

  const articleCount = modules.reduce(
    (n, m) => n + m.topics.reduce((t, topic) => t + topic.articles.length, 0),
    0,
  );
  const topicCount = modules.reduce((n, m) => n + m.topics.length, 0);
  const firstSlug = modules[0]?.topics[0]?.articles[0]?.slug ?? "";
  const allSlugs = modules.flatMap((m) =>
    m.topics.flatMap((topic) => topic.articles.map((article) => article.slug)),
  );

  const siteUrl = getSiteUrl();
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: "DSA Guide",
    description:
      "A structured, free data structures and algorithms curriculum with cited articles, live visualizations, and curated practice.",
    url: `${siteUrl}/`,
    provider: { "@type": "Organization", name: "DSA Guide", url: siteUrl },
    hasCourseInstance: {
      "@type": "CourseInstance",
      courseMode: "online",
      courseWorkload: `P${articleCount * 10}M`,
    },
  };
  const moduleListLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "DSA Guide curriculum",
    itemListElement: modules.map((m, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: m.name,
      url: `${siteUrl}/learn#mod-${m.slug}`,
    })),
  };

  return (
    <div className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(moduleListLd) }}
      />
      <link rel="preload" href="/fonts/iAWriterQuattroV.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
      <link rel="preload" href="/icon.svg" as="image" type="image/svg+xml" />

      {/* Hero */}
      <section className="mx-auto w-full max-w-6xl px-4 pt-14 pb-12 sm:px-6 md:pt-24 md:pb-16">
        <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-surface-1 px-3 py-1 text-xs text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-ink-green" aria-hidden />
              {articleCount} articles · {modules.length} modules · free
            </div>
            <h1 className="text-balance text-5xl font-semibold leading-[1.05] tracking-tight text-foreground md:text-6xl">
              Data structures and algorithms, explained clearly.
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground">
              A structured curriculum from foundations to advanced topics —
              every article cited from trusted sources, every idea paired
              with a live visualization.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              {firstSlug && (
                <Link
                  href={`/learn/${firstSlug}`}
                  className="inline-flex h-11 items-center gap-2 rounded-lg bg-foreground px-5 text-sm font-medium text-background transition-opacity hover:opacity-85"
                >
                  Start learning
                  <ArrowRight className="h-4 w-4" />
                </Link>
              )}
              <Link
                href="/roadmap"
                className="inline-flex h-11 items-center rounded-lg border border-border px-5 text-sm font-medium text-foreground transition-colors hover:border-border-hover hover:bg-surface-2"
              >
                View roadmap
              </Link>
            </div>
            <dl className="mt-10 flex flex-wrap gap-x-10 gap-y-4">
              {[
                [String(articleCount), "articles"],
                [String(topicCount), "topics"],
                [String(modules.length), "modules"],
              ].map(([value, label]) => (
                <div key={label}>
                  <dt className="sr-only">{label}</dt>
                  <dd className="text-2xl font-semibold tracking-tight text-foreground tabular-nums">
                    {value}
                  </dd>
                  <dd className="mt-0.5 text-xs uppercase tracking-wider text-muted-foreground">
                    {label}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="overflow-hidden rounded-xl border border-border bg-surface-1 shadow-[var(--shadow-pop)]">
            <div className="flex items-center gap-1.5 border-b border-border bg-surface-2 px-4 py-2.5" aria-hidden>
              <span className="h-2.5 w-2.5 rounded-full bg-border-hover" />
              <span className="h-2.5 w-2.5 rounded-full bg-border-hover" />
              <span className="h-2.5 w-2.5 rounded-full bg-border-hover" />
              <span className="ml-3 hidden flex-1 truncate rounded-md bg-background px-3 py-1 font-mono text-[11px] text-muted-foreground sm:block">
                dsa.guide/learn/breadth-first-search
              </span>
            </div>
            <div className="p-5 md:p-6 flex flex-col items-center">
              <div className="mb-4 flex w-full items-center justify-between">
                <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Live figure
                </span>
                <span className="text-xs text-muted-foreground">Breadth-first search</span>
              </div>
              <BFSHero />
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground text-center">
                Every concept ships with an interactive figure — step through
                the algorithm without leaving the page.
              </p>
            </div>
          </div>
        </div>
        {allSlugs.length > 0 && (
          <div className="mt-10">
            <HomeProgressTeaser slugs={allSlugs} />
          </div>
        )}
      </section>

      {/* How it works */}
      <section className="border-t border-border bg-surface-1">
        <div className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 md:py-20">
          <div className="mb-8 max-w-2xl">
            <div className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              How it works
            </div>
            <h2 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
              A loop, not a list
            </h2>
            <p className="mt-3 text-lg leading-relaxed text-muted-foreground">
              Read the idea, drill it on real problems, and let your dashboard
              tell you what is next.
            </p>
          </div>
          <ol className="grid gap-4 md:grid-cols-3">
            {STEPS.map((step, i) => (
              <li
                key={step.title}
                className="group rounded-xl border border-border bg-background p-6 shadow-[var(--shadow-card)] transition-all hover:border-border-hover hover:shadow-[var(--shadow-pop)]"
              >
                <div className="flex items-center justify-between">
                  <span className="grid h-10 w-10 place-items-center rounded-lg bg-surface-2 text-foreground">
                    <step.icon className="h-5 w-5" strokeWidth={1.75} />
                  </span>
                  <span className="font-mono text-xs tabular-nums text-muted-foreground">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
                <h3 className="mt-4 text-lg font-semibold tracking-tight text-foreground">
                  {step.title}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  {step.body}
                </p>
                <Link
                  href={step.href}
                  className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-ink-blue hover:underline"
                >
                  {step.cta}
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Curriculum */}
      <section className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 md:py-20">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-2xl">
            <div className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Curriculum
            </div>
            <h2 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
              Foundations to advanced, in order
            </h2>
            <p className="mt-3 text-lg leading-relaxed text-muted-foreground">
              {articleCount} articles across {modules.length} modules. Start at
              the top and work down — or jump straight to a weak spot.
            </p>
          </div>
          <Link
            href="/roadmap"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-blue hover:underline"
          >
            Study the full roadmap
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {modules.length === 0 ? (
          <div className="rounded-xl border border-border bg-surface-1 p-12 text-center">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">
              Coming soon
            </h2>
            <p className="mx-auto mt-2 max-w-md text-muted-foreground">
              No articles have been published yet. The first edition will appear here.
            </p>
          </div>
        ) : (
          <ol className="grid gap-4 md:grid-cols-2">
            {modules.map((m) => {
              const count = m.topics.reduce((t, topic) => t + topic.articles.length, 0);
              const topicLine = m.topics.map((t) => t.name).join(" · ");
              return (
                <li key={m.id}>
                  <Link
                    href={`/learn#mod-${m.slug}`}
                    className="group flex h-full flex-col rounded-xl border border-border bg-surface-1 p-5 shadow-[var(--shadow-card)] transition-all hover:border-border-hover hover:shadow-[var(--shadow-pop)]"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-mono text-xs tabular-nums text-muted-foreground">
                        {String(m.order).padStart(2, "0")}
                      </span>
                      <span className="rounded-full bg-surface-2 px-2.5 py-0.5 text-xs text-muted-foreground">
                        {count} {count === 1 ? "article" : "articles"}
                      </span>
                    </div>
                    <span className="mt-3 text-lg font-semibold tracking-tight text-foreground">
                      {m.name}
                    </span>
                    {topicLine && (
                      <span className="mt-1 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                        {topicLine}
                      </span>
                    )}
                    <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-ink-blue">
                      Open module
                      <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </Link>
                </li>
              );
            })}
          </ol>
        )}
      </section>

      {/* FAQ */}
      <section className="border-t border-border bg-surface-1">
        <div className="mx-auto w-full max-w-3xl px-4 py-14 sm:px-6 md:py-20">
          <div className="mb-8">
            <div className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              FAQ
            </div>
            <h2 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
              Questions, answered
            </h2>
          </div>
          <div className="divide-y divide-border rounded-xl border border-border bg-background px-6">
            {FAQS.map((faq) => (
              <details key={faq.q} className="group py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[15px] font-semibold tracking-tight text-foreground [&::-webkit-details-marker]:hidden">
                  {faq.q}
                  <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
                </summary>
                <p className="mt-2.5 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                  {faq.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 md:py-20">
        <div className="rounded-xl border border-border bg-foreground px-6 py-12 text-center md:py-16">
          <h2 className="mx-auto max-w-xl text-balance text-3xl font-semibold tracking-tight text-background md:text-4xl">
            Stop grinding randomly. Follow a path.
          </h2>
          <p className="mx-auto mt-3 max-w-md text-background/70">
            Free curriculum, live figures, and practice tracking — start with
            the first article.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            {firstSlug && (
              <Link
                href={`/learn/${firstSlug}`}
                className="inline-flex h-11 items-center gap-2 rounded-lg bg-background px-5 text-sm font-medium text-foreground transition-opacity hover:opacity-85"
              >
                Start learning
                <ArrowRight className="h-4 w-4" />
              </Link>
            )}
            <Link
              href="/roadmap"
              className="inline-flex h-11 items-center rounded-lg border border-background/25 px-5 text-sm font-medium text-background transition-colors hover:border-background/50"
            >
              View roadmap
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
