import "server-only";

import { createHash } from "node:crypto";
import { Prisma } from "@/generated/prisma";
import { prisma } from "@/lib/prisma";

export type RateLimitResult = {
  limited: boolean;
  remaining: number;
  resetMs: number;
  retryAfterSeconds: number;
};

export type RateLimitPolicy = {
  capacity: number;
  refillPerSecond: number;
};

export type RateLimitOptions = {
  /**
   * Use a server-derived stable identifier (for example a user ID or trusted
   * client address). Form fields are only a backwards-compatible fallback.
   */
  identifier?: string;
};

const DEFAULT_POLICY: RateLimitPolicy = {
  capacity: 5,
  refillPerSecond: 1 / 60,
};

const POLICIES: Record<string, RateLimitPolicy> = {
  // Auth operations receive a stricter IP bucket plus, for existing accounts,
  // a second stable account bucket from the action caller.
  login: { capacity: 5, refillPerSecond: 1 / 600 },
  login_account: { capacity: 5, refillPerSecond: 1 / 900 },
  register: { capacity: 3, refillPerSecond: 1 / 3600 },
  progress: { capacity: 30, refillPerSecond: 1 / 5 },
  bookmark: { capacity: 15, refillPerSecond: 1 / 10 },
  list_mutate: { capacity: 10, refillPerSecond: 1 / 30 },
};

const RETRY_COUNT = 3;
const STALE_BUCKET_MS = 24 * 60 * 60 * 1000;
let lastCleanupMs = 0;

function normalizeIdentifier(value: string | undefined) {
  const normalized = value?.slice(0, 4096).trim().slice(0, 255);
  return normalized || "anonymous";
}

function identifierFor(name: string, formData: FormData | null, options?: RateLimitOptions) {
  if (options?.identifier) return normalizeIdentifier(options.identifier);

  const userId = formData?.get("userId");
  if (typeof userId === "string") return normalizeIdentifier(userId);

  // Form-derived values are retained only for older callers. Auth actions now
  // pass a server-derived address explicitly and never depend on email alone.
  const email = formData?.get("email");
  if (typeof email === "string" && (name === "login" || name === "register")) {
    return normalizeIdentifier(email.toLowerCase());
  }

  return "anonymous";
}

function bucketKey(name: string, identifier: string) {
  const digest = createHash("sha256").update(`${name}\u0000${identifier}`).digest("hex");
  return `${name}:${digest}`;
}

function toResult(tokens: number, policy: RateLimitPolicy, now: Date, cost: number): RateLimitResult {
  if (tokens < cost) {
    const deficit = cost - tokens;
    return {
      limited: true,
      remaining: Math.max(0, Math.floor(tokens)),
      resetMs: now.getTime() + deficit * (1000 / policy.refillPerSecond),
      retryAfterSeconds: Math.max(1, Math.ceil(deficit / policy.refillPerSecond)),
    };
  }

  return {
    limited: false,
    remaining: Math.max(0, Math.floor(tokens - cost)),
    resetMs: now.getTime(),
    retryAfterSeconds: 0,
  };
}

async function cleanupStaleBuckets(now: Date) {
  if (now.getTime() - lastCleanupMs < 60 * 60 * 1000) return;
  lastCleanupMs = now.getTime();
  await prisma.rateLimitBucket.deleteMany({
    where: { updatedAt: { lt: new Date(now.getTime() - STALE_BUCKET_MS) } },
  });
}

async function consume(key: string, policy: RateLimitPolicy, cost: number): Promise<RateLimitResult> {
  const now = new Date();
  await cleanupStaleBuckets(now);

  for (let attempt = 0; attempt < RETRY_COUNT; attempt += 1) {
    try {
      return await prisma.$transaction(
        async (tx) => {
          const current = await tx.rateLimitBucket.findUnique({ where: { key } });
          const elapsedSeconds = current ? Math.max(0, (now.getTime() - current.updatedAt.getTime()) / 1000) : 0;
          const available = current
            ? Math.min(policy.capacity, current.tokens + elapsedSeconds * policy.refillPerSecond)
            : policy.capacity;
          const result = toResult(available, policy, now, cost);
          const nextTokens = result.limited ? available : available - cost;

          if (current) {
            await tx.rateLimitBucket.update({
              where: { key },
              data: { tokens: nextTokens },
            });
          } else {
            await tx.rateLimitBucket.create({ data: { key, tokens: nextTokens } });
          }

          return result;
        },
        { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
      );
    } catch (error) {
      const retryable = error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2034";
      if (!retryable || attempt === RETRY_COUNT - 1) throw error;
    }
  }

  throw new Error("Rate-limit transaction retry limit reached.");
}

export async function checkRateLimit(
  name: string,
  formData: FormData | null = null,
  cost = 1,
  options?: RateLimitOptions,
): Promise<RateLimitResult> {
  if (!Number.isFinite(cost) || cost <= 0) throw new Error("Rate-limit cost must be positive.");
  const policy = POLICIES[name] ?? DEFAULT_POLICY;
  const identifier = identifierFor(name, formData, options);
  return consume(bucketKey(name, identifier), policy, cost);
}

export async function enforceRateLimit(
  name: string,
  formData: FormData | null = null,
  cost = 1,
  options?: RateLimitOptions,
): Promise<RateLimitResult> {
  return checkRateLimit(name, formData, cost, options);
}

export function rateLimitedResponse(result: RateLimitResult): { error: string } {
  return {
    error: `Too many requests. Please wait ${result.retryAfterSeconds} second${
      result.retryAfterSeconds === 1 ? "" : "s"
    } before trying again.`,
  };
}
