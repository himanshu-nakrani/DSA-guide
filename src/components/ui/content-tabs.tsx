"use client";

import * as React from "react";

import { TabsList, TabsPanel, TabsRoot, TabsTab } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

export type ContentTab = {
  id: string;
  label: string;
  count?: number;
  content: React.ReactNode;
};

/**
 * ContentTabs — turns a stack of heavy sections into a tabbed workspace so
 * long pages stop scrolling forever. Labels take an optional count badge
 * ("Hints (3)"). Panels stay in the DOM (hidden) so content remains
 * linkable and searchable.
 */
export function ContentTabs({
  tabs,
  ariaLabel,
  className,
}: {
  tabs: ContentTab[];
  ariaLabel: string;
  className?: string;
}) {
  if (tabs.length === 0) return null;

  return (
    <TabsRoot defaultValue={tabs[0]?.id}>
      <div className="border-b border-rule mb-6">
        <TabsList
          aria-label={ariaLabel}
          className={cn("gap-1.5 overflow-x-auto pb-3 -mb-px", className)}
        >
          {tabs.map((tab) => (
            <TabsTab key={tab.id} value={tab.id} className="shrink-0">
              {tab.label}
              {typeof tab.count === "number" && (
                <span className="ml-1.5 tabular-nums opacity-70">({tab.count})</span>
              )}
            </TabsTab>
          ))}
        </TabsList>
      </div>

      {tabs.map((tab) => (
        <TabsPanel key={tab.id} value={tab.id}>
          {tab.content}
        </TabsPanel>
      ))}
    </TabsRoot>
  );
}
