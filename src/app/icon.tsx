import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

// BrandMark icon glyph: graph nodes + code brackets on neutral dark ground.
export default async function Icon() {
  return new ImageResponse(
    (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
        <rect width="24" height="24" rx="5" fill="#121316" />
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
    ),
    { ...size },
  );
}
