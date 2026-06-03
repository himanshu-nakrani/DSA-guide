---
slug: prefix-sums
title: Prefix Sums (1D and 2D)
summary: Precompute cumulative sums so any range-sum query answers in O(1) — the simplest static range-query trick and the foundation of every Fenwick tree you will ever write.
topicSlug: prefix-sums-and-sliding-window
level: FOUNDATION
order: 1
estimatedMins: 18
references:
  - { title: "Competitive Programmer's Handbook, Ch. 9 (Range Queries)", author: "Antti Laaksonen", url: "https://cses.fi/book/book.pdf", type: "book" }
  - { title: "Prefix Sum Array", url: "https://cp-algorithms.com/data_structures/prefix_sum.html", type: "web" }
prerequisites: ["array-fundamentals"]
---

## Overview
Prefix sums are the simplest example of a recurring algorithmic trade:
*spend $O(n)$ preprocessing to answer many subsequent queries in
$O(1)$*. When the queries are range sums of a static array, prefix sums
are unbeatable — no smarter structure improves the asymptotic bounds.

The technique generalizes from sums to any *invertible aggregate*
(products of nonzero numbers, XORs, sums modulo a prime) and from one
dimension to two and beyond. Beyond range queries, prefix sums are the
bookkeeping trick behind difference arrays, equilibrium-index
problems, and a long tail of subarray-sum patterns.

## The 1D Construction

Given $A[0..n-1]$, define the prefix-sum array $P[0..n]$ by

$$P[i] = A[0] + A[1] + \cdots + A[i-1], \qquad P[0] = 0.$$

Then the sum of the subarray $A[l..r-1]$ is

$$\text{sum}(l, r) = P[r] - P[l].$$

The half-open convention $[l, r)$ matters: it makes the formula
symmetric and avoids the off-by-one bug that catches everyone the first
time they write this.

```python
def build_prefix(A):
    P = [0] * (len(A) + 1)
    for i in range(len(A)):
        P[i + 1] = P[i] + A[i]
    return P

def range_sum(P, l, r):     # sum of A[l..r-1]
    return P[r] - P[l]
```

```viz
{ "type": "callout", "props": {
  "tone": "intuition",
  "title": "Why the extra slot",
  "body": "P has n+1 entries so that P[0] = 0 is a valid sentinel for empty prefixes. Without it, range_sum(0, k) has to special-case 'starts at the beginning'. With it, every range query is one subtraction, no branches."
} }
```

## A Worked Example

Take $A = [3, 1, 4, 1, 5, 9, 2, 6]$. The prefix array is $P = [0, 3, 4,
8, 9, 14, 23, 25, 31]$.

- Sum of $A[2..5]$ (the slice $[4, 1, 5]$): $P[5] - P[2] = 14 - 4 = 10$.
- Sum of the whole array: $P[8] - P[0] = 31$.
- Sum of the empty range $A[3..3)$: $P[3] - P[3] = 0$.

The third case is the reason for the sentinel.

## Cost

| Step           | Cost          |
| -------------- | ------------- |
| Build $P$      | $\Theta(n)$   |
| Each query     | $\Theta(1)$   |
| Memory         | $\Theta(n)$   |

If you only ever query once, building $P$ is overkill — a single pass
sums the range in $\Theta(n)$. Prefix sums earn their keep when queries
outnumber the build, which is almost always the case in interview
problems and competitive programming.

## 2D Prefix Sums

The same idea, one dimension up. For a matrix $A[r][c]$, build

$$P[r][c] = \sum_{i < r, j < c} A[i][j],$$

and any axis-aligned rectangle sum is *inclusion-exclusion* on four
prefix lookups:

$$\text{sum}(r_1, c_1, r_2, c_2) = P[r_2][c_2] - P[r_1][c_2] - P[r_2][c_1] + P[r_1][c_1].$$

The fourth term corrects for the rectangle that gets subtracted twice.

