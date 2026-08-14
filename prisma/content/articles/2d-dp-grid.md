---
slug: 2d-dp-grid
title: 2D Dynamic Programming on Grids and Sequences
summary: When the state is a pair of indices, the DP becomes a table. Unique paths, LCS, edit distance, and 0/1 knapsack — the four 2D templates that cover 80% of the genre.
topicSlug: dynamic-programming-i
level: INTERMEDIATE
order: 3
estimatedMins: 24
references:
  - { title: "Introduction to Algorithms, 4th ed., Ch. 14", author: "Cormen, Leiserson, Rivest, Stein", type: "book" }
  - { title: "Competitive Programmer's Handbook, Ch. 7", author: "Antti Laaksonen", url: "https://cses.fi/book/book.pdf", type: "book" }
  - { title: "The Algorithm Design Manual, Ch. 10", author: "Steven Skiena", type: "book" }
prerequisites: ["1d-dp-patterns"]
---

## Overview
A 2D dynamic program has a state space indexed by *two* integers. The
canonical situations:

- Two sequences, and the state $(i, j)$ tracks a prefix-length pair —
  longest common subsequence, edit distance.
- One sequence and one capacity — 0/1 knapsack, subset sum.
- A 2D grid and the state $(r, c)$ is the cell — unique paths, minimum
  path sum, dungeon game.

The recurrence is almost always a *constant-time combine* of two or
three previously computed cells. Fill the table in an order that
respects the dependency arrows and the answer falls out of the corner.

Four templates cover most 2D DP problems. This article walks through
each.

## Template 1: Unique Paths — Grid Movement

State: $dp[r][c]$ = number of paths from $(0, 0)$ to $(r, c)$ moving
only down or right.

Recurrence: $dp[r][c] = dp[r-1][c] + dp[r][c-1]$.

```python
def unique_paths(m, n):
    dp = [[1] * n for _ in range(m)]
    for r in range(1, m):
        for c in range(1, n):
            dp[r][c] = dp[r-1][c] + dp[r][c-1]
    return dp[m-1][n-1]
```

Variants:

- *Unique Paths II* — obstacles. $dp[r][c] = 0$ at obstacles.
- *Minimum path sum* — max/min instead of count; same recurrence with
  weight at each cell.
- *Cherry pickup I/II* — two simultaneous paths, state becomes
  $(r_1, c_1, r_2, c_2)$ — beware the 4D blow-up.
- *Dungeon game* — fill from the bottom-right corner backward, because
  the cost is *survivability* up to the current cell.

Each can be space-optimized: $dp[r][c]$ only depends on $dp[r-1][c]$
and $dp[r][c-1]$, so a single row plus a left-neighbor suffices.

## Template 2: LCS — Two-Sequence Alignment

State: $dp[i][j]$ = LCS length of $a[0..i-1]$ and $b[0..j-1]$.

```viz
{ "type": "dp-grid", "props": { "problem": "lcs", "a": "GTCG", "b": "CTAGC" } }
```

Recurrence:

- If $a[i-1] = b[j-1]$: $dp[i][j] = dp[i-1][j-1] + 1$.
- Otherwise: $dp[i][j] = \max(dp[i-1][j], dp[i][j-1])$.

The matching-character case extends the diagonal; the mismatch case
drops one character from one of the strings.

```python
def lcs(a, b):
    m, n = len(a), len(b)
    dp = [[0] * (n + 1) for _ in range(m + 1)]
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if a[i-1] == b[j-1]:
                dp[i][j] = dp[i-1][j-1] + 1
            else:
                dp[i][j] = max(dp[i-1][j], dp[i][j-1])
    return dp[m][n]
```

Variants:

- *Longest common substring* — change `max(...)` to `0` for the
  mismatch case, and the answer is the maximum over the table.
- *Edit distance* — symmetric structure but with three predecessors
  (insert, delete, replace) and minimize.
- *Distinct subsequences* — count, not length.
- *Interleaving strings* — two source strings, one target; the table
  is binary.

## Template 3: Edit Distance

State: $dp[i][j]$ = minimum edits to transform $a[0..i-1]$ into
$b[0..j-1]$.

```viz
{ "type": "dp-grid", "props": { "problem": "edit-distance", "a": "kitten", "b": "sitting" } }
```

Recurrence:

- Base: $dp[i][0] = i$, $dp[0][j] = j$.
- If $a[i-1] = b[j-1]$: $dp[i][j] = dp[i-1][j-1]$ (no edit needed).
- Otherwise: $dp[i][j] = 1 + \min(dp[i-1][j-1], dp[i-1][j], dp[i][j-1])$
  — minimum across replace, delete, insert.

```python
def edit_distance(a, b):
    m, n = len(a), len(b)
    dp = [[0] * (n + 1) for _ in range(m + 1)]
    for i in range(m + 1): dp[i][0] = i
    for j in range(n + 1): dp[0][j] = j
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if a[i-1] == b[j-1]:
                dp[i][j] = dp[i-1][j-1]
            else:
                dp[i][j] = 1 + min(dp[i-1][j-1], dp[i-1][j], dp[i][j-1])
    return dp[m][n]
```

### Reconstruct the edit sequence

