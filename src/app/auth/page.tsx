import { AuthForms } from "@/components/auth/AuthForms";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { getCurrentUser } from "@/lib/auth";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default async function AuthPage() {
  const user = await getCurrentUser();

  return (
    <div className="max-w-5xl mx-auto px-6 md:px-12 py-16 space-y-10">
      <header className="bloom">
        <div className="eyebrow mb-4" style={{ ["--i" as string]: 0 }}>
          <span className="text-[color:var(--ink-blue)] mr-2">§</span>
          Account
        </div>
        <h1
          className="font-display text-[clamp(2.25rem,5vw,3.5rem)] leading-[1.06] font-medium text-[color:var(--ink)]"
          style={{ ["--i" as string]: 1 }}
        >
          Save your place in the guide
        </h1>
        <p
          className="text-[1.05rem] mt-3 max-w-2xl text-[color:var(--ink-soft)]"
          style={{ ["--i" as string]: 2 }}
        >
          Sign in to persist article completion, track problem progress, and keep your roadmap synced across devices.
        </p>
      </header>

      {user ? (
        <section className="surface-card p-6 md:p-7 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="eyebrow mb-2">Signed in</div>
            <h2 className="font-display text-2xl font-medium">{user.name || user.email}</h2>
            <p className="mt-2 text-sm text-muted-foreground">Your progress will now sync to your account.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link href="/dashboard" className="btn-ink">
              Open dashboard
              <ArrowRight className="h-4 w-4" />
            </Link>
            <LogoutButton />
          </div>
        </section>
      ) : (
        <AuthForms />
      )}
    </div>
  );
}
