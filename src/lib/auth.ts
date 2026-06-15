import "server-only";

import { cookies } from "next/headers";
import { createHmac, randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { prisma } from "@/lib/prisma";

const scryptAsync = promisify(scrypt);

const SESSION_COOKIE = "dsa_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 30;
const PASSWORD_KEYLEN = 64;

function getAuthSecret() {
  if (!process.env.AUTH_SECRET) {
    throw new Error("AUTH_SECRET environment variable is not set. Please set it to a secure random string.");
  }
  return process.env.AUTH_SECRET;
}

function base64url(input: string | Buffer) {
  return Buffer.from(input)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function fromBase64url(input: string) {
  const normalized = input.replace(/-/g, "+").replace(/_/g, "/");
  const pad = normalized.length % 4 === 0 ? "" : "=".repeat(4 - (normalized.length % 4));
  return Buffer.from(normalized + pad, "base64").toString("utf8");
}

/**
 * Async password hashing via scrypt.
 *
 * The previous implementation used `scryptSync`, which blocks the Node event
 * loop for tens of milliseconds per call (scrypt is intentionally slow to
 * resist brute-force). That stalls every other in-flight request on the
 * server, which on a single-process dev / edge runtime is the entire app.
 * `util.promisify(scrypt)` yields the loop while scrypt runs.
 *
 * `hashPassword` is now an async function. Callers (register / verify) must
 * `await` it. Stored format is unchanged (`salt:hash` in hex) so existing
 * `passwordHash` values continue to verify.
 */
export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const derived = (await scryptAsync(password, salt, PASSWORD_KEYLEN)) as Buffer;
  return `${salt}:${derived.toString("hex")}`;
}

export async function verifyPassword(password: string, storedHash: string) {
  const [salt, hash] = storedHash.split(":");
  if (!salt || !hash) return false;
  const derived = (await scryptAsync(password, salt, PASSWORD_KEYLEN)) as Buffer;
  const stored = Buffer.from(hash, "hex");
  if (stored.length !== derived.length) return false;
  return timingSafeEqual(stored, derived);
}

function sign(payload: string) {
  return createHmac("sha256", getAuthSecret()).update(payload).digest("base64url");
}

type SessionPayload = {
  userId: string;
  iat: number; // issued-at, seconds since epoch
  exp: number; // expires-at, seconds since epoch
};

function createSessionValue(userId: string) {
  const nowSec = Math.floor(Date.now() / 1000);
  const payload: SessionPayload = {
    userId,
    iat: nowSec,
    exp: nowSec + SESSION_TTL_SECONDS,
  };
  const encoded = base64url(JSON.stringify(payload));
  return `${encoded}.${sign(encoded)}`;
}

function parseSessionValue(raw: string | undefined): SessionPayload | null {
  if (!raw) return null;
  const [payload, signature] = raw.split(".");
  if (!payload || !signature) return null;
  const expectedSignature = sign(payload);
  const expectedBuffer = Buffer.from(expectedSignature);
  const providedBuffer = Buffer.from(signature);
  if (expectedBuffer.length !== providedBuffer.length || !timingSafeEqual(expectedBuffer, providedBuffer)) {
    return null;
  }

  try {
    const parsed = JSON.parse(fromBase64url(payload)) as Partial<SessionPayload>;
    if (!parsed.userId || typeof parsed.iat !== "number" || typeof parsed.exp !== "number") return null;
    const nowSec = Math.floor(Date.now() / 1000);
    if (parsed.exp < nowSec) return null;
    return { userId: parsed.userId, iat: parsed.iat, exp: parsed.exp };
  } catch {
    return null;
  }
}

export async function setSession(userId: string) {
  const jar = await cookies();
  jar.set(SESSION_COOKIE, createSessionValue(userId), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
}

export async function clearSession() {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
}

export async function getCurrentUser() {
  const jar = await cookies();
  const parsed = parseSessionValue(jar.get(SESSION_COOKIE)?.value);
  if (!parsed) return null;

  // `select` only the columns we need to keep this hot path cheap. We also
  // pull `passwordChangedAt` so we can invalidate tokens issued before the
  // most recent password change (see B-3 in the audit).
  const user = await prisma.user.findUnique({
    where: { id: parsed.userId },
    select: {
      id: true,
      email: true,
      name: true,
      createdAt: true,
      passwordChangedAt: true,
    },
  });
  if (!user) return null;

  if (user.passwordChangedAt) {
    const changedAtSec = Math.floor(user.passwordChangedAt.getTime() / 1000);
    if (parsed.iat < changedAtSec) return null;
  }

  return user;
}

export async function requireCurrentUser() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Authentication required.");
  }
  return user;
}
