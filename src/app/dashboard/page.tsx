import type { ComponentType } from "react";
import Link from "next/link";
import { ArrowRight, BookOpen, Code2, Flame, Target } from "lucide-react";
import { unstable_cache } from "next/cache";
import { ProgressStatus } from "@/generated/prisma";
import { ProblemCard } from "@/components/problems/ProblemCard";
import { getCurrentUser } from "@/lib/auth";
import { getBookmarkProblemIds } from "@/lib/lists";
import { ReadProgressSync } from "@/components/progress/ReadProgressSync";
import { progressLabel } from "@/components/problems/problem-ui";
import { prisma } from "@/lib/prisma";

// The dashboard is largely a read-only summary that does not need to be
// fully dynamic on every request. Tag-based revalidation is intentionally
// not used here (writes from the user flow are infrequent) — a 60s TTL
// keeps the page snappy and bounded, while still picking up progress
// changes within a minute.
export const revalidate = 60;

/**
 * Cached module/topic/article index.
 *
 * This is the same shape that `getSearchIndex` already produces, but scoped
 * to the lightweight summary fields the dashboard actually consumes. It is
 * `unstable_cache`d so multiple signed-in users hitting the page in the
 * 60s revalidation window share the same DB round-trip.
 */
const getModuleIndex = unstable_cache(
  async () => {
    return prisma.module.findMany({
      where: { topics: { some: { articles: { some: { status: "PUBLISHED" } } } } },
      orderBy: { order: "asc" },
      select: {
        id: true,
        name: true,
        topics: {
          orderBy: { order: "asc" },
          select: {
            id: true,
            name: true,
            articles: {
              where: { status: "PUBLISHED" },
              orderBy: [{ level: "asc" }, { order: "asc" }],
              select: { id: true, slug: true, title: true },
            },
          },
        },
      },
    });
  },
  ["dashboard:module-index"],
  { revalidate: 60, tags: ["module-index"] },
);

type DashboardProblem = {
  id: string;
  updatedAt: Date;
  status: ProgressStatus;
  problem: {
    id: string;
    slug: string;
    title: string;
    difficulty: "EASY" | "MEDIUM" | "HARD";
    acceptanceRate: number;
    hints: { id: string }[];
    editorial: { id: string } | null;
    topics: { topic: { name: string; module: { name: string } } }[];
  };
};

