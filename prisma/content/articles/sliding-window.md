---
slug: sliding-window
title: Sliding Window Patterns
summary: Maintain a contiguous window that slides over the input in O(n), updating the aggregate in O(1) as elements enter and leave.
topicSlug: prefix-sums-and-sliding-window
level: INTERMEDIATE
order: 2
estimatedMins: 16
references:
  - { title: "Introduction to Algorithms, 4th ed.", author: "Cormen, Leiserson, Rivest, Stein", type: "book" }
  - { title: "Competitive Programmer's Handbook, Ch. 9", author: "Antti Laaksonen", url: "https://cses.fi/book/book.pdf", type: "book" }
  - { title: "Sliding Window Technique", url: "https://cp-algorithms.com/", type: "web" }
prerequisites: ["array-fundamentals", "two-pointers"]
---

## Overview
The sliding-window technique is the answer to a specific question: *given an
array and a function defined on contiguous subarrays, can we compute the
function over all subarrays without revisiting elements?* When the answer is
yes, an algorithm that looked $O(n^2)$ collapses to $O(n)$.

The trick is to maintain a contiguous window $[L, R]$ together with an
aggregate that we can update *incrementally* as the window moves. Each
element enters the window exactly once and leaves at most once — that's the
$O(n)$ guarantee.

## The Fixed-Size Window

The simplest variant: a window of constant width $k$. Slide it across the
array, updating the aggregate by adding the new right element and removing
the old left element.

```viz
{ "type": "sliding-window", "props": {
  "values": [4, 2, 7, 1, 5, 6, 3, 8, 2, 4, 9, 1],
  "k": 3,
  "mode": "fixed"
} }
```

The chart underneath plots the running window sum. Notice that the algorithm
never re-traverses elements — the cost per slide is constant.

```python
def max_sum_window(A, k):
    s = sum(A[:k])
    best = s
    for i in range(k, len(A)):
        s += A[i] - A[i - k]
        best = max(best, s)
    return best
```

The body of the loop is two additions, one subtraction, and a comparison.
Each iteration is $\Theta(1)$, and there are $n - k$ of them.

## The Variable-Size Window

When the window size depends on a predicate — *"longest subarray whose sum
is at most 20"* — we need a window that grows and shrinks. The standard
shape:

```python
def longest_with_sum_at_most(A, limit):
    L = 0
    s = 0
    best = 0
    for R in range(len(A)):
        s += A[R]                    # expand right
        while s > limit and L <= R:  # shrink left until valid
            s -= A[L]
            L += 1
        best = max(best, R - L + 1)
    return best
```

```viz
{ "type": "sliding-window", "props": {
  "values": [4, 2, 7, 1, 5, 6, 3, 8, 2, 4, 9, 1],
  "k": 3,
  "mode": "variable"
} }
```

`R` always advances; `L` advances only as far as needed to restore the
invariant. The total number of `L` advances across the whole algorithm is at
most $n$, which is what makes the inner `while` loop *amortized* $O(1)$
despite looking nested. The full procedure is $\Theta(n)$.

```viz
{ "type": "callout", "props": {
  "tone": "intuition",
  "title": "Why the inner loop is not O(n²)",
  "body": "Each index L visits is a slot the loop *passed* — it can never visit it again. Sum the L-advances across all R-advances and you get at most n. Two pointers, both monotone, each moving at most n times: O(n) total."
} }
```

## The Standard Shapes

Most window problems are one of three skeletons:

1. **Fixed-width aggregate** — sum, average, max of every length-$k$ window.
2. **Variable window seeking the maximum length** — *"longest subarray
   satisfying P"*. Expand right; shrink left only when P breaks.
3. **Variable window seeking the minimum length** — *"smallest subarray
   satisfying P"*. Expand right until P becomes true; shrink left while P
   still holds, recording lengths as you go.

The predicate `P` is typically monotone: once you have too much of
something, adding more cannot help. That monotonicity is what makes
sliding window correct.

## When Sliding Window Does *Not* Apply

```viz
{ "type": "callout", "props": {
  "tone": "pitfall",
  "title": "The predicate must be monotone in the window",
  "body": "If extending the window can *fix* a violated predicate, sliding window is wrong — the left pointer needs to back up. For 'subarray with sum ≥ k where elements can be negative', a stricter prefix-sum/hash approach is required."
} }
```

```viz
{ "type": "callout", "props": {
  "tone": "pitfall",
  "title": "Non-contiguous subsets",
  "body": "Sliding window finds contiguous ranges only. If the problem allows skipping elements (subsequences), this technique cannot help — you need DP or a different reduction."
} }
```

## Companion Data Structures

A window's aggregate is sometimes more than a sum — a min, a max, the count
of distinct values, the multiset of elements seen. The data structure
augmenting the window decides the per-step cost:

| Need                       | Data structure        | Per-step cost   |
| -------------------------- | --------------------- | --------------- |
| Sum                        | scalar                | $O(1)$          |
| Count of distinct chars    | hash map              | $O(1)$          |
| Min or max                 | monotonic deque       | $O(1)$ amortized |
| k-th order statistic       | balanced BST / heap pair | $O(\log k)$  |

The monotonic-deque trick is its own essay later; it's the reason "sliding
window maximum" is $O(n)$ and not $O(n \log n)$.

## Practice
- Maximum sum subarray of size exactly $k$.
- Longest substring without repeating characters (variable window, hash set).
- Minimum window substring (variable window, character count map).
- Smallest subarray with sum at least $S$.
- Sliding window maximum (introduces the monotonic deque).

## References
1. Laaksonen. *Competitive Programmer's Handbook*, Chapter 9.
2. Cormen et al. *Introduction to Algorithms, 4th ed.*
3. cp-algorithms.com. "Sliding Window Technique."
