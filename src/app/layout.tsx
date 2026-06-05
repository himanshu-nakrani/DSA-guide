import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import localFont from "next/font/local";
import "./globals.css";
import { Sidebar } from "@/components/layout/Sidebar";
import { CommandPalette } from "@/components/layout/CommandPalette";
import { InlineScript } from "@/components/layout/InlineScript";
import { getSearchIndex } from "@/lib/searchIndex";

const fraunces = localFont({
  variable: "--font-fraunces",
  display: "swap",
  src: [
    {
      path: "../../public/fonts/Fraunces-VF.ttf",
      weight: "100 900",
      style: "normal",
    },
    {
      path: "../../public/fonts/Fraunces-Italic-VF.ttf",
      weight: "100 900",
      style: "italic",
    },
  ],
});

const SITE_URL = process.env.SITE_URL?.replace(/\/$/, "") || "https://dsa.guide";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "DSA Guide — A structured curriculum on data structures and algorithms",
  description:
    "A modern, interactive curriculum of data structures and algorithms — drawn from CLRS, Sedgewick, Laaksonen, and cp-algorithms.",
  alternates: {
    canonical: "/",
    types: {
      "application/rss+xml": "/feed.xml",
    },
  },
  robots: { index: true, follow: true },
};

// Runs synchronously during HTML parsing — before first paint, before React.
// Reads persisted UI state out of localStorage and stamps the result onto
// <html> as data-* attributes so the CSS can drive layout (collapsed sidebar,
// focus mode) and the colour theme without a flash of unstyled state.
const themeBootstrap = `(()=>{try{
  var d=document.documentElement;
  var t=localStorage.getItem('dsa.theme')||(window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');
  d.setAttribute('data-theme',t);
  if(localStorage.getItem('dsa.sidebar.collapsed')==='1') d.setAttribute('data-sidebar-collapsed','');
  if(localStorage.getItem('dsa.focus')==='1') d.setAttribute('data-focus-mode','');
}catch(e){document.documentElement.setAttribute('data-theme','light');}})();`;

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const searchIndex = await getSearchIndex();

  return (
    <html
      lang="en"
      data-theme="light"
      className={`${GeistSans.variable} ${GeistMono.variable} ${fraunces.variable} h-full`}
      suppressHydrationWarning
    >
      <head>
        <InlineScript html={themeBootstrap} />
      </head>
      <body className="min-h-full flex flex-col md:flex-row bg-background text-foreground antialiased">
        <Sidebar searchIndex={searchIndex} />
        <main className="flex-1 min-w-0 md:overflow-y-auto">{children}</main>
        <CommandPalette index={searchIndex} />
      </body>
    </html>
  );
}
