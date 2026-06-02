import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArticleLevel, ArticleStatus } from "@/generated/prisma";

export const dynamic = "force-dynamic";

const levelLabel: Record<ArticleLevel, string> = {
  FOUNDATION: "Foundation",
  INTERMEDIATE: "Intermediate",
  ADVANCED: "Advanced",
};

export default async function LearnPage() {
  const topics = await prisma.topic.findMany({
    where: { articles: { some: { status: ArticleStatus.PUBLISHED } } },
    include: {
      module: true,
      articles: {
        where: { status: ArticleStatus.PUBLISHED },
        orderBy: [{ level: "asc" }, { order: "asc" }],
      },
    },
    orderBy: [{ module: { order: "asc" } }, { order: "asc" }],
  });

  if (topics.length === 0) {
    return (
      <div className="p-16">
        <p className="font-serif italic text-muted-foreground">
          No articles published yet.
        </p>
      </div>
    );
  }

  type TopicWithArticles = (typeof topics)[number];
  const modulesMap = new Map<
    string,
    { order: number; description: string | null; topics: TopicWithArticles[] }
  >();
  for (const topic of topics) {
    const m = modulesMap.get(topic.module.name);
    if (m) m.topics.push(topic);
    else
      modulesMap.set(topic.module.name, {
        order: topic.module.order,
        description: topic.module.description,
        topics: [topic],
      });
  }

  const totalArticles = topics.reduce((s, t) => s + t.articles.length, 0);

  return (
    <div className="max-w-5xl mx-auto px-12 py-16">
      {/* Page header — like the title page of a chapter section. */}
      <header className="bloom mb-16">
        <div className="smallcaps text-muted-foreground" style={{ ["--i" as string]: 0 }}>
          Part II
        </div>
        <h1
          className="font-display text-[clamp(3rem,6vw,4.5rem)] leading-[0.95] mt-2 font-medium tracking-tight"
          style={{ ["--i" as string]: 1 }}
        >
          The <em className="text-primary">Learnings</em>
        </h1>
        <p
          className="font-serif text-lg italic text-muted-foreground mt-4 max-w-2xl"
          style={{ ["--i" as string]: 2 }}
        >
          A collection of {totalArticles} essays, arranged in {modulesMap.size}{" "}
          chapters, from the elementary to the intermediate.
        </p>
        <div className="rule mt-10" style={{ ["--i" as string]: 3 }} />
      </header>

      {/* Table of contents — chapter-style, with marginalia. */}
      <div className="space-y-20 bloom">
        {Array.from(modulesMap.entries()).map(([moduleName, moduleData], idx) => (
          <ChapterSection
            key={moduleName}
            chapterNumber={moduleData.order}
            moduleName={moduleName}
            description={moduleData.description}
            topics={moduleData.topics}
            i={idx}
          />
        ))}
      </div>
    </div>
  );
}

function ChapterSection({
  chapterNumber,
  moduleName,
  description,
  topics,
  i,
}: {
  chapterNumber: number;
  moduleName: string;
  description: string | null;
  topics: Awaited<ReturnType<typeof prisma.topic.findMany>> extends infer T
    ? T extends Array<infer U>
      ? (U & { articles: Array<{ id: string; slug: string; title: string; summary: string; level: ArticleLevel; estimatedMins: number }> })[]
      : never
    : never;
  i: number;
}) {
  return (
    <section style={{ ["--i" as string]: i }}>
      <div className="grid grid-cols-[6rem_1fr] gap-x-8 gap-y-1 mb-8">
        <div className="font-display text-[2.6rem] leading-none text-muted-foreground/70 tabular-nums">
          {romanize(chapterNumber)}.
        </div>
        <div className="pt-1">
          <div className="smallcaps text-muted-foreground">Chapter</div>
          <h2 className="font-display text-3xl font-medium leading-tight mt-1">
            {moduleName}
          </h2>
          {description && (
            <p className="font-serif italic text-muted-foreground mt-2 max-w-xl">
              {description}
            </p>
          )}
        </div>
      </div>

      <div className="border-t border-foreground">
        {topics.flatMap((topic) =>
          topic.articles.map((article, idx) => (
            <Link
              key={article.id}
              href={`/learn/${article.slug}`}
              className="group block border-b border-border hover:bg-accent/40 transition-colors"
            >
              <div className="grid grid-cols-[6rem_1fr_auto] items-baseline gap-x-8 py-5">
                <div className="font-mono text-[0.7rem] tracking-wider text-muted-foreground/70 tabular-nums pl-1">
                  {String(chapterNumber).padStart(2, "0")}.{String(idx + 1).padStart(2, "0")}
                </div>
                <div className="min-w-0">
                  <div className="font-display text-xl font-medium leading-tight">
                    <span className="link-quill">{article.title}</span>
                  </div>
                  <p className="font-serif text-[0.95rem] text-muted-foreground mt-1 leading-snug">
                    {article.summary}
                  </p>
                </div>
                <div className="text-right shrink-0 hidden md:block">
                  <div className="smallcaps text-muted-foreground/80">
                    {levelLabel[article.level]}
                  </div>
                  <div className="font-mono text-[0.7rem] text-muted-foreground/70 mt-1 tabular-nums">
                    {article.estimatedMins} min
                  </div>
                </div>
              </div>
            </Link>
          )),
        )}
      </div>
    </section>
  );
}

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
