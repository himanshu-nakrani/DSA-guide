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
        <div style={{ display: "flex", width: "100%", height: "100%", background: "#0b0d10", color: "#e8e4d9", alignItems: "center", justifyContent: "center", fontSize: 48 }}>
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
          background:
            "radial-gradient(60% 70% at 18% 0%, rgba(255,209,102,0.18), transparent 70%), #0b0d10",
          color: "#e8e4d9",
          padding: "64px 80px",
          fontFamily: "ui-sans-serif, system-ui, sans-serif",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(to right, rgba(232,228,217,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(232,228,217,0.04) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
            display: "flex",
          }}
        />

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <BrandGlyph />
          <div
            style={{
              fontFamily: "ui-monospace, monospace",
              fontSize: 16,
              letterSpacing: 4,
              textTransform: "uppercase",
              color: "#8b94a3",
              display: "flex",
            }}
          >
            DSA Guide · Module {String(article.topic.module.order).padStart(2, "0")} · {article.topic.module.name}
          </div>
        </div>

        {/* Body */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: 24, maxWidth: 980 }}>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <span
              style={{
                display: "flex",
                fontFamily: "ui-monospace, monospace",
                fontSize: 16,
                letterSpacing: 2,
                textTransform: "uppercase",
                padding: "6px 12px",
                border: "1px solid rgba(255,209,102,0.4)",
                color: "#ffd166",
                background: "rgba(255,209,102,0.08)",
                borderRadius: 999,
              }}
            >
              {levelLabel[article.level]}
            </span>
            <span style={{ fontFamily: "ui-monospace, monospace", color: "#8b94a3", fontSize: 18, display: "flex" }}>
              {article.estimatedMins} min read · {article.topic.name}
            </span>
          </div>

          <div
            style={{
              display: "flex",
              fontSize: article.title.length > 60 ? 64 : 80,
              lineHeight: 1.05,
              letterSpacing: -2,
              fontWeight: 500,
            }}
          >
            {article.title}
          </div>

          <div
            style={{
              display: "flex",
              fontSize: 26,
              lineHeight: 1.45,
              color: "#8b94a3",
              maxWidth: 940,
            }}
          >
            {truncate(article.summary, 200)}
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontFamily: "ui-monospace, monospace",
            fontSize: 18,
            color: "#8b94a3",
          }}
        >
          <span style={{ display: "flex" }}>CLRS · Sedgewick · Laaksonen</span>
          <span style={{ display: "flex", color: "#ffd166" }}>dsa.guide/learn/{slug}</span>
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
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
      <rect width="24" height="24" rx="6" fill="rgba(255,209,102,0.12)" stroke="rgba(255,209,102,0.32)" />
      <path d="M5 6 L12 12" stroke="#e8e4d9" strokeOpacity="0.4" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M19 6 L12 12" stroke="#e8e4d9" strokeOpacity="0.4" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M5 18 L12 12" stroke="#e8e4d9" strokeOpacity="0.4" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M12 12 L19 18" stroke="#ffd166" strokeWidth="2.2" strokeLinecap="round" />
      <circle cx="5" cy="6" r="1.6" fill="#e8e4d9" fillOpacity="0.55" />
      <circle cx="19" cy="6" r="1.6" fill="#e8e4d9" fillOpacity="0.55" />
      <circle cx="5" cy="18" r="1.6" fill="#e8e4d9" fillOpacity="0.55" />
      <circle cx="12" cy="12" r="1.9" fill="#e8e4d9" />
      <circle cx="19" cy="18" r="2" fill="#ffd166" />
    </svg>
  );
}
