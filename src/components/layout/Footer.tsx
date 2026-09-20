import Link from "next/link";
import { BrandMark } from "@/components/ui/BrandMark";

const PRODUCT_LINKS = [
  { href: "/learn", label: "Learn" },
  { href: "/roadmap", label: "Roadmap" },
  { href: "/problems", label: "Problems" },
  { href: "/lists", label: "Lists" },
  { href: "/dashboard", label: "Dashboard" },
];

const COMPANY_LINKS = [
  { href: "/changelog", label: "Changelog" },
  { href: "https://github.com/himanshu-nakrani", label: "Author", external: true },
  { href: "https://github.com/himanshu-nakrani/DSA-guide/security", label: "Security policy", external: true },
  { href: "https://github.com/himanshu-nakrani/DSA-guide", label: "Open source", external: true },
];

const RESOURCE_LINKS = [
  { href: "/feed.xml", label: "RSS feed" },
  { href: "/sitemap.xml", label: "Sitemap" },
  { href: "https://github.com/himanshu-nakrani/DSA-guide", label: "GitHub repo", external: true },
  { href: "https://github.com/himanshu-nakrani/DSA-guide/issues", label: "Report issue", external: true },
];

/**
 * Footer — brand blurb plus product/resource columns.
 */
export function Footer() {
  return (
    <footer className="mt-auto border-t border-border">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-2.5">
            <span
              aria-hidden
              className="grid h-7 w-7 place-items-center rounded-lg bg-foreground text-background"
            >
              <BrandMark size={16} className="text-background" />
            </span>
            <span className="text-sm font-semibold tracking-tight text-foreground">
              DSA Guide
            </span>
          </div>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted-foreground">
            A structured, free path through data structures and algorithms —
            cited articles, live figures, and curated practice.
          </p>
          <Link
            href="/auth"
            className="mt-4 inline-flex h-10 min-h-[44px] items-center rounded-md border border-border px-4 text-sm font-medium text-foreground transition-colors hover:border-border-hover hover:bg-surface-2"
          >
            Sign in to sync progress
          </Link>
        </div>

        <nav aria-label="Product">
          <div className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Product
          </div>
          <ul className="space-y-2.5">
            {PRODUCT_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Company">
          <div className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Company
          </div>
          <ul className="space-y-2.5">
            {COMPANY_LINKS.map((link) => (
              <li key={link.label}>
                {link.external ? (
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </a>
                ) : (
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Resources">
          <div className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Resources
          </div>
          <ul className="space-y-2.5">
            {RESOURCE_LINKS.map((link) => (
              <li key={link.label}>
                {link.external ? (
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </a>
                ) : (
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <div className="border-t border-border">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span>Built by <a href="https://github.com/himanshu-nakrani" target="_blank" rel="noopener noreferrer" className="text-foreground hover:underline">Himanshu Nakrani</a></span>
            <span aria-hidden>·</span>
            <span>Actively maintained</span>
            <span aria-hidden>·</span>
            <Link href="/changelog" className="hover:underline">Release notes</Link>
          </div>
          <span className="text-xs text-muted-foreground">
            Sources: CLRS · Sedgewick &amp; Wayne · Laaksonen · MIT OCW · cp-algorithms
          </span>
        </div>
      </div>
    </footer>
  );
}