```viz
{ "type": "architecture", "props": {
  "caption": "2D prefix sums: every rectangle is four lookups",
  "cols": 12, "rows": 4, "height": 280,
  "boxes": [
    { "id": "tl", "label": "P[r1][c1]", "sub": "added (top-left over-subtracted)", "col": 0, "row": 0, "colSpan": 4, "emphasis": "primary" },
    { "id": "tr", "label": "P[r1][c2]", "sub": "subtracted (extends to top)", "col": 8, "row": 0, "colSpan": 4, "emphasis": "warn" },
    { "id": "bl", "label": "P[r2][c1]", "sub": "subtracted (extends to left)", "col": 0, "row": 3, "colSpan": 4, "emphasis": "warn" },
    { "id": "br", "label": "P[r2][c2]", "sub": "added (full prefix)", "col": 8, "row": 3, "colSpan": 4, "emphasis": "primary" },
    { "id": "ans", "label": "rectangle sum = br - tr - bl + tl", "col": 4, "row": 1, "colSpan": 4, "rowSpan": 2 }
  ]
} }
```

Build cost is $\Theta(rc)$; each rectangle query is $\Theta(1)$ — four
table lookups and three arithmetic operations.

The build itself is also a 2D recurrence:

$$P[r][c] = A[r-1][c-1] + P[r-1][c] + P[r][c-1] - P[r-1][c-1].$$

Same inclusion-exclusion, applied to the prefix-of-prefix.

## Beyond Sums: Difference Arrays

The mirror trick. If you want to apply many *range updates* (add 3 to
$A[l..r]$, then 7 to $A[l'..r']$, etc.) and read out the final array at
the end, maintain a *difference* array $D$:

```python
def range_add(D, l, r, v):
    D[l] += v
    D[r] -= v

def materialize(D):
    A = [0] * len(D)
    running = 0
    for i in range(len(D)):
        running += D[i]
        A[i] = running
    return A
```

Each update is $\Theta(1)$. The final materialization is one $\Theta(n)$
pass. For $q$ updates and one read, total work is $\Theta(n + q)$ —
linear instead of $\Theta(nq)$.

## When Prefix Sums Don't Help

```viz
{ "type": "callout", "props": {
  "tone": "pitfall",
  "title": "Mutable arrays break the static assumption",
  "body": "Prefix sums assume the underlying array doesn't change. If you need point updates plus range queries on the same structure, prefix sums are wrong — every update invalidates O(n) prefix entries. Reach for a Fenwick tree (binary indexed tree) or segment tree, both O(log n) per operation."
} }
```

```viz
{ "type": "callout", "props": {
  "tone": "pitfall",
  "title": "Non-invertible aggregates",
  "body": "Prefix-min and prefix-max do not support range queries via subtraction — you can't undo a min. For range-min over a static array use sparse tables (O(1) query after O(n log n) preprocessing); for mutable, segment trees."
} }
```

```viz
{ "type": "callout", "props": {
  "tone": "pitfall",
  "title": "Integer overflow",
  "body": "Sums of 10^5 entries each up to 10^9 overflow 32-bit. Default to 64-bit (long long, i64) for the prefix array unless you've checked the bounds yourself."
} }
```

## Hash Map of Prefix Sums

A frequent combination: "count subarrays with sum equal to $k$". Use the
fact that $\text{sum}(l, r) = P[r] - P[l]$. The question becomes: for
each $r$, how many indices $l < r$ have $P[l] = P[r] - k$? A hash map
of prefix-value frequencies answers this in $\Theta(n)$ total.

```python
def count_subarrays_with_sum(A, k):
    P = 0
    freq = {0: 1}
    count = 0
    for x in A:
        P += x
        count += freq.get(P - k, 0)
        freq[P] = freq.get(P, 0) + 1
    return count
```

This pattern — *prefix sums plus a hash map* — generalizes to many
problems and is worth memorizing.

## Practice
- Build a 1D prefix sum and answer 10⁵ random range queries.
- Implement a 2D prefix sum and compute the sum of every $k \times k$
  submatrix.
- Count subarrays with sum equal to $k$ using the hash-map trick.
- Given an array of 0s and 1s, find the longest subarray with equal
  zeros and ones. (Hint: replace 0 with $-1$ and look at prefix sums.)
- Find the equilibrium index — the index where the sum of elements to
  its left equals the sum to its right.

## References
1. Laaksonen. *Competitive Programmer's Handbook*, Chapter 9.
2. cp-algorithms.com. "Prefix Sum Array."
