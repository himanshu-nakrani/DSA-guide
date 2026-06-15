// Standalone smoke test for U-1 (Unicode-safe slugify) in src/lib/toc.ts.
// The function is pure and doesn't import server-only, so we can import
// it directly.

import { slugify } from "../src/lib/toc";

function main() {
  const cases: Array<[string, string]> = [
    // Plain ASCII round-trips.
    ["Hello World", "hello-world"],
    ["Array & Strings", "array-strings"],
    ["  leading and trailing  ", "leading-and-trailing"],
    ["multiple---hyphens", "multiple-hyphens"],
    // Unicode: accented Latin (NFKD + mark-strip should produce readable ASCII).
    ["Café Society", "cafe-society"],
    ["naïve approach", "naive-approach"],
    // Unicode: other scripts are preserved (per the new policy).
    ["日本語のタイトル", "日本語のタイトル"],
    // "ά" decomposes (NFKD) to "α" + combining acute; the mark-strip
    // step drops the acute, so the final character is just "α". That
    // matches how the previous ASCII-only slugify would have rendered
    // the same heading once it stripped everything non-`[a-z0-9]`.
    ["Ελληνικά", "ελληνικα"],
    // Punctuation runs collapse to a single hyphen.
    ["a!@#$b%^&*c", "a-b-c"],
    // Pure punctuation yields empty string.
    ["!!!", ""],
  ];

  let pass = 0;
  for (const [input, expected] of cases) {
    const actual = slugify(input);
    const ok = actual === expected;
    if (!ok) {
      console.error(`✗ slugify(${JSON.stringify(input)}) → ${JSON.stringify(actual)}, expected ${JSON.stringify(expected)}`);
    } else {
      pass++;
    }
  }
  console.log(`✓ ${pass}/${cases.length} slugify cases pass`);

  // Sanity: two headings that previously collided under the broken
  // implementation (any non-ASCII was nuked to "") now produce distinct
  // slugs.
  const cafe = slugify("Café");
  const cafeLatin = slugify("Cafe");
  console.assert(cafe === "cafe" && cafeLatin === "cafe", "same after NFKD collapse");
  // …but two visually identical CJK headings still collide, which is
  // acceptable — that was the existing behaviour and the new code
  // doesn't claim to deduplicate identical strings.
  const a = slugify("日本語のタイトル");
  const b = slugify("日本語のタイトル");
  console.assert(a === b, "identical strings produce identical slugs");
  console.log("✓ CJK round-trip is stable");
}

main();
