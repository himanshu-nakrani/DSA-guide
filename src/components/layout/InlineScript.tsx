/**
 * Render an inline `<script>` without tripping React's dev-only "script tag
 * inside a component" warning. The trick (documented in Next.js' "Preventing
 * Flash Before Hydration" guide) is to emit `type="text/javascript"` on the
 * server so the browser parses and executes it during HTML parsing, and
 * `type="text/plain"` on the client so React's reconciler ignores it. The
 * type attribute swap is reconciled by `suppressHydrationWarning`.
 */
export function InlineScript({ html }: { html: string }) {
  return (
    <script
      type={typeof window === "undefined" ? "text/javascript" : "text/plain"}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
