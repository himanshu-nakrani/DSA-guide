---
slug: 2d-dp-grid
title: 2D Dynamic Programming and Grid Problems
summary: When the state is two indices — typically (i, j) — and the recurrence reads adjacent cells. Unique paths, LCS, edit distance, 0/1 knapsack.
topicSlug: dynamic-programming-i
level: INTERMEDIATE
order: 3
estimatedMins: 22
references:
  - { title: "Introduction to Algorithms, 4th ed., Ch. 14 (Dynamic Programming)", author: "Cormen, Leiserson, Rivest, Stein", type: "book" }
  - { title: "Competitive Programmer's Handbook, Ch. 7", author: "Antti Laaksonen", type: "book" }
prerequisites: ["1d-dp-patterns"]
---

## Overview
2D DP problems use a state indexed by two integers — usually $(i, j)$. The recurrence reads a small number of neighboring cells. Grid path problems, sequence-pair problems (LCS, edit distance), and the 0/1 knapsack all fit this mold.

## Prerequisites
- 1D Dynamic Programming Patterns

## Core Idea
Pick the state carefully. For pair-of-sequences problems, $dp[i][j]$ usually means "the answer considering the first $i$ characters of $s$ and the first $j$ of $t$." For grid traversal, $dp[i][j]$ usually means "best result to reach cell $(i, j)$." The recurrence then expresses $dp[i][j]$ via $dp[i-1][j]$, $dp[i][j-1]$, $dp[i-1][j-1]$, or similar.

## Mechanics

**Template — fill order matters**:
```text
initialize dp[0][*] and dp[*][0] as base cases
for i in 1..n:
    for j in 1..m:
        dp[i][j] := f(dp[i-1][j], dp[i][j-1], dp[i-1][j-1], ...)
return dp[n][m]
```

**Unique paths in a grid**:
$dp[i][j] = dp[i-1][j] + dp[i][j-1]$ with $dp[0][0] = 1$.

**Longest common subsequence (LCS)** of strings $s$ and $t$:
```text
if s[i] == t[j]:
    dp[i+1][j+1] := dp[i][j] + 1
else:
    dp[i+1][j+1] := max(dp[i][j+1], dp[i+1][j])
```

**Edit distance (Levenshtein)**:
```text
if s[i] == t[j]:
    dp[i+1][j+1] := dp[i][j]
else:
    dp[i+1][j+1] := 1 + min(
        dp[i][j+1],     # delete s[i]
        dp[i+1][j],     # insert t[j]
        dp[i][j]        # substitute
    )
```

**0/1 knapsack** with capacity $W$ and $n$ items of weight $w_i$ and value $v_i$:
```text
for i in 1..n:
    for c in 0..W:
        dp[i][c] := dp[i-1][c]
        if w[i] <= c:
            dp[i][c] := max(dp[i][c], dp[i-1][c - w[i]] + v[i])
```

## Complexity
- Time: $O(nm)$ in most cases; the inner constant depends on how many neighbors the recurrence inspects.
- Space: $O(nm)$ for the full table. Frequently reducible to $O(\min(n, m))$ by keeping only the last row/column.

## Common Patterns
1. **Path counts in a grid**: with or without obstacles, with diagonals, with limited steps.
2. **Min-sum / max-sum paths**: same shape, different aggregator.
3. **Sequence alignment**: LCS, edit distance, longest common substring (slight variation).
4. **Subset / knapsack**: state $= (item index, capacity used)$.
5. **Coin change variations**: count of ways vs. fewest coins.
6. **Interval covering**: occasionally fits the 2D mold by indexing endpoints.

## Pitfalls
- **Wrong fill order**. The recurrence must read already-computed cells. Row-major top-to-bottom and left-to-right works for the templates above; off-pattern recurrences need a topological order.
- **In-place 1D rolling reads stale values**. When reducing knapsack from 2D to 1D, iterate capacity **in reverse** for 0/1 knapsack and **forward** for unbounded knapsack. Getting the direction wrong silently produces wrong answers.
- **Reconstructing the path**. The DP value alone is not the answer; if the problem asks for the sequence, store back-pointers or recompute by walking the DP table backward.
- **Off-by-one on indices**. Using 1-indexed DP with 0-indexed strings is a frequent bug source — pick a convention and stick with it.

## Practice
- Unique Paths I & II.
- Minimum Path Sum.
- Longest Common Subsequence.
- Edit Distance.
- 0/1 Knapsack.
- Partition Equal Subset Sum.
- Interleaving String.

## References
1. Cormen, Leiserson, Rivest, Stein. *Introduction to Algorithms, 4th ed.*, Chapter 14.
2. Laaksonen, Antti. *Competitive Programmer's Handbook*, Chapter 7.
