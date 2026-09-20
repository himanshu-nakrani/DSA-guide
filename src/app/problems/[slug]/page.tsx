import Link from "next/link";
import { ViewTransition } from "react";
import { notFound } from "next/navigation";
import { ArrowRight, ExternalLink } from "lucide-react";
import { ProgressStatus } from "@/generated/prisma";
import { ArticleBody } from "@/components/article/ArticleBody";
import { SaveToListForm } from "./SubmitButton";
import { BOOKMARK_LIST_NAME, getBookmarkProblemIds } from "@/lib/lists";
import { getProblemExternalUrl } from "@/lib/problem-links";
import { BookmarkButton } from "@/components/problems/BookmarkButton";
import { EditorialSections } from "@/components/problems/EditorialSections";
import { HintList } from "@/components/problems/HintList";
import { ProblemCard } from "@/components/problems/ProblemCard";
import { ProblemStatusControl } from "@/components/problems/ProblemStatusControl";
import { StarterCodeTabs } from "@/components/problems/StarterCodeTabs";
import { difficultyClass, difficultyLabel, progressLabel } from "@/components/problems/problem-ui";
import { Button } from "@/components/ui/button";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { PageShell } from "@/components/layout/PageShell";
import { ContentTabs, type ContentTab } from "@/components/ui/content-tabs";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { publicProblemWhere } from "@/lib/publication";

