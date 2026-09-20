"use client";

import { ChevronDown } from "lucide-react";

import { CollapsibleRoot, CollapsibleTrigger, CollapsiblePanel } from "@/components/ui/collapsible";
import { ArticleBody } from "@/components/article/ArticleBody";

type Editorial = {
  intuitionMd: string;
  bruteForceMd: string | null;
  optimizedMd: string;
  complexityMd: string;
  edgeCasesMd: string | null;
  commonMistakesMd: string | null;
};

/**
 * EditorialSections — progressive disclosure for the solution walk-through.
 * Each stage is its own ruled section; only "Intuition" starts open so the
 * full answer never dumps onto the reader who hasn't attempted the problem.
 */
export function EditorialSections({ editorial }: { editorial: Editorial }) {
  const sections = [
    { title: "Intuition", markdown: editorial.intuitionMd, defaultOpen: true },
    { title: "Brute force", markdown: editorial.bruteForceMd, defaultOpen: false },
    { title: "Optimized approach", markdown: editorial.optimizedMd, defaultOpen: false },
    { title: "Complexity", markdown: editorial.complexityMd, defaultOpen: false },
    { title: "Edge cases", markdown: editorial.edgeCasesMd, defaultOpen: false },
    { title: "Common mistakes", markdown: editorial.commonMistakesMd, defaultOpen: false },
  ].filter((section) => Boolean(section.markdown));

  return (
    <div className="border-t border-rule">
      {sections.map((section) => (
        <CollapsibleRoot key={section.title} defaultOpen={section.defaultOpen} className="border-b border-rule">
          <CollapsibleTrigger>
            <span className="font-display text-xl font-medium text-ink-blue">
              {section.title}
            </span>
            <ChevronDown
              className="h-4 w-4 text-muted-foreground transition-transform duration-[var(--dur-base)] ease-[var(--ease-out)] group-data-[open]/section:rotate-180"
              strokeWidth={1.5}
            />
          </CollapsibleTrigger>
          <CollapsiblePanel>
            <div className="article-prose pb-6 pt-1 max-w-none">
              <ArticleBody markdown={section.markdown as string} />
            </div>
          </CollapsiblePanel>
        </CollapsibleRoot>
      ))}
    </div>
  );
}
