import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { CommandPalette } from "@/components/layout/CommandPalette";
import { InlineScript } from "@/components/layout/InlineScript";
import { Footer } from "@/components/layout/Footer";
import { Toaster } from "@/components/ui/toast";
import { getSearchIndex } from "@/lib/searchIndex";
import { getCurrentUser } from "@/lib/auth";
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

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fcfcfc" },
    { media: "(prefers-color-scheme: dark)", color: "#131316" },
  ],
};

// Runs synchronously during HTML parsing — before first paint, before React.
// Reads the persisted colour theme out of localStorage and stamps it onto
// <html> so CSS renders the right theme without a flash.
const themeBootstrap = `(()=>{try{
  var d=document.documentElement;
  var t=localStorage.getItem('dsa.theme')||(window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');
  d.setAttribute('data-theme',t);
  if(localStorage.getItem('dsa.focus')==='1') d.setAttribute('data-focus-mode','');
}catch(e){document.documentElement.setAttribute('data-theme','light');}})();`;

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [searchIndex, user] = await Promise.all([getSearchIndex(), getCurrentUser()]);
  const headerUser = user ? { name: user.name, email: user.email } : null;

  return (
    <html
      lang="en"
      data-theme="light"
      data-scroll-behavior="smooth"
      className={`${iaWriter.variable} ${lilex.variable} h-full`}
      suppressHydrationWarning
    >
      <head>
        <InlineScript html={themeBootstrap} />
      </head>
      <body className="min-h-screen flex flex-col bg-background text-foreground antialiased">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:z-[100] focus:px-4 focus:py-2 focus:m-2 focus:bg-background focus:text-foreground focus:border focus:border-border focus:rounded-md focus:shadow-md"
        >
          Skip to main content
        </a>
        <Header user={headerUser} />
        <main id="main-content" className="flex-1 min-w-0 w-full">
          {children}
        </main>
        <Footer />
        <CommandPalette index={searchIndex} />
        <Toaster />
      </body>
    </html>
  );
}
