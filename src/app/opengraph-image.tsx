import { ImageResponse } from "next/og";

export const alt = "DSA Guide — A structured curriculum on data structures and algorithms";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpenGraphImage() {
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
          padding: "72px 80px",
          fontFamily: "ui-sans-serif, system-ui, sans-serif",
        }}
      >
        {/* Graph-paper grid */}
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

        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <BrandGlyph />
          <div
            style={{
              fontFamily: "ui-monospace, monospace",
              fontSize: 18,
              letterSpacing: 4,
              textTransform: "uppercase",
              color: "#8b94a3",
              display: "flex",
            }}
          >
            DSA Guide · Inkwell
          </div>
        </div>

        <div style={{ flex: 1, display: "flex", alignItems: "center" }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 24,
              maxWidth: 880,
            }}
          >
            <div
              style={{
                display: "flex",
                fontSize: 88,
                lineHeight: 1.02,
                letterSpacing: -2,
                fontWeight: 500,
              }}
            >
              <div style={{ display: "flex", flexWrap: "wrap" }}>
                Data structures and algorithms,{" "}
                <span style={{ color: "#ffd166", display: "flex" }}>
                  taught the way they were meant to be.
                </span>
              </div>
            </div>
            <div
              style={{
                display: "flex",
                fontSize: 28,
                lineHeight: 1.45,
                color: "#8b94a3",
                maxWidth: 760,
              }}
            >
              A structured curriculum drawn from CLRS, Sedgewick &amp; Wayne, and
              Laaksonen — paired with interactive visualizations.
            </div>
          </div>
        </div>

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
    <svg width="44" height="44" viewBox="0 0 24 24" fill="none">
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
