## 2024-06-13 - HMAC Timing Attack in Session Parsing
**Vulnerability:** The `parseSessionValue` function in `src/lib/auth.ts` was using a simple equality operator (`!==`) to compare the expected HMAC signature against the provided signature. This allows an attacker to perform a timing attack by measuring the time it takes for the comparison to fail, byte by byte, eventually forging a valid signature.
**Learning:** Even if the underlying hashing algorithm (like SHA256) is secure, the comparison of cryptographic signatures must always be done in constant time to prevent side-channel timing attacks.
**Prevention:** Always use `crypto.timingSafeEqual` (or a similar constant-time comparison function) when comparing cryptographic hashes, signatures, or MACs.

## 2026-06-20 - Authentication Bypass via Unawaited Promise
**Vulnerability:** In `loginAction` within `src/app/auth/actions.ts`, the asynchronous `verifyPassword` function was called without an `await`. In JavaScript, an unawaited Promise is truthy, so `!verifyPassword(...)` always evaluated to `false`, effectively bypassing password verification entirely.
**Learning:** Asynchronous operations, especially those related to security and authentication (like hashing or verification), must be properly awaited. Failing to do so can lead to logic flaws that completely negate the security check.
**Prevention:** Always `await` asynchronous functions returning boolean values in conditionals, and consider using linting rules (like `@typescript-eslint/no-floating-promises`) to catch unawaited Promises at compile time.
