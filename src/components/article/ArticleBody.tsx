import * as React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Viz } from "@/components/viz/Viz";

/**
 * ArticleBody: renders article markdown with a few extras:
 * - ```viz fenced blocks become interactive React visualizations
 *   (a JSON payload `{ "type": "...", "props": {...} }` selects the component)
 * - `H2` headings emit anchor IDs for the in-page TOC
 */
export function ArticleBody({ markdown }: { markdown: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        pre({ children }) {
          // Inspect the wrapped <code> child to spot ```viz fenced blocks.
          const child = React.Children.only(children);
          if (React.isValidElement<{ className?: string; children?: React.ReactNode }>(child)) {
            const className = child.props.className || "";
            if (/language-viz\b/.test(className)) {
              const raw = String(child.props.children ?? "").trim();
              return <Viz raw={raw} />;
            }
          }
          return <pre>{children}</pre>;
        },
        h2({ children }) {
          const id = slugify(String(children));
          return (
            <h2 id={id} className="scroll-mt-20 group">
              <a
                href={`#${id}`}
                className="no-underline group-hover:opacity-100 opacity-0 absolute -ml-6 text-muted-foreground"
                aria-label="anchor"
              >
                §
              </a>
              {children}
            </h2>
          );
        },
      }}
    >
      {markdown}
    </ReactMarkdown>
  );
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
