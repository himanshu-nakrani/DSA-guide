---
slug: 1d-dp-patterns
title: 1D Dynamic Programming Patterns
summary: Fibonacci, climbing stairs, house robber, longest increasing subsequence — the recurring shapes of one-dimensional DP.
topicSlug: dynamic-programming-i
level: INTERMEDIATE
order: 2
estimatedMins: 18
references:
  - { title: "Introduction to Algorithms, 4th ed., Ch. 14 (Dynamic Programming)", author: "Cormen, Leiserson, Rivest, Stein", type: "book" }
  - { title: "Competitive Programmer's Handbook, Ch. 7 (Dynamic Programming)", author: "Antti Laaksonen", type: "book" }
prerequisites: ["dp-fundamentals"]
---

## Overview
1D DP problems have a state describable by a single integer — typically a position $i$ in an array. The recurrence reads one or a small number of earlier states. These problems are the introductory tier of DP; mastering their templates makes higher-dimensional DP much easier.

## Prerequisites
- Dynamic Programming Fundamentals

## Core Idea
Define $dp[i]$ as the optimal value (count, sum, max, min) for the subproblem at index $i$. Write the recurrence in terms of $dp[i-1]$ and a few earlier entries. Then either fill iteratively (tabulation) or memoize a recursive function.

## Mechanics

**Template 1 — linear scan with constant lookback** (climbing stairs):
```text
dp[0] := base case for the empty prefix
dp[1] := base case for the single element
for i in 2..n:
    dp[i] := f(dp[i-1], dp[i-2], ..., a[i])
return dp[n]
```
Space optimization: if the recurrence only looks at the last $k$ states, drop the array and use $k$ rolling variables.

**Template 2 — every prior state matters** (longest increasing subsequence, naive):
```text
dp[i] := 1                          # the subsequence containing only a[i]
for i in 1..n-1:
    for j in 0..i-1:
        if a[j] < a[i]:
            dp[i] := max(dp[i], dp[j] + 1)
return max(dp)
```
$O(n^2)$. The $O(n \log n)$ patience-sort solution is a Tier 2 topic.

**Template 3 — partition / pick-one-of-many** (word break, decode ways):
```text
for i in 1..n:
    for each valid split j of [0..i]:
        if split [j..i] is allowed:
            dp[i] += dp[j]
```

## Complexity
- States $\times$ transitions: $O(n)$ to $O(n^2)$ depending on the recurrence.
- Space: $O(n)$ for the table; often $O(1)$ after rolling-variable optimization.

## Common Patterns
1. **Fibonacci-style**: $dp[i] = dp[i-1] + dp[i-2]$. Counting paths up stairs, ways to tile $2 \times n$.
2. **House Robber**: $dp[i] = \max(dp[i-1], dp[i-2] + a[i])$ — skip-or-take.
3. **Maximum subarray sum (Kadane's algorithm)**: $dp[i] = \max(a[i], dp[i-1] + a[i])$. Classic.
4. **Longest Increasing Subsequence**: $O(n^2)$ DP; $O(n \log n)$ with patience sort (Tier 2).
5. **Decode Ways / Word Break**: count partitions matching a constraint.
6. **Coin Change (unbounded knapsack on a 1D state)**: minimum coins to make a value.

## Pitfalls
- **Confusing "subarray" (contiguous) with "subsequence" (not contiguous)**. The DP shape differs.
- **Forgetting the base case**. $dp[0]$ usually represents the empty prefix; pick a value that makes the recurrence correct from $i = 1$.
- **Returning $dp[n-1]$ when the answer is $\max(dp)$**. For LIS-like problems the best ending isn't necessarily at the last index.
- **Rolling variables for the wrong recurrence**. If the recurrence reads $dp[i - 3]$, you need three rolling vars, not two.

## Practice
- Climbing Stairs.
- House Robber I & II.
- Maximum Subarray (Kadane's).
- Longest Increasing Subsequence.
- Coin Change.
- Word Break.
- Decode Ways.

## References
1. Cormen, Leiserson, Rivest, Stein. *Introduction to Algorithms, 4th ed.*, Chapter 14.
2. Laaksonen, Antti. *Competitive Programmer's Handbook*, Chapter 7.
