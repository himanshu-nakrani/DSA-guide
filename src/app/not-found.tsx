import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-12 py-20">
      <div className="max-w-xl w-full text-center bloom">
        <div className="font-display text-[8rem] leading-none text-primary italic" style={{ ["--i" as string]: 0 }}>
          404
        </div>
        <div className="smallcaps text-muted-foreground mt-2" style={{ ["--i" as string]: 1 }}>
          Errata
        </div>
        <div className="ornament my-6" style={{ ["--i" as string]: 2 }}>
          <span>·</span>
        </div>
        <h1 className="font-display text-3xl font-medium" style={{ ["--i" as string]: 3 }}>
          The page is <em>not in this volume</em>.
        </h1>
        <p
          className="font-serif italic text-muted-foreground mt-3 leading-relaxed"
          style={{ ["--i" as string]: 4 }}
        >
          Perhaps it was removed from a later impression, or the citation was
          mistaken. The contents may be consulted in the front matter.
        </p>
        <div
          className="mt-10 inline-flex items-baseline gap-3 font-display text-lg group"
          style={{ ["--i" as string]: 5 }}
        >
          <Link href="/" className="link-quill">
            Return to the title page
          </Link>
          <span className="text-primary transition-transform group-hover:translate-x-1">
            →
          </span>
        </div>
      </div>
    </div>
  );
}
