"use client";

import * as React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeHighlight from "rehype-highlight";
import { Viz } from "@/components/viz/Viz";
import { CopyButton } from "./CopyButton";
import { ArticleLink, type ArticleLinkPreview } from "./ArticleLink";
import { slugify } from "@/lib/toc";

export type ArticlePreviewMap = Record<string, ArticleLinkPreview>;

/**
 * ArticleBody: renders article markdown with a few extras:
 * - ```viz fenced blocks become interactive React visualizations
 * - non-viz code blocks get a hover copy button
 * - H2 headings emit anchor IDs for the in-page TOC
 * - GFM-style alerts inside blockquotes become margin/pitfall annotations:
 *     > [!MARGIN] Optional title
 *     > body...
 *   Supported tones: NOTE, MARGIN, PITFALL, INSIGHT.
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
      remarkPlugins={[remarkGfm, remarkMath]}
      rehypePlugins={[
        rehypeKatex,
        // detect: false avoids hljs guessing on code blocks without a
        // language hint (which is most viz blocks); ignoreMissing skips
        // languages we haven't preregistered without blowing up.
        [rehypeHighlight, { detect: false, ignoreMissing: true }],
      ]}
      components={{
        a({ href, children, ...rest }) {
          const safeHref = sanitizeHref(href);
          if (previews && typeof safeHref === "string") {
            const m = /^\/learn\/([^#?\/]+)/.exec(safeHref);
            const slug = m?.[1];
            const preview = slug ? previews[slug] : undefined;
            if (preview) {
              return (
                <ArticleLink href={safeHref} preview={preview}>
                  {children}
                </ArticleLink>
              );
            }
          }
          return (
            <a href={safeHref} {...rest}>
              {children}
            </a>
          );
        },
        table({ children }) {
          // Wrap tables in a horizontally scrollable container so wide tables
          // don't push the whole page sideways on narrow viewports.
          return (
            <div className="table-wrap">
              <table>{children}</table>
            </div>
          );
        },
        blockquote({ children }) {
          const detected = detectAnnotation(children);
          if (detected) {
            const { tone, title, body } = detected;
            return (
              <aside className={`annotation tone-${tone}`} role="note">
                <span className="annotation-label">{title ?? toneLabel(tone)}</span>
                {body}
              </aside>
            );
          }
          return <blockquote>{children}</blockquote>;
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
          const id = slugify(extractText(children));
          return (
            <h2 id={id} className="scroll-mt-24 group relative">
              <a
                href={`#${id}`}
                className="no-underline no-quill group-hover:opacity-100 opacity-0 absolute -ml-7 text-[color:var(--ink-blue-soft)] transition-opacity"
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

type Tone = "note" | "margin" | "pitfall" | "insight";

function toneLabel(tone: Tone): string {
  switch (tone) {
    case "pitfall": return "Pitfall";
    case "margin": return "Note";
    case "insight": return "Insight";
    default: return "Note";
  }
}

/**
 * Inspect a blockquote's children. If the very first text content starts with
 * `[!TONE]` (optionally followed by a title), return the parsed annotation
 * shape with the marker stripped from the rendered body. Otherwise return null
 * so the caller renders a normal blockquote.
 */
function detectAnnotation(
  children: React.ReactNode,
): { tone: Tone; title: string | undefined; body: React.ReactNode } | null {
  const arr = React.Children.toArray(children);
  // Find the first element node that has its own children (typically a <p>).
  const firstIndex = arr.findIndex(
    (c) =>
      React.isValidElement<{ children?: React.ReactNode }>(c) &&
      c.props &&
      c.props.children !== undefined,
  );
  if (firstIndex === -1) return null;

  const firstEl = arr[firstIndex] as React.ReactElement<{ children?: React.ReactNode }>;
  const innerArr = React.Children.toArray(firstEl.props.children);
  // The marker, if present, is the leading string in this paragraph.
  const head = innerArr[0];
  if (typeof head !== "string") return null;

  const m = /^\s*\[!(NOTE|MARGIN|PITFALL|INSIGHT)\]\s*(.*)$/m.exec(head);
  if (!m) return null;

  const tone = m[1].toLowerCase() as Tone;
  const sameLineRest = m[2];

  // Split the rest of the head string at the first newline: anything before
  // the newline is the optional title; anything after stays in the body.
  let title: string | undefined;
  let bodyHeadString = "";
  const nlIdx = sameLineRest.indexOf("\n");
  if (nlIdx === -1) {
    const trimmed = sameLineRest.trim();
    title = trimmed.length ? trimmed : undefined;
  } else {
    title = sameLineRest.slice(0, nlIdx).trim() || undefined;
    bodyHeadString = sameLineRest.slice(nlIdx + 1);
  }

  const newFirstChildren: React.ReactNode[] = [];
  if (bodyHeadString) newFirstChildren.push(bodyHeadString);
  newFirstChildren.push(...innerArr.slice(1));

  const cleanedFirst =
    newFirstChildren.length === 0
      ? null
      : React.cloneElement(firstEl, undefined, ...newFirstChildren);

  const body: React.ReactNode = [
    ...(cleanedFirst ? [cleanedFirst] : []),
    ...arr.slice(firstIndex + 1),
  ];

  return { tone, title, body };
}

function extractText(node: React.ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(extractText).join("");
  if (React.isValidElement<{ children?: React.ReactNode }>(node)) {
    return extractText(node.props.children);
  }
  return "";
}

/**
 * Strip dangerous URL schemes from a link href. Allows relative paths, hashes,
 * mailto, and standard http(s); blocks javascript:, data:, vbscript:, file:.
 * Belt-and-braces — react-markdown already escapes raw HTML, but markdown
 * link syntax goes straight to <a href=...> so the scheme still needs checking.
 */
function sanitizeHref(href: unknown): string | undefined {
  if (typeof href !== "string") return undefined;
  const trimmed = href.trim();
  if (!trimmed) return undefined;

  // SECURITY: Browsers ignore control characters and whitespaces when parsing the URL scheme.
  // Strip them before checking the scheme to prevent XSS via scheme masking.
  const check = trimmed.replace(/[\x00-\x1F\x7F\s]+/g, "");
  if (/^(?:[a-z][a-z0-9+.-]*):/i.test(check)) {
    const scheme = check.slice(0, check.indexOf(":")).toLowerCase();
    const allowed = new Set(["http", "https", "mailto", "tel"]);
    if (!allowed.has(scheme)) return undefined;
  }
  return trimmed;
}