type DashboardArticle = {
  id: string;
  readAt: Date;
  article: { id: string; slug: string; title: string; topic: { name: string; module: { name: string } } };
};

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <div className="max-w-5xl mx-auto px-6 md:px-12 py-16 space-y-10">
        <header className="bloom">
          <div className="eyebrow mb-4" style={{ ["--i" as string]: 0 }}>
            <span className="text-[color:var(--ink-blue)] mr-2">§</span>
            Dashboard
          </div>
          <h1
            className="font-display text-[clamp(2.25rem,5vw,3.5rem)] leading-[1.06] font-medium text-[color:var(--ink)]"
            style={{ ["--i" as string]: 1 }}
          >
            Track your learning arc
          </h1>
          <p
            className="text-[1.05rem] mt-3 max-w-2xl text-[color:var(--ink-soft)]"
            style={{ ["--i" as string]: 2 }}
          >
            Sign in to sync article completion, problem status, and roadmap progress across devices.
          </p>
        </header>

        <section className="surface-card p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="eyebrow mb-2">Progress sync</div>
            <h2 className="font-display text-2xl font-medium">No account connected</h2>
            <p className="mt-2 text-sm text-muted-foreground">Create an account to unlock your personal dashboard.</p>
          </div>
          <Link href="/auth" className="btn-ink">
            Sign in or create account
            <ArrowRight className="h-4 w-4" />
          </Link>
        </section>
      </div>
    );
  }

  // Four queries instead of the previous eight. The cached `getModuleIndex`
  // is shared across users; the remaining three are scoped to this user.
  const [modules, bookmarkIds, userProblemProgress, articleProgress] = await Promise.all([
    getModuleIndex(),
    getBookmarkProblemIds(user.id),
    prisma.userProblemProgress.findMany({
      where: { userId: user.id, problem: { status: "PUBLISHED" } },
      orderBy: [{ updatedAt: "desc" }],
      select: {
        id: true,
        updatedAt: true,
        status: true,
        problem: {
          // ⚡ Bolt + audit I-1: Use `select` instead of `include` to avoid
          // fetching large text fields (like `statementMd`, `examplesJson`).
          // We only need the first topic for the breadcrumb, hence `take: 1`.
          select: {
            id: true,
            slug: true,
            title: true,
            difficulty: true,
            acceptanceRate: true,
            hints: { select: { id: true } },
            editorial: { select: { id: true } },
            topics: {
              select: { topic: { select: { name: true, module: { select: { name: true } } } } },
              take: 1,
            },
          },
        },
      },
    }),
    prisma.userArticleProgress.findMany({
      where: { userId: user.id },
      orderBy: { readAt: "desc" },
      select: {
        id: true,
        readAt: true,
        article: {
          select: {
            id: true,
            slug: true,
            title: true,
            topic: { select: { name: true, module: { select: { name: true } } } },
          },
        },
      },
    }),
  ]);

  // The original code ran two extra `findMany`s just to pull `readAt` /
  // `updatedAt` again for the activity chart. With the consolidated fetch
  // above we already have those columns locally, so we derive everything
  // from these two arrays.
  const recentProblems: DashboardProblem[] = userProblemProgress;
  const allProblems = userProblemProgress;
  const recentReads: DashboardArticle[] = articleProgress.slice(0, 6);
  const allArticles = articleProgress;
  const readSlugs = Array.from(new Set(articleProgress.map((entry) => entry.article.slug)));

  // ⚡ Bolt: Use a Set for O(1) lookups below instead of O(N) array .includes()
  const readSlugSet = new Set(readSlugs);

  const totalArticles = modules.reduce(
    (sum, module) => sum + module.topics.reduce((inner, topic) => inner + topic.articles.length, 0),
    0,
  );
  const articlePct = totalArticles === 0 ? 0 : Math.round((readSlugs.length / totalArticles) * 100);
  // ⚡ Bolt: Prevent chained array allocations using explicit single-pass iteration
  let solvedCount = 0;
  let attemptedCount = 0;
  for (const entry of allProblems) {
    if (entry.status === ProgressStatus.SOLVED || entry.status === ProgressStatus.MASTERED) {
      solvedCount++;
    } else if (entry.status === ProgressStatus.ATTEMPTED || entry.status === ProgressStatus.NEEDS_REVISION) {
      attemptedCount++;
    }
  }

  const nextModule = modules.find((module) => {
    for (const topic of module.topics) {
      for (const article of topic.articles) {
        if (!readSlugSet.has(article.slug)) return true;
      }
    }
    return false;
  });

  // ⚡ Bolt: Avoid O(N*M) redundant traversals by grouping statuses in a single explicit pass
  const statusItems: Record<string, DashboardProblem[]> = {
    [ProgressStatus.ATTEMPTED]: [],
    [ProgressStatus.NEEDS_REVISION]: [],
    [ProgressStatus.SOLVED]: [],
    [ProgressStatus.MASTERED]: [],
  };
  for (const entry of allProblems) {
    if (statusItems[entry.status]) {
      statusItems[entry.status].push(entry);
    }
  }
  const statusBuckets = [
    ProgressStatus.ATTEMPTED,
    ProgressStatus.NEEDS_REVISION,
    ProgressStatus.SOLVED,
    ProgressStatus.MASTERED,
  ].map((status) => ({
    status,
    items: statusItems[status],
  }));

  // ⚡ Bolt: Prevent hidden O(N) array allocations (.map().map()) using explicit single-pass iteration
  const activityDates: Date[] = [];
  for (const entry of allArticles) activityDates.push(entry.readAt);
  for (const entry of allProblems) activityDates.push(entry.updatedAt);

  const activityDays = buildActivityDays(activityDates);

  const dateKeys: string[] = [];
  let bestDayCount = 1;
  for (const day of activityDays) {
    dateKeys.push(day.dateKey);
    if (day.count > bestDayCount) bestDayCount = day.count;
  }
  const currentStreak = computeCurrentStreak(dateKeys);
  const moduleCompletion = modules.map((module) => {
    let readCount = 0;
    let total = 0;
    let nextArticle: { id: string; slug: string; title: string; } | null = null;

    for (const topic of module.topics) {
      for (const article of topic.articles) {
        total++;
        if (readSlugSet.has(article.slug)) {
          readCount++;
        } else if (!nextArticle) {
          nextArticle = article;
        }
      }
    }

    const pct = total === 0 ? 0 : Math.round((readCount / total) * 100);
    return {
      name: module.name,
      readCount,
      total,
      pct,
      nextArticle,
    };
  });

  return (
    <div className="max-w-6xl mx-auto px-6 md:px-12 py-16 space-y-12">
      <ReadProgressSync slugs={readSlugs} />

      <header className="bloom">
        <div className="eyebrow mb-4" style={{ ["--i" as string]: 0 }}>
          <span className="text-[color:var(--ink-blue)] mr-2">§</span>
          Dashboard
        </div>
        <h1
          className="font-display text-[clamp(2.25rem,5vw,3.5rem)] leading-[1.06] font-medium text-[color:var(--ink)]"
          style={{ ["--i" as string]: 1 }}
        >
          Welcome back, {user.name || user.email}
        </h1>
        <p
          className="text-[1.05rem] mt-3 max-w-2xl text-[color:var(--ink-soft)]"
          style={{ ["--i" as string]: 2 }}
        >
          A quick view of what you’ve read, what you’ve solved, and what to tackle next.
        </p>
      </header>

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={BookOpen} label="Articles read" value={`${readSlugs.length}/${totalArticles}`} detail={`${articlePct}% of the curriculum`} />
        <StatCard icon={Code2} label="Problems solved" value={String(solvedCount)} detail={`${attemptedCount} still in progress`} />
        <StatCard icon={Target} label="Next module" value={nextModule?.name ?? "Revision loop"} detail={nextModule ? "Continue where your reading trail stops" : "You’ve completed every current module"} />
        <StatCard icon={Flame} label="Current streak" value={`${currentStreak} day${currentStreak === 1 ? "" : "s"}`} detail="Based on article reads and problem updates" />
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <div className="surface-card p-6 space-y-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="eyebrow mb-2">Activity</div>
              <h2 className="font-display text-2xl font-medium">Last 7 days</h2>
            </div>
            <span className="text-xs font-mono uppercase tracking-[0.12em] text-muted-foreground">Reads + progress updates</span>
          </div>
          <div className="rounded-xl border border-[color:var(--rule)] px-4 py-5">
            <div className="flex items-end gap-3 h-44">
              {activityDays.map((day) => {
                const height = Math.max(10, Math.round((day.count / bestDayCount) * 100));
                return (
                  <div key={day.dateKey} className="flex-1 flex flex-col items-center gap-3 min-w-0">
                    <span className="text-[0.68rem] font-mono text-muted-foreground">{day.count}</span>
                    <div className="w-full flex-1 flex items-end">
                      <div
                        className="w-full rounded-t-md bg-[color:var(--ink-blue)]/75"
                        style={{ height: `${height}%` }}
                        title={`${day.label}: ${day.count} activities`}
                      />
                    </div>
                    <span className="text-[0.65rem] font-mono uppercase tracking-[0.08em] text-muted-foreground">{day.shortLabel}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="surface-card p-6 space-y-5">
          <div>
            <div className="eyebrow mb-2">Problem states</div>
            <h2 className="font-display text-2xl font-medium">Your current queue</h2>
          </div>
          <div className="space-y-4">
            {statusBuckets.map(({ status, items }) => (
              <Link key={status} href={`/problems?status=${status}`} className="block rounded-xl border border-[color:var(--rule)] px-4 py-3 hover:border-[color:var(--ink-blue)] transition-colors">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm font-medium">{progressLabel[status]}</span>
                  <span className="text-xs font-mono uppercase tracking-[0.12em] text-muted-foreground">{items.length}</span>
                </div>
              </Link>
            ))}
          </div>
          <Link href="/problems" className="inline-flex items-center gap-1.5 text-sm font-medium text-[color:var(--ink-blue)] link-quill">
            Open problem library
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
          <Link href="/lists" className="inline-flex items-center gap-1.5 text-sm font-medium text-[color:var(--ink-blue)] link-quill">
            Open saved lists
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="surface-card p-6 space-y-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="eyebrow mb-2">Module completion</div>
              <h2 className="font-display text-2xl font-medium">Where your reading stands</h2>
            </div>
            <Link href="/roadmap" className="link-quill text-sm text-[color:var(--ink-blue)] inline-flex items-center gap-1.5">
              Open roadmap
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="space-y-4">
            {moduleCompletion.map((module) => (
              <div key={module.name} className="rounded-xl border border-[color:var(--rule)] px-4 py-3">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="font-medium text-[color:var(--ink)]">{module.name}</div>
                    <div className="mt-1 text-[0.72rem] font-mono uppercase tracking-[0.1em] text-muted-foreground">
                      {module.readCount}/{module.total} read · {module.pct}%
                    </div>
                  </div>
                  {module.nextArticle ? (
                    <Link href={`/learn/${module.nextArticle.slug}`} className="text-sm text-[color:var(--ink-blue)] link-quill shrink-0">
                      Continue
                    </Link>
                  ) : (
                    <span className="pill border-[color:var(--rule)] text-muted-foreground">Complete</span>
                  )}
                </div>
                <div className="mt-3 h-2 rounded-full bg-[color:var(--rule)]/60 overflow-hidden">
                  <div className="h-full bg-[color:var(--ink-blue)] transition-[width]" style={{ width: `${module.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="surface-card p-6 space-y-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="eyebrow mb-2">Recent reading</div>
              <h2 className="font-display text-2xl font-medium">Your latest article trail</h2>
            </div>
            <Link href="/learn" className="link-quill text-sm text-[color:var(--ink-blue)] inline-flex items-center gap-1.5">
              Browse library
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="space-y-3">
            {recentReads.length === 0 ? (
              <p className="text-sm text-muted-foreground">No synced article progress yet. Open an article to start your trail.</p>
            ) : (
              recentReads.map((entry) => (
                <Link
                  key={entry.id}
                  href={`/learn/${entry.article.slug}`}
                  className="block rounded-xl border border-[color:var(--rule)] px-4 py-3 hover:border-[color:var(--ink-blue)] transition-colors"
                >
                  <div className="font-medium text-[color:var(--ink)]">{entry.article.title}</div>
                  <div className="mt-1 text-[0.72rem] font-mono uppercase tracking-[0.1em] text-muted-foreground">
                    {entry.article.topic.module.name} · {entry.article.topic.name}
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </section>

      <section className="space-y-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="eyebrow mb-2">Practice focus</div>
            <h2 className="font-display text-2xl font-medium">Problems you’ve touched recently</h2>
          </div>
          <Link href="/problems?status=ATTEMPTED" className="link-quill text-sm text-[color:var(--ink-blue)] inline-flex items-center gap-1.5">
            Filter by status
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {recentProblems.length === 0 ? (
          <div className="surface-card p-8 text-muted-foreground">No synced problem progress yet. Mark a problem as attempted or solved to populate this section.</div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {recentProblems.slice(0, 8).map((entry) => {
              const primaryTopic = entry.problem.topics[0]?.topic;
              return (
                <ProblemCard
                  key={entry.id}
                  problem={entry.problem}
                  moduleName={primaryTopic?.module.name}
                  topicName={primaryTopic?.name}
                  status={entry.status}
                  bookmarked={bookmarkIds.has(entry.problem.id)}
                  signedIn
                  returnTo="/dashboard"
                />
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  detail,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="surface-card p-6 space-y-3">
      <div className="h-10 w-10 rounded-sm grid place-items-center border border-[color:var(--rule-strong)] text-[color:var(--ink-blue)] bg-[color:var(--surface-2)]">
        <Icon className="h-5 w-5" />
      </div>
      <div className="text-[0.72rem] font-mono uppercase tracking-[0.12em] text-muted-foreground">{label}</div>
      <div className="font-display text-2xl font-medium text-[color:var(--ink)]">{value}</div>
      <p className="text-sm text-muted-foreground leading-relaxed">{detail}</p>
    </div>
  );
}

// `toISOString().slice(0, 10)` reads the date in UTC, but `setHours(0,0,0,0)`
// writes midnight in the server's local time. The two are not the same
// day for any non-zero UTC offset (e.g. UTC+9: local midnight on Jun 15 is
// 15:00 UTC on Jun 14). Using `getFullYear`/`getMonth`/`getDate` keeps the
// bucket assignment in local time, which matches the user's wall clock.
function localDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function buildActivityDays(dates: Date[]) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const counts = new Map<string, number>();
  for (const date of dates) {
    const key = localDateKey(new Date(date));
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  return Array.from({ length: 7 }, (_, index) => {
    const day = new Date(today);
    day.setDate(today.getDate() - (6 - index));
    const dateKey = localDateKey(day);
    return {
      dateKey,
      count: counts.get(dateKey) ?? 0,
      label: day.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }),
      shortLabel: day.toLocaleDateString("en-US", { weekday: "short" }).slice(0, 3),
    };
  });
}

function computeCurrentStreak(dateKeys: string[]) {
  const unique = new Set(dateKeys);
  let streak = 0;
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);

  while (true) {
    const key = localDateKey(cursor);
    if (!unique.has(key)) break;
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}
