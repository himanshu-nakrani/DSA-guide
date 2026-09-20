import { cn } from "@/lib/utils";

/**
 * PageShell — the one container rhythm for every page outside the article
 * reader. Widths are semantic: `narrow` for reading, `default` for prose,
 * `wide` for data-dense surfaces.
 */
const widths = {
  narrow: "max-w-2xl",
  default: "max-w-4xl",
  wide: "max-w-6xl",
} as const;

export function PageShell({
  width = "default",
  className,
  children,
}: {
  width?: keyof typeof widths;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("mx-auto w-full px-4 sm:px-6 py-16 md:py-20", widths[width], className)}>
      {children}
    </div>
  );
}

/**
 * PageHeader — every index page opens with the same quiet block: small
 * eyebrow, tight title, muted lede, optional meta row.
 */
export function PageHeader({
  eyebrow,
  title,
  lede,
  meta,
  children,
  className,
}: {
  eyebrow: string;
  title: React.ReactNode;
  lede?: React.ReactNode;
  meta?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <header className={cn("mb-10 md:mb-12", className)}>
      <div className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {eyebrow}
      </div>
      <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-foreground text-balance">
        {title}
      </h1>
      {lede && (
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted-foreground">
          {lede}
        </p>
      )}
      {(meta || children) && (
        <div className="mt-6">
          {meta}
          {children}
        </div>
      )}
    </header>
  );
}
