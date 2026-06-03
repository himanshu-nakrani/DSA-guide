import Link from "next/link";
import { ArrowLeft, ArrowRight, Code2 } from "lucide-react";

export default function ProblemsPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-12 py-20">
      <div className="max-w-xl w-full bloom">
        <div className="rounded-xl border border-border bg-card p-8 shadow-sm">
          <div className="h-12 w-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-5">
            <Code2 className="h-6 w-6" strokeWidth={1.75} />
          </div>

          <div className="eyebrow mb-2" style={{ ["--i" as string]: 0 }}>
            Coming soon
          </div>
          <h1
            className="font-display text-3xl font-semibold tracking-tight"
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
            every essay in the library ends with a curated practice set.
          </p>

          <div
            className="mt-6 flex items-center gap-3"
            style={{ ["--i" as string]: 3 }}
          >
            <Link
              href="/learn"
              className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground px-3.5 py-2 rounded-lg text-sm font-medium shadow-sm hover:opacity-95 transition-opacity"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to articles
            </Link>
            <Link
              href="/roadmap"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
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
