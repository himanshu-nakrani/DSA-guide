import { prisma } from "@/lib/prisma";
import Link from "next/link";
import type { Metadata } from "next";
import { ViewTransition } from "react";
import { ArticleLevel, ArticleStatus, Prisma } from "@/generated/prisma";
import { ArrowRight } from "lucide-react";
import { ReadBadge } from "@/components/article/ReadBadge";
import { ReadTally } from "@/components/article/ReadTally";
import { getCurrentUser } from "@/lib/auth";
import { getUserReadArticleSlugs } from "@/lib/progress";
import { ReadProgressSync } from "@/components/progress/ReadProgressSync";
import { PageHeader, PageShell } from "@/components/layout/PageShell";
import { getSiteUrl } from "@/lib/site-url";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Learn — DSA Guide",
  description:
    "Browse the full DSA article library: foundations to advanced topics, every article cited from trusted sources.",
};

type TopicWithArticles = Prisma.TopicGetPayload<{
  include: {
    module: true;
    articles: {
      select: {
        id: true;
        slug: true;
        title: true;
        summary: true;
        level: true;
        estimatedMins: true;
      };
    };
  };
}>;

const levelLabel: Record<ArticleLevel, string> = {
  FOUNDATION: "Foundation",
  INTERMEDIATE: "Intermediate",
  ADVANCED: "Advanced",
};

const levelStyle: Record<ArticleLevel, string> = {
  FOUNDATION: "pill",
  INTERMEDIATE: "pill",
  ADVANCED: "pill pill-primary",
};

export default async function LearnPage() {
  const user = await getCurrentUser();
  const topics = await prisma.topic.findMany({
    where: { articles: { some: { status: ArticleStatus.PUBLISHED } } },
    include: {
      module: true,
      articles: {
        where: { status: ArticleStatus.PUBLISHED },
        orderBy: [{ level: "asc" }, { order: "asc" }],
        // ⚡ Bolt: Use `select` instead of `include` to avoid fetching large text fields (like `contentMd`)
        select: {
          id: true,
          slug: true,
          title: true,
          summary: true,
          level: true,
          estimatedMins: true,
        },
      },
    },
    orderBy: [{ module: { order: "asc" } }, { order: "asc" }],
  });

  if (topics.length === 0) {
    return (
      <PageShell width="narrow">
        <div className="surface-card p-12 text-center space-y-3 mt-8">
          <h1 className="font-display text-2xl font-medium text-ink">
            No articles published yet
          </h1>
          <p className="text-body text-muted-foreground leading-relaxed">
            Articles will appear here once published. Check back soon.
          </p>
        </div>
      </PageShell>
    );
  }

  const modulesMap = new Map<
    string,
    {
      order: number;
      id: string;
      slug: string;
      name: string;
      description: string | null;
      topics: TopicWithArticles[];
    }
  >();

  // ⚡ Bolt: Prevent hidden O(N) array allocations (.reduce() and .flatMap().map()) using explicit single-pass iteration
  let totalArticles = 0;
  const allSlugs: string[] = [];
  const allTitles: { slug: string; title: string }[] = [];

  for (const topic of topics) {
    const m = modulesMap.get(topic.module.id);
    if (m) m.topics.push(topic);
    else
      modulesMap.set(topic.module.id, {
        order: topic.module.order,
        id: topic.module.id,
        slug: topic.module.slug,
        name: topic.module.name,
        description: topic.module.description,
        topics: [topic],
      });

    totalArticles += topic.articles.length;
    for (const article of topic.articles) {
      allSlugs.push(article.slug);
      allTitles.push({ slug: article.slug, title: article.title });
    }
  }

  const readSlugs = user ? await getUserReadArticleSlugs(user.id) : [];

  const siteUrl = getSiteUrl();
  const itemListLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "DSA Guide article library",
    itemListElement: allTitles.map((a, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: a.title,
      url: `${siteUrl}/learn/${a.slug}`,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListLd) }}
      />
    <PageShell width="narrow">
      {readSlugs.length > 0 && <ReadProgressSync slugs={readSlugs} />}
      <PageHeader
        eyebrow="Library"
        title="Table of Articles"
        lede={
          <>
            {totalArticles} articles across {modulesMap.size} modules — from asymptotic
            notation through shortest paths and dynamic programming.
          </>
        }
      >
        <ReadTally slugs={allSlugs} />
      </PageHeader>

      {/* Jump nav — mono chips that scroll-jump to each module */}
      <nav
        aria-label="Jump to a module"
        className="no-scrollbar -mt-2 mb-8 flex items-center gap-2 overflow-x-auto pb-1"
      >
        <span className="mr-1 shrink-0 text-xs font-medium uppercase tracking-wider text-muted-foreground">Jump</span>
        {Array.from(modulesMap.values()).map((moduleData) => (
          <a
            key={moduleData.id}
            href={`#mod-${moduleData.slug}`}
            className="pill shrink-0 whitespace-nowrap hover:text-ink-blue hover:border-ink-blue transition-colors"
          >
            <span className="tabular-nums">{String(moduleData.order).padStart(2, "0")}</span>
            <span className="max-w-40 truncate">{moduleData.name}</span>
          </a>
        ))}
      </nav>

      <div className="space-y-6">
        {Array.from(modulesMap.values()).map((moduleData) => (
          <ModuleSection
            key={moduleData.id}
            moduleSlug={moduleData.slug}
            moduleNumber={moduleData.order}
            moduleName={moduleData.name}
            description={moduleData.description}
            topics={moduleData.topics}
          />
        ))}
      </div>
    </PageShell>
    </>
  );
}

