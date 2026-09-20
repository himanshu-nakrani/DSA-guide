import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * The one button system. Quiet Paper: `ink` is a solid neutral stamp,
 * `ghost` a hairline outline, `subtle` a bare label, `chip` the small
 * control used inside viz figures.
 * Links stay buttons via Base UI's `render` prop:
 *   <Button variant="ink" render={<Link href="/learn" />}>Browse</Button>
 */
export const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-[var(--radius-md)] font-medium transition-colors duration-[var(--dur-base)] ease-[var(--ease-out)] select-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        ink: "bg-foreground text-background border border-foreground hover:bg-ink-soft hover:border-ink-soft",
        ghost:
          "bg-transparent text-foreground border border-border hover:border-border-hover hover:bg-surface-2",
        subtle:
          "bg-transparent border border-transparent text-muted-foreground hover:text-foreground hover:bg-surface-2",
        chip:
          "font-mono text-caption uppercase tracking-[0.1em] px-2 py-1 rounded-[var(--radius-sm)] border",
      },
      size: {
        md: "px-[1.15rem] py-[0.6rem] text-body",
        sm: "px-3 py-1.5 text-small",
        icon: "h-9 w-9 p-0",
      },
    },
    defaultVariants: {
      variant: "ink",
      size: "md",
    },
  },
)

/**
 * Class strings for the small mono chip buttons inside viz figures. Kept as
 * plain cva (no Base UI) so viz bundles stay dependency-light.
 */
export const chipButtonVariants = cva(
  "font-mono text-caption uppercase tracking-[0.1em] inline-flex items-center justify-center min-h-[44px] min-w-[44px] sm:min-h-[32px] sm:min-w-0 px-3 py-2 sm:px-2.5 sm:py-1 rounded-[var(--radius-sm)] border transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out)] disabled:opacity-30 disabled:cursor-not-allowed",
  {
    variants: {
      active: {
        true: "border-foreground bg-foreground text-background",
        false:
          "border-border bg-transparent text-muted-foreground hover:text-foreground hover:border-border-hover hover:bg-surface-2",
      },
    },
    defaultVariants: {
      active: false,
    },
  },
)

function Button({
  className,
  variant = "ink",
  size = "md",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button }
