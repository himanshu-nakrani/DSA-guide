## 2024-06-13 - HMAC Timing Attack in Session Parsing
**Vulnerability:** The `parseSessionValue` function in `src/lib/auth.ts` was using a simple equality operator (`!==`) to compare the expected HMAC signature against the provided signature. This allows an attacker to perform a timing attack by measuring the time it takes for the comparison to fail, byte by byte, eventually forging a valid signature.
**Learning:** Even if the underlying hashing algorithm (like SHA256) is secure, the comparison of cryptographic signatures must always be done in constant time to prevent side-channel timing attacks.
**Prevention:** Always use `crypto.timingSafeEqual` (or a similar constant-time comparison function) when comparing cryptographic hashes, signatures, or MACs.

## 2026-06-20 - Authentication Bypass via Unawaited Promise
**Vulnerability:** In `loginAction` within `src/app/auth/actions.ts`, the asynchronous `verifyPassword` function was called without an `await`. In JavaScript, an unawaited Promise is truthy, so `!verifyPassword(...)` always evaluated to `false`, effectively bypassing password verification entirely.
**Learning:** Asynchronous operations, especially those related to security and authentication (like hashing or verification), must be properly awaited. Failing to do so can lead to logic flaws that completely negate the security check.
**Prevention:** Always `await` asynchronous functions returning boolean values in conditionals, and consider using linting rules (like `@typescript-eslint/no-floating-promises`) to catch unawaited Promises at compile time.

## 2025-02-14 - URL Scheme XSS via Control Character Bypass
**Vulnerability:** The markdown rendering component (`ArticleBody.tsx`) implemented URL sanitization (`sanitizeHref`) by testing for dangerous schemes using a regex `/^(?:[a-z][a-z0-9+.-]*):/i` against `href.trim()`. This allowed XSS because malicious `javascript:` URIs could bypass the regex check by prepending control characters (e.g. `\x11javascript:alert(1)`). Browsers ignore control characters when parsing URL schemes, so the link would still execute JavaScript when clicked.
**Learning:** Checking for protocol/scheme in a URL requires extreme caution, as the browser parser is very forgiving. Simple `trim()` combined with a strict-anchored regex `^` is insufficient, because it leaves non-whitespace control characters intact, effectively hiding the scheme from the regex while exposing it to the browser.
**Prevention:** Always normalize the URL by stripping out all control characters (`\x00-\x1F\x7F`) and whitespaces before checking the URL scheme against an allowlist or denylist.

## 2024-06-28 - Username Enumeration Timing Attack
**Vulnerability:** The `loginAction` function exited early if the requested user email did not exist in the database. Because password hashing via `scrypt` is intentionally slow, requests for non-existent users completed noticeably faster than requests for existing users. This allowed an attacker to map out which emails belong to valid accounts by measuring server response times.
**Learning:** Checking for the presence of a user *before* performing an expensive operation like password verification inadvertently leaks state information via execution time.
**Prevention:** To prevent timing-based username enumeration, ensure that the login flow always performs the expensive hashing operation. If the user doesn't exist, compute the hash against a hardcoded "dummy" hash of the correct format so the processing time remains roughly constant regardless of whether the user exists.
## 2024-05-24 - Rate Limiter Authentication Bypass via Extraneous Form Fields
**Vulnerability:** The rate limiter implementation in `src/lib/rate-limit.ts` relied on a single `identifierFor` function that could be manipulated. It checked for an `identifier` form field before checking the actual `email` field when establishing the rate limit bucket key. Since `identifier` is an optional field not used in the login endpoint, an attacker could supply an `email` along with random `identifier` strings in the form data, forcing the rate limiter to use the random `identifier` for its bucket key and entirely bypass the rate limit on the `email` bucket.
**Learning:** Checking for coarse/generic form fields before specific, high-priority fields in rate limiter identifiers allows attackers to easily craft distinct bucket keys for brute forcing.
**Prevention:** Ensure that the rate limiter token bucket key resolution explicitly prioritizes high-value context properties (e.g. `email` or `userId`) and only falls back to generic identifiers if the specific context is missing.

