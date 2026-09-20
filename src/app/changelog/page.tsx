import type { Metadata } from "next";
import { PageHeader, PageShell } from "@/components/layout/PageShell";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { ExternalLink, ShieldCheck, Bug } from "lucide-react";

export const metadata: Metadata = {
  title: "Changelog & Trust — DSA Guide",
  description:
    "Product updates, release notes, contact details, and security policies for DSA Guide.",
};

const RELEASES = [
  {
    version: "UI Uplift",
    date: "March 2026",
    title: "Design System & Interface Polish",
    summary:
      "Comprehensive design system refinement focusing on brand identity, mobile ergonomics, and accessibility.",
    highlights: [
      "Brand identity: Replaced temporary placeholder mark with a cohesive graph-nodes and code-brackets motif across header, footer, favicon, and OG cards.",
      "Design tokens: Unified radius and shadow scales in globals.css, and calibrated light --pencil and dark --code-comment tokens for WCAG AA compliance.",
      "Mobile navigation: Implemented an accessible bottom-sheet table of contents for long-form reading, collapsible practice filters, and scroll-collapsing subnav.",
      "Touch accessibility: Enlarged tap targets across list actions, bookmark buttons, auth tabs, and problem status controls to meet standard touch sizes.",
      "Focus management: Added Tab focus trapping and focus restoration to the Command Palette and mobile TOC sheet, and marked problem counts as live regions.",
      "Performance: Configured OG image caching headers, pruned unused font files, and wired hero visualization to pause when offscreen.",
    ],
  },
  {
    version: "Security & Hardening",
    date: "February 2026",
    title: "Strict Headers & Rate Limiting",
    summary:
      "Infrastructure protections against abuse and automated credential stuffing.",
    highlights: [
      "Strict HTTP security headers configured in Next.js (HSTS, X-Frame-Options: DENY, nosniff, and referrer policy).",
      "Client IP rate limiting on authentication endpoints with constant-time password verification.",
      "Fixed route streaming status codes for non-existent entities via proxy pre-checks.",
    ],
  },
  {
    version: "phase-problems-progress-v1",
    date: "January 2026",
    title: "Problems, Practice Tracking & Visualizations",
    summary:
      "Interactive algorithm players and user progress tracking across devices.",
    highlights: [
      "Curated practice problem queue with topic mappings, difficulty classifications, and custom list creation.",
      "Interactive step-through visualizations for Binary Search, BFS, Two Pointers, and Dynamic Programming.",
      "Optional accounts to synchronize read articles, problem statuses, and saved collections.",
    ],
  },
];

export default function ChangelogPage() {
  return (
    <PageShell width="default" className="space-y-12">
      <div>
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Changelog" }]} />
        <PageHeader
          eyebrow="Updates & Trust"
          title="Changelog"
          lede="Release notes, project roadmap progress, and maintenance policies. We ship continuous improvements to help you master algorithms."
        />
      </div>

      {/* Release Timeline */}
      <section className="space-y-8" aria-label="Release timeline">
        {RELEASES.map((rel) => (
          <article
            key={rel.version}
            className="surface-card p-6 sm:p-8 space-y-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-4">
              <div className="flex items-center gap-3">
                <span className="pill pill-primary font-mono font-semibold">
                  {rel.version}
                </span>
                <h2 className="text-xl font-semibold tracking-tight text-foreground">
                  {rel.title}
                </h2>
              </div>
              <time className="text-caption font-mono uppercase tracking-[0.1em] text-muted-foreground">
                {rel.date}
              </time>
            </div>

            <p className="text-body leading-relaxed text-muted-foreground">
              {rel.summary}
            </p>

            <ul className="space-y-2 pt-2 text-sm text-foreground">
              {rel.highlights.map((item) => (
                <li key={item} className="flex items-start gap-2.5">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-ink-blue" />
                  <span className="leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </section>

      {/* Trust, Contact & Security */}
      <section className="grid gap-6 md:grid-cols-2 pt-4" aria-label="Trust and security">
        <div className="surface-card p-6 sm:p-7 space-y-3">
          <div className="flex items-center gap-2.5 text-foreground font-semibold">
            <Bug className="h-5 w-5 text-ink-blue" strokeWidth={1.75} />
            <span>Contact & Feedback</span>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Have a suggestion, found a typo in an explanation, or ran into a bug? We welcome feedback and contributions.
          </p>
          <div className="pt-2">
            <a
              href="https://github.com/himanshu-nakrani/DSA-guide/issues"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-blue hover:underline"
            >
              Open a GitHub Issue
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>

        <div className="surface-card p-6 sm:p-7 space-y-3">
          <div className="flex items-center gap-2.5 text-foreground font-semibold">
            <ShieldCheck className="h-5 w-5 text-ink-green" strokeWidth={1.75} />
            <span>Security & Responsible Disclosure</span>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            We take security seriously. If you discover a vulnerability, please report it directly through GitHub Security Advisories.
          </p>
          <div className="pt-2">
            <a
              href="https://github.com/himanshu-nakrani/DSA-guide/security"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-blue hover:underline"
            >
              View Security Policy
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
