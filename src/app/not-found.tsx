import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6 md:px-12 py-20">
      <div className="max-w-md w-full bloom">
        <div className="eyebrow mb-4" style={{ ["--i" as string]: 0 }}>
          <span className="text-[color:var(--ink-blue)] mr-2">§</span>
          Errata · 404
        </div>
        <h1
          className="font-display text-[clamp(2.25rem,5vw,3.25rem)] leading-[1.06] font-medium text-[color:var(--ink)]"
          style={{ ["--i" as string]: 1 }}
        >
          This folio is missing from the binding.
        </h1>
        <p
          className="text-[1.05rem] mt-4 leading-relaxed text-[color:var(--ink-soft)]"
          style={{ ["--i" as string]: 2 }}
        >
          The page you&rsquo;re looking for doesn&rsquo;t exist — or it has
          been moved to a new edition. Try searching, or return to the table
          of contents.
        </p>
        <div
          aria-hidden
          className="my-7 h-px bg-[color:var(--rule-strong)]"
          style={{ ["--i" as string]: 3 }}
        />
        <div
          className="flex flex-wrap items-center gap-3"
          style={{ ["--i" as string]: 4 }}
        >
          <Link href="/" className="btn-ink">
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to the title page
          </Link>
          <Link href="/learn" className="btn-ghost">
            Table of essays
          </Link>
        </div>
        <p
          className="font-pencil text-[0.85rem] mt-8 text-[color:var(--pencil)]"
          style={{ ["--i" as string]: 5 }}
        >
          If you arrived here from a link in another article, please report
          the typo — every page in the manuscript is supposed to find its
          siblings.
        </p>
      </div>
    </div>
  );
}
