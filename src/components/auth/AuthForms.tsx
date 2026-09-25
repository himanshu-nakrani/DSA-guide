"use client";
import { useActionState, useEffect, useId, useState } from "react";
import { Check, CircleAlert, Eye, EyeOff, Loader2 } from "lucide-react";
import { loginAction, registerAction, type AuthFormState } from "@/app/auth/actions";
import { Button } from "@/components/ui/button";
import { TabsList, TabsPanel, TabsRoot, TabsTab } from "@/components/ui/tabs";
import { BrandMark } from "@/components/ui/BrandMark";
import { toast } from "@/components/ui/toast";
const initialState: AuthFormState = {};

const BENEFITS = [
  "Reading progress synced across devices",
  "Problem statuses, bookmarks, and lists saved",
  "Roadmap resume links follow you",
];

function AuthForm({
  title,
  description,
  action,
  includeName = false,
  submitLabel,
  passwordHint,
}: {
  title: string;
  description: string;
  action: (state: AuthFormState, formData: FormData) => Promise<AuthFormState>;
  includeName?: boolean;
  submitLabel: string;
  passwordHint?: string;
}) {

  const [state, formAction, pending] = useActionState(action, initialState);
  const formId = useId();
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (state.unexpected && state.error) {
      toast(state.error, { tone: "error" });
    }
  }, [state]);
  return (
    <form action={formAction} className="space-y-4">
      <div>
        <h2 className="font-display text-2xl font-medium tracking-tight">{title}</h2>
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
            className="field"
            placeholder="Ada Lovelace"
          />
        </div>
      )}

      <div className="block space-y-1.5">
        <label htmlFor={`${formId}-email`} className="text-sm font-medium">
          Email <span aria-hidden="true" className="text-ink-red">*</span>
          <span className="sr-only"> (required)</span>
        </label>
        <input
          id={`${formId}-email`}
          type="email"
          name="email"
          autoComplete="email"
          required
          className="field"
          placeholder="you@example.com"
        />
      </div>

      <div className="block space-y-1.5">
        <label htmlFor={`${formId}-password`} className="text-sm font-medium">
          Password <span aria-hidden="true" className="text-ink-red">*</span>
          <span className="sr-only"> (required)</span>
        </label>
        <div className="relative">
          <input
            id={`${formId}-password`}
            type={showPassword ? "text" : "password"}
            name="password"
            autoComplete={includeName ? "new-password" : "current-password"}
            required
            className="field field-pad-right"
            placeholder="At least 8 characters"
          />
          {passwordHint && (
            <p className="text-xs text-muted-foreground">{passwordHint}</p>
          )}
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            aria-pressed={showPassword}
            title={showPassword ? "Hide password" : "Show password"}
            className="absolute inset-y-0 right-0 grid w-10 place-items-center text-muted-foreground hover:text-ink-blue transition-colors rounded-md outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ink-blue)]"
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
        <p
          role="alert"
          className="flex items-start gap-2 rounded-md border border-ink-red/40 bg-ink-red-wash px-3 py-2 text-small text-ink-red"
        >
          <CircleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" strokeWidth={1.5} />
          <span>{state.error}</span>
        </p>
      )}

      <Button type="submit" disabled={pending} className="w-full gap-2">
        {pending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            Please wait…
          </>
        ) : (
          submitLabel
        )}
      </Button>
    </form>
  );
}

export function AuthForms() {
  return (
    <div className="mx-auto w-full max-w-md">
      <div className="mb-6 flex items-center gap-2.5">
        <span
          aria-hidden
          className="grid h-9 w-9 place-items-center rounded-lg bg-foreground text-background"
        >
          <BrandMark size={20} className="text-background" />
        </span>
        <div>
          <div className="text-[15px] font-semibold tracking-tight text-foreground">
            DSA Guide
          </div>
          <div className="text-xs text-muted-foreground">One account, every device</div>
        </div>
      </div>

      <ul className="mb-6 space-y-2">
        {BENEFITS.map((benefit) => (
          <li key={benefit} className="flex items-start gap-2 text-sm text-muted-foreground">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-ink-green" />
            {benefit}
          </li>
        ))}
      </ul>

      <div className="surface-card p-6 md:p-7">
        <TabsRoot defaultValue="signin">
          <TabsList aria-label="Sign in or create account" className="mb-6 grid grid-cols-2 gap-1 rounded-lg border border-border bg-surface-2 p-1">
            <TabsTab
              value="signin"
              className="flex min-h-[44px] items-center justify-center rounded-md px-3 py-2 font-sans text-sm font-medium normal-case tracking-normal data-[selected]:bg-surface-1 data-[selected]:text-foreground data-[selected]:shadow-[var(--shadow-card)]"
            >
              Sign in
            </TabsTab>
            <TabsTab
              value="signup"
              className="flex min-h-[44px] items-center justify-center rounded-md px-3 py-2 font-sans text-sm font-medium normal-case tracking-normal data-[selected]:bg-surface-1 data-[selected]:text-foreground data-[selected]:shadow-[var(--shadow-card)]"
            >
              Create account
            </TabsTab>
          </TabsList>
          <TabsPanel value="signin">
            <AuthForm
              title="Welcome back"
              description="Pick up where you left off across articles and practice sets."
              action={loginAction}
              submitLabel="Sign in"
            />
          </TabsPanel>
          <TabsPanel value="signup">
            <AuthForm
              title="Create your account"
              description="Save reading progress, mark problem status, and keep your roadmap in sync."
              action={registerAction}
              includeName
              submitLabel="Create account"
              passwordHint="At least 8 characters. Use a password you don't reuse elsewhere."
            />
          </TabsPanel>
        </TabsRoot>
      </div>
    </div>
  );
}
