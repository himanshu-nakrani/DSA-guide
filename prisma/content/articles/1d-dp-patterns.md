---
slug: 1d-dp-patterns
title: 1D Dynamic Programming Patterns
summary: The six recurring templates that turn most 1D DP problems into fill-in-the-blanks — Fibonacci, house robber, Kadane, LIS, coin change, and partition counters.
topicSlug: dynamic-programming-i
level: INTERMEDIATE
order: 2
estimatedMins: 22
references:
  - { title: "Introduction to Algorithms, 4th ed., Ch. 14", author: "Cormen, Leiserson, Rivest, Stein", type: "book" }
  - { title: "Competitive Programmer's Handbook, Ch. 7", author: "Antti Laaksonen", url: "https://cses.fi/book/book.pdf", type: "book" }
  - { title: "The Algorithm Design Manual, Ch. 10", author: "Steven Skiena", type: "book" }
prerequisites: ["dp-fundamentals"]
---

## Overview
A 1D dynamic program has a state space indexed by a single integer:
$dp[i]$ holds the answer for a prefix of length $i$, an index $i$, or
a quantity $i$. Most 1D DP problems are instances of one of six
templates. Once you recognize which, the recurrence almost writes
itself.

This article catalogs the six. For each: the shape of the state, the
recurrence, the rolling-buffer space optimization, and an example
problem.

## The Six Templates

```viz
{ "type": "architecture", "props": {
  "caption": "1D DP — six recurring templates",
  "cols": 12, "rows": 4, "height": 280,
  "boxes": [
    { "id": "fib", "label": "Fibonacci", "sub": "dp[i] depends on dp[i-1], dp[i-2]", "col": 0, "row": 0, "colSpan": 4, "emphasis": "primary" },
    { "id": "rob", "label": "House Robber", "sub": "include or skip current item", "col": 4, "row": 0, "colSpan": 4, "emphasis": "primary" },
    { "id": "kad", "label": "Kadane", "sub": "extend or restart at i", "col": 8, "row": 0, "colSpan": 4, "emphasis": "primary" },
    { "id": "lis", "label": "LIS", "sub": "extend any compatible predecessor", "col": 0, "row": 2, "colSpan": 4, "emphasis": "primary" },
    { "id": "coin", "label": "Coin Change", "sub": "achieve amount i with one coin choice", "col": 4, "row": 2, "colSpan": 4, "emphasis": "primary" },
    { "id": "part", "label": "Partition Count", "sub": "count ways to reach i", "col": 8, "row": 2, "colSpan": 4, "emphasis": "primary" }
  ]
} }
```

## Template 1: Fibonacci-Shape

State: $dp[i]$ depends on a constant-bounded window of earlier values.

```python
def climb_stairs(n):
    if n <= 2: return n
    a, b = 1, 2
    for _ in range(3, n + 1):
        a, b = b, a + b
    return b
```

- *Climbing stairs* — $dp[i] = dp[i-1] + dp[i-2]$.
- *Decode ways* — $dp[i]$ uses $dp[i-1]$ (single char) and $dp[i-2]$
  (two chars), depending on whether they form a valid encoding.
- *Min cost climbing stairs* — same window, min instead of sum.

Space drops trivially from $O(n)$ to $O(1)$: keep only the last few
values.

```viz
{ "type": "recursion-tree", "props": { "n": 6, "memoized": true } }
```

The memoized fib above is the same shape — every Fibonacci-template
problem has a recursion tree that collapses to a single linear path
under memoization.

## Template 2: House Robber — Include or Skip

State: $dp[i]$ = best answer considering items $0..i$. Choice: include
item $i$ (and skip $i - 1$) or skip item $i$.

```python
def rob(A):
    prev2, prev1 = 0, 0
    for x in A:
        prev2, prev1 = prev1, max(prev1, prev2 + x)
    return prev1
```

### Predict the include-or-skip decision

At each index, the recurrence compares two legal futures. Choose the branch
first, then reveal how the rolling variables preserve the two states needed by
the next index. Switch to Kadane mode to see the same interaction pattern
with the different “extend or restart” decision.

```viz
{ "type": "dp-decision-trace", "props": {
  "caption": "House Robber: predict the include-or-skip branch",
  "mode": "house-robber",
  "values": [2, 7, 9, 3, 1]
} }
```

- *House Robber I* — straight array.
- *House Robber II* — circular; run twice, once excluding the first
  item and once excluding the last, take the maximum.
- *Delete and earn* — bucket by value, then this template on the
  bucketed counts.
- *Best time to buy and sell stock with cooldown* — three-state
  variant: holding, free, cooling.

## Template 3: Kadane — Extend or Restart

State: $dp[i]$ = best subarray ending exactly at $i$. Choice: extend
the previous best or start fresh at $i$.

```python
def max_subarray(A):
    best = curr = A[0]
    for x in A[1:]:
        curr = max(x, curr + x)
        best = max(best, curr)
    return best
```

- *Maximum subarray sum* — classic Kadane.
- *Maximum product subarray* — track both min and max because negatives
  flip the order.
