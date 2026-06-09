import Link from "next/link";
import { ArrowLeft, ArrowRight, Code2 } from "lucide-react";

export default function ProblemsPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-12 py-20">
      <div className="max-w-xl w-full bloom">
        <div className="surface-card p-8">
          <div
            className="h-11 w-11 rounded-sm grid place-items-center text-[color:var(--ink-blue)] border border-[color:var(--rule-strong)] mb-5"
            style={{ background: "var(--surface-2)" }}
          >
            <Code2 className="h-5 w-5" strokeWidth={1.6} />
          </div>

          <div className="eyebrow mb-2" style={{ ["--i" as string]: 0 }}>
            Coming soon
          </div>
          <h1
            className="font-display text-3xl md:text-4xl font-medium tracking-[-0.015em]"
            style={{ ["--i" as string]: 1 }}
          >
            The problem workspace
          </h1>
          <p
            className="text-muted-foreground mt-3 leading-relaxed"
            style={{ ["--i" as string]: 2 }}
          >
            An interactive workspace for applying the theory — code editor,
            judge, hints, and editorial — is in development. Until it ships,
            every article in the library ends with a curated practice set.
          </p>

          <div
            className="mt-6 flex items-center gap-3"
            style={{ ["--i" as string]: 3 }}
          >
            <Link href="/learn" className="btn-ink">
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to articles
            </Link>
            <Link
              href="/roadmap"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-[color:var(--ink-blue)] link-quill"
            >
              See the roadmap
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
