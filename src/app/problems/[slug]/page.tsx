import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, ExternalLink } from "lucide-react";
import { ProgressStatus } from "@/generated/prisma";
import { ArticleBody } from "@/components/article/ArticleBody";
import { addProblemToListAction } from "@/app/lists/actions";
import { BOOKMARK_LIST_NAME, getBookmarkProblemIds } from "@/lib/lists";
import { getProblemExternalUrl } from "@/lib/problem-links";
import { BookmarkButton } from "@/components/problems/BookmarkButton";
import { ProblemCard } from "@/components/problems/ProblemCard";
import { ProblemStatusControl } from "@/components/problems/ProblemStatusControl";
import { SaveToListButton } from "./SubmitButton";
import { difficultyClass, difficultyLabel, progressLabel } from "@/components/problems/problem-ui";
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
  const firstTopic = problem.topics[0]?.topic;
  const externalUrl = getProblemExternalUrl(problem.slug);

  return (
    <div className="max-w-6xl mx-auto px-6 md:px-12 py-12 space-y-12">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/problems" className="inline-flex items-center gap-1.5 hover:text-[color:var(--ink-blue)] transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Back to problems
        </Link>
      </div>

      <header className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_20rem] xl:items-start">
        <div className="space-y-5">
          <div className="eyebrow">
            <span className="text-[color:var(--ink-blue)] mr-2">§</span>
            {firstTopic?.module.name} · {firstTopic?.name}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-display text-[clamp(2rem,4vw,3.1rem)] leading-[1.08] font-medium text-[color:var(--ink)]">
              {problem.title}
            </h1>
            <span className={difficultyClass[problem.difficulty]}>{difficultyLabel[problem.difficulty]}</span>
            {user && currentStatus !== ProgressStatus.NEW && (
              <span className="pill border-[color:var(--rule)] text-muted-foreground">{progressLabel[currentStatus]}</span>
            )}
          </div>
          <p className="max-w-3xl text-[1.02rem] leading-relaxed text-[color:var(--ink-soft)]">
            Practice the core pattern, then compare your solution against hints and the editorial once you have a working approach.
          </p>
          <div className="flex flex-wrap gap-3 text-[0.75rem] font-mono uppercase tracking-[0.12em] text-muted-foreground">
            <span>{problem.timeLimitMs}ms time limit</span>
            <span>{problem.memoryLimitMb}MB memory</span>
            <span>{problem.hints.length} hints</span>
            <span>{Math.round(problem.acceptanceRate)}% acceptance</span>
          </div>
        </div>

        <aside className="surface-card p-5 space-y-5">
          {externalUrl && (
            <a
              href={externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-ink w-full justify-center"
            >
              Solve on LeetCode
              <ExternalLink className="h-4 w-4" />
            </a>
          )}
          <div className="space-y-2">
            <div className="text-xs font-mono uppercase tracking-[0.12em] text-muted-foreground">Saved</div>
            <div className="flex items-center justify-between gap-3 rounded-md border border-[color:var(--rule)] px-3 py-2">
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
            <form action={addProblemToListAction} className="space-y-2">
              <input type="hidden" name="problemSlug" value={problem.slug} />
              <input type="hidden" name="returnTo" value={`/problems/${problem.slug}`} />
              <label className="block text-xs font-mono uppercase tracking-[0.12em] text-muted-foreground">
                Save to list
              </label>
              <div className="flex gap-2">
                <select
                  name="listId"
                  className="min-w-0 flex-1 rounded-md border border-[color:var(--rule-strong)] bg-background px-3 py-2 text-sm outline-none focus:border-[color:var(--ink-blue)]"
                >
                  {customLists.map((list) => (
                    <option key={list.id} value={list.id}>{list.name}</option>
                  ))}
                </select>
                <SaveToListButton />
              </div>
            </form>
          )}
          {user && customLists.length === 0 && (
            <Link href="/lists" className="inline-flex items-center gap-1.5 text-sm font-medium text-[color:var(--ink-blue)] link-quill">
              Create a custom list
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          )}
          <div className="space-y-2">
            <div className="text-xs font-mono uppercase tracking-[0.12em] text-muted-foreground">Primary article track</div>
            <div className="space-y-2">
              {firstTopic?.articles.slice(0, 3).map((article) => (
                <Link key={article.slug} href={`/learn/${article.slug}`} className="block rounded-md border border-[color:var(--rule)] px-3 py-2 hover:border-[color:var(--ink-blue)] hover:text-[color:var(--ink-blue)] transition-colors">
                  <div className="font-medium text-sm">{article.title}</div>
                  <div className="mt-1 text-xs text-muted-foreground">{article.estimatedMins}m read</div>
                </Link>
              ))}
            </div>
          </div>
          {!user && (
            <Link href="/auth" className="inline-flex items-center gap-1.5 text-sm font-medium text-[color:var(--ink-blue)] link-quill">
              Create an account to save progress
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          )}
        </aside>
      </header>

      <section className="surface-card p-6 md:p-8 space-y-6">
        <div>
          <div className="eyebrow mb-3">Statement</div>
          <ArticleBody markdown={problem.statementMd} />
        </div>

        {examples.length > 0 && (
          <div className="space-y-4">
            <div className="eyebrow">Examples</div>
            <div className="grid gap-4 md:grid-cols-2">
              {examples.map((example, index) => (
                <div key={index} className="rounded-xl border border-[color:var(--rule)] bg-[color:var(--surface-1)] p-4 space-y-3">
                  <div className="text-xs font-mono uppercase tracking-[0.12em] text-muted-foreground">Example {index + 1}</div>
                  <div>
                    <div className="text-xs font-mono uppercase tracking-[0.12em] text-muted-foreground mb-1">Input</div>
                    <pre className="code-block !mb-0 overflow-x-auto"><code>{example.input}</code></pre>
                  </div>
                  <div>
                    <div className="text-xs font-mono uppercase tracking-[0.12em] text-muted-foreground mb-1">Output</div>
                    <pre className="code-block !mb-0 overflow-x-auto"><code>{example.output}</code></pre>
                  </div>
                  {example.explanation && (
                    <p className="text-sm text-muted-foreground leading-relaxed">{example.explanation}</p>
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
                <div key={testCase.id} className="rounded-xl border border-[color:var(--rule)] p-4 space-y-3">
                  <div className="text-xs font-mono uppercase tracking-[0.12em] text-muted-foreground">Sample {testCase.order}</div>
                  <div>
                    <div className="text-xs font-mono uppercase tracking-[0.12em] text-muted-foreground mb-1">Input</div>
                    <pre className="code-block !mb-0 overflow-x-auto"><code>{testCase.input}</code></pre>
                  </div>
                  <div>
                    <div className="text-xs font-mono uppercase tracking-[0.12em] text-muted-foreground mb-1">Expected output</div>
                    <pre className="code-block !mb-0 overflow-x-auto"><code>{testCase.output}</code></pre>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-4">
          <div className="eyebrow">Starter templates</div>
          <div className="grid gap-4 xl:grid-cols-2">
            {Object.entries(starterCode).map(([language, code]) => (
              <div key={language} className="rounded-xl border border-[color:var(--rule)] p-4">
                <div className="text-xs font-mono uppercase tracking-[0.12em] text-muted-foreground mb-3">{language}</div>
                <pre className="code-block !mb-0 overflow-x-auto"><code>{code}</code></pre>
              </div>
            ))}
          </div>
        </div>
      </section>

      {problem.hints.length > 0 && (
        <section className="surface-card p-6 md:p-8 space-y-4">
          <div className="eyebrow">Hints</div>
          <ol className="space-y-3">
            {problem.hints.map((hint) => (
              <li key={hint.id} className="rounded-xl border border-[color:var(--rule)] px-4 py-3 leading-relaxed">
                <span className="mr-2 font-mono text-xs text-[color:var(--ink-blue)]">{String(hint.order).padStart(2, "0")}</span>
                {hint.content}
              </li>
            ))}
          </ol>
        </section>
      )}

      {problem.editorial && (
        <section className="surface-card p-6 md:p-8 space-y-8">
          <div className="eyebrow">Editorial</div>
          <section>
            <h2 className="font-display text-2xl font-medium mb-3">Intuition</h2>
            <ArticleBody markdown={problem.editorial.intuitionMd} />
          </section>
          {problem.editorial.bruteForceMd && (
            <section>
              <h2 className="font-display text-2xl font-medium mb-3">Brute force</h2>
              <ArticleBody markdown={problem.editorial.bruteForceMd} />
            </section>
          )}
          <section>
            <h2 className="font-display text-2xl font-medium mb-3">Optimized approach</h2>
            <ArticleBody markdown={problem.editorial.optimizedMd} />
          </section>
          <section>
            <h2 className="font-display text-2xl font-medium mb-3">Complexity</h2>
            <ArticleBody markdown={problem.editorial.complexityMd} />
          </section>
          {problem.editorial.edgeCasesMd && (
            <section>
              <h2 className="font-display text-2xl font-medium mb-3">Edge cases</h2>
              <ArticleBody markdown={problem.editorial.edgeCasesMd} />
            </section>
          )}
          {problem.editorial.commonMistakesMd && (
            <section>
              <h2 className="font-display text-2xl font-medium mb-3">Common mistakes</h2>
              <ArticleBody markdown={problem.editorial.commonMistakesMd} />
            </section>
          )}
        </section>
      )}

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
                    className="block rounded-xl border border-[color:var(--rule)] px-4 py-3 hover:border-[color:var(--ink-blue)] transition-colors"
                  >
                    <div className="font-medium text-[color:var(--ink)]">{article.title}</div>
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
    </div>
  );
}
