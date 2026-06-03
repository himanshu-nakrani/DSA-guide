---
slug: dp-fundamentals
title: Dynamic Programming Fundamentals
summary: Optimal substructure plus overlapping subproblems — when memoization or tabulation turns exponential time into polynomial.
topicSlug: dynamic-programming-i
level: INTERMEDIATE
order: 1
estimatedMins: 25
references:
  - { title: "Introduction to Algorithms, 4th ed., Ch. 14", author: "Cormen, Leiserson, Rivest, Stein", type: "book" }
  - { title: "Competitive Programmer's Handbook, Ch. 7", author: "Antti Laaksonen", url: "https://cses.fi/book/book.pdf", type: "book" }
  - { title: "The Algorithm Design Manual, Ch. 10", author: "Steven Skiena", type: "book" }
prerequisites: ["recursion-fundamentals"]
---

## Overview
Dynamic programming is the discipline of solving a problem by combining
solutions to overlapping subproblems. Two properties have to hold for it to
apply:

1. **Optimal substructure** — the optimal answer can be assembled from
   optimal answers to smaller instances of the same problem.
2. **Overlapping subproblems** — the recursive decomposition re-asks the
   same questions many times. Without overlap, plain divide-and-conquer is
   cheaper.

When both hold, DP exchanges *time* (recomputation) for *space* (a cache).
Problems that look $O(2^n)$ collapse to $O(n)$ or $O(n^2)$ — the gulf
between exponential and polynomial is, in practice, the entire point.

## The Canonical Failure: Naive Fibonacci

`fib(n) = fib(n - 1) + fib(n - 2)` is a recurrence everyone has seen. The
naive recursion is also the textbook example of what DP fixes:

```viz
{ "type": "recursion-tree", "props": { "n": 6, "memoized": false } }
```

Notice how `fib(3)` appears three times, `fib(2)` five times. Every
recomputation is wasted work. The tree has roughly $\Phi^n$ nodes — pure
exponential blow-up.

Now memoize: cache `fib(k)` the first time we compute it. Every subsequent
call to `fib(k)` is a hit.

```viz
{ "type": "recursion-tree", "props": { "n": 6, "memoized": true } }
```

The tree collapses to one path of recursive calls plus cache hits — $O(n)$
total work, $O(n)$ space.

## Two Idioms: Top-Down vs. Bottom-Up

The same recurrence can be implemented in two superficially different but
equivalent ways.

**Top-down (memoization)** — write the natural recursion, then add a cache.

```python
from functools import lru_cache

@lru_cache(None)
def fib(n):
    if n <= 1: return n
    return fib(n - 1) + fib(n - 2)
```

**Bottom-up (tabulation)** — loop from the base cases up to the answer.

```python
def fib(n):
    if n <= 1: return n
    dp = [0] * (n + 1)
    dp[1] = 1
    for i in range(2, n + 1):
        dp[i] = dp[i - 1] + dp[i - 2]
    return dp[n]
```

```viz
{ "type": "callout", "props": {
  "tone": "intuition",
  "title": "Which form to reach for",
  "body": "Top-down is easier to write directly from the recurrence — useful when the state space is sparse or the recursion's natural order is irregular. Bottom-up is easier to reason about for space (you can often discard old rows) and slightly faster in tight loops because there is no recursion overhead. They give the same answers."
} }
```

## The Three-Step Discipline

When you face a new DP problem, work it in this order. Skipping any step
is the most common way to ship a wrong solution.

1. **Define the state.** Write down, in English, exactly what `dp[i]` (or
   `dp[i][j]`, or `dp[i][j][k]`) means. *"Length of the longest increasing
   subsequence ending at index i."* If you cannot finish that sentence
   precisely, the rest of the work is wasted.
2. **Write the recurrence.** Express `dp[i]` in terms of strictly smaller
   subproblems. Identify the base cases — the smallest values you can
   fill in directly.
3. **Pick a fill order.** Make sure every dependency is computed before
   the cell that needs it. For 1D DP this is usually left-to-right; for
   2D it is often row-by-row.

```viz
{ "type": "callout", "props": {
  "tone": "pitfall",
  "title": "Skipping step 1 will cost you the problem",
  "body": "Half of all DP debugging is discovering, three pages of code in, that the state you defined was not quite the state you needed. Spend the five minutes up front to nail down the meaning of dp[i]."
} }
```

## A Full Worked Example: Longest Common Subsequence

Given two strings $a$ and $b$, find the length of the longest sequence of
characters that appears (not necessarily contiguously) in both. The state:

$$dp[i][j] = \text{LCS length of } a[0..i-1] \text{ and } b[0..j-1].$$

The recurrence, by examining the last characters:

