"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { Prisma } from "@/generated/prisma";
import { checkRateLimit, rateLimitedResponse } from "@/lib/rate-limit";
import { clearSession, hashPassword, setSession, verifyPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function finishAuthRedirect(destination: string): never {
  revalidatePath("/", "layout");
  redirect(destination);
}

export type AuthFormState = {
  error?: string;
};

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.slice(0, 4096).trim() : "";
}

function isValidEmail(email: string) {
  // A deliberately conservative boundary check; full RFC parsing is neither
  // needed nor desirable for account identifiers.
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 255;
}

async function clientAddress() {
  const requestHeaders = await headers();
  // Deployment proxies must overwrite these headers before traffic reaches the
  // app. Prefer provider-controlled headers over generic forwarded headers.
  const raw =
    requestHeaders.get("x-vercel-forwarded-for") ??
    requestHeaders.get("cf-connecting-ip") ??
    requestHeaders.get("x-real-ip") ??
    requestHeaders.get("x-forwarded-for") ??
    "unknown";

  // SECURITY: Apply max length bounds before computationally expensive operations like split
  // to prevent Denial of Service (DoS) attacks via memory exhaustion or event loop blocking.
  return raw.slice(0, 1024).split(",")[0]?.trim().slice(0, 255) || "unknown";
}

async function enforceNetworkLimit(name: "login" | "register") {
  const rateLimit = await checkRateLimit(name, null, 1, { identifier: await clientAddress() });
  return rateLimit.limited ? rateLimitedResponse(rateLimit) : null;
}

export async function registerAction(
  _prevState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const networkError = await enforceNetworkLimit("register");
  if (networkError) return networkError;

  const name = getString(formData, "name");
  const email = getString(formData, "email").toLowerCase();
  const password = getString(formData, "password");

  if (!email || !password) {
    return { error: "Email and password are required." };
  }
  if (!isValidEmail(email)) {
    return { error: "Enter a valid email address." };
  }
  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }
  if (password.length > 72 || name.length > 255) {
    return { error: "Input exceeds the maximum allowed length." };
  }

  try {
    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        email,
        name: name || null,
        passwordHash,
        passwordChangedAt: new Date(),
        profile: { create: {} },
      },
    });

    await setSession(user.id);
  } catch (error) {
    // Covers a race on the unique email constraint without turning it into an
    // account-existence oracle.
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { error: "Unable to create an account with those details." };
    }
    throw error;
  }

  finishAuthRedirect("/learn");
}

export async function loginAction(
  _prevState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const networkError = await enforceNetworkLimit("login");
  if (networkError) return networkError;

  const email = getString(formData, "email").toLowerCase();
  const password = getString(formData, "password");

  if (!email || !password) {
    return { error: "Email and password are required." };
  }
  if (!isValidEmail(email) || password.length > 72) {
    return { error: "Invalid email or password." };
  }

  const accountRateLimit = await checkRateLimit("login_account", null, 1, { identifier: email });
  if (accountRateLimit.limited) return rateLimitedResponse(accountRateLimit);

  const user = await prisma.user.findUnique({ where: { email } });
  const dummyHash = "00000000000000000000000000000000:00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000";
  const isValidPassword = await verifyPassword(password, user?.passwordHash || dummyHash);

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
