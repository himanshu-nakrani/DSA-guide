import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { ArticleStatus } from "@/generated/prisma";

export type SearchItem =
  | {
      kind: "article";
      title: string;
      summary: string;
      href: string;
      level: "FOUNDATION" | "INTERMEDIATE" | "ADVANCED";
      mins: number;
      moduleName: string;
      topicName: string;
    }
  | {
      kind: "module";
      title: string;
      href: string;
      order: number;
      description: string | null;
    }
  | {
      kind: "topic";
      title: string;
      href: string;
      moduleName: string;
    }
  | {
      kind: "problem";
      title: string;
      href: string;
      difficulty: "EASY" | "MEDIUM" | "HARD";
      topicName: string;
      moduleName: string;
    };

export const getSearchIndex = cache(async (): Promise<SearchItem[]> => {
  const modules = await prisma.module.findMany({
    orderBy: { order: "asc" },
    include: {
      topics: {
        orderBy: { order: "asc" },
        include: {
          articles: {
            where: { status: ArticleStatus.PUBLISHED },
            orderBy: [{ level: "asc" }, { order: "asc" }],
            select: {
              slug: true,
              title: true,
              summary: true,
              level: true,
              estimatedMins: true,
            },
          },
          problems: {
            where: { problem: { status: "PUBLISHED" } },
            select: {
              problem: {
                select: {
                  slug: true,
                  title: true,
                  difficulty: true,
                },
              },
            },
          },
        },
      },
    },
  });

  const items: SearchItem[] = [];
  for (const m of modules) {
    items.push({
      kind: "module",
      title: m.name,
      href: "/roadmap",
      order: m.order,
      description: m.description,
    });
    for (const t of m.topics) {
      items.push({
        kind: "topic",
        title: t.name,
        href: "/learn",
        moduleName: m.name,
      });
      for (const { problem } of [...t.problems].sort((a, b) =>
        a.problem.title.localeCompare(b.problem.title),
      )) {
        items.push({
          kind: "problem",
          title: problem.title,
          href: `/problems/${problem.slug}`,
          difficulty: problem.difficulty,
          moduleName: m.name,
          topicName: t.name,
        });
      }
      for (const a of t.articles) {
        items.push({
          kind: "article",
          title: a.title,
          summary: a.summary,
          href: `/learn/${a.slug}`,
          level: a.level,
          mins: a.estimatedMins,
          moduleName: m.name,
          topicName: t.name,
        });
      }
    }
  }
  return items;
});
