"use client";

import { useActionState, useId, useState } from "react";
import { Loader2, Eye, EyeOff } from "lucide-react";
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
  const formId = useId();
  const [showPassword, setShowPassword] = useState(false);


  return (
    <form action={formAction} className="surface-card p-6 md:p-7 space-y-4">
      <div>
        <div className="eyebrow mb-2">Account</div>
        <h2 className="font-display text-2xl font-medium">{title}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{description}</p>
      </div>

      {includeName && (
        <div className="block space-y-1.5">
          <label htmlFor={`${formId}-name`} className="text-sm font-medium">
            Name
          </label>
          <input
            id={`${formId}-name`}
            type="text"
            name="name"
            autoComplete="name"
            className="w-full rounded-md border border-[color:var(--rule-strong)] bg-background px-3 py-2 outline-none focus:border-[color:var(--ink-blue)]"
            placeholder="Ada Lovelace"
          />
        </div>
      )}

      <div className="block space-y-1.5">
        <label htmlFor={`${formId}-email`} className="text-sm font-medium">
          Email <span aria-hidden="true" className="text-red-500">*</span>
          <span className="sr-only"> (required)</span>
        </label>
        <input
          id={`${formId}-email`}
          type="email"
          name="email"
          autoComplete="email"
          required
          className="w-full rounded-md border border-[color:var(--rule-strong)] bg-background px-3 py-2 outline-none focus:border-[color:var(--ink-blue)]"
          placeholder="you@example.com"
        />
      </div>

      <div className="block space-y-1.5">
        <label htmlFor={`${formId}-password`} className="text-sm font-medium">
          Password <span aria-hidden="true" className="text-red-500">*</span>
          <span className="sr-only"> (required)</span>
        </label>
        <div className="relative">
          <input
            id={`${formId}-password`}
            type={showPassword ? "text" : "password"}
            name="password"
            autoComplete={includeName ? "new-password" : "current-password"}
            required
            className="w-full rounded-md border border-[color:var(--rule-strong)] bg-background pl-3 pr-10 py-2 outline-none focus:border-[color:var(--ink-blue)]"
            placeholder="At least 8 characters"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            aria-pressed={showPassword}
            title={showPassword ? "Hide password" : "Show password"}
            className="absolute inset-y-0 right-0 grid w-10 place-items-center text-muted-foreground hover:text-[color:var(--ink-blue)] transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ink-blue)] focus-visible:ring-offset-1 focus-visible:ring-offset-[color:var(--surface-1)] rounded-md"
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" strokeWidth={1.5} />
            ) : (
              <Eye className="h-4 w-4" strokeWidth={1.5} />
            )}
          </button>
        </div>
      </div>

      {state.error && (
        <p role="alert" className="rounded-md border border-red-300/60 bg-red-500/8 px-3 py-2 text-sm text-red-700 dark:text-red-300">
          {state.error}
        </p>
      )}

      <button type="submit" disabled={pending} className="btn-ink w-full justify-center disabled:opacity-60 gap-2">
        {pending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            Please wait…
          </>
        ) : (
          submitLabel
        )}
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
