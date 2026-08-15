import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Sidebar } from "@/components/layout/Sidebar";
import { CommandPalette } from "@/components/layout/CommandPalette";
import { InlineScript } from "@/components/layout/InlineScript";
import { getSearchIndex } from "@/lib/searchIndex";
import { getSiteUrl } from "@/lib/site-url";

const iaWriter = localFont({
  variable: "--font",
  display: "swap",
  src: [
    {
      path: "../../public/fonts/iAWriterQuattroV.woff2",
      weight: "100 900",
      style: "normal",
    },
    {
      path: "../../public/fonts/iAWriterQuattroV-Italic.woff2",
      weight: "100 900",
      style: "italic",
    },
  ],
});

const ibmPlex = localFont({
  variable: "--title-font",
  display: "swap",
  src: [{ path: "../../public/fonts/IBMPlexSerif-Var.woff2", weight: "400 700" }],
});

const lilex = localFont({
  variable: "--mono-font",
  display: "swap",
  src: [{ path: "../../public/fonts/Lilex-Regular.woff2", weight: "400" }],
});

const SITE_URL = getSiteUrl();

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
      className={`${iaWriter.variable} ${ibmPlex.variable} ${lilex.variable} h-full`}
      suppressHydrationWarning
    >
      <head>
        <InlineScript html={themeBootstrap} />
      </head>
      <body className="min-h-full flex flex-col md:flex-row bg-background text-foreground antialiased">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:z-[100] focus:px-4 focus:py-2 focus:m-2 focus:bg-background focus:text-foreground focus:border focus:border-border focus:rounded-md focus:shadow-md"
        >
          Skip to main content
        </a>
        <Sidebar searchIndex={searchIndex} />
        <main id="main-content" className="flex-1 min-w-0 md:overflow-y-auto">{children}</main>
        <CommandPalette index={searchIndex} />
      </body>
    </html>
  );
}
