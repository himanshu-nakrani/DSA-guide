import Link from "next/link";
import { ArrowRight, Bookmark, Plus } from "lucide-react";
import { CreateListForm, ListActions, ListItemsManager, ShareButton } from "@/components/lists/ListActions";
import { Button } from "@/components/ui/button";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { PageHeader, PageShell } from "@/components/layout/PageShell";
import { getCurrentUser } from "@/lib/auth";
import { BOOKMARK_LIST_NAME, getBookmarkProblemIds, getOrCreateBookmarkList } from "@/lib/lists";
import { prisma } from "@/lib/prisma";

export default async function ListsPage() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <PageShell width="default">
        <PageHeader
          eyebrow="Lists"
          title="Save problems for later"
          lede="Sign in to bookmark problems and organize practice lists."
        />

        <section className="surface-card p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="eyebrow mb-2">Saved practice</div>
            <h2 className="font-display text-2xl font-medium">No account connected</h2>
            <p className="mt-2 text-small text-muted-foreground">Lists are stored with your DSA Guide account.</p>
          </div>
          <Button render={<Link href="/auth" />}>
            Sign in or create account
            <ArrowRight className="h-4 w-4" />
          </Button>
        </section>
      </PageShell>
    );
  }

  await getOrCreateBookmarkList(user.id);

  const [lists, bookmarkIds] = await Promise.all([
    prisma.customList.findMany({
      where: { userId: user.id },
      orderBy: [{ name: "asc" }, { updatedAt: "desc" }],
      include: {
        items: {
          where: { problem: { status: "PUBLISHED" } },
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

  // ⚡ Bolt: Prevent hidden O(N) array allocations (.flatMap.map) using explicit iteration
  const savedSet = new Set<string>();
  for (const list of lists) {
    for (const item of list.items) {
      savedSet.add(item.problemId);
    }
  }
  const savedCount = savedSet.size;

  return (
    <PageShell width="wide" className="space-y-10">
      <div>
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Lists" }]} />
        <PageHeader
          eyebrow="Lists"
          title="Saved Problems"
          lede="Keep a fast revisit queue with bookmarks, then split focused practice into custom lists."
          meta={
            <span className="flex flex-wrap items-center gap-3 text-note font-mono uppercase tracking-[0.12em] text-muted-foreground">
              <span>{savedCount} unique saved problems</span>
              <span className="text-muted-foreground/40">·</span>
              <span>{sortedLists.length} lists</span>
            </span>
          }
        />
      </div>

      <section className="surface-card p-5 md:p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl grid place-items-center border border-border text-ink-blue bg-surface-2">
            <Plus className="h-5 w-5" />
          </div>
          <div>
            <div className="eyebrow mb-1">Create list</div>
            <h2 className="font-display text-xl font-medium">Add a focused practice queue</h2>
          </div>
        </div>

        <CreateListForm />
      </section>

      <div className="space-y-10">
        {sortedLists.map((list) => (
          <section key={list.id} className="space-y-4">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <div className="eyebrow mb-2 flex items-center gap-2">
                  {list.name === BOOKMARK_LIST_NAME && <Bookmark className="h-3.5 w-3.5" />}
                  Saved list
                </div>
                <h2 className="font-display text-2xl font-medium">{list.name}</h2>
                {list.description && (
                  <p className="mt-1 text-small text-muted-foreground">{list.description}</p>
                )}
              </div>
              <div className="flex items-center gap-3">
                {list.name !== BOOKMARK_LIST_NAME && (
                  <ShareButton listId={list.id} initialPublic={list.isPublic} />
                )}
                <ListActions
                  listId={list.id}
                  name={list.name}
                  description={list.description ?? ""}
                  isBookmark={list.name === BOOKMARK_LIST_NAME}
                />
                <span className="pill border-rule text-muted-foreground">
                  {list.items.length} problem{list.items.length === 1 ? "" : "s"}
                </span>
              </div>
            </div>

            {list.items.length === 0 ? (
              <div className="surface-card p-8 text-muted-foreground">
                No saved problems yet.
                <Link href="/problems" className="ml-2 link-quill text-ink-blue">
                  Browse problems
                </Link>
              </div>
            ) : (
              <ListItemsManager
                listId={list.id}
                listName={list.name}
                items={list.items.map((item) => {
                  const primaryTopic = item.problem.topics[0]?.topic;
                  return {
                    problemId: item.problemId,
                    slug: item.problem.slug,
                    problem: item.problem,
                    moduleName: primaryTopic?.module.name,
                    topicName: primaryTopic?.name,
                  };
                })}
                bookmarkedIds={Array.from(bookmarkIds)}
                moveTargets={sortedLists
                  .filter((l) => l.id !== list.id && l.name !== BOOKMARK_LIST_NAME)
                  .map((l) => ({ id: l.id, name: l.name }))}
              />
            )}
          </section>
        ))}
      </div>
    </PageShell>
  );
}

