import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ViewTransition } from "react";
import { ArticleLevel, ArticleStatus } from "@/generated/prisma";
import { ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

const levelLabel: Record<ArticleLevel, string> = {
  FOUNDATION: "Foundation",
  INTERMEDIATE: "Intermediate",
  ADVANCED: "Advanced",
};

const levelStyle: Record<ArticleLevel, string> = {
  FOUNDATION:
    "bg-[color:var(--chart-2)]/10 text-[color:var(--chart-2)] border-[color:var(--chart-2)]/25",
  INTERMEDIATE:
    "bg-[color:var(--chart-3)]/12 text-[color:var(--chart-3)] border-[color:var(--chart-3)]/25",
  ADVANCED:
    "bg-[color:var(--primary)]/12 text-[color:var(--primary)] border-[color:var(--primary)]/25",
};

export default async function LearnPage() {
  const topics = await prisma.topic.findMany({
    where: { articles: { some: { status: ArticleStatus.PUBLISHED } } },
    include: {
      module: true,
      articles: {
        where: { status: ArticleStatus.PUBLISHED },
        orderBy: [{ level: "asc" }, { order: "asc" }],
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

  type TopicWithArticles = (typeof topics)[number];
  const modulesMap = new Map<
    string,
    {
      order: number;
      id: string;
      name: string;
      description: string | null;
      topics: TopicWithArticles[];
    }
  >();
  for (const topic of topics) {
    const m = modulesMap.get(topic.module.id);
    if (m) m.topics.push(topic);
    else
      modulesMap.set(topic.module.id, {
        order: topic.module.order,
        id: topic.module.id,
        name: topic.module.name,
        description: topic.module.description,
        topics: [topic],
      });
  }

  const totalArticles = topics.reduce((s, t) => s + t.articles.length, 0);

  return (
    <div className="max-w-5xl mx-auto px-12 py-16">
      <header className="bloom mb-14">
        <div className="eyebrow mb-3" style={{ ["--i" as string]: 0 }}>
          Library
        </div>
        <h1
          className="font-display text-[clamp(2.5rem,5vw,3.75rem)] leading-[1.05] font-semibold"
          style={{ ["--i" as string]: 1 }}
        >
          Learn
        </h1>
        <p
          className="text-lg text-muted-foreground mt-4 max-w-2xl"
          style={{ ["--i" as string]: 2 }}
        >
          {totalArticles} articles across {modulesMap.size} modules — from
          asymptotic notation through shortest paths and dynamic programming.
        </p>
      </header>

      <div className="space-y-14 bloom">
        {Array.from(modulesMap.values()).map((moduleData, idx) => (
          <ModuleSection
            key={moduleData.id}
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
  moduleNumber,
  moduleName,
  description,
  topics,
  i,
}: {
  moduleNumber: number;
  moduleName: string;
  description: string | null;
  topics: Awaited<ReturnType<typeof prisma.topic.findMany>> extends infer T
    ? T extends Array<infer U>
      ? (U & { articles: Array<{ id: string; slug: string; title: string; summary: string; level: ArticleLevel; estimatedMins: number }> })[]
      : never
    : never;
  i: number;
}) {
  return (
    <section style={{ ["--i" as string]: i }}>
      <div className="flex items-baseline gap-4 mb-5">
        <span className="font-mono text-sm text-muted-foreground tabular-nums">
          {String(moduleNumber).padStart(2, "0")}
        </span>
        <div>
          <h2 className="font-display text-2xl font-medium tracking-[-0.015em]">
            {moduleName}
          </h2>
          {description && (
            <p className="text-sm text-muted-foreground mt-1">
              {description}
            </p>
          )}
        </div>
      </div>

      <div className="surface-card overflow-hidden divide-y divide-border !p-0">
        {topics.flatMap((topic) =>
          topic.articles.map((article) => (
            <Link
              key={article.id}
              href={`/learn/${article.slug}`}
              className="group flex items-start gap-4 px-5 py-4 hover:bg-accent/50 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <ViewTransition name={`article-title-${article.slug}`}>
                    <h3 className="text-[0.95rem] font-medium text-foreground tracking-[-0.005em]">
                      {article.title}
                    </h3>
                  </ViewTransition>
                  <span
                    className={`text-[0.65rem] font-mono uppercase tracking-[0.04em] px-1.5 py-0.5 rounded border ${levelStyle[article.level]}`}
                  >
                    {levelLabel[article.level]}
                  </span>
                  <span className="text-[0.7rem] font-mono text-muted-foreground tabular-nums">
                    {article.estimatedMins}m
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
                  {article.summary}
                </p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground mt-1.5 shrink-0 transition-all group-hover:text-primary group-hover:translate-x-0.5" />
            </Link>
          )),
        )}
      </div>
    </section>
  );
}
