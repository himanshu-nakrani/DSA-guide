import { prisma } from "@/lib/prisma";
import { ArticleStatus, ProgressStatus } from "@/generated/prisma";
import { ArrowRight } from "lucide-react";
import { ArticleLink } from "@/components/article/ArticleLink";
import { ProgressNode } from "@/components/roadmap/ProgressNode";
import { getCurrentUser } from "@/lib/auth";
import { getBookmarkProblemIds } from "@/lib/lists";
import { getUserReadArticleSlugs } from "@/lib/progress";
import { ReadProgressSync } from "@/components/progress/ReadProgressSync";
import { ProblemCard } from "@/components/problems/ProblemCard";
import { pickNextProblem, summarizeProblemProgress } from "@/lib/problem-progress";

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
                // ⚡ Bolt: Use `select` instead of fetching all fields to avoid pulling large `contentMd` text
                select: {
                  slug: true,
                  title: true,
                  summary: true,
                  level: true,
                  estimatedMins: true,
                },
              },
              problems: {
                // ⚡ Bolt: Use `select` instead of `include` to avoid fetching large text fields (like `statementMd`, `examplesJson`)
                select: {
                  problemId: true,
                  problem: {
                    select: {
                      id: true,
                      slug: true,
                      title: true,
                      difficulty: true,
                      acceptanceRate: true,
                    },
                  },
                },
              },
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

  // ⚡ Bolt: Single-pass iteration to avoid chained flatMap/map intermediate array allocations
  const problemIds: string[] = [];
  for (const trackModule of track.modules) {
    for (const topic of trackModule.topics) {
      for (const entry of topic.problems) {
        problemIds.push(entry.problemId);
      }
    }
  }

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
  const bookmarkIds = user ? await getBookmarkProblemIds(user.id) : new Set<string>();
  const readSlugSet = new Set(readSlugs);

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
          // ⚡ Bolt: Single-pass iteration to prevent hidden O(N) array allocations
          // and redundant O(N) traversals across deeply nested relationships.
          let articleCount = 0;
          let problemCount = 0;
          let readArticleCount = 0;
          const moduleSlugs: string[] = [];
          const moduleProblems: Array<{
            id: string;
            slug: string;
            title: string;
            difficulty: import("@/generated/prisma").Difficulty;
            acceptanceRate: number;
          }> = [];
          let firstArticle = null;

          for (const topic of module.topics) {
            articleCount += topic.articles.length;
            problemCount += topic.problems.length;

            for (const article of topic.articles) {
              if (!firstArticle) firstArticle = article;
              moduleSlugs.push(article.slug);
              if (readSlugSet.has(article.slug)) readArticleCount++;
            }

            for (const entry of topic.problems) {
              moduleProblems.push(entry.problem);
            }
          }

          const moduleProblemSummary = summarizeProblemProgress(
            moduleProblems.map((problem) => problem.id),
            problemProgressMap,
          );
          const nextProblem = pickNextProblem(moduleProblems, problemProgressMap);
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

                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <ProgressMeter
                      label="Reading"
                      current={readArticleCount}
                      total={articleCount}
                      detail={`${readArticleCount}/${articleCount} articles read`}
                    />
                    <ProgressMeter
                      label="Practice"
                      current={moduleProblemSummary.solved}
                      total={moduleProblemSummary.total}
                      detail={`${moduleProblemSummary.solved}/${moduleProblemSummary.total} problems solved`}
                    />
                  </div>

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

                  {module.topics.length > 0 && (
                    <div className="mt-5 space-y-3">
                      <div className="text-[0.7rem] font-mono uppercase tracking-[0.12em] text-muted-foreground">
                        Topic progress
                      </div>
                      <div className="grid gap-3 md:grid-cols-2">
                        {module.topics.map((topic) => {
                          const topicSlugs = topic.articles.map((article) => article.slug);
                          const topicProblemIds = topic.problems.map((entry) => entry.problemId);
                          const topicProblemSummary = summarizeProblemProgress(
                            topicProblemIds,
                            problemProgressMap,
                          );
                          const topicReadCount = topicSlugs.filter((articleSlug) =>
                            readSlugSet.has(articleSlug),
                          ).length;
                          const topicPercent =
                            topic.articles.length + topicProblemSummary.total === 0
                              ? 0
                              : Math.round(
                                  ((topicReadCount + topicProblemSummary.solved) /
                                    (topic.articles.length + topicProblemSummary.total)) *
                                    100,
                                );

                          return (
                            <div
                              key={topic.id}
                              className="rounded-xl border border-[color:var(--rule)] bg-background/40 px-4 py-3"
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <div className="font-medium text-sm text-[color:var(--ink)]">
                                    {topic.name}
                                  </div>
                                  <div className="mt-1 text-[0.68rem] font-mono uppercase tracking-[0.1em] text-muted-foreground">
                                    {topicReadCount}/{topic.articles.length} read · {topicProblemSummary.solved}/{topicProblemSummary.total} solved
                                  </div>
                                </div>
                                <span className="text-xs font-mono tabular-nums text-muted-foreground">
                                  {topicPercent}%
                                </span>
                              </div>
                              <div className="mt-3 h-1.5 rounded-full bg-[color:var(--rule)]/60 overflow-hidden">
                                <div
                                  className="h-full bg-[color:var(--ink-blue)] transition-[width]"
                                  style={{ width: `${topicPercent}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {nextProblem && (
                    <div className="mt-5 space-y-3">
                      <div className="flex items-center justify-between gap-4">
                        <div className="text-[0.7rem] font-mono uppercase tracking-[0.12em] text-muted-foreground">
                          Recommended next problem
                        </div>
                        <span className="text-[0.68rem] font-mono uppercase tracking-[0.1em] text-muted-foreground">
                          {moduleProblemSummary.started}/{moduleProblemSummary.total} started
                        </span>
                      </div>
                      <ProblemCard
                        problem={{
                          ...nextProblem,
                          hints: [],
                          editorial: null,
                        }}
                        moduleName={module.name}
                        topicName={
                          module.topics.find((topic) =>
                            topic.problems.some((entry) => entry.problemId === nextProblem.id),
                          )?.name
                        }
                        status={problemProgressMap.get(nextProblem.id)}
                        bookmarked={bookmarkIds.has(nextProblem.id)}
                        signedIn={Boolean(user)}
                        returnTo="/roadmap"
                      />
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

function ProgressMeter({
  label,
  current,
  total,
  detail,
}: {
  label: string;
  current: number;
  total: number;
  detail: string;
}) {
  const percent = total === 0 ? 0 : Math.round((current / total) * 100);

  return (
    <div className="rounded-xl border border-[color:var(--rule)] bg-background/40 px-4 py-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-[0.68rem] font-mono uppercase tracking-[0.12em] text-muted-foreground">
            {label}
          </div>
          <div className="mt-1 text-sm text-[color:var(--ink-soft)]">{detail}</div>
        </div>
        <span className="font-mono text-sm tabular-nums text-[color:var(--ink)]">
          {percent}%
        </span>
      </div>
      <div className="mt-3 h-1.5 rounded-full bg-[color:var(--rule)]/60 overflow-hidden">
        <div
          className="h-full bg-[color:var(--ink-blue)] transition-[width]"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
