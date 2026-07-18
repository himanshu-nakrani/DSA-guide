import Link from "next/link";
import { ArrowRight, Bookmark, Plus } from "lucide-react";
import { createListAction, removeProblemFromListAction } from "@/app/lists/actions";
import { ProblemCard } from "@/components/problems/ProblemCard";
import { getCurrentUser } from "@/lib/auth";
import { BOOKMARK_LIST_NAME, getBookmarkProblemIds, getOrCreateBookmarkList } from "@/lib/lists";
import { prisma } from "@/lib/prisma";

export default async function ListsPage() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <div className="max-w-5xl mx-auto px-6 md:px-12 py-16 space-y-10">
        <header className="bloom">
          <div className="eyebrow mb-4" style={{ ["--i" as string]: 0 }}>
            <span className="text-[color:var(--ink-blue)] mr-2">§</span>
            Lists
          </div>
          <h1
            className="font-display text-[clamp(2.25rem,5vw,3.5rem)] leading-[1.06] font-medium text-[color:var(--ink)]"
            style={{ ["--i" as string]: 1 }}
          >
            Save problems for later
          </h1>
          <p
            className="text-[1.05rem] mt-3 max-w-2xl text-[color:var(--ink-soft)]"
            style={{ ["--i" as string]: 2 }}
          >
            Sign in to bookmark problems and organize practice lists.
          </p>
        </header>

        <section className="surface-card p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="eyebrow mb-2">Saved practice</div>
            <h2 className="font-display text-2xl font-medium">No account connected</h2>
            <p className="mt-2 text-sm text-muted-foreground">Lists are stored with your DSA Guide account.</p>
          </div>
          <Link href="/auth" className="btn-ink">
            Sign in or create account
            <ArrowRight className="h-4 w-4" />
          </Link>
        </section>
      </div>
    );
  }

  await getOrCreateBookmarkList(user.id);

  const [lists, bookmarkIds] = await Promise.all([
    prisma.customList.findMany({
      where: { userId: user.id },
      orderBy: [{ name: "asc" }, { updatedAt: "desc" }],
      include: {
        items: {
          orderBy: { order: "asc" },
          include: {
            problem: {
              // ⚡ Bolt: Use `select` instead of `include` to avoid fetching large text fields (like `statementMd`, `examplesJson`)
              select: {
                id: true,
                slug: true,
                title: true,
                difficulty: true,
                acceptanceRate: true,
                topics: {
                  select: {
                    topic: {
                      select: {
                        id: true,
                        slug: true,
                        name: true,
                        module: { select: { id: true, slug: true, name: true } },
                      },
                    },
                  },
                },
                hints: { select: { id: true } },
                editorial: { select: { id: true } },
              },
            },
          },
        },
      },
    }),
    getBookmarkProblemIds(user.id),
  ]);

  const sortedLists = [
    ...lists.filter((list) => list.name === BOOKMARK_LIST_NAME),
    ...lists.filter((list) => list.name !== BOOKMARK_LIST_NAME),
  ];
  const savedCount = new Set(lists.flatMap((list) => list.items.map((item) => item.problemId))).size;

  return (
    <div className="max-w-6xl mx-auto px-6 md:px-12 py-16 space-y-10">
      <header className="bloom">
        <div className="eyebrow mb-4" style={{ ["--i" as string]: 0 }}>
          <span className="text-[color:var(--ink-blue)] mr-2">§</span>
          Lists
        </div>
        <h1
          className="font-display text-[clamp(2.25rem,5vw,3.5rem)] leading-[1.06] font-medium text-[color:var(--ink)]"
          style={{ ["--i" as string]: 1 }}
        >
          Saved Problems
        </h1>
        <p
          className="text-[1.05rem] mt-3 max-w-2xl text-[color:var(--ink-soft)]"
          style={{ ["--i" as string]: 2 }}
        >
          Keep a fast revisit queue with bookmarks, then split focused practice into custom lists.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-3 text-[0.75rem] font-mono uppercase tracking-[0.12em] text-muted-foreground">
          <span>{savedCount} unique saved problems</span>
          <span className="text-muted-foreground/40">·</span>
          <span>{sortedLists.length} lists</span>
        </div>
        <div aria-hidden className="mt-8 h-px bg-[color:var(--rule-strong)]" />
      </header>

      <section className="surface-card p-5 md:p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-sm grid place-items-center border border-[color:var(--rule-strong)] text-[color:var(--ink-blue)] bg-[color:var(--surface-2)]">
            <Plus className="h-5 w-5" />
          </div>
          <div>
            <div className="eyebrow mb-1">Create list</div>
            <h2 className="font-display text-xl font-medium">Add a focused practice queue</h2>
          </div>
        </div>

        <form action={createListAction} className="grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]">
          <input
            type="text"
            name="name"
            required
            placeholder="List name"
            className="rounded-md border border-[color:var(--rule-strong)] bg-background px-3 py-2 text-sm outline-none focus:border-[color:var(--ink-blue)]"
          />
          <input
            type="text"
            name="description"
            placeholder="Optional description"
            className="rounded-md border border-[color:var(--rule-strong)] bg-background px-3 py-2 text-sm outline-none focus:border-[color:var(--ink-blue)]"
          />
          <button type="submit" className="btn-ink justify-center">
            Create
          </button>
        </form>
      </section>

      <div className="space-y-10">
        {sortedLists.map((list) => (
          <section key={list.id} className="space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="eyebrow mb-2 flex items-center gap-2">
                  {list.name === BOOKMARK_LIST_NAME && <Bookmark className="h-3.5 w-3.5" />}
                  Saved list
                </div>
                <h2 className="font-display text-2xl font-medium">{list.name}</h2>
                {list.description && (
                  <p className="mt-1 text-sm text-muted-foreground">{list.description}</p>
                )}
              </div>
              <span className="pill border-[color:var(--rule)] text-muted-foreground">
                {list.items.length} problem{list.items.length === 1 ? "" : "s"}
              </span>
            </div>

            {list.items.length === 0 ? (
              <div className="surface-card p-8 text-muted-foreground">
                No saved problems yet.
                <Link href="/problems" className="ml-2 link-quill text-[color:var(--ink-blue)]">
                  Browse problems
                </Link>
              </div>
            ) : (
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {list.items.map((item) => {
                  const primaryTopic = item.problem.topics[0]?.topic;
                  return (
                    <div key={item.id} className="space-y-2">
                      <ProblemCard
                        problem={item.problem}
                        moduleName={primaryTopic?.module.name}
                        topicName={primaryTopic?.name}
                        bookmarked={bookmarkIds.has(item.problemId)}
                        signedIn
                        returnTo="/lists"
                      />
                      <form action={removeProblemFromListAction}>
                        <input type="hidden" name="listId" value={list.id} />
                        <input type="hidden" name="problemSlug" value={item.problem.slug} />
                        <input type="hidden" name="returnTo" value="/lists" />
                        <button
                          type="submit"
                          className="text-sm text-muted-foreground hover:text-[color:var(--ink-blue)] transition-colors"
                        >
                          Remove from {list.name}
                        </button>
                      </form>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}

