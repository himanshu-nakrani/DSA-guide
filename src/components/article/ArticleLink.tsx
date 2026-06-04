"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";

export type ArticleLinkPreview = {
  title: string;
  summary: string;
  level: "FOUNDATION" | "INTERMEDIATE" | "ADVANCED";
  estimatedMins: number;
  moduleName?: string;
};

const levelLabel: Record<ArticleLinkPreview["level"], string> = {
  FOUNDATION: "Foundation",
  INTERMEDIATE: "Intermediate",
  ADVANCED: "Advanced",
};
const levelStyle: Record<ArticleLinkPreview["level"], string> = {
  FOUNDATION:
    "bg-[color:var(--chart-2)]/10 text-[color:var(--chart-2)] border-[color:var(--chart-2)]/25",
  INTERMEDIATE:
    "bg-[color:var(--chart-3)]/12 text-[color:var(--chart-3)] border-[color:var(--chart-3)]/25",
  ADVANCED:
    "bg-[color:var(--primary)]/12 text-[color:var(--primary)] border-[color:var(--primary)]/25",
};

/**
 * Article link with a hover-preview card. Card opens after a short delay,
 * positions itself near the link, and closes on pointer-leave or escape.
 */
export function ArticleLink({
  href,
  preview,
  className,
  children,
}: {
  href: string;
  preview: ArticleLinkPreview;
  className?: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ left: number; top: number; placement: "below" | "above" } | null>(null);
  const linkRef = useRef<HTMLAnchorElement>(null);
  const openTimerRef = useRef<number | null>(null);
  const closeTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (openTimerRef.current) window.clearTimeout(openTimerRef.current);
      if (closeTimerRef.current) window.clearTimeout(closeTimerRef.current);
    };
  }, []);

  const computePosition = () => {
    const el = linkRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const cardWidth = 352; // matches .preview-card width (22rem at 16px)
    const cardHeightEstimate = 180;
    const margin = 12;

    const fitsBelow = rect.bottom + cardHeightEstimate + margin < window.innerHeight;
    const top = fitsBelow ? rect.bottom + 8 : rect.top - cardHeightEstimate - 8;
    let left = rect.left;
    if (left + cardWidth > window.innerWidth - margin) {
      left = Math.max(margin, window.innerWidth - cardWidth - margin);
    }
    setPos({ left, top, placement: fitsBelow ? "below" : "above" });
  };

  const onEnter = () => {
    if (closeTimerRef.current) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    if (openTimerRef.current) return;
    openTimerRef.current = window.setTimeout(() => {
      openTimerRef.current = null;
      computePosition();
      setOpen(true);
    }, 220);
  };

  const onLeave = () => {
    if (openTimerRef.current) {
      window.clearTimeout(openTimerRef.current);
      openTimerRef.current = null;
    }
    closeTimerRef.current = window.setTimeout(() => {
      closeTimerRef.current = null;
      setOpen(false);
    }, 120);
  };

  useEffect(() => {
    if (!open) return;
    const onScroll = () => setOpen(false);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      <Link
        ref={linkRef}
        href={href}
        onMouseEnter={onEnter}
        onMouseLeave={onLeave}
        onFocus={() => {
          computePosition();
          setOpen(true);
        }}
        onBlur={onLeave}
        className={className}
      >
        {children}
      </Link>
      {pos && (
        <div
          role="dialog"
          aria-label={`Preview of ${preview.title}`}
          data-open={open ? "true" : "false"}
          className="preview-card surface-card !p-4"
          style={{ left: pos.left, top: pos.top }}
          onMouseEnter={() => {
            if (closeTimerRef.current) {
              window.clearTimeout(closeTimerRef.current);
              closeTimerRef.current = null;
            }
          }}
          onMouseLeave={onLeave}
        >
          <div className="flex items-center gap-1.5 flex-wrap mb-2">
            <span
              className={`text-[0.6rem] font-mono uppercase tracking-[0.06em] px-1.5 py-0.5 rounded border ${levelStyle[preview.level]}`}
            >
              {levelLabel[preview.level]}
            </span>
            <span className="text-[0.65rem] font-mono text-muted-foreground tabular-nums">
              {preview.estimatedMins}m read
            </span>
            {preview.moduleName && (
              <span className="text-[0.65rem] font-mono text-muted-foreground truncate">
                · {preview.moduleName}
              </span>
            )}
          </div>
          <div className="font-medium text-[0.95rem] tracking-[-0.005em] leading-snug">
            {preview.title}
          </div>
          <p className="text-[0.82rem] text-muted-foreground mt-1.5 leading-snug line-clamp-3">
            {preview.summary}
          </p>
        </div>
      )}
    </>
  );
}