## 2024-05-18 - Rate Limit Bypass via Weak Key Derivation
**Vulnerability:** The rate limiter blindly allowed `email` fields to take precedence over `slug` fields in the `identifierFor` key generation logic. An attacker targeting a rate-limited endpoint like `/api/progress/article` that normally requires a `slug` could bypass its limits by injecting a randomized `email` field in the FormData payload, causing the limiter to create new buckets under those dummy emails.
**Learning:** Generic fallback mechanisms for deriving rate limiter keys from user input are dangerous. If a lower-priority or completely unrelated field can be manipulated to spoof the bucket identifier, an attacker can trivially avoid the limit and potentially burn the global capacity or exhaust memory.
**Prevention:** Always restrict rate limit key derivation to explicitly expected identifier fields based on the context of the action being performed (e.g. `name === "login"` should only check `email`), and never blindly fall back to fields from unrelated endpoints.
## 2024-07-09 - [Rate Limiter Key Spoofing Vulnerability]
**Vulnerability:** The rate limiter identifier derivation allowed attackers to spoof their identity. By passing a different target identifier (e.g., via the generic `identifier` field in a payload) when specific action fields (like `email` for login) were missing, an attacker could artificially consume the quota of other users (Denial of Service/Account Lockout).
**Learning:** When determining rate limiting buckets based on user inputs, it is critical to ensure that missing primary identifiers DO NOT fall through to generic fallback identifier checks in the same payload.
**Prevention:** Immediately terminate key derivation evaluation (e.g., return "anonymous") once it enters an action-specific branch, preventing malicious field injection from taking effect.

## 2024-07-17 - Authentication DoS via Extremely Long Inputs
**Vulnerability:** The authentication endpoints (`registerAction` and `loginAction`) lacked maximum length constraints for user inputs. Submitting an extremely long password string (e.g., millions of characters) could cause the Node event loop to block heavily while allocating memory or processing the slow, CPU-intensive `scrypt` hashing function, leading to Denial of Service (DoS) for other users.
**Learning:** Functions that perform computationally expensive operations like cryptographic hashing must enforce strict, reasonable upper bounds on input sizes to prevent asymmetric resource exhaustion attacks.
**Prevention:** Always validate maximum input lengths on API endpoints, especially for fields subjected to heavy computation or direct database lookups (like passwords or emails). Common limits are 72 characters for passwords and 255 characters for emails.
## 2026-07-18 - [DoS Risk via Resource Exhaustion]
**Vulnerability:** The authentication endpoints (`registerAction`, `loginAction`) lacked maximum length constraints on user inputs (e.g., passwords, emails, names).
**Learning:** Without input length limits, attackers could send excessively long strings. When passed to computationally expensive functions like `scrypt`, this could cause severe resource exhaustion (CPU and memory) and stall the event loop, leading to a Denial of Service (DoS) for all other users.
**Prevention:** Enforce strict maximum length constraints (e.g., 256 characters) on all user inputs in API and authentication endpoints *before* any processing or database lookups occur.
## 2024-07-09 - Rate Limiter Key Spoofing Vulnerability
**Vulnerability:** The rate limiter identifier derivation allowed attackers to spoof their identity. By passing a different target identifier (e.g., via the generic `identifier` field in a payload) when specific action fields (like `email` for login) were missing, an attacker could artificially consume the quota of other users (Denial of Service/Account Lockout).
**Learning:** When determining rate limiting buckets based on user inputs, it is critical to ensure that missing primary identifiers DO NOT fall through to generic fallback identifier checks in the same payload.
**Prevention:** Immediately terminate key derivation evaluation (e.g., return "anonymous") once it enters an action-specific branch, preventing malicious field injection from taking effect.

## 2026-07-26 - Rate Limiter Bypass via Sibling Field Injection
**Vulnerability:** The rate limiter identifier derivation in `identifierFor` allowed attackers to spoof keys for progress and bookmark actions. Because the logic checked for `slug` OR `problemSlug` in the same block for both actions, an attacker could bypass limits by injecting the non-expected field (e.g., sending `slug` to the bookmark action instead of `problemSlug`).
**Learning:** Combining key extraction logic for distinct actions allows attackers to exploit the fallback behavior by injecting unexpected fields, resulting in rate limit bypass and potential DoS.
**Prevention:** Strictly restrict key extraction to the exact expected fields for the given action type (e.g., only check `slug` for progress, only check `problemSlug` for bookmarks). Avoid shared fallback logic.
