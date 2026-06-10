export const LEETCODE_PROBLEM_URLS: Record<string, string> = {
  "two-sum": "https://leetcode.com/problems/two-sum/",
  "best-time-to-buy-and-sell-stock": "https://leetcode.com/problems/best-time-to-buy-and-sell-stock/",
  "maximum-subarray": "https://leetcode.com/problems/maximum-subarray/",
  "move-zeroes": "https://leetcode.com/problems/move-zeroes/",
  "merge-sorted-array": "https://leetcode.com/problems/merge-sorted-array/",
  "contains-duplicate": "https://leetcode.com/problems/contains-duplicate/",
  "valid-anagram": "https://leetcode.com/problems/valid-anagram/",
  "longest-substring-without-repeating-characters": "https://leetcode.com/problems/longest-substring-without-repeating-characters/",
  "maximum-average-subarray-i": "https://leetcode.com/problems/maximum-average-subarray-i/",
  "binary-search": "https://leetcode.com/problems/binary-search/",
  "search-insert-position": "https://leetcode.com/problems/search-insert-position/",
  "first-bad-version": "https://leetcode.com/problems/first-bad-version/",
  "reverse-linked-list": "https://leetcode.com/problems/reverse-linked-list/",
  "merge-two-sorted-lists": "https://leetcode.com/problems/merge-two-sorted-lists/",
  "valid-parentheses": "https://leetcode.com/problems/valid-parentheses/",
  "min-stack": "https://leetcode.com/problems/min-stack/",
  "daily-temperatures": "https://leetcode.com/problems/daily-temperatures/",
  "subsets": "https://leetcode.com/problems/subsets/",
  "permutations": "https://leetcode.com/problems/permutations/",
  "invert-binary-tree": "https://leetcode.com/problems/invert-binary-tree/",
  "maximum-depth-of-binary-tree": "https://leetcode.com/problems/maximum-depth-of-binary-tree/",
  "implement-trie-prefix-tree": "https://leetcode.com/problems/implement-trie-prefix-tree/",
  "number-of-islands": "https://leetcode.com/problems/number-of-islands/",
  "flood-fill": "https://leetcode.com/problems/flood-fill/",
  "climbing-stairs": "https://leetcode.com/problems/climbing-stairs/",
  "house-robber": "https://leetcode.com/problems/house-robber/",
  "coin-change": "https://leetcode.com/problems/coin-change/",
  "maximum-subarray-greedy": "https://leetcode.com/problems/maximum-subarray/",
};

export function getProblemExternalUrl(slug: string) {
  return LEETCODE_PROBLEM_URLS[slug] ?? null;
}

