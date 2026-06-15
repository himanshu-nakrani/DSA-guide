"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { checkRateLimit, rateLimitedResponse } from "@/lib/rate-limit";
import { clearSession, hashPassword, setSession, verifyPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// `redirect()` throws a special Next.js error that aborts rendering; any code
// after it (including `revalidatePath`) is unreachable. We revalidate first
// and let `redirect` close out the function via throw.
function finishAuthRedirect(destination: string) {
  revalidatePath("/", "layout");
  redirect(destination);
}

export type AuthFormState = {
  error?: string;
};

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export async function registerAction(
  _prevState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const rateLimit = await checkRateLimit("register", formData);
  if (rateLimit.limited) return rateLimitedResponse(rateLimit);

  const name = getString(formData, "name");
  const email = getString(formData, "email").toLowerCase();
  const password = getString(formData, "password");

  if (!email || !password) {
    return { error: "Email and password are required." };
  }
  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "An account with that email already exists." };
  }

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: {
      email,
      name: name || null,
      passwordHash,
      // Stamp the password-change moment so any future session token
      // whose iat predates this is rejected.
      passwordChangedAt: new Date(),
      profile: { create: {} },
    },
  });

  await setSession(user.id);
  finishAuthRedirect("/learn");
}

export async function loginAction(
  _prevState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const rateLimit = await checkRateLimit("login", formData);
  if (rateLimit.limited) return rateLimitedResponse(rateLimit);

  const email = getString(formData, "email").toLowerCase();
  const password = getString(formData, "password");

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user?.passwordHash || !verifyPassword(password, user.passwordHash)) {
    return { error: "Invalid email or password." };
  }

  await setSession(user.id);
  finishAuthRedirect("/learn");
}

export async function logoutAction() {
  await clearSession();
  finishAuthRedirect("/");
}