function ModuleSection({
  moduleSlug,
  moduleNumber,
  moduleName,
  description,
  topics,
}: {
  moduleSlug: string;
  moduleNumber: number;
  moduleName: string;
  description: string | null;
  topics: TopicWithArticles[];
}) {
  return (
    <section
      id={`mod-${moduleSlug}`}
      className="scroll-mt-32 overflow-hidden rounded-xl border border-border bg-surface-1 shadow-[var(--shadow-card)]"
    >
      <div className="flex flex-wrap items-center gap-3 border-b border-border px-5 py-4">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-surface-2 font-mono text-xs font-medium tabular-nums text-muted-foreground">
          {String(moduleNumber).padStart(2, "0")}
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-lg font-semibold tracking-tight text-foreground">
            {moduleName}
          </h2>
          {description && (
            <p className="mt-0.5 line-clamp-1 text-sm text-muted-foreground">
              {description}
            </p>
          )}
        </div>
      </div>

      <div>
        {topics.map((topic) => (
          <div key={topic.id}>
            {topics.length > 1 && (
              <div className="border-b border-border bg-surface-2/60 px-5 py-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {topic.name}
              </div>
            )}
            {topic.articles.map((article) => (
              <Link
                key={article.id}
                href={`/learn/${article.slug}`}
                className="group flex items-center gap-4 border-b border-border px-5 py-4 transition-colors last:border-b-0 hover:bg-surface-2"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <ViewTransition name={`article-title-${article.slug}`}>
                      <h3 className="text-[15px] font-semibold tracking-tight text-foreground group-hover:text-ink-blue">
                        {article.title}
                      </h3>
                    </ViewTransition>
                    <span className={levelStyle[article.level]}>
                      {levelLabel[article.level]}
                    </span>
                    <span className="text-xs tabular-nums text-muted-foreground">
                      {article.estimatedMins}m
                    </span>
                    <ReadBadge slug={article.slug} />
                  </div>
                  <p className="mt-1 line-clamp-1 text-sm leading-relaxed text-muted-foreground">
                    {article.summary}
                  </p>
                </div>
                <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-all group-hover:translate-x-0.5 group-hover:text-ink-blue" />
              </Link>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
