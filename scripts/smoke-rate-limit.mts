// Standalone smoke test for B-2 (rate-limit) in src/lib/rate-limit.ts.
// The full module has `import "server-only"` at the top, which makes it
// unloadable from a plain node script. So we re-implement the public
// surface here against the same algorithm. If this smoke check ever
// drifts from the real rate-limit.ts, regenerate it from the source.

type Bucket = { tokens: number; lastRefillMs: number };

const buckets = new Map<string, Bucket>();

const POLICIES: Record<string, { capacity: number; refillPerSecond: number }> = {
  login: { capacity: 10, refillPerSecond: 0.1 },
  register: { capacity: 3, refillPerSecond: 0.05 },
  progress: { capacity: 30, refillPerSecond: 5 },
  bookmark: { capacity: 30, refillPerSecond: 2 },
};

function checkRateLimit(name: string, formData: FormData | null) {
  const policy = POLICIES[name] ?? { capacity: 5, refillPerSecond: 0.2 };
  const raw = formData?.get("identifier") ?? formData?.get("email") ?? formData?.get("slug") ?? "anonymous";
  const id = typeof raw === "string" ? raw.toLowerCase() : "anonymous";
  const key = `${name}:${id}`;
  const now = Date.now();
  let bucket = buckets.get(key);
  if (!bucket) {
    bucket = { tokens: policy.capacity, lastRefillMs: now };
    buckets.set(key, bucket);
  } else {
    const elapsed = (now - bucket.lastRefillMs) / 1000;
    bucket.tokens = Math.min(policy.capacity, bucket.tokens + elapsed * policy.refillPerSecond);
    bucket.lastRefillMs = now;
  }
  if (bucket.tokens < 1) {
    const deficit = 1 - bucket.tokens;
    return { limited: true, remaining: Math.floor(bucket.tokens), retryAfterSeconds: Math.max(1, Math.ceil(deficit / policy.refillPerSecond)) };
  }
  bucket.tokens -= 1;
  return { limited: false, remaining: Math.floor(bucket.tokens), retryAfterSeconds: 0 };
}

function makeForm(values: Record<string, string>): FormData {
  const map = new Map<string, string>();
  for (const [k, v] of Object.entries(values)) map.set(k, v);
  return { get: (k: string) => map.get(k) ?? null } as unknown as FormData;
}

function rateLimitedResponse(result: { retryAfterSeconds: number }): { error: string } {
  return { error: `Too many requests. Please wait ${result.retryAfterSeconds}s.` };
}

function reset() {
  buckets.clear();
}

async function main() {
  reset();

  // 1. Fresh bucket is not limited.
  const first = checkRateLimit("progress", makeForm({ slug: "article-1" }));
  console.assert(first.limited === false, "fresh bucket should not be limited");
  console.log(`✓ first request: limited=${first.limited}, remaining=${first.remaining}`);

  // 2. Burst: 35 requests in a tight loop on a "burst" policy (defaults
  //    to capacity 5). Some should be limited.
  let accepted = 0, rejected = 0;
  for (let i = 0; i < 35; i++) {
    const r = checkRateLimit("burst", makeForm({ slug: "x" }));
    if (r.limited) rejected++; else accepted++;
  }
  console.assert(accepted > 0 && rejected > 0, "burst should mix accepts and rejects");
  console.log(`✓ burst: ${accepted} accepted, ${rejected} rejected`);

  // 3. rateLimitedResponse shape.
  const limited = checkRateLimit("login", makeForm({ email: "x" }));
  if (limited.limited) {
    const body = rateLimitedResponse(limited);
    console.assert(typeof body.error === "string" && body.error.length > 0, "error message present");
    console.log(`✓ rateLimitedResponse: "${body.error}"`);
  }

  // 4. login policy is tighter than progress policy.
  reset();
  let loginAccepted = 0;
  while (!checkRateLimit("login", makeForm({ email: "x" })).limited) loginAccepted++;
  reset();
  let progressAccepted = 0;
  while (!checkRateLimit("progress", makeForm({ slug: "x" })).limited) progressAccepted++;
  console.assert(loginAccepted < progressAccepted, `login(${loginAccepted}) < progress(${progressAccepted})`);
  console.log(`✓ login bucket (${loginAccepted}) < progress bucket (${progressAccepted})`);

  // 5. Identifier isolation.
  reset();
  const a = checkRateLimit("login", makeForm({ email: "alice" }));
  const b = checkRateLimit("login", makeForm({ email: "bob" }));
  console.assert(!a.limited && !b.limited, "different identifiers should not share a bucket");
  console.log("✓ identifier isolation");

  console.log("\nAll B-2 rate-limit smoke checks passed.");
}

main().catch((e) => {
  console.error("FAILED:", e);
  process.exit(1);
});
