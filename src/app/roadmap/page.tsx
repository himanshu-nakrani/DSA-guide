import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArticleStatus } from "@/generated/prisma";
import { ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function RoadmapPage() {
  const track = await prisma.track.findUnique({
    where: { slug: "a2z-dsa-roadmap" },
    include: {
      modules: {
        orderBy: { order: "asc" },
        include: {
          topics: {
            orderBy: { order: "asc" },
            include: {
              articles: {
                where: { status: ArticleStatus.PUBLISHED },
                orderBy: [{ level: "asc" }, { order: "asc" }],
              },
              problems: { include: { problem: true } },
            },
          },
        },
      },
    },
  });

  if (!track) {
    return (
      <div className="p-16">
        <p className="text-muted-foreground">Roadmap not found.</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-12 py-16">
      <header className="bloom mb-14">
        <div className="eyebrow mb-3" style={{ ["--i" as string]: 0 }}>
          Curriculum
        </div>
        <h1
          className="font-display text-[clamp(2.5rem,5vw,3.75rem)] leading-[1.05] font-semibold"
          style={{ ["--i" as string]: 1 }}
        >
          Roadmap
        </h1>
        <p
          className="text-lg text-muted-foreground mt-4 max-w-2xl"
          style={{ ["--i" as string]: 2 }}
        >
          {track.description}
        </p>
      </header>

      {/* Vertical step timeline */}
      <ol className="bloom">
        {track.modules.map((module, i) => {
          const articleCount = module.topics.reduce(
            (s, t) => s + t.articles.length,
            0,
          );
          const problemCount = module.topics.reduce(
            (s, t) => s + t.problems.length,
            0,
          );
          const firstArticle =
            module.topics.flatMap((t) => t.articles)[0] ?? null;
          const isLast = i === track.modules.length - 1;

          return (
            <li
              key={module.id}
              className="relative grid grid-cols-[3rem_1fr] gap-5"
              style={{ ["--i" as string]: i }}
            >
              <div className="flex flex-col items-center">
                <div className="h-10 w-10 rounded-full bg-primary/10 text-primary border border-primary/20 flex items-center justify-center font-mono text-sm font-medium tabular-nums shrink-0">
                  {String(module.order).padStart(2, "0")}
                </div>
                {!isLast && <div className="flex-1 w-px bg-border my-1" aria-hidden />}
              </div>

              <div className={`pt-1 ${isLast ? "pb-0" : "pb-5"}`}>
                <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
                  <div className="flex items-baseline justify-between gap-4 flex-wrap mb-2">
                    <h2 className="font-display text-lg font-semibold">
                      {module.name}
                    </h2>
                    <div className="text-[0.7rem] font-mono text-muted-foreground tabular-nums flex items-center gap-2">
                      <span>{articleCount} {articleCount === 1 ? "article" : "articles"}</span>
                      {problemCount > 0 && (
                        <>
                          <span className="text-muted-foreground/40">·</span>
                          <span>{problemCount} {problemCount === 1 ? "problem" : "problems"}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {module.description && (
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {module.description}
                    </p>
                  )}

                  {firstArticle && (
                    <div className="mt-3">
                      <Link
                        href={`/learn/${firstArticle.slug}`}
                        className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:opacity-80 transition-opacity"
                      >
                        Start: {firstArticle.title}
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
