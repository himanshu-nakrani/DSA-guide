---
slug: binary-search-fundamentals
title: Binary Search on Sorted Arrays
summary: Halve the search space at every step to locate a target in a sorted array in O(log n).
topicSlug: binary-search
level: FOUNDATION
order: 1
estimatedMins: 16
references:
  - { title: "Introduction to Algorithms, 4th ed., Ch. 2", author: "Cormen, Leiserson, Rivest, Stein", type: "book" }
  - { title: "Binary Search", url: "https://cp-algorithms.com/num_methods/binary_search.html", type: "web" }
  - { title: "Programming Pearls, Column 4", author: "Jon Bentley", type: "book" }
prerequisites: ["array-fundamentals", "asymptotic-notation"]
---

## Overview
Binary search is the canonical demonstration that *structure on the input
buys you speed*. If we know nothing about an array, the best we can do is
look at every element — $\Theta(n)$ in the worst case. The moment we know
the array is sorted, we can throw away half the candidates in a single
comparison, and the cost collapses to $\Theta(\log n)$.

The idea is older than computer science. Bentley quotes Knuth: "Although
the basic idea of binary search is comparatively straightforward, the
details can be surprisingly tricky… many good programmers have done it
wrong the first few times they tried." The animation below is here so you
don't have to.

## The Core Loop

Maintain a *live window* `[L, R]` of indices that could still contain the
target. Pick the middle, compare, and discard the half that cannot. Repeat
until the window is empty or you find the target.

```viz
{ "type": "binary-search", "props": {
  "values": [2, 4, 7, 9, 12, 17, 23, 31, 42, 56, 78, 91],
  "target": 23
} }
```

Step through and watch what happens to `L`, `R`, and `M`. Each iteration
roughly halves `R − L`, so after $k$ steps the window has size
$\lceil n / 2^k \rceil$. The loop terminates when that's zero — i.e., after
$\lceil \log_2 n \rceil$ steps.

```viz
{ "type": "callout", "props": {
  "tone": "intuition",
  "title": "Why halving wins",
  "body": "Each comparison answers a yes/no question about the target's location. With log₂(n) yes/no questions you can distinguish n positions — this is the same information-theoretic argument that bounds comparison sorts at n log n."
} }
```

## Linear vs. Binary at the Same Target

Linear search and binary search behave so differently that staring at side-
by-side step counts is the fastest path to internalizing why we sort things
in the first place.

```viz
{ "type": "linear-vs-binary", "props": { "size": 64 } }
```

For $n = 64$, linear search costs up to 64 comparisons. Binary search costs
at most $\lceil \log_2 64 \rceil = 6$. For $n = 10^9$, linear is a billion;
binary is 30.

## The Reference Implementation

```python
def binary_search(A, target):
    L, R = 0, len(A) - 1
    while L <= R:
        M = L + (R - L) // 2     # avoid overflow on fixed-size ints
        if A[M] == target:
            return M
        elif A[M] < target:
            L = M + 1
        else:
            R = M - 1
    return -1
```

Four invariants to keep in mind:

1. The window is `[L, R]` *inclusive on both sides*. If you prefer half-
   open `[L, R)`, change all four index updates accordingly — and never mix
   conventions in the same function.
2. `L = M + 1` and `R = M - 1` are crucial. Writing `L = M` or `R = M` will
   stall the loop when the window shrinks to two elements.
3. The middle is `L + (R - L) // 2`, not `(L + R) // 2`. In Java/C++ on
   64-bit signed integers near `INT_MAX`, the latter overflows.
4. Termination: `L > R` means the window is empty.

```viz
{ "type": "callout", "props": {
  "tone": "pitfall",
  "title": "Off-by-one is the failure mode",
  "body": "If your binary search loops forever or misses a target sitting in the array, it is almost certainly one of: wrong window convention, wrong pointer update, or wrong loop guard. There are only three things to check — check them."
} }
```

## Variants You Will Actually Need

Plain "find target or report missing" is rarely the actual problem. The
useful variants are:

- **Lower bound** — smallest index `i` with `A[i] ≥ target`.
- **Upper bound** — smallest index `i` with `A[i] > target`.
- **First / last occurrence** of a duplicated value.
- **Search in a rotated sorted array** — generalize the comparison.
- **Binary search on the answer** — covered in the next essay.

All of them share the same skeleton. The differences are only in the
comparison and which half you keep.

## Search in a Rotated Sorted Array

Suppose `[15, 18, 2, 3, 6, 12]` — sorted, then rotated. A target like `3`
still lives there; we just don't know which half is sorted at any moment.
The trick: look at `A[L]`, `A[M]`. If `A[L] ≤ A[M]`, the left half is
sorted; check whether the target falls in `[A[L], A[M])` and discard
accordingly. Otherwise the right half is sorted; do the symmetric check.

This is one comparison more per iteration. Complexity is still
$O(\log n)$.

## Complexity

- **Time:** $\Theta(\log n)$ comparisons in the worst case. $\Theta(1)$ in
  the lucky best case (target lands at the first midpoint).
- **Space:** $\Theta(1)$ for the iterative form. The recursive form costs
  $\Theta(\log n)$ on the call stack but is otherwise identical.

```viz
{ "type": "complexity-chart", "props": { "maxN": 256, "curves": ["1", "logn", "n"] } }
```

The gap between the green log curve and the amber linear one is the entire
reason this algorithm matters.

## When Binary Search Does *Not* Apply

- The array is not sorted. Sort first, search second — but only if you
  search many times against the same array; sorting is $O(n \log n)$ and
  beats a single linear search only if amortized over enough queries.
- You don't have random access. On a linked list, finding the middle is
  itself $O(n)$, so binary search collapses to a linear scan with more
  bookkeeping.
- The predicate is not monotonic. Binary search needs *some* monotone
  property — sorted order, or "is X achievable?" being yes-then-no. Without
  monotonicity, there's no half to throw away.

## Practice
- Implement `lower_bound` and `upper_bound`. Verify on an array with
  duplicates.
- Find the first and last index of a target in a sorted array.
- Search in a sorted array rotated at an unknown pivot.
- Given a sorted array of integers and an integer `k`, find the
  $k$-th smallest element using only binary search primitives.

## References
1. Cormen, Leiserson, Rivest, Stein. *Introduction to Algorithms, 4th ed.*, Chapter 2.
2. Bentley. *Programming Pearls*, Column 4.
3. cp-algorithms.com. "Binary Search".
