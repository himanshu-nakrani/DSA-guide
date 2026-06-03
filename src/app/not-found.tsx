import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-12 py-20">
      <div className="max-w-md w-full text-center bloom">
        <div
          className="font-display text-7xl leading-none text-primary font-semibold"
          style={{ ["--i" as string]: 0 }}
        >
          404
        </div>
        <h1
          className="font-display text-2xl font-semibold mt-4 tracking-tight"
          style={{ ["--i" as string]: 1 }}
        >
          Page not found
        </h1>
        <p
          className="text-muted-foreground mt-2"
          style={{ ["--i" as string]: 2 }}
        >
          The page you&rsquo;re looking for doesn&rsquo;t exist or has been moved.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex items-center gap-1.5 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium shadow-sm hover:opacity-95 transition-opacity"
          style={{ ["--i" as string]: 3 }}
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to home
        </Link>
      </div>
    </div>
  );
}
