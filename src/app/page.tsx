import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ArticleStatus } from "@/generated/prisma";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [articleCount, moduleCount, problemCount] = await Promise.all([
    prisma.article.count({ where: { status: ArticleStatus.PUBLISHED } }),
    prisma.module.count(),
    prisma.problem.count(),
  ]);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Frontispiece — the title page of the volume. */}
      <section className="flex-1 flex items-center justify-center px-12 py-20">
        <div className="max-w-3xl w-full bloom">
          <div className="text-center" style={{ ["--i" as string]: 0 }}>
            <div className="smallcaps text-muted-foreground">Vol. I</div>
            <div className="ornament mt-4 mb-10">
              <span>§</span>
            </div>
          </div>

          <h1
            className="font-display text-center"
            style={{ ["--i" as string]: 1 }}
          >
            <span className="block text-[clamp(3rem,7vw,5.75rem)] leading-[0.95] font-medium tracking-tight">
              A Practitioner&rsquo;s
            </span>
            <span className="block italic text-[clamp(3.25rem,7.5vw,6.25rem)] leading-[0.95] font-medium tracking-tight text-primary mt-2">
              Treatise
            </span>
            <span className="block text-[clamp(1.4rem,2.5vw,2rem)] mt-6 font-normal text-muted-foreground tracking-wide">
              on Data Structures &amp; Algorithms
            </span>
          </h1>

          <div className="ornament mt-12 mb-10" style={{ ["--i" as string]: 2 }}>
            <span>·</span>
            <span>·</span>
            <span>·</span>
          </div>

          <p
            className="font-serif text-center text-[1.1rem] italic text-muted-foreground max-w-xl mx-auto leading-relaxed"
            style={{ ["--i" as string]: 3 }}
          >
            “Algorithms are concepts that have existence apart from any programming language.”
            <span className="block not-italic smallcaps text-[0.65rem] mt-3">
              — Robert Sedgewick
            </span>
          </p>

          <div
            className="mt-14 flex items-center justify-center gap-10"
            style={{ ["--i" as string]: 4 }}
          >
            <Link
              href="/learn"
              className="group inline-flex items-baseline gap-3 font-display text-lg"
            >
              <span className="link-quill">Open the Volume</span>
              <span className="text-primary transition-transform group-hover:translate-x-1">
                →
              </span>
            </Link>
            <span className="text-border" aria-hidden>
              |
            </span>
            <Link
              href="/roadmap"
              className="font-display text-lg italic text-muted-foreground hover:text-foreground transition-colors"
            >
              Survey the Roadmap
            </Link>
          </div>

          {/* Colophon-style stats row. */}
          <div
            className="mt-20 grid grid-cols-3 gap-px bg-border max-w-2xl mx-auto"
            style={{ ["--i" as string]: 5 }}
          >
            <Colophon value={moduleCount} label="Chapters" />
            <Colophon value={articleCount} label="Articles" />
            <Colophon value={problemCount} label="Problem Sets" />
          </div>
        </div>
      </section>

      {/* Three editorial cards introducing the parts of the volume. */}
      <section className="px-12 pb-20 max-w-6xl mx-auto w-full">
        <div className="ornament mb-12">
          <span>·</span>
        </div>
        <div className="grid md:grid-cols-3 gap-px bg-border border border-border">
          <ChapterCard
            roman="I."
            title="Learnings"
            italic="The Articles"
            blurb="Thirty-two essays from asymptotic notation to shortest paths, each drawn from primary sources and traced back to chapter and verse."
            cta="Read the essays"
            href="/learn"
          />
          <ChapterCard
            roman="II."
            title="Roadmap"
            italic="A Curriculum"
            blurb="A sixteen-chapter progression, ordered for the student who would build the discipline from foundation upward, in the manner of the classic textbooks."
            cta="Study the path"
            href="/roadmap"
          />
          <ChapterCard
            roman="III."
            title="Problems"
            italic="Practica"
            blurb="An interactive workspace for the application of theory. Forthcoming in the next edition; theory ought to precede mechanism."
            cta="Forthcoming"
            href="/problems"
          />
        </div>
      </section>
    </div>
  );
}

function Colophon({ value, label }: { value: number; label: string }) {
  return (
    <div className="bg-background px-6 py-5 text-center">
      <div className="font-display text-3xl tabular-nums">{value}</div>
      <div className="smallcaps text-muted-foreground mt-1">{label}</div>
    </div>
  );
}

function ChapterCard({
  roman,
  title,
  italic,
  blurb,
  cta,
  href,
}: {
  roman: string;
  title: string;
  italic: string;
  blurb: string;
  cta: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="group bg-card p-9 flex flex-col gap-5 transition-colors hover:bg-accent/40"
    >
      <div className="flex items-baseline justify-between">
        <span className="font-display text-3xl text-muted-foreground/70">
          {roman}
        </span>
        <span className="smallcaps text-muted-foreground/80">Part</span>
      </div>
      <div>
        <h3 className="font-display text-2xl font-medium leading-tight">
          {title}
        </h3>
        <div className="font-display italic text-muted-foreground text-lg leading-tight">
          {italic}
        </div>
      </div>
      <p className="font-serif text-[0.96rem] leading-relaxed text-foreground/85 flex-1">
        {blurb}
      </p>
      <div className="inline-flex items-baseline gap-2 font-display text-base text-primary">
        <span className="link-quill">{cta}</span>
        <span className="transition-transform group-hover:translate-x-1">→</span>
      </div>
    </Link>
  );
}
