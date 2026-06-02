import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArticleStatus } from "@/generated/prisma";

function romanize(num: number): string {
  const map: [number, string][] = [
    [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"],
  ];
  let n = num;
  let out = "";
  for (const [v, s] of map) {
    while (n >= v) {
      out += s;
      n -= v;
    }
  }
  return out;
}

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
        <p className="font-serif italic text-muted-foreground">Roadmap not found.</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-12 py-16">
      <header className="bloom mb-16">
        <div className="smallcaps text-muted-foreground" style={{ ["--i" as string]: 0 }}>
          Part III
        </div>
        <h1
          className="font-display text-[clamp(3rem,6vw,4.5rem)] leading-[0.95] mt-2 font-medium tracking-tight"
          style={{ ["--i" as string]: 1 }}
        >
          The <em className="text-primary">Roadmap</em>
        </h1>
        <p
          className="font-serif text-lg italic text-muted-foreground mt-4 max-w-2xl"
          style={{ ["--i" as string]: 2 }}
        >
          {track.description}
        </p>
        <div className="rule mt-10" style={{ ["--i" as string]: 3 }} />
      </header>

      <ol className="space-y-14 bloom">
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

          return (
            <li
              key={module.id}
              className="grid grid-cols-[6rem_1fr] gap-x-8"
              style={{ ["--i" as string]: i }}
            >
              <div className="font-display text-[2.2rem] leading-none text-muted-foreground/60 tabular-nums pt-1">
                {romanize(module.order)}.
              </div>
              <div className="border-b border-border pb-6">
                <div className="flex items-baseline justify-between gap-6 flex-wrap">
                  <div className="min-w-0">
                    <h2 className="font-display text-2xl font-medium leading-tight">
                      {module.name}
                    </h2>
                    {module.description && (
                      <p className="font-serif italic text-muted-foreground mt-1">
                        {module.description}
                      </p>
                    )}
                  </div>
                  <div className="smallcaps text-muted-foreground/80 shrink-0">
                    <span className="tabular-nums">{articleCount}</span>{" "}
                    {articleCount === 1 ? "essay" : "essays"}
                    <span className="mx-2 text-muted-foreground/40">·</span>
                    <span className="tabular-nums">{problemCount}</span>{" "}
                    {problemCount === 1 ? "problem" : "problems"}
                  </div>
                </div>

                {firstArticle && (
                  <div className="mt-5">
                    <Link
                      href={`/learn/${firstArticle.slug}`}
                      className="group inline-flex items-baseline gap-2 font-display text-base text-primary"
                    >
                      <span className="link-quill">Begin: {firstArticle.title}</span>
                      <span className="transition-transform group-hover:translate-x-1">
                        →
                      </span>
                    </Link>
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ol>

      <div className="ornament mt-20">
        <span>❦</span>
      </div>
    </div>
  );
}