$$dp[i][j] = \begin{cases}
0 & i = 0 \text{ or } j = 0 \\
dp[i-1][j-1] + 1 & a[i-1] = b[j-1] \\
\max(dp[i-1][j], dp[i][j-1]) & \text{otherwise}
\end{cases}$$

Watch the table fill row by row:

```viz
{ "type": "dp-grid", "props": { "problem": "lcs", "a": "GTCG", "b": "CTAGC" } }
```

The answer sits at $dp[|a|][|b|]$. Total time $\Theta(|a| \cdot |b|)$,
space $\Theta(|a| \cdot |b|)$ — or $\Theta(\min(|a|, |b|))$ if you only
need the length and roll two rows.

## 0/1 Knapsack

Given items each with weight $w_i$ and value $v_i$, and a knapsack of
capacity $C$, maximize total value without exceeding $C$. State:

$$dp[i][j] = \text{best value using items}\ 1..i\ \text{with capacity}\ j.$$

```viz
{ "type": "dp-grid", "props": { "problem": "knapsack", "weights": [2, 3, 4, 5], "values": [3, 4, 5, 6], "capacity": 7 } }
```

Each cell either includes item $i$ (if it fits) or skips it; the maximum
of the two options is the answer. The decision-tree analog has $2^n$
leaves; DP collapses it to $n \cdot C$ cells.

## The Mental Model: A DAG of Subproblems

Underneath every DP is a *directed acyclic graph* of subproblems. Each
cell is a vertex; each cell's dependencies are its in-edges. The DP
algorithm is a topological order traversal of that DAG, computing each
cell once.

```viz
{ "type": "architecture", "props": {
  "caption": "DP, viewed as solving a DAG of subproblems",
  "cols": 12, "rows": 4, "height": 280,
  "boxes": [
    { "id": "p",  "label": "the problem", "sub": "f(n)", "col": 0, "row": 0, "colSpan": 3, "emphasis": "primary" },
    { "id": "s1", "label": "subproblem", "sub": "f(n-1)", "col": 5, "row": 0, "colSpan": 3 },
    { "id": "s2", "label": "subproblem", "sub": "f(n-2)", "col": 5, "row": 2, "colSpan": 3 },
    { "id": "b1", "label": "base case", "sub": "f(0), f(1)", "col": 9, "row": 1, "colSpan": 3, "emphasis": "muted" }
  ],
  "arrows": [
    { "from": "p",  "to": "s1" },
    { "from": "p",  "to": "s2" },
    { "from": "s1", "to": "b1" },
    { "from": "s2", "to": "b1" }
  ]
} }
```

That picture explains why memoization saves work: in the original
recursion the DAG is traversed many times (once for each path from the
root to a base case); the cache turns it into a single visit per vertex.

## Memory Compression

Many DPs only look back a constant number of rows. When that's true, you
can drop the table down to a 1D rolling buffer:

```python
# 1D rolling buffer for LCS length (not reconstruction)
prev = [0] * (m + 1)
for i in range(1, n + 1):
    curr = [0] * (m + 1)
    for j in range(1, m + 1):
        if a[i-1] == b[j-1]:
            curr[j] = prev[j-1] + 1
        else:
            curr[j] = max(prev[j], curr[j-1])
    prev = curr
```

This costs $\Theta(\min(|a|, |b|))$ space instead of $\Theta(|a| \cdot |b|)$,
which is the difference between a 10-megabyte and a 10-gigabyte allocation
on real inputs. The price: you cannot reconstruct the optimal sequence
without keeping the full table.

## When DP Is *Not* the Right Tool

```viz
{ "type": "callout", "props": {
  "tone": "pitfall",
  "title": "DP needs overlap",
  "body": "Pure divide-and-conquer (merge sort, quicksort) breaks the problem into disjoint subproblems. Adding memoization buys you nothing because no subproblem repeats. DP only earns its keep when the recursion tree has shared subtrees."
} }
```

```viz
{ "type": "callout", "props": {
  "tone": "pitfall",
  "title": "DP needs optimal substructure",
  "body": "Some problems look DP-shaped but aren't: 'longest simple path in a general graph' does not have optimal substructure (composing two optimal paths can repeat vertices). That problem is NP-hard."
} }
```

## Practice
- Climbing Stairs ($O(n)$ time, $O(1)$ space after rolling buffer).
- Coin change — minimum coins for a target amount.
- Longest increasing subsequence in $O(n^2)$, then $O(n \log n)$.
- House Robber I and II (handle the circular case).
- Edit distance (the workhorse 2D DP — also visualizable with `problem: "edit-distance"`).

## References
1. Cormen, Leiserson, Rivest, Stein. *Introduction to Algorithms, 4th ed.*, Chapter 14.
2. Laaksonen. *Competitive Programmer's Handbook*, Chapter 7.
3. Skiena. *The Algorithm Design Manual*, Chapter 10.
