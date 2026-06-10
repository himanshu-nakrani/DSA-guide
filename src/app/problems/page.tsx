import Link from "next/link";
import { ArrowDownAZ, ArrowRight, ArrowUpDown, Clock3, Search, Trophy } from "lucide-react";
import { Difficulty, ProgressStatus, type Prisma } from "@/generated/prisma";
import { ProblemCard } from "@/components/problems/ProblemCard";
import { difficultyLabel, progressLabel } from "@/components/problems/problem-ui";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const statusOptions = [
  ProgressStatus.NEW,
  ProgressStatus.ATTEMPTED,
  ProgressStatus.SOLVED,
  ProgressStatus.NEEDS_REVISION,
  ProgressStatus.MASTERED,
] as const;

const sortOptions = [
  { value: "title", label: "Title (A–Z)", icon: ArrowDownAZ },
  { value: "difficulty", label: "Difficulty", icon: Trophy },
  { value: "acceptance", label: "Acceptance rate", icon: ArrowUpDown },
  { value: "recent", label: "Recently updated", icon: Clock3 },
] as const;

type SortOption = (typeof sortOptions)[number]["value"];

function parseDifficulty(value?: string): Difficulty | undefined {
  return value && Object.values(Difficulty).includes(value as Difficulty)
    ? (value as Difficulty)
    : undefined;
}

function parseStatus(value?: string): ProgressStatus | undefined {
  return value && Object.values(ProgressStatus).includes(value as ProgressStatus)
    ? (value as ProgressStatus)
    : undefined;
}

function parseSort(value?: string): SortOption {
  return sortOptions.some((option) => option.value === value) ? (value as SortOption) : "difficulty";
}

function buildOrderBy(sort: SortOption): Prisma.ProblemOrderByWithRelationInput[] {
  switch (sort) {
    case "title":
      return [{ title: "asc" }];
    case "acceptance":
      return [{ acceptanceRate: "desc" }, { title: "asc" }];
    case "recent":
      return [{ updatedAt: "desc" }, { title: "asc" }];
    case "difficulty":
    default:
      return [{ difficulty: "asc" }, { title: "asc" }];
  }
}

