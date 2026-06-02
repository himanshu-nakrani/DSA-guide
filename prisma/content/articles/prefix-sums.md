---
slug: prefix-sums
title: Prefix Sums (1D and 2D)
summary: Precompute cumulative sums once so any range-sum query answers in O(1) — the simplest static range-query trick.
topicSlug: prefix-sums-and-sliding-window
level: FOUNDATION
order: 1
estimatedMins: 14
references:
  - { title: "Competitive Programmer's Handbook, Ch. 9 (Range Queries)", author: "Antti Laaksonen", type: "book" }
  - { title: "Prefix Sum Array", url: "https://cp-algorithms.com/data_structures/segment_tree.html", type: "web" }
prerequisites: ["array-fundamentals"]
---

## Overview
A prefix sum array stores cumulative totals so that any contiguous range sum can be answered in $O(1)$ after an $O(n)$ preprocessing step. It generalizes from 1D to higher dimensions and underlies many "range query without updates" problems.

## Prerequisites
- Array Fundamentals

## Core Idea
Define $P[i] = a_0 + a_1 + \cdots + a_{i-1}$, with $P[0] = 0$. Then for any range $[l, r]$:

$$
\text{sum}(l, r) = P[r+1] - P[l]
$$

Subtracting two prefix sums skips the explicit loop, turning $O(n)$ range queries into $O(1)$.

## Mechanics

**1D construction**:
```text
P[0] = 0
for i in 0..n-1:
    P[i+1] = P[i] + a[i]
```
Query `sum(l, r) = P[r+1] - P[l]`.

**2D construction** over an $m \times n$ grid $A$:
```text
P[i+1][j+1] = A[i][j] + P[i][j+1] + P[i+1][j] - P[i][j]
```
Query the rectangle $(r_1, c_1)$–$(r_2, c_2)$:
```text
sum = P[r2+1][c2+1] - P[r1][c2+1] - P[r2+1][c1] + P[r1][c1]
```
The four-term formula is the 2D analog of inclusion-exclusion.

## Complexity
- Build: $O(n)$ for 1D, $O(mn)$ for 2D.
- Query: $O(1)$ regardless of range size.
- Space: $O(n)$ or $O(mn)$ for the auxiliary table.

Prefix sums **do not support updates** efficiently. A single update is $O(n)$ for 1D because every later prefix changes. For updates plus queries, reach for a Fenwick tree or segment tree (Tier 2).

## Common Patterns
1. **Range-sum without updates**: Static arrays where many queries follow one build.
2. **Subarray sum equals K**: Use a hash map of prefix-sum frequencies. For each $P[i]$, count prior $P[j]$ with $P[i] - P[j] = K$.
3. **Difference arrays**: The "inverse" of a prefix sum. To apply many range additions, increment $D[l]$ and decrement $D[r+1]$; the final array is the prefix sum of $D$.
4. **2D image integrals**: Computer vision uses 2D prefix sums (often called "integral images") to compute box filters in $O(1)$ per pixel.

## Pitfalls
- **Off-by-one**: Decide once whether $P$ is 0-indexed of length $n+1$ or aligned with $a$ of length $n$, and stick with it. The formula changes.
- **Integer overflow**: A sum of $10^5$ values each up to $10^9$ exceeds 32-bit signed range. Use 64-bit accumulators.
- **Trying to apply to updatable arrays**: A single point update invalidates $O(n)$ prefix entries. Use a Fenwick tree instead.

## Practice
- Range Sum Query — Immutable.
- Subarray Sum Equals K.
- Range Sum Query 2D — Immutable.

## References
1. Laaksonen, Antti. *Competitive Programmer's Handbook*, Chapter 9.
2. cp-algorithms.com. "Range Queries / Prefix Sums".
