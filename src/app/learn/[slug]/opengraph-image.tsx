import { ImageResponse } from "next/og";
import { prisma } from "@/lib/prisma";
import { ArticleStatus, ArticleLevel } from "@/generated/prisma";

export const alt = "Article preview";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const revalidate = 86400;

export async function generateStaticParams() {
  const articles = await prisma.article.findMany({
    where: { status: ArticleStatus.PUBLISHED },
    select: { slug: true },
  });
  return articles.map((a) => ({ slug: a.slug }));
}

const levelLabel: Record<ArticleLevel, string> = {
  FOUNDATION: "Foundation",
  INTERMEDIATE: "Intermediate",
  ADVANCED: "Advanced",
};

const BG = "#0c0d10";
const FG = "#f4f4f5";
const MUTED = "#a1a1aa";
const ACCENT = "#3b82f6";
const BORDER = "#27272a";

export default async function ArticleOpenGraphImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await prisma.article.findFirst({
    where: { slug, status: ArticleStatus.PUBLISHED },
    select: {
      title: true,
      summary: true,
      level: true,
      estimatedMins: true,
      topic: { select: { name: true, module: { select: { name: true, order: true } } } },
    },
  });

  if (!article) {
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: BG,
            color: FG,
            fontSize: 48,
            fontFamily: "ui-sans-serif, system-ui, sans-serif",
          }}
        >
          DSA Guide
        </div>
      ),
      { ...size },
    );
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: BG,
          color: FG,
          padding: "64px 72px",
          fontFamily: "ui-sans-serif, system-ui, -apple-system, sans-serif",
          position: "relative",
        }}
      >
        {/* Subtle border lines */}
        <div
          style={{
            position: "absolute",
            top: 48,
            left: 72,
            right: 72,
            height: 1,
            background: BORDER,
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: 48,
            left: 72,
            right: 72,
            height: 1,
            background: BORDER,
            display: "flex",
          }}
        />

        {/* Running header */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 12 }}>
          <BrandGlyph />
          <div
            style={{
              fontFamily: "ui-monospace, monospace",
              fontSize: 15,
              letterSpacing: 2,
              textTransform: "uppercase",
              color: MUTED,
              display: "flex",
            }}
          >
            DSA Guide · Module {String(article.topic.module.order).padStart(2, "0")} ·{" "}
            {article.topic.module.name}
          </div>
        </div>

        {/* Body */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: 22,
            maxWidth: 1020,
          }}
        >
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <span
              style={{
                display: "flex",
                fontFamily: "ui-monospace, monospace",
                fontSize: 13,
                letterSpacing: 2,
                textTransform: "uppercase",
                padding: "4px 12px",
                border: `1px solid ${ACCENT}`,
                color: ACCENT,
                background: "rgba(59, 130, 246, 0.1)",
                borderRadius: 6,
              }}
            >
              {levelLabel[article.level]}
            </span>
            <span
              style={{
                display: "flex",
                fontFamily: "ui-monospace, monospace",
                fontSize: 14,
                color: MUTED,
              }}
            >
              {article.topic.name}
            </span>
            <span style={{ display: "flex", color: MUTED }}>·</span>
            <span
              style={{
                display: "flex",
                fontFamily: "ui-monospace, monospace",
                fontSize: 14,
                color: MUTED,
              }}
            >
              {article.estimatedMins} min read
            </span>
          </div>

          <div
            style={{
              display: "flex",
              fontFamily: "ui-sans-serif, system-ui, -apple-system, sans-serif",
              fontSize: article.title.length > 60 ? 60 : 76,
              lineHeight: 1.05,
              letterSpacing: -2,
              fontWeight: 700,
              color: FG,
            }}
          >
            {article.title}
          </div>

          <div
            style={{
              display: "flex",
              fontFamily: "ui-sans-serif, system-ui, -apple-system, sans-serif",
              fontSize: 24,
              lineHeight: 1.45,
              color: MUTED,
              maxWidth: 960,
            }}
          >
            {truncate(article.summary, 220)}
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontFamily: "ui-monospace, monospace",
            fontSize: 15,
            color: MUTED,
            letterSpacing: 2,
            textTransform: "uppercase",
            marginBottom: 12,
          }}
        >
          <span style={{ display: "flex" }}>CLRS · Sedgewick · Laaksonen</span>
          <span style={{ display: "flex", color: ACCENT }}>
            dsa.guide/learn/{slug}
          </span>
        </div>
      </div>
    ),
    { ...size },
  );
}

function truncate(s: string, n: number) {
  if (s.length <= n) return s;
  return s.slice(0, n - 1).trimEnd() + "…";
}

function BrandGlyph() {
  return (
    <svg width="34" height="34" viewBox="0 0 24 24" fill="none">
      <rect width="24" height="24" rx="6" fill="#1c1d22" stroke={BORDER} strokeWidth="1" />
      <path
        d="M10.5 5.5L5.5 12L10.5 18.5"
        stroke="#f4f4f5"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M13.5 5.5L18.5 12L13.5 18.5"
        stroke="#f4f4f5"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <line
        x1="7.5"
        y1="12"
        x2="16.5"
        y2="12"
        stroke="#3b82f6"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <circle cx="5.5" cy="12" r="2" fill="#3b82f6" />
      <circle cx="18.5" cy="12" r="2" fill="#3b82f6" />
      <circle cx="10.5" cy="5.5" r="1.6" fill="#f4f4f5" />
      <circle cx="13.5" cy="5.5" r="1.6" fill="#f4f4f5" />
      <circle cx="10.5" cy="18.5" r="1.6" fill="#f4f4f5" />
      <circle cx="13.5" cy="18.5" r="1.6" fill="#f4f4f5" />
    </svg>
  );
}