export default async function ProblemsPage({
  searchParams,
}: {
  searchParams: Promise<{ difficulty?: string; topic?: string; status?: string; q?: string; sort?: string }>;
}) {
  const user = await getCurrentUser();
  const params = await searchParams;

  const difficulty = parseDifficulty(params.difficulty);
  const status = parseStatus(params.status);
  const topicSlug = params.topic?.trim() || undefined;
  const query = params.q?.trim() || "";
  const sort = parseSort(params.sort);

  const topics = await prisma.topic.findMany({
    where: { problems: { some: { problem: { status: "PUBLISHED" } } } },
    orderBy: [{ module: { order: "asc" } }, { order: "asc" }],
    include: { module: true },
  });

  const problemWhere: Prisma.ProblemWhereInput = {
    status: "PUBLISHED",
    ...(difficulty ? { difficulty } : {}),
    ...(topicSlug
      ? {
          topics: {
            some: {
              topic: { slug: topicSlug },
            },
          },
        }
      : {}),
    ...(query
      ? {
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { statementMd: { contains: query, mode: "insensitive" } },
            {
              topics: {
                some: {
                  topic: {
                    OR: [
                      { name: { contains: query, mode: "insensitive" } },
                      { module: { name: { contains: query, mode: "insensitive" } } },
                    ],
                  },
                },
              },
            },
          ],
        }
      : {}),
  };

  const progressFilter = user && status
    ? {
        progress: {
          some: {
            userId: user.id,
            status,
          },
        },
      }
    : undefined;

  const problems = await prisma.problem.findMany({
    where: {
      ...problemWhere,
      ...(progressFilter ?? {}),
    },
    orderBy: buildOrderBy(sort),
    include: {
      topics: {
        include: {
          topic: {
            include: { module: true },
          },
        },
      },
      hints: { select: { id: true } },
      editorial: { select: { id: true } },
    },
  });

  const progressRows = user
    ? await prisma.userProblemProgress.findMany({
        where: { userId: user.id, problemId: { in: problems.map((problem) => problem.id) } },
        select: { problemId: true, status: true },
      })
    : [];

  const progressMap = new Map<string, ProgressStatus>(
    progressRows.map((row) => [row.problemId, row.status]),
  );

  const withEditorialCount = problems.filter((p) => p.editorial).length;
  const activeFilters = [difficulty, topicSlug, user && status ? status : undefined, query || undefined, sort !== "difficulty" ? sort : undefined].filter(Boolean).length;

  return (
    <div className="max-w-6xl mx-auto px-6 md:px-12 py-16">
      <header className="bloom mb-12">
        <div className="eyebrow mb-4" style={{ ["--i" as string]: 0 }}>
          <span className="text-[color:var(--ink-blue)] mr-2">§</span>
          Practice
        </div>
        <h1
          className="font-display text-[clamp(2.25rem,5vw,3.5rem)] leading-[1.06] font-medium text-[color:var(--ink)]"
          style={{ ["--i" as string]: 1 }}
        >
          Problem Library
        </h1>
        <p
          className="text-[1.05rem] mt-3 max-w-2xl text-[color:var(--ink-soft)]"
          style={{ ["--i" as string]: 2 }}
        >
          Move from theory to repetition: curated practice, hints, editorials, and now a searchable, sortable queue.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-3 text-[0.75rem] font-mono uppercase tracking-[0.12em] text-muted-foreground">
          <span>{problems.length} matching problems</span>
          <span className="text-muted-foreground/40">·</span>
          <span>{withEditorialCount} with editorials</span>
          {activeFilters > 0 && (
            <>
              <span className="text-muted-foreground/40">·</span>
              <span>{activeFilters} active filter{activeFilters === 1 ? "" : "s"}</span>
            </>
          )}
          {!user && (
            <>
              <span className="text-muted-foreground/40">·</span>
              <Link href="/auth" className="link-quill text-[color:var(--ink-blue)] normal-case tracking-normal font-sans text-sm inline-flex items-center gap-1">
                Sign in to save progress
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </>
          )}
        </div>
        <div aria-hidden className="mt-8 h-px bg-[color:var(--rule-strong)]" />
      </header>

      <section className="surface-card p-5 md:p-6 mb-8 space-y-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <div className="eyebrow mb-2">Filters</div>
            <h2 className="font-display text-xl font-medium">Search, narrow, and sort the practice set</h2>
          </div>
          {activeFilters > 0 && (
            <Link href="/problems" className="link-quill text-sm text-[color:var(--ink-blue)] inline-flex items-center gap-1.5">
              Clear filters
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          )}
        </div>

        <form className="grid gap-4 md:grid-cols-2 xl:grid-cols-5" action="/problems">
          <label className="space-y-1.5 xl:col-span-2">
            <span className="block text-xs font-mono uppercase tracking-[0.12em] text-muted-foreground">Search</span>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                name="q"
                defaultValue={query}
                placeholder="Search title, statement, topic, module…"
                className="w-full rounded-md border border-[color:var(--rule-strong)] bg-background pl-9 pr-3 py-2 text-sm outline-none focus:border-[color:var(--ink-blue)]"
              />
            </div>
          </label>

          <label className="space-y-1.5">
            <span className="block text-xs font-mono uppercase tracking-[0.12em] text-muted-foreground">Difficulty</span>
            <select
              name="difficulty"
              defaultValue={difficulty ?? ""}
              className="w-full rounded-md border border-[color:var(--rule-strong)] bg-background px-3 py-2 text-sm outline-none focus:border-[color:var(--ink-blue)]"
            >
              <option value="">All levels</option>
              {Object.values(Difficulty).map((value) => (
                <option key={value} value={value}>{difficultyLabel[value]}</option>
              ))}
            </select>
          </label>

          <label className="space-y-1.5">
            <span className="block text-xs font-mono uppercase tracking-[0.12em] text-muted-foreground">Topic</span>
            <select
              name="topic"
              defaultValue={topicSlug ?? ""}
              className="w-full rounded-md border border-[color:var(--rule-strong)] bg-background px-3 py-2 text-sm outline-none focus:border-[color:var(--ink-blue)]"
            >
              <option value="">All topics</option>
              {topics.map((topic) => (
                <option key={topic.id} value={topic.slug}>{topic.module.name} · {topic.name}</option>
              ))}
            </select>
          </label>

          <label className="space-y-1.5">
            <span className="block text-xs font-mono uppercase tracking-[0.12em] text-muted-foreground">Status</span>
            <select
              name="status"
              defaultValue={user ? status ?? "" : ""}
              disabled={!user}
              className="w-full rounded-md border border-[color:var(--rule-strong)] bg-background px-3 py-2 text-sm outline-none focus:border-[color:var(--ink-blue)] disabled:opacity-60"
            >
              <option value="">All statuses</option>
              {statusOptions.map((value) => (
                <option key={value} value={value}>{progressLabel[value]}</option>
              ))}
            </select>
            {!user && <span className="block text-xs text-muted-foreground">Sign in to filter by saved status.</span>}
          </label>

          <label className="space-y-1.5">
            <span className="block text-xs font-mono uppercase tracking-[0.12em] text-muted-foreground">Sort by</span>
            <select
              name="sort"
              defaultValue={sort}
              className="w-full rounded-md border border-[color:var(--rule-strong)] bg-background px-3 py-2 text-sm outline-none focus:border-[color:var(--ink-blue)]"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </label>

          <div className="flex items-end gap-3 xl:col-span-5 xl:justify-end">
            <button type="submit" className="btn-ink min-w-40 justify-center">Apply filters</button>
          </div>
        </form>
      </section>

      {problems.length === 0 ? (
        <div className="surface-card p-8 text-muted-foreground">No problems match the current filters.</div>
      ) : (
        <div className="space-y-5">
          <div className="flex flex-wrap items-center gap-2 text-xs font-mono uppercase tracking-[0.12em] text-muted-foreground">
            <span>Sorted by</span>
            <span className="pill border-[color:var(--rule)] text-muted-foreground">
              {sortOptions.find((option) => option.value === sort)?.label ?? "Difficulty"}
            </span>
            {query && (
              <span className="pill border-[color:var(--rule)] text-muted-foreground normal-case tracking-normal font-sans">
                “{query}”
              </span>
            )}
          </div>
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {problems.map((problem) => {
              const primaryTopic = problem.topics[0]?.topic;
              return (
                <ProblemCard
                  key={problem.id}
                  problem={problem}
                  moduleName={primaryTopic?.module.name}
                  topicName={primaryTopic?.name}
                  status={progressMap.get(problem.id)}
                />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
