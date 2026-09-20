import type { SVGProps } from "react";

/**
 * BrandMark — DSA Guide identity mark.
 *
 * Motif: Graph nodes (data structures) unified with code brackets `< >` (algorithms).
 * Symmetrical 4-node connected graph designed on a 24x24 grid.
 * Legible at 16px favicon/badge sizes and scales smoothly to high-res OG displays.
 */
export function BrandMark({
  size = 24,
  className,
  ...props
}: SVGProps<SVGSVGElement> & { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
      {...props}
    >
      {/* Code bracket paths `<` and `>` */}
      <path
        d="M10.5 5.5L5.5 12L10.5 18.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M13.5 5.5L18.5 12L13.5 18.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Central graph edge linking algorithms and structures */}
      <line
        x1="7.5"
        y1="12"
        x2="16.5"
        y2="12"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
      {/* Graph nodes at vertices */}
      <circle cx="5.5" cy="12" r="2.25" fill="currentColor" />
      <circle cx="18.5" cy="12" r="2.25" fill="currentColor" />
      <circle cx="10.5" cy="5.5" r="1.75" fill="currentColor" />
      <circle cx="13.5" cy="5.5" r="1.75" fill="currentColor" />
      <circle cx="10.5" cy="18.5" r="1.75" fill="currentColor" />
      <circle cx="13.5" cy="18.5" r="1.75" fill="currentColor" />
    </svg>
  );
}
