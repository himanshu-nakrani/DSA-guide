"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { checkRateLimit, rateLimitedResponse } from "@/lib/rate-limit";
import { clearSession, hashPassword, setSession, verifyPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// `redirect()` throws a special Next.js error that aborts rendering; any code
// after it (including `revalidatePath`) is unreachable. We revalidate first
// and let `redirect` close out the function via throw. The `never` return
// type tells TypeScript that callers don't need an explicit `return` after
// this (the function never falls through).
function finishAuthRedirect(destination: string): never {
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

  // SECURITY: Prevent resource exhaustion (DoS) via extremely long inputs.
  // Scrypt hashing or database lookups with massive strings can block the event loop or crash the server.
  if (email.length > 255 || password.length > 72 || name.length > 255) {
    return { error: "Input exceeds maximum allowed length." };
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

  // SECURITY: Prevent resource exhaustion (DoS) via extremely long inputs.
  if (email.length > 255 || password.length > 72) {
    return { error: "Invalid email or password." };
  }

  const user = await prisma.user.findUnique({ where: { email } });

  // SECURITY: Prevent username enumeration via timing attacks.
  // If the user doesn't exist (or has no password), we verify against a dummy hash
  // so the computational cost of scrypt remains roughly the same.
  const DUMMY_HASH = "00000000000000000000000000000000:00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000";
  const hashToVerify = user?.passwordHash || DUMMY_HASH;

  // SECURITY: verifyPassword is async. Failing to await it evaluates to true (Promise is truthy),
  // which causes auth bypass. Always await async auth functions.
  const isValidPassword = await verifyPassword(password, hashToVerify);

  if (!user || !user.passwordHash || !isValidPassword) {
    return { error: "Invalid email or password." };
  }

  await setSession(user.id);
  finishAuthRedirect("/learn");
}

export async function logoutAction() {
  await clearSession();
  finishAuthRedirect("/");
}
