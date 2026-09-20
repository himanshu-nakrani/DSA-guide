import { ImageResponse } from "next/og";

export const alt = "DSA Guide — Data structures and algorithms, explained clearly";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const revalidate = 86400;

const BG = "#0c0d10";
const FG = "#f4f4f5";
const MUTED = "#a1a1aa";
const ACCENT = "#3b82f6";
const BORDER = "#27272a";

export default async function OpenGraphImage() {
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
        {/* Subtle border line */}
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
              fontSize: 16,
              letterSpacing: 3,
              textTransform: "uppercase",
              color: MUTED,
              display: "flex",
            }}
          >
            DSA Guide
          </div>
        </div>

        {/* Title and summary */}
        <div style={{ flex: 1, display: "flex", alignItems: "center" }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 20,
              maxWidth: 980,
            }}
          >
            <div
              style={{
                display: "flex",
                fontSize: 84,
                lineHeight: 1.05,
                letterSpacing: -2,
                fontWeight: 700,
                color: FG,
              }}
            >
              <div style={{ display: "flex", flexWrap: "wrap" }}>
                Data structures &amp; algorithms,{" "}
                <span
                  style={{
                    color: ACCENT,
                    display: "flex",
                    marginLeft: 14,
                  }}
                >
                  explained clearly.
                </span>
              </div>
            </div>
            <div
              style={{
                display: "flex",
                fontSize: 26,
                lineHeight: 1.45,
                color: MUTED,
                maxWidth: 880,
              }}
            >
              A structured curriculum from foundations to advanced topics.
              Cited articles, live visualizations, and curated practice.
            </div>
          </div>
        </div>

        {/* Footer info */}
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
          <span style={{ display: "flex", color: ACCENT }}>dsa.guide</span>
        </div>
      </div>
    ),
    { ...size },
  );
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
