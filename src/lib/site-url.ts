const DEFAULT_SITE_URL = "https://dsa.guide";

/**
 * Resolve the canonical site origin used for absolute URLs in
 * `sitemap.xml`, `feed.xml`, `robots.ts`, and `metadataBase` in
 * `app/layout.tsx`.
 *
 * Behavior:
 * - If `SITE_URL` is set, return it (with a trailing slash stripped).
 * - In production with `SITE_URL` unset, throw at first call. A wrong
 *   or missing site URL in prod would silently publish a sitemap and
 *   feed advertising the wrong host (or the dev default), which is an
 *   SEO/discovery bug we want to surface at the first request, not a
 *   week later when crawlers 404 on every entry.
 * - In development/test, fall back to a stable local default so the
 *   dev server still serves a usable feed.
 */
export function getSiteUrl(): string {
  const raw = process.env.SITE_URL?.replace(/\/$/, "");
  if (raw) return raw;

  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "SITE_URL is not set. Set it to the canonical site origin " +
        "(e.g. https://dsa.guide) so the sitemap, RSS feed, and " +
        "metadataBase resolve to absolute URLs.",
    );
  }

  return DEFAULT_SITE_URL;
}
