import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ViewTransition } from "react";
import { ArticleLevel, ArticleStatus, Prisma } from "@/generated/prisma";
import { ArrowRight } from "lucide-react";
import { ReadBadge } from "@/components/article/ReadBadge";
import { ReadTally } from "@/components/article/ReadTally";
import { getCurrentUser } from "@/lib/auth";
import { getUserReadArticleSlugs } from "@/lib/progress";
import { ReadProgressSync } from "@/components/progress/ReadProgressSync";

export const revalidate = 3600;

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
      <div className="p-16">
        <p className="text-muted-foreground">No articles published yet.</p>
      </div>
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
    }
  }

  const readSlugs = user ? await getUserReadArticleSlugs(user.id) : [];

  return (
    <div className="max-w-5xl mx-auto px-6 md:px-12 py-16">
      {readSlugs.length > 0 && <ReadProgressSync slugs={readSlugs} />}
      <header className="bloom mb-12">
        <div className="eyebrow mb-4" style={{ ["--i" as string]: 0 }}>
          <span className="text-[color:var(--ink-blue)] mr-2">§</span>
          Library
        </div>
        <h1
          className="font-display text-[clamp(2.25rem,5vw,3.5rem)] leading-[1.06] font-medium text-[color:var(--ink)]"
          style={{ ["--i" as string]: 1 }}
        >
          Table of Articles
        </h1>
        <p
          className="text-[1.05rem] mt-3 max-w-2xl text-[color:var(--ink-soft)]"
          style={{ ["--i" as string]: 2 }}
        >
          {totalArticles} articles across {modulesMap.size} modules — from
          asymptotic notation through shortest paths and dynamic programming.
        </p>
        <div
          className="mt-4 min-h-[1.25rem]"
          style={{ ["--i" as string]: 3 }}
        >
          <ReadTally slugs={allSlugs} />
        </div>
        <div aria-hidden className="mt-6 h-px bg-[color:var(--rule-strong)]" />
      </header>

      <div className="space-y-14 bloom">
        {Array.from(modulesMap.values()).map((moduleData, idx) => (
          <ModuleSection
            key={moduleData.id}
            moduleSlug={moduleData.slug}
            moduleNumber={moduleData.order}
            moduleName={moduleData.name}
            description={moduleData.description}
            topics={moduleData.topics}
            i={idx}
          />
        ))}
      </div>
    </div>
  );
}

function ModuleSection({
  moduleSlug,
  moduleNumber,
  moduleName,
  description,
  topics,
  i,
}: {
  moduleSlug: string;
  moduleNumber: number;
  moduleName: string;
  description: string | null;
  topics: TopicWithArticles[];
  i: number;
}) {
  return (
    <section id={`mod-${moduleSlug}`} className="scroll-mt-24" style={{ ["--i" as string]: i }}>
      <div className="flex items-baseline gap-4 mb-4">
        <span className="font-mono text-[0.85rem] text-[color:var(--ink-blue)] tabular-nums tracking-[0.08em]">
          {String(moduleNumber).padStart(2, "0")}
        </span>
        <div>
          <h2 className="font-display text-[1.5rem] font-medium text-[color:var(--ink)]">
            {moduleName}
          </h2>
          {description && (
            <p className="text-[0.9rem] mt-1 text-[color:var(--ink-soft)]">
              {description}
            </p>
          )}
        </div>
      </div>

      <div className="border-t border-[color:var(--rule-strong)] border-b border-b-[color:var(--rule-strong)]">
        {topics.flatMap((topic) =>
          topic.articles.map((article, idx) => (
            <Link
              key={article.id}
              href={`/learn/${article.slug}`}
              className={`group flex items-start gap-4 px-1 py-3 transition-colors hover:bg-[color:var(--ink-blue-wash)] ${idx > 0 ? "border-t border-[color:var(--rule)]" : ""}`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <ViewTransition name={`article-title-${article.slug}`}>
                    <h3 className="font-display text-[1.05rem] font-medium text-[color:var(--ink)] group-hover:text-[color:var(--ink-blue)] transition-colors">
                      {article.title}
                    </h3>
                  </ViewTransition>
                  <span className={levelStyle[article.level]}>
                    {levelLabel[article.level]}
                  </span>
                  <span className="text-[0.7rem] font-mono text-muted-foreground tabular-nums">
                    {article.estimatedMins}m
                  </span>
                  <ReadBadge slug={article.slug} />
                </div>
                <p className="text-[0.9rem] mt-1 leading-relaxed text-[color:var(--ink-soft)] max-w-2xl">
                  {article.summary}
                </p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground mt-1.5 shrink-0 transition-all group-hover:text-[color:var(--ink-blue)] group-hover:translate-x-0.5" />
            </Link>
          )),
        )}
      </div>
    </section>
  );
}
