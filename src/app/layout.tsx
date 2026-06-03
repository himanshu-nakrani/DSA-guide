import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import localFont from "next/font/local";
import "./globals.css";
import { Sidebar } from "@/components/layout/Sidebar";
import { CommandPalette } from "@/components/layout/CommandPalette";
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

export const metadata: Metadata = {
  title: "DSA Guide — A structured curriculum on data structures and algorithms",
  description:
    "A modern, interactive curriculum of data structures and algorithms — drawn from CLRS, Sedgewick, Laaksonen, and cp-algorithms.",
};

const themeBootstrap = `(()=>{try{const k='dsa.theme';const s=localStorage.getItem(k);const m=window.matchMedia('(prefers-color-scheme: light)').matches;const t=s||(m?'light':'dark');document.documentElement.setAttribute('data-theme',t);}catch(e){document.documentElement.setAttribute('data-theme','dark');}})();`;

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const searchIndex = await getSearchIndex();

  return (
    <html
      lang="en"
      data-theme="dark"
      className={`${GeistSans.variable} ${GeistMono.variable} ${fraunces.variable} h-full`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootstrap }} />
      </head>
      <body className="min-h-full flex flex-col md:flex-row bg-background text-foreground antialiased">
        <Sidebar />
        <main className="flex-1 min-w-0 md:overflow-y-auto">{children}</main>
        <CommandPalette index={searchIndex} />
      </body>
    </html>
  );
}
