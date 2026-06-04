import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArticleLevel, ArticleStatus } from "@/generated/prisma";
import { ArticleBody } from "@/components/article/ArticleBody";
import { ArticleToc } from "@/components/article/ArticleToc";
import { ReadingProgress } from "@/components/article/ReadingProgress";
import { FocusMode } from "@/components/article/FocusMode";
import { ArticleLink } from "@/components/article/ArticleLink";
import { ReadTracker } from "@/components/article/ReadTracker";
import { extractH2Toc } from "@/lib/toc";
import { getSearchIndex } from "@/lib/searchIndex";
import { ViewTransition } from "react";
import type { ArticlePreviewMap } from "@/components/article/ArticleBody";
import { ArrowLeft, ArrowRight, Clock } from "lucide-react";

export const dynamic = "force-dynamic";

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
  return {
    title: `${article.title} — DSA Guide`,
    description: article.summary,
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
  FOUNDATION:
    "bg-[color:var(--chart-2)]/10 text-[color:var(--chart-2)] border-[color:var(--chart-2)]/25",
  INTERMEDIATE:
    "bg-[color:var(--chart-3)]/12 text-[color:var(--chart-3)] border-[color:var(--chart-3)]/25",
  ADVANCED:
    "bg-[color:var(--primary)]/12 text-[color:var(--primary)] border-[color:var(--primary)]/25",
};

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

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

  return (
    <div className="min-h-screen">
      <ReadTracker slug={article.slug} />
      <ReadingProgress targetSelector="#article-root" />

      {/* Breadcrumb / metadata bar */}
      <div className="reader-chrome border-b border-border bg-[color:var(--surface-1,var(--card))] transition-opacity duration-300">
        <div className="max-w-6xl mx-auto px-6 md:px-12 py-4 flex items-center justify-between gap-6">
          <nav className="text-xs text-muted-foreground flex items-center gap-2 flex-wrap min-w-0">
            <Link href="/learn" className="hover:text-foreground transition-colors">
              Learn
            </Link>
            <span className="text-muted-foreground/50">/</span>
            <span className="truncate">{article.topic.module.name}</span>
            <span className="text-muted-foreground/50">/</span>
            <span className="text-foreground truncate">{article.topic.name}</span>
          </nav>
          <div className="flex items-center gap-3 shrink-0">
            <div className="hidden md:flex items-center gap-2">
              <span
                className={`text-[0.65rem] font-mono uppercase tracking-[0.04em] px-1.5 py-0.5 rounded border ${levelStyle[article.level]}`}
              >
                {levelLabel[article.level]}
              </span>
              <span className="inline-flex items-center gap-1 text-[0.7rem] font-mono text-muted-foreground tabular-nums">
                <Clock className="h-3 w-3" />
                {article.estimatedMins}m
              </span>
            </div>
            <FocusMode />
          </div>
        </div>
      </div>

      <article
        id="article-root"
        className="reader-article max-w-6xl mx-auto px-6 md:px-12 py-12 bloom"
      >
        {/* Title block */}
        <header className="mb-10 max-w-3xl" style={{ ["--i" as string]: 0 }}>
          <ViewTransition name={`article-title-${article.slug}`}>
            <h1 className="font-display text-[clamp(2.25rem,5vw,3.75rem)] leading-[1.02] font-medium tracking-[-0.02em]">
              {article.title}
            </h1>
          </ViewTransition>
          <p className="text-xl text-muted-foreground mt-4 leading-relaxed max-w-2xl">
            {article.summary}
          </p>
        </header>

        {/* Body + right rail (TOC + references) */}
        <div
          className="reader-grid grid lg:grid-cols-[minmax(0,1fr)_16rem] gap-10 lg:gap-14"
          style={{ ["--i" as string]: 1 }}
        >
          <div className="essay min-w-0">
            <ArticleBody markdown={bodyMd} previews={previews} />
          </div>

          <aside className="reader-toc hidden lg:block lg:sticky lg:top-8 lg:self-start space-y-8">
            {tocItems.length > 0 && <ArticleToc items={tocItems} />}
            {references.length > 0 && (
              <div className="space-y-3 border-l border-border pl-6">
                <div className="eyebrow">References</div>
                <ol className="space-y-3.5">
                  {references.map((ref, i) => (
                    <li key={i} className="text-[0.82rem] leading-snug">
                      <span className="font-mono text-[0.65rem] text-primary mr-1.5 tabular-nums">
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
                        <div className="text-muted-foreground text-xs mt-0.5">
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

        {/* Prev/Next nav */}
        <nav
          className="reader-chrome mt-16 grid sm:grid-cols-2 gap-3 transition-opacity duration-300"
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
      className={`group surface-card !p-5 block transition-all hover:-translate-y-0.5 hover:border-[color:color-mix(in_srgb,var(--primary)_45%,var(--border))] ${
        isPrev ? "text-left" : "text-right"
      }`}
    >
      <div className="eyebrow mb-1.5 flex items-center gap-1.5">
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
      <div className="font-medium text-[1rem] tracking-[-0.005em]">
        {article.title}
      </div>
    </ArticleLink>
  );
}

function FootBlank({ label }: { label: string }) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-muted/30 p-5 text-muted-foreground">
      <div className="text-sm">{label}</div>
    </div>
  );
}
