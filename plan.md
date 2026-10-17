1. **Optimize Set and Array allocations from mapped lists in `src/app/dashboard/page.tsx`**
   - The current code extracts slugs using intermediate mapping and constructs a Set and then an Array, then another Set:
     `const readSlugs = Array.from(new Set(articleProgress.map((entry) => entry.article.slug)));`
     `const readSlugSet = new Set(readSlugs);`
   - This violates the explicit performance learning (`2026-10-03 - Prevent Array Allocations in Map Initialization`) which dictates initializing a Set/Map directly in a single pass without mapped array allocations. It also creates a redundant `Set`.
   - We will consolidate this into a single `for...of` loop to directly populate `readSlugSet`, preventing the hidden array allocation and strictly bounding main-thread processing:
     ```typescript
     const readSlugSet = new Set<string>();
     for (const entry of articleProgress) {
       readSlugSet.add(entry.article.slug);
     }
     const readSlugs = Array.from(readSlugSet);
     ```
     This completely eliminates the intermediate `.map` array, the redundant inner `Set` construction, and the redundant outer `readSlugSet` construction.

2. **Verify the change using `pnpm run lint` and `pnpm run test`**.
   - Ensure the new logic matches existing functionality and type checks perfectly.

3. **Complete pre-commit steps to ensure proper testing, verification, review, and reflection are done.**
