"use client";

import * as React from "react";
import { TabsList, TabsPanel, TabsRoot, TabsTab } from "@/components/ui/tabs";
import { CopyButton } from "@/components/article/CopyButton";

/**
 * StarterCodeTabs — one language visible at a time instead of every template
 * stacked into a wall of code. Defaults to the first language on offer.
 */
export function StarterCodeTabs({ starter }: { starter: Record<string, string> }) {
  const languages = Object.keys(starter);
  if (languages.length === 0) return null;

  return (
    <TabsRoot defaultValue={languages[0]}>
      <TabsList aria-label="Starter code language">
        {languages.map((language) => (
          <TabsTab key={language} value={language}>
            {language}
          </TabsTab>
        ))}
      </TabsList>
      {languages.map((language) => (
        <TabsPanel key={language} value={language} className="mt-4">
          <div className="code-block">
            <pre className="!mb-0 overflow-x-auto">
              <code>{starter[language]}</code>
            </pre>
            <CopyButton text={starter[language] ?? ""} />
          </div>
        </TabsPanel>
      ))}
    </TabsRoot>
  );
}
