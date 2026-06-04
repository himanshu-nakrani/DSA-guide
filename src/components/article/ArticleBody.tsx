import * as React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Viz } from "@/components/viz/Viz";
import { CopyButton } from "./CopyButton";
import { ArticleLink, type ArticleLinkPreview } from "./ArticleLink";

export type ArticlePreviewMap = Record<string, ArticleLinkPreview>;

/**
 * ArticleBody: renders article markdown with a few extras:
 * - ```viz fenced blocks become interactive React visualizations
 *   (a JSON payload `{ "type": "...", "props": {...} }` selects the component)
 * - non-viz code blocks get a hover copy button
 * - H2 headings emit anchor IDs for the in-page TOC
 */
export function ArticleBody({
  markdown,
  previews,
}: {
  markdown: string;
  previews?: ArticlePreviewMap;
}) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        a({ href, children, ...rest }) {
          if (previews && typeof href === "string") {
            const m = /^\/learn\/([^#?\/]+)/.exec(href);
            const slug = m?.[1];
            const preview = slug ? previews[slug] : undefined;
            if (preview) {
              return (
                <ArticleLink href={href} preview={preview}>
                  {children}
                </ArticleLink>
              );
            }
          }
          return (
            <a href={href} {...rest}>
              {children}
            </a>
          );
        },
        pre({ children }) {
          const child = React.Children.only(children);
          if (
            React.isValidElement<{ className?: string; children?: React.ReactNode }>(child)
          ) {
            const className = child.props.className || "";
            if (/language-viz\b/.test(className)) {
              const raw = String(child.props.children ?? "").trim();
              return <Viz raw={raw} />;
            }
            const codeText = String(child.props.children ?? "");
            return (
              <div className="code-block">
                <pre>{children}</pre>
                <CopyButton text={codeText} />
              </div>
            );
          }
          return <pre>{children}</pre>;
        },
        h2({ children }) {
          const id = slugify(String(children));
          return (
            <h2 id={id} className="scroll-mt-24 group relative">
              <a
                href={`#${id}`}
                className="no-underline group-hover:opacity-100 opacity-0 absolute -ml-7 text-muted-foreground transition-opacity"
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
