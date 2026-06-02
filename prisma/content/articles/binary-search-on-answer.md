---
slug: binary-search-on-answer
title: Binary Search on the Answer
summary: When the answer is a number with a monotone feasibility check, binary search the answer itself — not just an array index.
topicSlug: binary-search
level: INTERMEDIATE
order: 2
estimatedMins: 16
references:
  - { title: "Competitive Programmer's Handbook, Ch. 3 (Sorting)", author: "Antti Laaksonen", type: "book" }
  - { title: "Binary Search", url: "https://cp-algorithms.com/num_methods/binary_search.html", type: "web" }
  - { title: "USACO Guide — Binary Search", url: "https://usaco.guide/silver/binary-search", type: "web" }
prerequisites: ["binary-search-fundamentals"]
---

## Overview
"Binary search on the answer" generalizes the technique from searching an array to searching a numeric answer space. Whenever you can phrase a problem as *"is some value $x$ achievable?"* and the feasibility is monotone in $x$, the optimal $x$ can be found in $O(\log)$ rounds, each involving a feasibility check.

## Prerequisites
- Binary Search on Sorted Arrays

## Core Idea
Suppose we want the smallest integer $x$ in $[lo, hi]$ such that `can(x)` is `true`, and `can` is monotone: if `can(x)` then `can(x+1)`, and similarly for the false side. Binary search the predicate, not an array:

```text
while lo < hi:
    mid = lo + (hi - lo) / 2
    if can(mid):
        hi = mid          # mid might be the answer; don't exclude it
    else:
        lo = mid + 1
return lo
```

The same template inverted gives the largest feasible $x$ when monotonicity flips.

## Mechanics
Three things must be true:
1. **A bounded answer space**, $[lo, hi]$. Even for continuous problems, you need bounds.
2. **A monotone feasibility predicate** `can(x)`. Either `false, ..., false, true, ..., true` or the reverse over the search range.
3. **An efficient predicate**. Cost per check $\times \log(\text{range})$ must beat the brute-force approach.

For real-valued answers, replace the integer loop with a fixed number of iterations (~100) or a `while hi - lo > eps` loop, picking `eps` based on required precision.

## Complexity
- $O(\log(\text{range}) \cdot C)$ where $C$ is the cost of one feasibility check and *range* is $hi - lo$.
- Compare against the brute-force cost — if the brute force is already $O(C \cdot \text{range})$, you save a factor of $\text{range}/\log(\text{range})$.

## Common Patterns
1. **Capacity / minimax problems**: "Minimum capacity such that all packages ship in $D$ days." `can(c)` simulates shipping; monotone in $c$.
2. **Aggressive cows / placement problems**: "Place $k$ cows in stalls so the minimum pairwise distance is maximized." Binary search on the distance.
3. **Kth smallest in a multiplication table or sorted matrix**: `can(x) = (count of cells ≤ x) ≥ k`.
4. **Square roots and Nth roots**: Real-valued binary search on a continuous answer.

## Pitfalls
- **The predicate is not actually monotone**. If `can(5) = true` and `can(7) = true` but `can(6) = false`, binary search will return garbage. Verify monotonicity before applying.
- **Wrong boundary update**. Mixing `hi = mid` with `lo = mid + 1` (or vice versa) causes infinite loops when `lo + 1 == hi`. Pick a consistent template and reuse it.
- **Overflow in `mid = (lo + hi) / 2`**. Use `lo + (hi - lo) / 2` for large integer ranges.
- **Continuous loops that never converge** because of floating-point precision — bound the iteration count.

## Practice
- Capacity to Ship Packages Within D Days.
- Split Array Largest Sum.
- Find the Smallest Divisor Given a Threshold.
- Aggressive Cows (SPOJ).

## References
1. Laaksonen, Antti. *Competitive Programmer's Handbook*, Chapter 3.
2. cp-algorithms.com. "Binary Search".
3. USACO Guide. "Binary Search on the Answer".
