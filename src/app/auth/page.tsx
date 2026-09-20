import { AuthForms } from "@/components/auth/AuthForms";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { Button } from "@/components/ui/button";
import { PageHeader, PageShell } from "@/components/layout/PageShell";
import { getCurrentUser } from "@/lib/auth";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default async function AuthPage() {
  const user = await getCurrentUser();

  return (
    <PageShell width="default">
      <PageHeader
        eyebrow="Account"
        title="Save your place in the guide"
        lede="Sign in to persist article completion, track problem progress, and keep your roadmap synced across devices."
      />

      {user ? (
        <section className="surface-card p-6 md:p-7 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="eyebrow mb-2">Signed in</div>
            <h2 className="font-display text-2xl font-medium">{user.name || user.email}</h2>
            <p className="mt-2 text-sm text-muted-foreground">Your progress will now sync to your account.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button render={<Link href="/dashboard" />}>
              Open dashboard
              <ArrowRight className="h-4 w-4" />
            </Button>
            <LogoutButton />
          </div>
        </section>
      ) : (
        <AuthForms />
      )}
    </PageShell>
  );
}
