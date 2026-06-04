import { ImageResponse } from "next/og";

export const alt = "DSA Guide — A structured curriculum on data structures and algorithms";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const PAPER = "#f7f3ea";
const INK = "#14212e";
const INK_BLUE = "#1f3d7a";
const RULE = "rgba(20, 33, 46, 0.22)";
const PENCIL = "#6b6457";

export default async function OpenGraphImage() {
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
        {/* faint ruled top + bottom band like a printed page header */}
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
              fontSize: 16,
              letterSpacing: 4,
              textTransform: "uppercase",
              color: PENCIL,
              display: "flex",
            }}
          >
            DSA Guide · Manuscript ed.
          </div>
        </div>

        {/* title */}
        <div style={{ flex: 1, display: "flex", alignItems: "center" }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 24,
              maxWidth: 960,
            }}
          >
            <div
              style={{
                display: "flex",
                fontSize: 92,
                lineHeight: 1.04,
                letterSpacing: -1.5,
                fontWeight: 500,
                fontFamily: "Georgia, serif",
              }}
            >
              <div style={{ display: "flex", flexWrap: "wrap" }}>
                Data structures &amp; algorithms,{" "}
                <span
                  style={{
                    color: INK_BLUE,
                    fontStyle: "italic",
                    display: "flex",
                  }}
                >
                  annotated.
                </span>
              </div>
            </div>
            <div
              style={{
                display: "flex",
                fontSize: 26,
                lineHeight: 1.45,
                color: PENCIL,
                maxWidth: 820,
                fontFamily: "Georgia, serif",
              }}
            >
              A printed-feeling curriculum drawn from CLRS, Sedgewick &amp;
              Wayne, and Laaksonen — paired with interactive figures.
            </div>
          </div>
        </div>

        {/* colophon */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontFamily: "ui-monospace, monospace",
            fontSize: 16,
            color: PENCIL,
            letterSpacing: 2,
            textTransform: "uppercase",
            marginBottom: 12,
          }}
        >
          <span style={{ display: "flex" }}>Open curriculum · 2026</span>
          <span style={{ display: "flex" }}>dsa.guide</span>
        </div>
      </div>
    ),
    { ...size },
  );
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
