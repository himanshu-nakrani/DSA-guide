import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArticleLevel, ArticleStatus } from "@/generated/prisma";
import { ArticleBody } from "@/components/article/ArticleBody";
import { ArrowLeft, ArrowRight, Clock } from "lucide-react";

export const dynamic = "force-dynamic";

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
  FOUNDATION: "bg-[#2563eb]/10 text-[#2563eb] border-[#2563eb]/20",
  INTERMEDIATE: "bg-[#0f766e]/10 text-[#0f766e] border-[#0f766e]/20",
  ADVANCED: "bg-[#c2410c]/10 text-[#c2410c] border-[#c2410c]/20",
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
    select: { slug: true, title: true },
  });

  const idx = siblings.findIndex((a) => a.slug === article.slug);
  const prev = idx > 0 ? siblings[idx - 1] : null;
  const next = idx < siblings.length - 1 ? siblings[idx + 1] : null;
  const references = (article.references ?? []) as Reference[];

  return (
    <div className="min-h-screen">
      {/* Breadcrumb / metadata bar */}
      <div className="border-b border-border bg-[color:var(--sidebar)]">
        <div className="max-w-5xl mx-auto px-12 py-4 flex items-center justify-between gap-6">
          <nav className="text-xs text-muted-foreground flex items-center gap-2 flex-wrap">
            <Link href="/learn" className="hover:text-foreground transition-colors">
              Learn
            </Link>
            <span className="text-muted-foreground/50">/</span>
            <span>{article.topic.module.name}</span>
            <span className="text-muted-foreground/50">/</span>
            <span className="text-foreground">{article.topic.name}</span>
          </nav>
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
        </div>
      </div>

      <article className="max-w-5xl mx-auto px-12 py-12 bloom">
        {/* Title block */}
        <header className="mb-10 max-w-3xl" style={{ ["--i" as string]: 0 }}>
          <h1 className="font-display text-[clamp(2.25rem,4.5vw,3.5rem)] leading-[1.05] font-semibold">
            {article.title}
          </h1>
          <p className="text-xl text-muted-foreground mt-4 leading-relaxed">
            {article.summary}
          </p>
        </header>

        {/* Body + marginalia */}
        <div
          className="grid lg:grid-cols-[minmax(0,1fr)_15rem] gap-10 lg:gap-14"
          style={{ ["--i" as string]: 1 }}
        >
          <div className="essay min-w-0">
            <ArticleBody markdown={stripFirstReferencesSection(article.contentMd)} />
          </div>

          {references.length > 0 && (
            <aside className="lg:sticky lg:top-8 lg:self-start space-y-3 lg:border-l lg:border-border lg:pl-6">
              <div className="eyebrow">References</div>
              <ol className="space-y-3.5">
                {references.map((ref, i) => (
                  <li key={i} className="text-[0.85rem] leading-snug">
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
            </aside>
          )}
        </div>

        {/* Prev/Next nav */}
        <nav
          className="mt-16 grid sm:grid-cols-2 gap-3"
          style={{ ["--i" as string]: 2 }}
        >
          {prev ? (
            <FootLink direction="prev" label="Previous" title={prev.title} href={`/learn/${prev.slug}`} />
          ) : (
            <FootBlank label="No previous article" />
          )}
          {next ? (
            <FootLink direction="next" label="Next" title={next.title} href={`/learn/${next.slug}`} />
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
  title,
  href,
}: {
  direction: "prev" | "next";
  label: string;
  title: string;
  href: string;
}) {
  const isPrev = direction === "prev";
  return (
    <Link
      href={href}
      className={`group rounded-xl border border-border bg-card p-5 transition-all hover:shadow-md hover:-translate-y-0.5 ${
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
      <div className="font-display text-base font-semibold">
        {title}
      </div>
    </Link>
  );
}

function FootBlank({ label }: { label: string }) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-muted/30 p-5 text-muted-foreground">
      <div className="text-sm">{label}</div>
    </div>
  );
}
