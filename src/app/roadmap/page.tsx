import { prisma } from "@/lib/prisma";
import { ArticleStatus, ProgressStatus } from "@/generated/prisma";
import { ArrowRight } from "lucide-react";
import { ArticleLink } from "@/components/article/ArticleLink";
import { ProgressNode } from "@/components/roadmap/ProgressNode";
import { getCurrentUser } from "@/lib/auth";
import { getUserReadArticleSlugs } from "@/lib/progress";
import { ReadProgressSync } from "@/components/progress/ReadProgressSync";
import { ProblemCard } from "@/components/problems/ProblemCard";

export const revalidate = 3600;

export default async function RoadmapPage() {
  const user = await getCurrentUser();
  const track = await prisma.track.findUnique({
    where: { slug: "a2z-dsa-roadmap" },
    include: {
      modules: {
        orderBy: { order: "asc" },
        include: {
          topics: {
            orderBy: { order: "asc" },
            include: {
              articles: {
                where: { status: ArticleStatus.PUBLISHED },
                orderBy: [{ level: "asc" }, { order: "asc" }],
              },
              problems: { include: { problem: true } },
            },
          },
        },
      },
    },
  });

  if (!track) {
    return (
      <div className="p-16">
        <p className="text-muted-foreground">Roadmap not found.</p>
      </div>
    );
  }

  const readSlugs = user ? await getUserReadArticleSlugs(user.id) : [];
  const problemIds = track.modules.flatMap((module) =>
    module.topics.flatMap((topic) => topic.problems.map((entry) => entry.problemId)),
  );
  const problemProgressRows = user
    ? await prisma.userProblemProgress.findMany({
        where: {
          userId: user.id,
          problemId: { in: problemIds },
        },
        select: { problemId: true, status: true },
      })
    : [];
  const problemProgressMap = new Map<string, ProgressStatus>(
    problemProgressRows.map((row) => [row.problemId, row.status]),
  );

  return (
    <div className="max-w-5xl mx-auto px-6 md:px-12 py-16">
      {readSlugs.length > 0 && <ReadProgressSync slugs={readSlugs} />}
      <header className="bloom mb-12">
        <div className="eyebrow mb-4" style={{ ["--i" as string]: 0 }}>
          <span className="text-[color:var(--ink-blue)] mr-2">§</span>
          Curriculum
        </div>
        <h1
          className="font-display text-[clamp(2.25rem,5vw,3.5rem)] leading-[1.06] font-medium text-[color:var(--ink)]"
          style={{ ["--i" as string]: 1 }}
        >
          The Roadmap
        </h1>
        <p
          className="text-[1.05rem] mt-3 max-w-2xl text-[color:var(--ink-soft)]"
          style={{ ["--i" as string]: 2 }}
        >
          {track.description}
        </p>
        <div aria-hidden className="mt-8 h-px bg-[color:var(--rule-strong)]" />
      </header>

      {/* Vertical step timeline */}
      <ol className="bloom">
        {track.modules.map((module, i) => {
          const articleCount = module.topics.reduce(
            (s, t) => s + t.articles.length,
            0,
          );
          const problemCount = module.topics.reduce(
            (s, t) => s + t.problems.length,
            0,
          );
          const moduleSlugs = module.topics.flatMap((t) =>
            t.articles.map((a) => a.slug),
          );
          const firstArticle =
            module.topics.flatMap((t) => t.articles)[0] ?? null;
          const isLast = i === track.modules.length - 1;

          return (
            <li
              key={module.id}
              className="relative grid grid-cols-[3rem_1fr] gap-5"
              style={{ ["--i" as string]: i }}
            >
              <div className="flex flex-col items-center">
                <ProgressNode order={module.order} slugs={moduleSlugs} />
                {!isLast && <div className="flex-1 w-px bg-border my-1" aria-hidden />}
              </div>

              <div className={`pt-1 ${isLast ? "pb-0" : "pb-5"}`}>
                <div className="p-5 border border-[color:var(--rule)] rounded-sm bg-[color:var(--surface-1)] transition-colors hover:border-[color:var(--ink-blue)]">

                  <div className="flex items-baseline justify-between gap-4 flex-wrap mb-2">
                    <h2 className="font-display text-[1.25rem] font-medium text-[color:var(--ink)]">
                      {module.name}
                    </h2>
                    <div className="text-[0.7rem] font-mono text-muted-foreground tabular-nums flex items-center gap-2">
                      <span>{articleCount} {articleCount === 1 ? "article" : "articles"}</span>
                      {problemCount > 0 && (
                        <>
                          <span className="text-muted-foreground/40">·</span>
                          <span>{problemCount} {problemCount === 1 ? "problem" : "problems"}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {module.description && (
                    <p className="text-[0.9rem] leading-relaxed text-[color:var(--ink-soft)]">
                      {module.description}
                    </p>
                  )}

                  {firstArticle && (
                    <div className="mt-3">
                      <ArticleLink
                        href={`/learn/${firstArticle.slug}`}
                        preview={{
                          title: firstArticle.title,
                          summary: firstArticle.summary,
                          level: firstArticle.level,
                          estimatedMins: firstArticle.estimatedMins,
                          moduleName: module.name,
                        }}
                        className="inline-flex items-center gap-1.5 text-sm font-medium text-[color:var(--ink-blue)] link-quill"
                      >
                        Start: {firstArticle.title}
                        <ArrowRight className="h-3.5 w-3.5" />
                      </ArticleLink>
                    </div>
                  )}

                  {module.topics.some((topic) => topic.problems.length > 0) && (
                    <div className="mt-5 space-y-3">
                      <div className="text-[0.7rem] font-mono uppercase tracking-[0.12em] text-muted-foreground">
                        Practice in this module
                      </div>
                      <div className="grid gap-3 md:grid-cols-2">
                        {module.topics
                          .flatMap((topic) =>
                            topic.problems.map((entry) => ({
                              topic,
                              problem: entry.problem,
                            })),
                          )
                          .slice(0, 2)
                          .map(({ topic, problem }) => (
                            <ProblemCard
                              key={problem.id}
                              problem={{
                                ...problem,
                                hints: [],
                                editorial: null,
                              }}
                              moduleName={module.name}
                              topicName={topic.name}
                              status={problemProgressMap.get(problem.id)}
                              compact
                            />
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
