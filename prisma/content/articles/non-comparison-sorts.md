---
slug: non-comparison-sorts
title: Non-Comparison Sorts (Counting, Radix, Bucket)
summary: How sorts that look at the keys themselves (not just compare them) break the n log n barrier — and the assumptions they need to do so.
topicSlug: sorting
level: INTERMEDIATE
order: 2
estimatedMins: 16
references:
  - { title: "Introduction to Algorithms, 4th ed., Ch. 8 (Sorting in Linear Time)", author: "Cormen, Leiserson, Rivest, Stein", type: "book" }
  - { title: "Sorting", url: "https://cp-algorithms.com/", type: "web" }
prerequisites: ["comparison-sorts"]
---

## Overview
The $\Omega(n \log n)$ lower bound applies to **comparison-based** sorting. If we can look at the keys themselves — extract digits, hash to buckets, count occurrences — we can sort in linear time, with caveats. Counting, radix, and bucket sorts are the three standard answers.

## Prerequisites
- Comparison-Based Sorts

## Core Idea
Comparison sorts use a key only as a black box: "is $a < b$?" Non-comparison sorts crack open the key. The price is that the input must satisfy assumptions: bounded integer range, fixed-width keys, or a known distribution.

## Mechanics

**Counting sort** — for integer keys in $[0, k)$:
```text
count[i] = number of input elements equal to i      # O(n + k)
prefix-sum count[] so count[i] = number ≤ i
walk input in reverse, placing each x at position count[x] - 1; decrement
```
Stable, $O(n + k)$ time, $O(n + k)$ space. Useful only when $k = O(n)$ or smaller.

**Radix sort** — for fixed-width keys (e.g., $b$-bit integers, fixed-length strings):
- LSD (least-significant-digit) radix sort: apply a stable sort (counting sort) on each digit from least to most significant.
- MSD (most-significant-digit): recurse on each bucket. Better for variable-length strings.

For $b$-bit integers split into $d$ digits of width $w$ (so $b = dw$):
- $O(d \cdot (n + 2^w))$ time. Tuning $w$ to roughly $\log n$ minimizes the cost.

**Bucket sort** — assumes keys are drawn uniformly from a known range:
- Distribute into $n$ buckets by scaling, sort each bucket (typically with insertion sort), concatenate.
- $O(n)$ expected under the uniform assumption; degrades to $O(n^2)$ if keys cluster.

## Complexity
| Sort | Time | Space | Stable | Assumption |
|---|---|---|---|---|
| Counting | $O(n + k)$ | $O(n + k)$ | Yes | Keys in $[0, k)$, small $k$ |
| Radix (LSD) | $O(d(n + b))$ | $O(n + b)$ | Yes | Fixed-width keys |
| Bucket | $O(n)$ expected | $O(n)$ | Depends | Uniformly distributed keys |

Linear time *only when the input assumption holds*. For arbitrary 64-bit integers with no structure, radix sort is $O(n \cdot d)$ where $d$ may be 8 — useful, but the constant matters.

## Common Patterns
1. **Sort integers in a known small range**: Counting sort is the simplest fast answer.
2. **Sort by composite keys**: Stable sort by least-significant key, then next, etc. Equivalent to LSD radix sort.
3. **Suffix sort an alphabet of fixed size**: Use counting / radix as a building block (the basis of $O(n \log n)$ and $O(n)$ suffix-array constructions, Tier 2).
4. **Sort floats by treating bit patterns as integers**: Reinterpret IEEE-754 floats as integers and radix-sort, after fixing the sign-bit ordering. Used in graphics.

## Pitfalls
- **Counting sort on a huge range**: If $k \gg n$, the $O(n + k)$ bound becomes $O(k)$, wasting memory and time.
- **Forgetting stability in radix**: The inner sort must be stable, or LSD radix sort produces wrong results.
- **Bucket sort on skewed data**: A pathological distribution (e.g., all keys map to one bucket) degrades to insertion sort.

## Practice
- Sort an array of integers in $[0, 10^6)$ using counting sort.
- Implement LSD radix sort for 32-bit integers.
- Use counting sort as a subroutine to compute the rank of every element.

## References
1. Cormen, Leiserson, Rivest, Stein. *Introduction to Algorithms, 4th ed.*, Chapter 8.
2. cp-algorithms.com. "Sorting".