- *Best time to buy and sell stock* — Kadane on the difference array.
- *Longest valid parentheses* — Kadane shape on validity counts.

## Template 4: LIS — Extend Any Compatible Predecessor

State: $dp[i]$ = best chain ending at $i$. Recurrence inspects *all*
earlier $j < i$ where $j$ is a valid predecessor.

```python
def lis(A):
    n = len(A)
    dp = [1] * n
    for i in range(n):
        for j in range(i):
            if A[j] < A[i]:
                dp[i] = max(dp[i], dp[j] + 1)
    return max(dp)
```

$O(n^2)$ as written. For LIS specifically, a clever patience-sorting
algorithm using binary search gets it to $O(n \log n)$.

- *Longest increasing subsequence.*
- *Longest divisible subset* — extend if `A[i] % A[j] == 0` (after
  sorting).
- *Russian doll envelopes* — sort by one dimension, LIS on the other.
- *Largest sum increasing subsequence* — same shape, optimize sum
  instead of count.

## Template 5: Coin Change — Unbounded Choices

State: $dp[i]$ = best answer for amount/target $i$ using any
combination of items. Recurrence iterates over the item choices.

```python
def coin_change(coins, amount):
    INF = float("inf")
    dp = [INF] * (amount + 1)
    dp[0] = 0
    for i in range(1, amount + 1):
        for c in coins:
            if c <= i and dp[i - c] + 1 < dp[i]:
                dp[i] = dp[i - c] + 1
    return -1 if dp[amount] == INF else dp[amount]
```

- *Coin change* (minimum coins).
- *Perfect squares* (fewest squares summing to $n$).
- *Word break* (true if a prefix of length $i$ can be segmented).
- *Integer break* (max product of an integer partition).

## Template 6: Partition Count — Number of Ways

State: $dp[i]$ = *count* of ways to achieve $i$. Recurrence sums over
the previous states that can reach $i$.

```python
def coin_change_ways(coins, amount):
    dp = [0] * (amount + 1)
    dp[0] = 1
    for c in coins:           # outer loop on coins for combinations
        for i in range(c, amount + 1):
            dp[i] += dp[i - c]
    return dp[amount]
```

The order of the two loops matters:

- Outer over coins, inner over amount → *combinations* (order does
  not matter).
- Outer over amount, inner over coins → *permutations* (order
  matters).

Pick consciously. The two answers are wildly different.

- *Coin change II* (combination count).
- *Climb stairs ways* with variable step sizes.
- *Number of ways to make change.*
- *Decode ways* (the count variant of template 1).

```viz
{ "type": "callout", "props": {
  "tone": "intuition",
  "title": "Loop order encodes ordering semantics",
  "body": "Counting subsets uses outer-coin loops — each coin is offered once and the inner loop assigns it across amounts. Counting sequences uses outer-amount loops — each amount tries every coin. Same recurrence, different ordering, different answer."
} }
```

## A Routing Table

| Problem reads like…                                  | Template               |
| ---------------------------------------------------- | ---------------------- |
| "ways to climb stairs", "ways to decode"             | Fibonacci              |
| "max value with no two adjacent items"               | House Robber           |
| "max subarray sum or product"                        | Kadane                 |
| "longest chain / longest increasing"                 | LIS                    |
| "fewest items summing to target"                     | Coin Change            |
| "count ways to make target"                          | Partition Count        |

When in doubt, write the brute-force recursion, identify which earlier
indices it consults, and the template usually becomes obvious.

## Pitfalls

```viz
{ "type": "callout", "props": {
  "tone": "pitfall",
  "title": "Off-by-one on the base case",
  "body": "dp[0] usually means 'before doing anything'. Setting dp[0] wrong propagates everywhere. Coin change: dp[0] = 0 (zero coins for amount 0). Coin change ways: dp[0] = 1 (one way — choose nothing). Sloppy initialization is the most common DP bug."
} }
```

```viz
{ "type": "callout", "props": {
  "tone": "pitfall",
  "title": "Inner-outer loop order in partition counts",
  "body": "Counting subsets versus sequences hinges on which loop is outer. Get it backwards and the answer is wildly wrong, not just off by a factor. Always articulate which semantics you want before writing the loops."
} }
```

```viz
{ "type": "callout", "props": {
  "tone": "pitfall",
  "title": "LIS is O(n log n) with patience sorting",
  "body": "The O(n²) DP is fine for n = 10^3. At n = 10^5, you need the binary-search variant: maintain the tails array and binary-search the insertion point. Same answer, much faster."
} }
```

## Practice
- Climbing stairs in $O(1)$ space.
- House robber I and II.
- Maximum subarray (Kadane).
- LIS in $O(n^2)$ and then $O(n \log m)$.
- Coin change (minimum coins) and coin change II (number of ways).
- Word break (segment a string with a dictionary).
- Decode ways.
- Best time to buy and sell stock with cooldown.

## References
1. Cormen, Leiserson, Rivest, Stein. *Introduction to Algorithms, 4th ed.*, Chapter 14.
2. Laaksonen. *Competitive Programmer's Handbook*, Chapter 7.
3. Skiena. *The Algorithm Design Manual*, Chapter 10.
