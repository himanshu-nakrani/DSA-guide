import { ImageResponse } from "next/og";
import { prisma } from "@/lib/prisma";
import { ArticleStatus, ArticleLevel } from "@/generated/prisma";

export const alt = "Article preview";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const levelLabel: Record<ArticleLevel, string> = {
  FOUNDATION: "Foundation",
  INTERMEDIATE: "Intermediate",
  ADVANCED: "Advanced",
};

const PAPER = "#f7f3ea";
const INK = "#14212e";
const INK_BLUE = "#1f3d7a";
const RULE = "rgba(20, 33, 46, 0.22)";
const PENCIL = "#6b6457";

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
            display: "flex",
            width: "100%",
            height: "100%",
            background: PAPER,
            color: INK,
            alignItems: "center",
            justifyContent: "center",
            fontSize: 48,
            fontFamily: "Georgia, serif",
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
          background: PAPER,
          color: INK,
          padding: "64px 72px",
          fontFamily: "ui-sans-serif, system-ui, sans-serif",
          position: "relative",
        }}
      >
        {/* ruled top + bottom hairlines */}
        <div
          style={{
            position: "absolute",
            top: 48,
            left: 72,
            right: 72,
            height: 1,
            background: RULE,
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
            background: RULE,
            display: "flex",
          }}
        />

        {/* running header */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 12 }}>
          <BrandGlyph />
          <div
            style={{
              fontFamily: "ui-monospace, monospace",
              fontSize: 15,
              letterSpacing: 3,
              textTransform: "uppercase",
              color: PENCIL,
              display: "flex",
            }}
          >
            DSA Guide · § {String(article.topic.module.order).padStart(2, "0")} ·{" "}
            {article.topic.module.name}
          </div>
        </div>

        {/* body */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: 22,
            maxWidth: 1000,
          }}
        >
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <span
              style={{
                display: "flex",
                fontFamily: "ui-monospace, monospace",
                fontSize: 14,
                letterSpacing: 2,
                textTransform: "uppercase",
                padding: "4px 10px",
                border: `1px solid ${INK_BLUE}`,
                color: INK_BLUE,
                background: "transparent",
                borderRadius: 2,
              }}
            >
              {levelLabel[article.level]}
            </span>
            <span
              style={{
                fontFamily: "ui-monospace, monospace",
                color: PENCIL,
                fontSize: 16,
                display: "flex",
                letterSpacing: 1.5,
                textTransform: "uppercase",
              }}
            >
              {article.estimatedMins} min · {article.topic.name}
            </span>
          </div>

          <div
            style={{
              display: "flex",
              fontFamily: "Georgia, serif",
              fontSize: article.title.length > 60 ? 64 : 80,
              lineHeight: 1.04,
              letterSpacing: -1.5,
              fontWeight: 500,
              color: INK,
            }}
          >
            {article.title}
          </div>

          <div
            style={{
              display: "flex",
              fontFamily: "Georgia, serif",
              fontSize: 24,
              lineHeight: 1.45,
              color: PENCIL,
              maxWidth: 940,
            }}
          >
            {truncate(article.summary, 200)}
          </div>
        </div>

        {/* colophon */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontFamily: "ui-monospace, monospace",
            fontSize: 15,
            color: PENCIL,
            letterSpacing: 2,
            textTransform: "uppercase",
            marginBottom: 12,
          }}
        >
          <span style={{ display: "flex" }}>CLRS · Sedgewick · Laaksonen</span>
          <span style={{ display: "flex", color: INK_BLUE }}>
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
    <svg width="38" height="38" viewBox="0 0 24 24" fill="none">
      <rect
        x="0.5"
        y="0.5"
        width="23"
        height="23"
        rx="1"
        fill={PAPER}
        stroke={INK}
        strokeOpacity="0.55"
      />
      <path
        d="M6 4 L6 20 L11 20 C16 20 19 16.5 19 12 C19 7.5 16 4 11 4 Z"
        stroke={INK}
        strokeWidth="1.6"
        fill="none"
      />
      <path d="M14 7 L20 13" stroke={INK_BLUE} strokeWidth="1.8" />
    </svg>
  );
}
