import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6 md:px-12 py-20">
      <div className="max-w-md w-full bloom">
        <div className="eyebrow mb-4" style={{ ["--i" as string]: 0 }}>
          Page not found · 404
        </div>
        <h1
          className="font-display text-[clamp(2.25rem,5vw,3.25rem)] leading-[1.06] font-medium text-ink"
          style={{ ["--i" as string]: 1 }}
        >
          This page could not be found.
        </h1>
        <p
          className="text-title mt-4 leading-relaxed text-ink-soft"
          style={{ ["--i" as string]: 2 }}
        >
          The page you&rsquo;re looking for doesn&rsquo;t exist — or it may
          have been moved. Try searching with ⌘K, or return to the curriculum.
        </p>
        <div
          aria-hidden
          className="my-7 h-px bg-rule-strong"
          style={{ ["--i" as string]: 3 }}
        />
        <div
          className="flex flex-wrap items-center gap-3"
          style={{ ["--i" as string]: 4 }}
        >
          <Button render={<Link href="/" />}>
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to home
          </Button>
          <Button variant="ghost" render={<Link href="/learn" />}>
            Browse articles
          </Button>
        </div>
        <p
          className="font-pencil text-body mt-8 text-pencil"
          style={{ ["--i" as string]: 5 }}
        >
          If you arrived here from a link in another article, please report
          the issue — every link in the curriculum is supposed to find its
          destination.
        </p>
      </div>
    </div>
  );
}
