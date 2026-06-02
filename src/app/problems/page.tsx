import Link from "next/link";

export default function ProblemsPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-12 py-20">
      <div className="max-w-2xl w-full text-center bloom">
        <div className="smallcaps text-muted-foreground" style={{ ["--i" as string]: 0 }}>
          Part IV
        </div>

        <div className="ornament my-6" style={{ ["--i" as string]: 1 }}>
          <span>§</span>
        </div>

        <h1
          className="font-display text-[clamp(2.75rem,6vw,4.5rem)] leading-[0.95] font-medium tracking-tight"
          style={{ ["--i" as string]: 2 }}
        >
          <em className="text-primary">Practica</em>
        </h1>
        <p
          className="font-display italic text-2xl text-muted-foreground mt-3"
          style={{ ["--i" as string]: 3 }}
        >
          forthcoming in the second edition
        </p>

        <div className="rule my-10" style={{ ["--i" as string]: 4 }} />

        <p
          className="font-serif text-[1.05rem] leading-relaxed text-foreground/85 italic max-w-lg mx-auto"
          style={{ ["--i" as string]: 5 }}
        >
          The interactive workspace — wherein the reader shall apply the theory
          to verified problems — is presently in preparation. Until its issue,
          the essays of Part&nbsp;II carry the practical examples and the
          recommended exercises at the foot of each chapter.
        </p>

        <div
          className="mt-12 flex items-center justify-center gap-10"
          style={{ ["--i" as string]: 6 }}
        >
          <Link
            href="/learn"
            className="group inline-flex items-baseline gap-3 font-display text-lg"
          >
            <span className="link-quill">Return to the Essays</span>
            <span className="text-primary transition-transform group-hover:translate-x-1">
              →
            </span>
          </Link>
          <span className="text-border" aria-hidden>|</span>
          <Link
            href="/roadmap"
            className="font-display text-lg italic text-muted-foreground hover:text-foreground transition-colors"
          >
            Consult the Roadmap
          </Link>
        </div>
      </div>
    </div>
  );
}
