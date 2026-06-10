"use client";

import { useActionState } from "react";
import { loginAction, registerAction, type AuthFormState } from "@/app/auth/actions";

const initialState: AuthFormState = {};

function AuthForm({
  title,
  description,
  action,
  includeName = false,
  submitLabel,
}: {
  title: string;
  description: string;
  action: (state: AuthFormState, formData: FormData) => Promise<AuthFormState>;
  includeName?: boolean;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="surface-card p-6 md:p-7 space-y-4">
      <div>
        <div className="eyebrow mb-2">Account</div>
        <h2 className="font-display text-2xl font-medium">{title}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{description}</p>
      </div>

      {includeName && (
        <label className="block space-y-1.5">
          <span className="text-sm font-medium">Name</span>
          <input
            type="text"
            name="name"
            autoComplete="name"
            className="w-full rounded-md border border-[color:var(--rule-strong)] bg-background px-3 py-2 outline-none focus:border-[color:var(--ink-blue)]"
            placeholder="Ada Lovelace"
          />
        </label>
      )}

      <label className="block space-y-1.5">
        <span className="text-sm font-medium">Email</span>
        <input
          type="email"
          name="email"
          autoComplete="email"
          required
          className="w-full rounded-md border border-[color:var(--rule-strong)] bg-background px-3 py-2 outline-none focus:border-[color:var(--ink-blue)]"
          placeholder="you@example.com"
        />
      </label>

      <label className="block space-y-1.5">
        <span className="text-sm font-medium">Password</span>
        <input
          type="password"
          name="password"
          autoComplete={includeName ? "new-password" : "current-password"}
          required
          className="w-full rounded-md border border-[color:var(--rule-strong)] bg-background px-3 py-2 outline-none focus:border-[color:var(--ink-blue)]"
          placeholder="At least 8 characters"
        />
      </label>

      {state.error && (
        <p className="rounded-md border border-red-300/60 bg-red-500/8 px-3 py-2 text-sm text-red-700 dark:text-red-300">
          {state.error}
        </p>
      )}

      <button type="submit" disabled={pending} className="btn-ink w-full justify-center disabled:opacity-60">
        {pending ? "Please wait…" : submitLabel}
      </button>
    </form>
  );
}

export function AuthForms() {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <AuthForm
        title="Sign in"
        description="Pick up where you left off across articles and practice sets."
        action={loginAction}
        submitLabel="Sign in"
      />
      <AuthForm
        title="Create account"
        description="Save reading progress, mark problem status, and keep your roadmap in sync."
        action={registerAction}
        includeName
        submitLabel="Create account"
      />
    </div>
  );
}
