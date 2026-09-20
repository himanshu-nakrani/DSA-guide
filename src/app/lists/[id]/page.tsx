import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowRight, Globe } from "lucide-react";
import { ProblemCard } from "@/components/problems/ProblemCard";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { PageHeader, PageShell } from "@/components/layout/PageShell";
import { getCurrentUser } from "@/lib/auth";
import { getBookmarkProblemIds } from "@/lib/lists";
import { prisma } from "@/lib/prisma";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const list = await prisma.customList.findFirst({
    where: { id, isPublic: true },
    select: { name: true, description: true },
  });
  if (!list) return { title: "Lists — DSA Guide" };
  return {
    title: `${list.name} — Lists — DSA Guide`,
    description:
      list.description ?? `A public DSA practice list: ${list.name}.`,
  };
}

export default async function PublicListPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [list, user] = await Promise.all([
    prisma.customList.findFirst({
      where: { id, isPublic: true },
      include: {
        items: {
          where: { problem: { status: "PUBLISHED" } },
          orderBy: { order: "asc" },
          include: {
            problem: {
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
    getCurrentUser(),
  ]);

  if (!list) notFound();

  const bookmarkIds = user ? await getBookmarkProblemIds(user.id) : new Set<string>();

  return (
    <PageShell width="wide" className="space-y-10">
      <div>
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: list.name }]} />
        <PageHeader
          eyebrow="Shared list"
          title={list.name}
          lede={list.description ?? "A public practice list shared from DSA Guide."}
          meta={
            <span className="flex flex-wrap items-center gap-3 text-note font-mono uppercase tracking-[0.12em] text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <Globe className="h-3.5 w-3.5" />
                Public
              </span>
              <span className="text-muted-foreground/40">·</span>
              <span>
                {list.items.length} problem{list.items.length === 1 ? "" : "s"}
              </span>
            </span>
          }
        />
      </div>

      {list.items.length === 0 ? (
        <div className="surface-card p-8 text-muted-foreground">
          This list is empty.
          <Link href="/problems" className="ml-2 link-quill text-ink-blue">
            Browse problems
          </Link>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {list.items.map((item) => {
            const primaryTopic = item.problem.topics[0]?.topic;
            return (
              <ProblemCard
                key={item.problem.id}
                problem={item.problem}
                moduleName={primaryTopic?.module.name}
                topicName={primaryTopic?.name}
                bookmarked={bookmarkIds.has(item.problem.id)}
                signedIn={Boolean(user)}
                returnTo={`/lists/${list.id}`}
              />
            );
          })}
        </div>
      )}

      {!user && (
        <div className="surface-card p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            Create a free account to save your own lists and track progress.
          </p>
          <Link
            href="/auth"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-blue hover:underline"
          >
            Sign in
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      )}
    </PageShell>
  );
}