export async function generateStaticParams() {
  const problems = await prisma.problem.findMany({
    where: publicProblemWhere(),
    select: { slug: true },
  });

  return problems.map((problem) => ({ slug: problem.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const problem = await prisma.problem.findFirst({
    where: publicProblemWhere(slug),
    select: { title: true, statementMd: true },
  });

  if (!problem) return { title: "Problems — DSA Guide" };

  return {
    title: `${problem.title} — Problems — DSA Guide`,
    description: problem.statementMd.slice(0, 160),
  };
}

export default async function ProblemDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const user = await getCurrentUser();

  const problem = await prisma.problem.findFirst({
    where: publicProblemWhere(slug),
    include: {
      topics: {
        include: {
          topic: {
            include: {
              module: true,
              articles: {
                where: { status: "PUBLISHED" },
                orderBy: [{ level: "asc" }, { order: "asc" }],
                select: {
                  slug: true,
                  title: true,
                  summary: true,
                  level: true,
                  estimatedMins: true,
                },
              },
            },
          },
        },
      },
      hints: { orderBy: { order: "asc" } },
      editorial: true,
      testCases: { where: { isHidden: false }, orderBy: { order: "asc" } },
    },
  });

  if (!problem) notFound();

  const currentStatus = user
    ? (
        await prisma.userProblemProgress.findUnique({
          where: {
            userId_problemId: {
              userId: user.id,
              problemId: problem.id,
            },
          },
          select: { status: true },
        })
      )?.status ?? ProgressStatus.NEW
    : ProgressStatus.NEW;

  let bookmarkIds = new Set<string>();
  let customLists: Array<{ id: string; name: string }> = [];
  if (user) {
    [bookmarkIds, customLists] = await Promise.all([
      getBookmarkProblemIds(user.id),
      prisma.customList.findMany({
        where: { userId: user.id, name: { not: BOOKMARK_LIST_NAME } },
        orderBy: { updatedAt: "desc" },
        select: { id: true, name: true },
      }),
    ]);
  }

  const relatedProblems = await prisma.problem.findMany({
    where: {
      status: "PUBLISHED",
      slug: { not: problem.slug },
      topics: {
        some: {
          topicId: { in: problem.topics.map((edge) => edge.topicId) },
        },
      },
    },
    orderBy: [{ difficulty: "asc" }, { title: "asc" }],
    take: 3,
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
  });

  const examples = Array.isArray(problem.examplesJson) ? (problem.examplesJson as Array<{ input: string; output: string; explanation?: string }>) : [];
  const starterCode = problem.starterCodeJson as Record<string, string>;
  const starterLanguages = Object.keys(starterCode ?? {});
  const firstTopic = problem.topics[0]?.topic;
  const externalUrl = getProblemExternalUrl(problem.slug);

  // One tabbed workspace instead of an endless single scroll: the statement
  // is the landing tab; hints and the editorial stay one click away but out
  // of view, which doubles as spoiler protection.
  const workspaceTabs: ContentTab[] = [
    {
      id: "statement",
      label: "Statement",
      content: (
        <div className="space-y-8">
          <ArticleBody markdown={problem.statementMd} />

          {examples.length > 0 && (
            <div className="space-y-4">
              <div className="eyebrow">Examples</div>
              <div className="grid gap-4 md:grid-cols-2">
                {examples.map((example, index) => (
                  <div key={index} className="rounded-xl border border-rule bg-surface-1 p-4 space-y-3">
                    <div className="text-caption font-mono uppercase tracking-[0.12em] text-muted-foreground">Example {index + 1}</div>
                    <div>
                      <div className="text-caption font-mono uppercase tracking-[0.12em] text-muted-foreground mb-1">Input</div>
                      <pre className="code-block !mb-0 overflow-x-auto"><code>{example.input}</code></pre>
                    </div>
                    <div>
                      <div className="text-caption font-mono uppercase tracking-[0.12em] text-muted-foreground mb-1">Output</div>
                      <pre className="code-block !mb-0 overflow-x-auto"><code>{example.output}</code></pre>
                    </div>
                    {example.explanation && (
                      <p className="text-small text-muted-foreground leading-relaxed">{example.explanation}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {problem.testCases.length > 0 && (
            <div className="space-y-4">
              <div className="eyebrow">Sample tests</div>
              <div className="grid gap-4 md:grid-cols-2">
                {problem.testCases.map((testCase) => (
                  <div key={testCase.id} className="rounded-xl border border-rule p-4 space-y-3">
                    <div className="text-caption font-mono uppercase tracking-[0.12em] text-muted-foreground">Sample {testCase.order}</div>
                    <div>
                      <div className="text-caption font-mono uppercase tracking-[0.12em] text-muted-foreground mb-1">Input</div>
                      <pre className="code-block !mb-0 overflow-x-auto"><code>{testCase.input}</code></pre>
                    </div>
                    <div>
                      <div className="text-caption font-mono uppercase tracking-[0.12em] text-muted-foreground mb-1">Expected output</div>
                      <pre className="code-block !mb-0 overflow-x-auto"><code>{testCase.output}</code></pre>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ),
    },
  ];

  if (starterLanguages.length > 0) {
    workspaceTabs.push({
      id: "starter",
      label: "Starter code",
      content: (
        <div className="space-y-3">
          <p className="text-small font-pencil text-pencil">
            A skeleton per language — copy it into LeetCode or your editor of choice.
          </p>
          <StarterCodeTabs starter={starterCode} />
        </div>
      ),
    });
  }

  if (problem.hints.length > 0) {
    workspaceTabs.push({
      id: "hints",
      label: "Hints",
      count: problem.hints.length,
      content: (
        <div className="space-y-4">
          <p className="text-small font-pencil text-pencil">
            Try to earn each hint — reveal only when you&rsquo;ve genuinely stalled.
          </p>
          <HintList hints={problem.hints.map(({ id, order, content }) => ({ id, order, content }))} />
        </div>
      ),
    });
  }

  if (problem.editorial) {
    workspaceTabs.push({
      id: "editorial",
      label: "Editorial",
      content: (
        <div className="space-y-5">
          <p className="text-small font-pencil text-pencil">
            Attempt your own solution first — sections open as you need them.
          </p>
          <EditorialSections editorial={problem.editorial} />
        </div>
      ),
    });
  }

  return (
    <PageShell width="wide" className="space-y-12">
      <Breadcrumbs items={[{ label: "Problems", href: "/problems" }, { label: problem.title }]} />

      <header className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_20rem] xl:items-start">
        <div className="space-y-5">
          <div className="eyebrow">
            <span className="text-ink-blue mr-2">§</span>
            {firstTopic?.module.name} · {firstTopic?.name}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <ViewTransition name={`problem-title-${problem.slug}`}>
              <h1 className="font-display text-[clamp(2rem,4vw,3.1rem)] leading-[1.08] font-medium text-ink">
                {problem.title}
              </h1>
            </ViewTransition>
            <span className={difficultyClass[problem.difficulty]}>{difficultyLabel[problem.difficulty]}</span>
            {user && currentStatus !== ProgressStatus.NEW && (
              <span className="pill border-rule text-muted-foreground">{progressLabel[currentStatus]}</span>
            )}
          </div>
          <p className="max-w-3xl text-title leading-relaxed text-ink-soft">
            Practice the core pattern, then compare your solution against hints and the editorial once you have a working approach.
          </p>
          <div className="flex flex-wrap gap-3 text-note font-mono uppercase tracking-[0.12em] text-muted-foreground">
            <span>{problem.timeLimitMs}ms time limit</span>
            <span>{problem.memoryLimitMb}MB memory</span>
            <span>{problem.hints.length} hints</span>
            <span>{Math.round(problem.acceptanceRate)}% acceptance</span>
          </div>
        </div>

        <aside className="surface-card p-5 space-y-5">
          {externalUrl && (
            <Button
              render={<a href={externalUrl} target="_blank" rel="noopener noreferrer" />}
              className="w-full"
            >
              Solve on LeetCode
              <ExternalLink className="h-4 w-4" />
            </Button>
          )}
          <div className="space-y-2">
            <div className="text-xs font-mono uppercase tracking-[0.12em] text-muted-foreground">Saved</div>
            <div className="flex items-center justify-between gap-3 rounded-md border border-rule px-3 py-2">
              <span className="text-sm">{bookmarkIds.has(problem.id) ? "Bookmarked" : "Bookmark this problem"}</span>
              <BookmarkButton
                problemSlug={problem.slug}
                saved={bookmarkIds.has(problem.id)}
                signedIn={Boolean(user)}
                returnTo={`/problems/${problem.slug}`}
              />
            </div>
          </div>

          <ProblemStatusControl slug={problem.slug} initialStatus={currentStatus} signedIn={Boolean(user)} />
          {user && customLists.length > 0 && (
            <SaveToListForm
              problemSlug={problem.slug}
              returnTo={`/problems/${problem.slug}`}
              lists={customLists}
            />
          )}
          {user && customLists.length === 0 && (
            <Link href="/lists" className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-blue link-quill">
              Create a custom list
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          )}
          <div className="space-y-2">
            <div className="text-xs font-mono uppercase tracking-[0.12em] text-muted-foreground">Primary article track</div>
            <div className="space-y-2">
              {firstTopic?.articles.slice(0, 3).map((article) => (
                <Link key={article.slug} href={`/learn/${article.slug}`} className="block rounded-md border border-rule px-3 py-2 hover:border-ink-blue hover:text-ink-blue transition-colors">
                  <div className="font-medium text-sm">{article.title}</div>
                  <div className="mt-1 text-xs text-muted-foreground">{article.estimatedMins}m read</div>
                </Link>
              ))}
            </div>
          </div>
          {!user && (
            <Link href="/auth" className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-blue link-quill">
              Create an account to save progress
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          )}
        </aside>
      </header>

      <div className="flex flex-wrap items-center gap-2" aria-label="At a glance">
        {problem.topics.map((edge) => (
          <Link
            key={edge.topic.id}
            href={`/problems?topic=${edge.topic.slug}`}
            className="pill hover:text-ink-blue hover:border-ink-blue transition-colors"
          >
            {edge.topic.name}
          </Link>
        ))}
        {starterLanguages.length > 0 && (
          <span className="pill">
            Starter code · {starterLanguages.join(", ")}
          </span>
        )}
        {problem.editorial ? (
          <span className="pill pill-primary">Editorial available</span>
        ) : (
          <span className="pill">No editorial yet</span>
        )}
      </div>

      <section className="surface-card p-4 md:p-6 lg:p-8">
        <ContentTabs tabs={workspaceTabs} ariaLabel={`${problem.title} — problem workspace`} />
      </section>

      {(firstTopic?.articles.length || relatedProblems.length > 0) && (
        <section className="grid gap-6 xl:grid-cols-2">
          {firstTopic?.articles.length ? (
            <div className="surface-card p-6 space-y-4">
              <div className="eyebrow">Learn the pattern</div>
              <div className="space-y-3">
                {firstTopic.articles.map((article) => (
                  <Link
                    key={article.slug}
                    href={`/learn/${article.slug}`}
                    className="block rounded-xl border border-rule px-4 py-3 hover:border-ink-blue transition-colors"
                  >
                    <div className="font-medium text-ink">{article.title}</div>
                    <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{article.summary}</p>
                  </Link>
                ))}
              </div>
            </div>
          ) : null}

          {relatedProblems.length > 0 ? (
            <div className="space-y-4">
              <div className="eyebrow">Related problems</div>
              <div className="space-y-4">
                {relatedProblems.map((relatedProblem) => (
                  <ProblemCard
                    key={relatedProblem.id}
                    problem={relatedProblem}
                    moduleName={relatedProblem.topics[0]?.topic.module.name}
                    topicName={relatedProblem.topics[0]?.topic.name}
                    bookmarked={bookmarkIds.has(relatedProblem.id)}
                    signedIn={Boolean(user)}
                    returnTo={`/problems/${problem.slug}`}
                    compact
                  />
                ))}
              </div>
            </div>
          ) : null}
        </section>
      )}
    </PageShell>
  );
}
