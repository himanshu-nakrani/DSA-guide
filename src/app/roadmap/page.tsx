import { prisma } from "@/lib/prisma";
import { ArticleStatus, ProblemStatus, ProgressStatus } from "@/generated/prisma";
import { ArrowRight, ChevronDown } from "lucide-react";
import { ArticleLink } from "@/components/article/ArticleLink";
import { ProgressNode } from "@/components/roadmap/ProgressNode";
import { CollapsibleRoot, CollapsiblePanel, CollapsibleTrigger } from "@/components/ui/collapsible";
import { PageHeader, PageShell } from "@/components/layout/PageShell";
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
                where: { problem: { status: ProblemStatus.PUBLISHED } },
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
      <div className="max-w-4xl mx-auto px-6 md:px-12 py-24 text-center space-y-3">
        <h1 className="font-display text-3xl font-medium text-ink">No roadmap bound yet</h1>
        <p className="text-body text-muted-foreground">
          The curriculum hasn&rsquo;t been published. Check back after the next edition.
        </p>
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

  // One stats pass up front so the "current module" (first one not finished)
  // can be auto-expanded while completed and untouched ones stay folded.
  const moduleStats = track.modules.map((module) => {
    const articleCount = module.topics.reduce((s, t) => s + t.articles.length, 0);
    const problemCount = module.topics.reduce((s, t) => s + t.problems.length, 0);
    const moduleSlugs = module.topics.flatMap((t) => t.articles.map((a) => a.slug));
    const readArticleCount = moduleSlugs.filter((slug) => readSlugSet.has(slug)).length;
    const moduleProblemIds = module.topics.flatMap((topic) =>
      topic.problems.map((entry) => entry.problemId),
    );
    const summary = summarizeProblemProgress(moduleProblemIds, problemProgressMap);
    const denom = articleCount + summary.total;
    const percent = denom === 0 ? 0 : Math.round(((readArticleCount + summary.solved) / denom) * 100);
    return {
      moduleId: module.id,
      articleCount,
      problemCount,
      readArticleCount,
      summary,
      percent,
    };
  });
  const currentModuleId =
    moduleStats.find((stats) => stats.percent < 100)?.moduleId ??
    track.modules[track.modules.length - 1]?.id ??
    null;

  return (
    <PageShell width="default">
      {readSlugs.length > 0 && <ReadProgressSync slugs={readSlugs} />}
      <PageHeader
        eyebrow="Curriculum"
        title="The Roadmap"
        lede={track.description}
      />

      {/* Module cards */}
      <ol className="space-y-4">
        {track.modules.map((module, i) => {
          const stats = moduleStats[i];
          const moduleProblems = module.topics.flatMap((topic) =>
            topic.problems.map((entry) => entry.problem),
          );
          const nextProblem = pickNextProblem(moduleProblems, problemProgressMap);
          const moduleArticles = module.topics.flatMap((t) => t.articles);
          const firstArticle = moduleArticles[0] ?? null;
          const firstUnread =
            moduleArticles.find((a) => !readSlugSet.has(a.slug)) ?? null;
          const resumeTarget = firstUnread ?? firstArticle;
          const isCurrent = module.id === currentModuleId;

          return (
            <li key={module.id}>
              <CollapsibleRoot
                defaultOpen={isCurrent}
                className="overflow-hidden rounded-xl border border-border bg-surface-1 shadow-[var(--shadow-card)]"
              >
                <div>
                  <CollapsibleTrigger className="px-5 py-4">
                    <span className="flex min-w-0 flex-1 items-center gap-3">
                      <ProgressNode order={module.order} slugs={module.topics.flatMap((t) => t.articles.map((a) => a.slug))} />
                      <span className="min-w-0 flex-1 text-left">
                        <span className="block truncate text-base font-semibold tracking-tight text-foreground">
                          {module.name}
                        </span>
                        <span className="mt-0.5 block text-xs tabular-nums text-muted-foreground">
                          {stats.articleCount} {stats.articleCount === 1 ? "article" : "articles"}
                          {stats.problemCount > 0 && ` · ${stats.percent}%`}
                        </span>
                      </span>
                      {stats.percent >= 100 ? (
                        <span className="pill shrink-0 border-ink-green/40 bg-ink-green-wash text-ink-green">
                          Complete
                        </span>
                      ) : (
                        isCurrent && (
                          <span className="pill pill-primary shrink-0">
                            Up next
                          </span>
                        )
                      )}
                    </span>
                    <ChevronDown
                      aria-hidden
                      className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-[var(--dur-base)] ease-[var(--ease-out)] group-data-[open]/section:rotate-180"
                      strokeWidth={1.75}
                    />
                  </CollapsibleTrigger>

                    <CollapsiblePanel>
                      <div className="px-5 pb-5 space-y-4 border-t border-border pt-4">
                        {module.description && (
                          <p className="text-body leading-relaxed text-ink-soft">
                            {module.description}
                          </p>
                        )}

                        <div className="grid gap-3 sm:grid-cols-2">
                          <ProgressMeter
                            label="Reading"
                            current={stats.readArticleCount}
                            total={stats.articleCount}
                            detail={`${stats.readArticleCount}/${stats.articleCount} articles read`}
                            sourceNote={user ? "Synced to account" : "Local to this browser"}
                          />
                          <ProgressMeter
                            label="Practice"
                            current={stats.summary.solved}
                            total={stats.summary.total}
                            detail={`${stats.summary.solved}/${stats.summary.total} problems solved`}
                            sourceNote={user ? "Synced to account" : "Sign in to save progress"}
                          />
                        </div>

                        {resumeTarget && (
                          <div>
                            <ArticleLink
                              href={`/learn/${resumeTarget.slug}`}
                              preview={{
                                title: resumeTarget.title,
                                summary: resumeTarget.summary,
                                level: resumeTarget.level,
                                estimatedMins: resumeTarget.estimatedMins,
                                moduleName: module.name,
                              }}
                              className="inline-flex items-center gap-1.5 text-small font-medium text-ink-blue link-quill"
                            >
                              {firstUnread ? "Resume" : "Review again"}: {resumeTarget.title}
                              <ArrowRight className="h-3.5 w-3.5" />
                            </ArticleLink>
                          </div>
                        )}

                        {module.topics.length > 0 && (
                          <div className="space-y-3">
                            <div className="text-note font-mono uppercase tracking-[0.12em] text-muted-foreground">
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
                                    className="rounded-xl border border-border bg-surface-2/60 px-4 py-3"
                                  >
                                    <div className="flex items-start justify-between gap-3">
                                      <div>
                                        <div className="font-medium text-small text-ink">
                                          {topic.name}
                                        </div>
                                        <div className="mt-1 text-caption font-mono uppercase tracking-[0.1em] text-muted-foreground">
                                          {topicReadCount}/{topic.articles.length} read · {topicProblemSummary.solved}/{topicProblemSummary.total} solved
                                        </div>
                                      </div>
                                      <span className="text-caption font-mono tabular-nums text-muted-foreground">
                                        {topicPercent}%
                                      </span>
                                    </div>
                                    <div className="mt-3 h-1.5 rounded-full bg-border overflow-hidden">
                                      <div
                                        className="h-full bg-ink-blue transition-[width]"
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
                          <div className="space-y-3">
                            <div className="flex items-center justify-between gap-4">
                              <div className="text-note font-mono uppercase tracking-[0.12em] text-muted-foreground">
                                Recommended next problem
                              </div>
                              <span className="text-caption font-mono uppercase tracking-[0.1em] text-muted-foreground">
                                {stats.summary.started}/{stats.summary.total} started
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
                    </CollapsiblePanel>
                  </div>
                </CollapsibleRoot>
            </li>
          );
        })}
      </ol>
    </PageShell>
  );
}

function ProgressMeter({
  label,
  current,
  total,
  detail,
  sourceNote,
}: {
  label: string;
  current: number;
  total: number;
  detail: string;
  sourceNote?: string;
}) {
  const percent = total === 0 ? 0 : Math.round((current / total) * 100);

  return (
    <div className="rounded-xl border border-border bg-surface-2/60 px-4 py-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-caption font-mono uppercase tracking-[0.12em] text-muted-foreground">
            {label}
          </div>
          <div className="mt-1 text-small text-ink-soft">{detail}</div>
        </div>
        <span className="font-mono text-small tabular-nums text-ink">
          {percent}%
        </span>
      </div>
      <div className="mt-3 h-1.5 rounded-full bg-border overflow-hidden">
        <div
          className="h-full bg-ink-blue transition-[width]"
          style={{ width: `${percent}%` }}
        />
      </div>
      {sourceNote && (
        <div className="mt-2 font-pencil text-caption text-muted-foreground">{sourceNote}</div>
      )}
    </div>
  );
}
