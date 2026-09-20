import Link from "next/link";
import { ViewTransition } from "react";
import { ArrowLeft, ArrowRight, ArrowDownAZ, ArrowUpDown, Clock3, SearchX, Trophy } from "lucide-react";
import { Difficulty, ProgressStatus, type Prisma } from "@/generated/prisma";
import { ProblemCard } from "@/components/problems/ProblemCard";
import { ProblemFilters } from "@/components/problems/ProblemFilters";
import { PageHeader, PageShell } from "@/components/layout/PageShell";
import { getCurrentUser } from "@/lib/auth";
import { getBookmarkProblemIds } from "@/lib/lists";
import { prisma } from "@/lib/prisma";

const PAGE_SIZE = 24;

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

const MAX_QUERY_LENGTH = 120;
const MAX_TOPIC_SLUG_LENGTH = 120;

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
  searchParams: Promise<{
    difficulty?: string;
    topic?: string;
    status?: string;
    q?: string;
    sort?: string;
    page?: string;
  }>;
}) {
  const user = await getCurrentUser();
  const params = await searchParams;

  const difficulty = parseDifficulty(params.difficulty);
  const status = parseStatus(params.status);
  const topicSlug = params.topic?.trim().slice(0, MAX_TOPIC_SLUG_LENGTH) || undefined;
  const query = params.q?.trim().slice(0, MAX_QUERY_LENGTH) || "";
  const sort = parseSort(params.sort);
  const page = Math.max(1, Number.parseInt(params.page ?? "", 10) || 1);

  const topics = await prisma.topic.findMany({
    where: { problems: { some: { problem: { status: "PUBLISHED" } } } },
    orderBy: [{ module: { order: "asc" } }, { order: "asc" }],
    // ⚡ Bolt: Use `select` instead of `include` to minimize fetched data size
    select: {
      id: true,
      slug: true,
      name: true,
      module: { select: { name: true } },
    },
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

  const filteredWhere: Prisma.ProblemWhereInput = {
    ...problemWhere,
    ...(progressFilter ?? {}),
  };

  const [total, problems] = await Promise.all([
    prisma.problem.count({ where: filteredWhere }),
    prisma.problem.findMany({
      where: filteredWhere,
      orderBy: buildOrderBy(sort),
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: {
        id: true,
        slug: true,
        title: true,
        difficulty: true,
        acceptanceRate: true,
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
    }),
  ]);

  const progressRows = user
    ? await prisma.userProblemProgress.findMany({
        where: { userId: user.id, problemId: { in: problems.map((problem) => problem.id) } },
        select: { problemId: true, status: true },
      })
    : [];

  const progressMap = new Map<string, ProgressStatus>(
    progressRows.map((row) => [row.problemId, row.status]),
  );
  const bookmarkIds = user ? await getBookmarkProblemIds(user.id) : new Set<string>();

  const withEditorialCount = problems.filter((p) => p.editorial).length;
  const activeFilters = [
    difficulty,
    topicSlug,
    user && status ? status : undefined,
    query || undefined,
    sort !== "difficulty" ? sort : undefined,
  ].filter(Boolean).length;

  const currentParams = new URLSearchParams();
  if (query) currentParams.set("q", query);
  if (difficulty) currentParams.set("difficulty", difficulty);
  if (topicSlug) currentParams.set("topic", topicSlug);
  if (user && status) currentParams.set("status", status);
  if (sort !== "difficulty") currentParams.set("sort", sort);
  const returnTo = currentParams.size > 0 ? `/problems?${currentParams.toString()}` : "/problems";

  const pageHref = (targetPage: number) => {
    const pagerParams = new URLSearchParams(currentParams);
    if (targetPage > 1) pagerParams.set("page", String(targetPage));
    return pagerParams.size > 0 ? `/problems?${pagerParams.toString()}` : "/problems";
  };

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const rangeStart = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(page * PAGE_SIZE, total);

  return (
    <PageShell width="wide">
      <PageHeader
        eyebrow="Practice"
        title="Problem Library"
        lede="Move from theory to repetition: curated practice, hints, editorials, and now a searchable, sortable queue."
        meta={
          <div aria-live="polite" aria-atomic="true" className="flex flex-wrap items-center gap-3 text-note font-mono uppercase tracking-[0.12em] text-muted-foreground">
            <span>{total} matching problem{total === 1 ? "" : "s"}</span>
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
                <Link href="/auth" className="link-quill text-ink-blue normal-case tracking-normal font-sans text-small inline-flex items-center gap-1">
                  Sign in to save progress
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </>
            )}
          </div>
        }
      />

      <section className="surface-card p-5 md:p-6 mb-8 space-y-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <div className="eyebrow mb-2">Filters</div>
            <h2 className="font-display text-xl font-medium">Search, narrow, and sort the practice set</h2>
          </div>
          <span className="text-caption font-mono uppercase tracking-[0.12em] text-muted-foreground">
            Applies as you type
          </span>
        </div>

        <ProblemFilters
          topics={topics.map((topic) => ({
            id: topic.id,
            slug: topic.slug,
            name: topic.name,
            moduleName: topic.module.name,
          }))}
          sortOptions={sortOptions.map(({ value, label }) => ({ value, label }))}
          statusOptions={statusOptions}
          signedIn={Boolean(user)}
          query={query}
          difficulty={difficulty ?? ""}
          topicSlug={topicSlug ?? ""}
          status={user && status ? status : ""}
          sort={sort}
        />
      </section>

      {problems.length === 0 ? (
        <div className="surface-card p-12 text-center space-y-4">
          <div className="mx-auto h-12 w-12 grid place-items-center rounded-xl border border-border text-muted-foreground bg-surface-2">
            <SearchX className="h-6 w-6" strokeWidth={1.5} />
          </div>
          <h2 className="font-display text-2xl font-medium text-ink">Nothing on this shelf</h2>
          <p className="text-body text-muted-foreground max-w-md mx-auto leading-relaxed">
            {activeFilters > 0
              ? "No problems match the current combination of filters. Try loosening one."
              : "The library is empty for now — check back once the next edition ships."}
          </p>
          {activeFilters > 0 && (
            <Link
              href="/problems"
              className="inline-flex items-center gap-1.5 text-small font-medium text-ink-blue link-quill"
            >
              Clear all filters
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          )}
        </div>

      ) : (
        <div className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2 text-caption font-mono uppercase tracking-[0.12em] text-muted-foreground">
              <span>
                Showing {rangeStart}–{rangeEnd} of {total}
              </span>
              <span className="pill border-rule text-muted-foreground">
                {sortOptions.find((option) => option.value === sort)?.label ?? "Difficulty"}
              </span>
              {query && (
                <span className="pill border-rule text-muted-foreground normal-case tracking-normal font-sans">
                  “{query}”
                </span>
              )}
            </div>
          </div>
          <ViewTransition name="problem-cards-grid">
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
                    bookmarked={bookmarkIds.has(problem.id)}
                    signedIn={Boolean(user)}
                    returnTo={returnTo}
                  />
                );
              })}
            </div>
          </ViewTransition>

          {totalPages > 1 && (
            <nav
              aria-label="Pagination"
              className="flex items-center justify-between gap-4 pt-4 border-t border-rule"
            >
              {page > 1 ? (
                <Link
                  href={pageHref(page - 1)}
                  className="inline-flex items-center gap-1.5 text-small font-medium text-ink-blue link-quill"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Previous
                </Link>
              ) : (
                <span />
              )}
              <span className="font-mono text-caption uppercase tracking-[0.12em] text-muted-foreground">
                Page {page} of {totalPages}
              </span>
              {page < totalPages ? (
                <Link
                  href={pageHref(page + 1)}
                  className="inline-flex items-center gap-1.5 text-small font-medium text-ink-blue link-quill"
                >
                  Next
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              ) : (
                <span />
              )}
            </nav>
          )}
        </div>
      )}
    </PageShell>
  );
}