The distance is only the score. To recover the actual sequence of
matches, insertions, deletions, and replacements, keep the completed table
and walk backward from `dp[m][n]`. At each cell, choose a predecessor that
satisfies the recurrence; the interaction below makes that backtracking
path explicit and lists the recovered operations in forward order.

```viz
{ "type": "edit-path-reconstructor", "props": { "a": "kitten", "b": "sitting" } }
```

For long strings with small expected edit distance, the *banded* DP
restricts $|i - j| \le k$ for a known bound $k$, giving $O(nk)$
instead of $O(n^2)$.

## Template 4: 0/1 Knapsack

State: $dp[i][j]$ = best value using items $1..i$ with capacity $j$.

```viz
{ "type": "dp-grid", "props": { "problem": "knapsack", "weights": [2, 3, 4, 5], "values": [3, 4, 5, 6], "capacity": 7 } }
```

Recurrence:

- If $w_i > j$: $dp[i][j] = dp[i-1][j]$ (item won't fit).
- Otherwise: $dp[i][j] = \max(dp[i-1][j], dp[i-1][j - w_i] + v_i)$.

```python
def knapsack(weights, values, C):
    n = len(weights)
    dp = [[0] * (C + 1) for _ in range(n + 1)]
    for i in range(1, n + 1):
        for j in range(C + 1):
            dp[i][j] = dp[i-1][j]
            if weights[i-1] <= j:
                dp[i][j] = max(dp[i][j], dp[i-1][j - weights[i-1]] + values[i-1])
    return dp[n][C]
```

Variants:

- *Subset sum / partition equal* — binary "can we reach exactly $j$?"
- *Target sum* — count of ways with $\pm$ signs.
- *Last stone weight II* — partition into two subsets minimizing the
  difference; reduces to subset sum.
- *Unbounded knapsack* — each item can be chosen many times; recurrence
  uses $dp[i]$ instead of $dp[i-1]$ on the include branch. Same shape
  as coin change.

## Memory Compression

In nearly every 2D DP, cell $(i, j)$ depends only on the *previous row*
plus the *current row to the left*. So a one-dimensional rolling
buffer suffices:

```python
# knapsack with rolling buffer
def knapsack_rolled(weights, values, C):
    dp = [0] * (C + 1)
    for i in range(len(weights)):
        # iterate capacity backwards so we don't reuse the same item
        for j in range(C, weights[i] - 1, -1):
            dp[j] = max(dp[j], dp[j - weights[i]] + values[i])
    return dp[C]
```

The backward iteration is crucial — going forward would let the same
item contribute twice.

```viz
{ "type": "callout", "props": {
  "tone": "intuition",
  "title": "When you can roll, do",
  "body": "If dp[i][j] depends on dp[i-1][*] and dp[i][* < j], you can replace the 2D array with a 1D one. Saves memory by a factor of m or n. Reconstructing the optimal *sequence* — not just the value — requires the full table, so don't roll if you need to backtrack."
} }
```

## A Routing Table

| Problem reads like…                                   | Template                  |
| ----------------------------------------------------- | ------------------------- |
| "ways to traverse a grid from corner to corner"       | Unique Paths              |
| "longest common subsequence / shared structure"       | LCS                       |
| "minimum edits to transform one string into another"  | Edit Distance             |
| "select items with capacity / weight constraint"      | Knapsack                  |
| "count subsets summing to k"                          | Knapsack (binary variant) |
| "match an input against a pattern / regex"            | LCS-shape                 |

## Pitfalls

```viz
{ "type": "callout", "props": {
  "tone": "pitfall",
  "title": "Index alignment between string and table",
  "body": "If dp[i][j] uses prefixes a[0..i-1] and b[0..j-1], the table is size (m+1) × (n+1), not m × n. The +1 leaves room for the empty prefix. Confusing the two by 1 is the most common index bug in 2D string DP."
} }
```

```viz
{ "type": "callout", "props": {
  "tone": "pitfall",
  "title": "Wrong rolling direction in knapsack",
  "body": "0/1 knapsack on a 1D rolling buffer requires iterating capacity from high to low. Going forward turns it into unbounded knapsack — same code, different problem. The direction is the bookkeeping that says 'this item is used at most once'."
} }
```

```viz
{ "type": "callout", "props": {
  "tone": "pitfall",
  "title": "Reconstructing the answer needs the full table",
  "body": "Rolling-buffer DP gives you the optimal value but loses the trace. If you need the actual subsequence, sequence of operations, or path, keep the full 2D table and walk it backwards from dp[m][n]."
} }
```

## Practice
- Unique paths I and II.
- Minimum path sum on a grid.
- Longest common subsequence — value, then reconstruct the actual
  subsequence.
- Edit distance — and Damerau-Levenshtein as an extension.
- 0/1 knapsack — both 2D and rolled.
- Subset sum, then partition equal subset.
- Distinct subsequences (count of $a$'s subsequences equal to $b$).
- Dungeon game.

## References
1. Cormen, Leiserson, Rivest, Stein. *Introduction to Algorithms, 4th ed.*, Chapter 14.
2. Laaksonen. *Competitive Programmer's Handbook*, Chapter 7.
3. Skiena. *The Algorithm Design Manual*, Chapter 10.
