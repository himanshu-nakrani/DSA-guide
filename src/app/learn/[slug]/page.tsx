import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArticleLevel, ArticleStatus, ProgressStatus } from "@/generated/prisma";
import { ArticleBody } from "@/components/article/ArticleBody";
import { ArticleToc } from "@/components/article/ArticleToc";
import { ReadingProgress } from "@/components/article/ReadingProgress";
import { FocusMode } from "@/components/article/FocusMode";
import { SearchTrigger } from "@/components/article/SearchTrigger";
import { ReadingChip } from "@/components/article/ReadingChip";
import { ArticleLink } from "@/components/article/ArticleLink";
import { ReadTracker } from "@/components/article/ReadTracker";
import { extractH2Toc } from "@/lib/toc";
import { getSearchIndex } from "@/lib/searchIndex";
import { getCurrentUser } from "@/lib/auth";
import { getBookmarkProblemIds } from "@/lib/lists";
import { getUserReadArticleSlugs } from "@/lib/progress";
import { ReadProgressSync } from "@/components/progress/ReadProgressSync";
import { ProblemCard } from "@/components/problems/ProblemCard";
import { pickNextProblem, summarizeProblemProgress } from "@/lib/problem-progress";
import { ViewTransition } from "react";
import type { ArticlePreviewMap } from "@/components/article/ArticleBody";
import { ArrowLeft, ArrowRight } from "lucide-react";

export const revalidate = 3600;

export async function generateStaticParams() {
  const articles = await prisma.article.findMany({
    where: { status: ArticleStatus.PUBLISHED },
    select: { slug: true },
  });
  return articles.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await prisma.article.findFirst({
    where: { slug, status: ArticleStatus.PUBLISHED },
    select: { title: true, summary: true },
  });
  if (!article) return { title: "DSA Guide" };
  const canonical = `/learn/${slug}`;
  return {
    title: `${article.title} — DSA Guide`,
    description: article.summary,
    alternates: { canonical },
    openGraph: {
      title: article.title,
      description: article.summary,
      url: canonical,
      type: "article",
      images: [{ url: `${canonical}/opengraph-image` }],
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.summary,
      images: [`${canonical}/opengraph-image`],
    },
  };
}

type Reference = {
  title: string;
  author?: string;
  url?: string;
  type: string;
};

const levelLabel: Record<ArticleLevel, string> = {
  FOUNDATION: "Foundation",
  INTERMEDIATE: "Intermediate",
  ADVANCED: "Advanced",
};

