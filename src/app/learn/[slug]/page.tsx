import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ArticleLevel, ArticleStatus } from "@/generated/prisma";

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

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const article = await prisma.article.findUnique({
    where: { slug },
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
      {/* Top metadata bar — runs above the article body. */}
      <div className="border-b border-border bg-[color:var(--sidebar)]">
        <div className="max-w-5xl mx-auto px-12 py-5 flex items-center justify-between gap-6">
          <nav className="font-mono text-[0.7rem] tracking-wider uppercase text-muted-foreground">
            <Link href="/learn" className="hover:text-foreground transition-colors">
              Learnings
            </Link>
            <span className="mx-3 text-muted-foreground/50">/</span>
            <span>{article.topic.module.name}</span>
            <span className="mx-3 text-muted-foreground/50">/</span>
            <span className="text-foreground">{article.topic.name}</span>
          </nav>
          <div className="smallcaps text-muted-foreground hidden md:block">
            {levelLabel[article.level]}
            <span className="mx-2 text-muted-foreground/40">·</span>
            <span className="tabular-nums">{article.estimatedMins} min</span>
          </div>
        </div>
      </div>

      <article className="max-w-5xl mx-auto px-12 py-16 bloom">
        {/* Article title block */}
        <header className="mb-12 max-w-3xl" style={{ ["--i" as string]: 0 }}>
          <div className="smallcaps text-muted-foreground mb-3">
            §{idx + 1} &nbsp;·&nbsp; an essay
          </div>
          <h1 className="font-display text-[clamp(2.5rem,5vw,4rem)] leading-[1.02] font-medium tracking-tight">
            {article.title}
          </h1>
          <p className="font-serif italic text-xl text-muted-foreground mt-5 leading-relaxed">
            {article.summary}
          </p>
        </header>

        <div className="rule mb-12" style={{ ["--i" as string]: 1 }} />

        {/* Two-column layout: essay on the left, references in the margin. */}
        <div
          className="grid lg:grid-cols-[minmax(0,1fr)_16rem] gap-12 lg:gap-16"
          style={{ ["--i" as string]: 2 }}
        >
          <div className="essay dropcap min-w-0">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {stripFirstReferencesSection(article.contentMd)}
            </ReactMarkdown>
            <div className="ornament mt-16 mb-2 text-muted-foreground/60">
              <span>❦</span>
            </div>
          </div>

          {/* Marginalia: references. Sticky on large screens. */}
          {references.length > 0 && (
            <aside className="lg:sticky lg:top-8 lg:self-start space-y-5 lg:border-l lg:border-border lg:pl-8">
              <div className="smallcaps text-muted-foreground">References</div>
              <ol className="space-y-4">
                {references.map((ref, i) => (
                  <li key={i} className="font-serif text-[0.88rem] leading-snug">
                    <span className="font-mono text-[0.65rem] text-primary mr-2 tabular-nums">
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
                      <span className="italic">{ref.title}</span>
                    )}
                    {ref.author && (
                      <div className="text-muted-foreground mt-0.5">{ref.author}</div>
                    )}
                  </li>
                ))}
              </ol>
            </aside>
          )}
        </div>

        {/* Foot navigation — previous / next chapter signatures. */}
        <nav
          className="mt-20 grid sm:grid-cols-2 gap-px bg-border border border-border"
          style={{ ["--i" as string]: 3 }}
        >
          {prev ? (
            <FootLink direction="prev" label="Previous" title={prev.title} href={`/learn/${prev.slug}`} />
          ) : (
            <FootBlank label="No essay precedes" />
          )}
          {next ? (
            <FootLink direction="next" label="Next" title={next.title} href={`/learn/${next.slug}`} />
          ) : (
            <FootBlank label="No essay follows" />
          )}
        </nav>
      </article>
    </div>
  );
}

/** The article markdown already ends in a "## References" section we render
 *  separately in the margin. Strip it from the body so it isn't duplicated. */
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
      className={`group bg-card p-8 transition-colors hover:bg-accent/40 ${
        isPrev ? "text-left" : "text-right"
      }`}
    >
      <div className="smallcaps text-muted-foreground mb-2">
        {isPrev ? "← " : ""}{label}{isPrev ? "" : " →"}
      </div>
      <div className="font-display text-xl italic leading-tight">
        <span className="link-quill">{title}</span>
      </div>
    </Link>
  );
}

function FootBlank({ label }: { label: string }) {
  return (
    <div className="bg-card/60 p-8 text-muted-foreground">
      <div className="font-display italic text-base">{label}</div>
    </div>
  );
}
