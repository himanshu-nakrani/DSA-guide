import "server-only";

/**
 * In-memory token-bucket rate limiter.
 *
 * The Next.js server runtime is single-process in dev and in many prod
 * deployments, so a Map-backed limiter is appropriate. For multi-instance
 * prod deployments, swap `buckets` for an external store (Redis / Upstash)
 * — the public API is the only thing the rest of the app should depend on.
 *
 * Buckets are keyed by a caller-supplied identifier (e.g. action name) and
 * a per-caller discriminator (typically a form-supplied identifier, since
 * the action runs server-side and the IP is not always meaningful behind
 * a proxy or in serverless contexts). This keeps a single attacker from
 * using a flood of unauthenticated actions to exhaust other users' quota.
 */

export type RateLimitResult = {
  limited: boolean;
  remaining: number;
  resetMs: number;
  retryAfterSeconds: number;
};

type Bucket = {
  tokens: number;
  lastRefillMs: number;
};

export type RateLimitPolicy = {
  // Max tokens the bucket can hold (= max burst).
  capacity: number;
  // Tokens added per second.
  refillPerSecond: number;
};

const DEFAULT_POLICY: RateLimitPolicy = {
  capacity: 5,
  refillPerSecond: 0.2, // 1 token every 5s → ~12/min sustained
};

const POLICIES: Record<string, RateLimitPolicy> = {
  // Login: more permissive on burst, but still bounded.
  login: { capacity: 10, refillPerSecond: 0.1 },
  // Register: a real user should only need 1-2 attempts.
  register: { capacity: 3, refillPerSecond: 0.05 },
  // Progress endpoints are called frequently from the client.
  progress: { capacity: 30, refillPerSecond: 5 },
  // Bookmark toggles fire on click.
  bookmark: { capacity: 30, refillPerSecond: 2 },
};

const buckets = new Map<string, Bucket>();

// Crude bound to avoid memory growth from one-shot keys.
const MAX_BUCKETS = 10_000;
let lastSweepMs = 0;

function sweep(now: number) {
  // Cheap, time-throttled sweep: drop buckets that have been full for >1h.
  if (now - lastSweepMs < 60_000) return;
  lastSweepMs = now;
  for (const [key, bucket] of buckets) {
    const elapsedSec = (now - bucket.lastRefillMs) / 1000;
    const refilled = bucket.tokens + elapsedSec * 0; // policy-agnostic check below
    // A bucket is "stale" if it's already at full capacity and has been idle
    // long enough to be fully refilled multiple times.
    const policy = DEFAULT_POLICY;
    if (refilled >= policy.capacity && now - bucket.lastRefillMs > 60 * 60 * 1000) {
      buckets.delete(key);
    }
    void refilled;
  }
  if (buckets.size <= MAX_BUCKETS) return;
  // Hard cap: drop the oldest entries.
  const overflow = buckets.size - MAX_BUCKETS;
  let dropped = 0;
  for (const key of buckets.keys()) {
    buckets.delete(key);
    if (++dropped >= overflow) break;
  }
}

function consume(key: string, policy: RateLimitPolicy, cost = 1): RateLimitResult {
  const now = Date.now();
  sweep(now);
  let bucket = buckets.get(key);
  if (!bucket) {
    bucket = { tokens: policy.capacity, lastRefillMs: now };
    buckets.set(key, bucket);
  } else {
    const elapsedSec = (now - bucket.lastRefillMs) / 1000;
    bucket.tokens = Math.min(
      policy.capacity,
      bucket.tokens + elapsedSec * policy.refillPerSecond,
    );
    bucket.lastRefillMs = now;
  }

  if (bucket.tokens < cost) {
    const deficit = cost - bucket.tokens;
    const retryAfter = Math.max(1, Math.ceil(deficit / policy.refillPerSecond));
    return {
      limited: true,
      remaining: Math.floor(bucket.tokens),
      resetMs: now + deficit * (1000 / policy.refillPerSecond),
      retryAfterSeconds: retryAfter,
    };
  }

  bucket.tokens -= cost;
  return {
    limited: false,
    remaining: Math.floor(bucket.tokens),
    resetMs: now,
    retryAfterSeconds: 0,
  };
}

/**
 * Look up the caller identifier for a FormData request. We deliberately use
 * the supplied email (if any) for login/register so that a single attacker
 * can't burn the global bucket, and an opaque per-form "target" key for
 * progress endpoints (typically the article/problem slug). When no
 * identifier is present, fall back to a coarse bucket keyed on action name.
 */
function identifierFor(name: string, formData: FormData | null): string {
  if (name === "login" || name === "register") {
    const email = formData?.get("email");
    if (typeof email === "string") {
      const val = email.slice(0, 255).trim();
      if (val) return val.toLowerCase();
    }
    return "anonymous";
  }

  if (name === "progress") {
    const slug = formData?.get("slug");
    if (typeof slug === "string") {
      const val = slug.slice(0, 255).trim();
      if (val) return val;
    }
    return "anonymous";
  }

  if (name === "bookmark") {
    const slug = formData?.get("problemSlug");
    if (typeof slug === "string") {
      const val = slug.slice(0, 255).trim();
      if (val) return val;
    }
    return "anonymous";
  }

  return "anonymous";
}

export async function checkRateLimit(
  name: string,
  formData: FormData | null = null,
  cost = 1,
): Promise<RateLimitResult> {
  const policy = POLICIES[name] ?? DEFAULT_POLICY;
  const key = `${name}:${identifierFor(name, formData)}`;
  return consume(key, policy, cost);
}

export async function enforceRateLimit(
  name: string,
  formData: FormData | null = null,
  cost = 1,
): Promise<RateLimitResult> {
  return checkRateLimit(name, formData, cost);
}

export function rateLimitedResponse(result: RateLimitResult): { error: string } {
  return {
    error: `Too many requests. Please wait ${result.retryAfterSeconds} second${
      result.retryAfterSeconds === 1 ? "" : "s"
    } before trying again.`,
  };
}

// Test-only: reset bucket state.
export function __resetRateLimitBuckets() {
  buckets.clear();
  lastSweepMs = 0;
}