const levelStyle: Record<ArticleLevel, string> = {
  FOUNDATION: "pill",
  INTERMEDIATE: "pill",
  ADVANCED: "pill pill-primary",
};

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const user = await getCurrentUser();

  const article = await prisma.article.findFirst({
    where: { slug, status: ArticleStatus.PUBLISHED },
    include: { topic: { include: { module: true } } },
  });

  if (!article) notFound();

  const siblings = await prisma.article.findMany({
    where: { topicId: article.topicId, status: ArticleStatus.PUBLISHED },
    orderBy: [{ level: "asc" }, { order: "asc" }],
    select: {
      slug: true,
      title: true,
      summary: true,
      level: true,
      estimatedMins: true,
    },
  });

  const idx = siblings.findIndex((a) => a.slug === article.slug);
  const prev = idx > 0 ? siblings[idx - 1] : null;
  const next = idx < siblings.length - 1 ? siblings[idx + 1] : null;
  const references = (article.references ?? []) as Reference[];
  const bodyMd = stripFirstReferencesSection(article.contentMd);
  const tocItems = extractH2Toc(bodyMd);

  // Build the slug -> preview map from the global search index so any
  // /learn/<slug> link inside the essay gets a hover-preview card.
  const searchIndex = await getSearchIndex();
  const previews: ArticlePreviewMap = {};
  for (const item of searchIndex) {
    if (item.kind !== "article") continue;
    const m = /^\/learn\/(.+)$/.exec(item.href);
    if (!m) continue;
    previews[m[1]] = {
      title: item.title,
      summary: item.summary,
      level: item.level,
      estimatedMins: item.mins,
      moduleName: item.moduleName,
    };
  }

  const readSlugs = user ? await getUserReadArticleSlugs(user.id) : [];
  const relatedProblems = await prisma.problem.findMany({
    where: {
      status: "PUBLISHED",
      topics: { some: { topicId: article.topicId } },
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
  const problemProgress = user
    ? await prisma.userProblemProgress.findMany({
        where: { userId: user.id, problemId: { in: relatedProblems.map((problem) => problem.id) } },
        select: { problemId: true, status: true },
      })
    : [];
  const problemProgressMap = new Map<string, ProgressStatus>(
    problemProgress.map((row) => [row.problemId, row.status]),
  );
  const bookmarkIds = user ? await getBookmarkProblemIds(user.id) : new Set<string>();
  const practiceSummary = summarizeProblemProgress(
    relatedProblems.map((problem) => problem.id),
    problemProgressMap,
  );
  const recommendedProblem = pickNextProblem(relatedProblems, problemProgressMap);
  const remainingProblems = recommendedProblem
    ? relatedProblems.filter((problem) => problem.id !== recommendedProblem.id)
    : relatedProblems;

  return (
    <div className="min-h-screen">
      {readSlugs.length > 0 && <ReadProgressSync slugs={readSlugs} />}
      <ReadTracker slug={article.slug} />
      <ReadingProgress targetSelector="#article-root" />

      {/* Breadcrumb / metadata bar — printed running header */}
      <div className="reader-chrome border-b border-[color:var(--rule)] transition-opacity duration-300">
        <div className="max-w-6xl mx-auto px-6 md:px-12 py-3 flex items-center justify-between gap-6">
          <nav className="text-[0.72rem] font-mono uppercase tracking-[0.12em] text-muted-foreground flex items-center gap-2 flex-wrap min-w-0">
            <Link href="/learn" className="hover:text-[color:var(--ink-blue)] transition-colors">
              Learn
            </Link>
            <span className="text-muted-foreground/50">·</span>
            <span className="truncate">{article.topic.module.name}</span>
            <span className="text-muted-foreground/50">·</span>
            <span className="text-foreground truncate">{article.topic.name}</span>
          </nav>
          <div className="flex items-center gap-3 shrink-0">
            <div className="hidden md:flex items-center gap-2">
              <span className={levelStyle[article.level]}>
                {levelLabel[article.level]}
              </span>
              <ReadingChip
                targetSelector="#article-root"
                totalMins={article.estimatedMins}
              />
            </div>
            <SearchTrigger />
            <FocusMode />
          </div>
        </div>
      </div>

      <article
        id="article-root"
        className="reader-article max-w-6xl mx-auto px-6 md:px-12 py-12 bloom"
      >
        {/* Title block — manuscript page header */}
        <header className="mb-10 max-w-3xl" style={{ ["--i" as string]: 0 }}>
          <div className="eyebrow mb-4">
            <span className="text-[color:var(--ink-blue)] mr-2">§</span>
            {article.topic.module.name}
          </div>
          <ViewTransition name={`article-title-${article.slug}`}>
            <h1 className="font-display font-medium text-[clamp(2rem,4.5vw,3.25rem)] leading-[1.08]">
              {article.title}
            </h1>
          </ViewTransition>
          <p className="text-[1.1rem] mt-4 leading-relaxed max-w-2xl text-[color:var(--ink-soft)]">
            {article.summary}
          </p>
          <div aria-hidden className="mt-8 h-px bg-[color:var(--rule-strong)]" />
        </header>

        {/* Body + right rail (TOC + references). At xl widths the `.essay`
            itself becomes a 2-column subgrid (body + 13rem marginalia gutter)
            so margin-tone annotations sit beside the paragraph they belong to. */}
        <div
          className="reader-grid grid lg:grid-cols-[minmax(0,1fr)_15rem] gap-10 lg:gap-12"
          style={{ ["--i" as string]: 1 }}
        >
          <div className="essay min-w-0">
            <ArticleBody markdown={bodyMd} previews={previews} />

            {relatedProblems.length > 0 && (
              <section className="mt-12 space-y-5">
                <div className="rule-section with-ornament" aria-hidden />
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <div className="eyebrow mb-2">Practice set</div>
                    <h2 className="font-display text-2xl font-medium text-[color:var(--ink)]">
                      Apply this topic
                    </h2>
                    <p className="mt-2 text-[0.95rem] text-[color:var(--ink-soft)]">
                      Try these problems while the pattern is still fresh.
                    </p>
                  </div>
                  <div className="rounded-xl border border-[color:var(--rule)] bg-background/40 px-4 py-3 min-w-44">
                    <div className="text-[0.68rem] font-mono uppercase tracking-[0.12em] text-muted-foreground">
                      Topic practice
                    </div>
                    <div className="mt-1 font-mono text-sm tabular-nums text-[color:var(--ink)]">
                      {practiceSummary.solved}/{practiceSummary.total} solved · {practiceSummary.percent}%
                    </div>
                    <div className="mt-3 h-1.5 rounded-full bg-[color:var(--rule)]/60 overflow-hidden">
                      <div
                        className="h-full bg-[color:var(--ink-blue)] transition-[width]"
                        style={{ width: `${practiceSummary.percent}%` }}
                      />
                    </div>
                  </div>
                </div>

                {recommendedProblem && (
                  <div className="space-y-3">
                    <div className="text-[0.7rem] font-mono uppercase tracking-[0.12em] text-muted-foreground">
                      Recommended next
                    </div>
                    <ProblemCard
                      problem={recommendedProblem}
                      moduleName={recommendedProblem.topics[0]?.topic.module.name}
                      topicName={recommendedProblem.topics[0]?.topic.name}
                      status={problemProgressMap.get(recommendedProblem.id)}
                      bookmarked={bookmarkIds.has(recommendedProblem.id)}
                      signedIn={Boolean(user)}
                      returnTo={`/learn/${article.slug}`}
                    />
                  </div>
                )}

                {remainingProblems.length > 0 && (
                  <div className="space-y-3">
                    <div className="text-[0.7rem] font-mono uppercase tracking-[0.12em] text-muted-foreground">
                      More practice
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      {remainingProblems.map((problem) => (
                        <ProblemCard
                          key={problem.id}
                          problem={problem}
                          moduleName={problem.topics[0]?.topic.module.name}
                          topicName={problem.topics[0]?.topic.name}
                          status={problemProgressMap.get(problem.id)}
                          bookmarked={bookmarkIds.has(problem.id)}
                          signedIn={Boolean(user)}
                          returnTo={`/learn/${article.slug}`}
                          compact
                        />
                      ))}
                    </div>
                  </div>
                )}
              </section>
            )}
          </div>


          <aside className="reader-toc hidden lg:block lg:sticky lg:top-8 lg:self-start space-y-9 font-sans">
            {tocItems.length > 0 && <ArticleToc items={tocItems} />}
            {references.length > 0 && (
              <div className="space-y-3 border-l border-[color:var(--rule)] pl-5">
                <div className="eyebrow">Sources</div>
                <ol className="space-y-3">
                  {references.map((ref, i) => (
                    <li key={i} className="text-[0.78rem] leading-snug">
                      <span className="font-mono text-[0.62rem] text-[color:var(--ink-blue)] mr-1.5 tabular-nums">
                        [{String(i + 1).padStart(2, "0")}]
                      </span>
                      {ref.url ? (
                        <a
                          href={ref.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="link-quill"
                        >
                          {ref.title}
                        </a>
                      ) : (
                        <span>{ref.title}</span>
                      )}
                      {ref.author && (
                        <div className="text-muted-foreground text-[0.72rem] mt-0.5 font-pencil">
                          {ref.author}
                        </div>
                      )}
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </aside>
        </div>

        {/* Prev/Next nav — manuscript folio links */}
        <div aria-hidden className="mt-16 rule-section with-ornament" />
        <nav
          className="reader-chrome grid sm:grid-cols-2 gap-3 transition-opacity duration-300"
          style={{ ["--i" as string]: 2 }}
        >
          {prev ? (
            <FootLink
              direction="prev"
              label="Previous"
              article={prev}
              moduleName={article.topic.module.name}
            />
          ) : (
            <FootBlank label="No previous article" />
          )}
          {next ? (
            <FootLink
              direction="next"
              label="Next"
              article={next}
              moduleName={article.topic.module.name}
            />
          ) : (
            <FootBlank label="No next article" />
          )}
        </nav>
      </article>
    </div>
  );
}

/** Strip the trailing `## References` section so we render it in the margin instead. */
function stripFirstReferencesSection(md: string): string {
  const idx = md.search(/\n##\s+References\s*\n/);
  return idx === -1 ? md : md.slice(0, idx);
}

function FootLink({
  direction,
  label,
  article,
  moduleName,
}: {
  direction: "prev" | "next";
  label: string;
  article: {
    slug: string;
    title: string;
    summary: string;
    level: ArticleLevel;
    estimatedMins: number;
  };
  moduleName: string;
}) {
  const isPrev = direction === "prev";
  return (
    <ArticleLink
      href={`/learn/${article.slug}`}
      preview={{
        title: article.title,
        summary: article.summary,
        level: article.level,
        estimatedMins: article.estimatedMins,
        moduleName,
      }}
      className={`group block p-5 border border-[color:var(--rule)] rounded-sm transition-colors hover:border-[color:var(--ink-blue)] ${
        isPrev ? "text-left" : "text-right"
      }`}
    >
      <div className="eyebrow mb-2 flex items-center gap-1.5 text-[color:var(--pencil)]">
        {isPrev ? (
          <>
            <ArrowLeft className="h-3 w-3" /> {label}
          </>
        ) : (
          <span className="ml-auto flex items-center gap-1.5">
            {label} <ArrowRight className="h-3 w-3" />
          </span>
        )}
      </div>
      <div className="font-display text-[1.05rem] text-[color:var(--ink)] group-hover:text-[color:var(--ink-blue)] transition-colors">
        {article.title}
      </div>
    </ArticleLink>
  );
}

function FootBlank({ label }: { label: string }) {
  return (
    <div className="rounded-sm border border-dashed border-[color:var(--rule)] p-5 text-muted-foreground font-pencil">
      <div className="text-sm">{label}</div>
    </div>
  );
}
