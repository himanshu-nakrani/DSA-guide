---
slug: greedy-fundamentals
title: Greedy Algorithms
summary: "Making the locally optimal choice at every step — and proving it leads to the global optimum. The exchange argument, the guts of activity selection, Huffman coding, and the coin-change pitfall that teaches caution."
topicSlug: greedy
level: INTERMEDIATE
order: 1
estimatedMins: 22
references:
  - { title: "Introduction to Algorithms, 4th ed., Ch. 15", author: "Cormen, Leiserson, Rivest, Stein", type: "book" }
  - { title: "The Algorithm Design Manual, Ch. 1", author: "Steven Skiena", type: "book" }
  - { title: "Algorithms, 4th ed., Ch. 4.3", author: "Sedgewick & Wayne", type: "book" }
prerequisites: ["asymptotic-notation", "comparison-sorts"]
---

## Overview
A *greedy* algorithm builds a solution one piece at a time, always
making the choice that looks best *right now*, with no backtracking
and no lookahead. When the greedy choice leads to a globally optimal
answer, the algorithm is shorter, faster, and cleaner than DP. When
it doesn't, the algorithm is wrong — and the failure mode is usually
silent.

The art of greedy algorithms is not writing them. It is *proving they
work*. Two techniques — the exchange argument and the inductive proof
of the greedy-choice property — separate problems where greedy is the
right tool from problems where it is a trap.

## When Greedy Works

A problem admits a greedy solution iff it has two properties:

- **Greedy-choice property.** A globally optimal solution can be
  constructed by making locally optimal greedy choices.
- **Optimal substructure.** Once a greedy choice is made, the
  remaining subproblem is itself an instance of the original, and an
  optimal solution to that subproblem combined with the greedy choice
  yields a global optimum.

Optimal substructure is shared with DP. The difference is the
greedy-choice property: with DP you consider many choices; with greedy
you commit to one without looking back.

```viz
{ "type": "callout", "props": {
  "tone": "intuition",
  "title": "Greedy is a special case of DP",
  "body": "DP considers every choice at every step. Greedy commits to one. When the locally best choice is provably the globally right one, you skip the DP and save the time. Most of the work in a greedy proof is showing that you really can skip the DP."
} }
```

## The Exchange Argument

The most common proof technique. Suppose your greedy algorithm
produces solution $G$ and there is an optimal solution $O \ne G$. Show
that you can *transform* $O$ into something at least as good by
swapping in a greedy choice. Repeat until $O$ has been turned into
$G$. Conclude $G$ is also optimal.

Concretely:

1. Suppose $G$ and $O$ disagree at the first step.
2. Show that swapping the first choice in $O$ for the greedy choice
   does not make $O$ worse.
3. The transformed $O$ now agrees with $G$ on one more position.
4. By induction, $O$ can be transformed into $G$ without losing
   optimality. Hence $G$ is optimal.

The classic example follows.

## Activity Selection

Given $n$ activities each with a start and finish time, schedule the
maximum number of non-overlapping activities on a single resource.

**Greedy:** sort by *finish time* (ascending). Pick the first one;
skip everything that overlaps it; pick the next compatible one;
repeat.

```python
def activity_selection(activities):
    activities.sort(key=lambda a: a[1])     # by finish time
    chosen = []
    last_finish = -float("inf")
    for start, finish in activities:
        if start >= last_finish:
            chosen.append((start, finish))
            last_finish = finish
    return chosen
```

**Proof (exchange).** Let $O$ be an optimal solution. Let $g$ be the
activity with the earliest finish time across all activities, and let
$o_1$ be the first activity in $O$. If $g = o_1$, we agree. Otherwise,
$g$ finishes no later than $o_1$, so swapping $o_1$ for $g$ in $O$
still gives a feasible solution of the same size. The remaining
problem (activities not conflicting with $g$) has $|O| - 1$ chosen
activities; by induction, the greedy completion is optimal. $\square$

Sorting is $O(n \log n)$; the linear scan is $O(n)$. Total
$O(n \log n)$.

```viz
{ "type": "architecture", "props": {
  "caption": "Activity selection — the greedy rule",
  "cols": 12, "rows": 4, "height": 280,
  "boxes": [
    { "id": "in",   "label": "input", "sub": "(start, finish) pairs", "col": 0, "row": 0, "colSpan": 4, "emphasis": "muted" },
    { "id": "sort", "label": "sort by finish time", "col": 4, "row": 0, "colSpan": 4, "emphasis": "primary" },
    { "id": "scan", "label": "scan once, picking compatible", "col": 8, "row": 0, "colSpan": 4, "emphasis": "primary" },
    { "id": "why",  "label": "exchange argument", "sub": "finishing earliest leaves the most room for future activities", "col": 2, "row": 2, "colSpan": 8, "rowSpan": 2 }
  ],
  "arrows": [
    { "from": "in",   "to": "sort" },
    { "from": "sort", "to": "scan" },
    { "from": "scan", "to": "why", "dashed": true }
  ]
} }
```

## Huffman Coding

Given character frequencies, build a prefix-free binary code minimizing
the weighted total length. **Greedy:** repeatedly merge the two lowest-
frequency nodes into one. Use a min-heap to find the two lowest in
$O(\log n)$. Total $O(n \log n)$.

The proof — also an exchange argument — shows that in an optimal tree,
the two least-frequent characters appear at maximum depth and can be
made siblings. Then the remaining problem on $n - 1$ frequencies is
solved by recursion.

Huffman is one of the most consequential greedy algorithms in
practice: it underlies gzip, JPEG, MP3, PNG, and nearly every
general-purpose compressor.

## Other Provably-Correct Greedy Algorithms

- **Fractional knapsack.** Sort items by value-per-weight; take whole
  items greedily, take a fraction of the last item to fill the
  capacity exactly. Critically: *fractional* — the 0/1 version is *not*
  greedy-solvable and requires DP.
- **Minimum spanning tree (Prim, Kruskal).** Both are greedy on edges.
  The exchange argument shows that the cheapest edge crossing any cut
  is in *some* MST.
- **Dijkstra's shortest paths.** Greedy on settled vertices — once a
  vertex is settled, its distance is final.
- **Job sequencing with deadlines.** Sort by profit (or deadline);
  schedule each job in its latest available slot.
- **Gas station / canjump.** Greedy works because of a problem-specific
  exchange.

## The Coin Change Trap

The classic counterexample for "greedy always works."

**Coins:** $\{1, 5, 10, 25\}$ (US coinage). Greedy — take the largest
coin not exceeding the remaining amount — *does* find the minimum
number of coins.

**Coins:** $\{1, 3, 4\}$. Amount = 6. Greedy gives $4 + 1 + 1 = 3$
coins. Optimal is $3 + 3 = 2$ coins. Greedy is *wrong*.

The greedy strategy works for "canonical" coin systems (a property of
the coin denominations) but fails in general. Without a proof, you
cannot assume your coin set is canonical.

```viz
{ "type": "callout", "props": {
  "tone": "pitfall",
  "title": "Greedy is a hypothesis, not a default",
  "body": "When a problem feels greedy, write down the greedy rule, the candidate proof (exchange or stay-ahead), and three adversarial test cases. If the rule fails on any of them, fall back to DP. Shipping unprooved greedy code is how you ship wrong answers."
} }
```

## The Stay-Ahead Argument

A close relative of the exchange argument. Show that after $k$ steps,
the greedy solution is *at least as good as* any other partial
solution.

- *Activity selection* — after $k$ chosen activities, greedy's
  $k$-th activity finishes no later than any other algorithm's
  $k$-th activity. So greedy can keep going at least as long.
- *Jump game* — after $i$ steps, greedy's maximum reachable index is
  at least as far as any other strategy's. So greedy reaches the end
  at least as quickly.

When you can prove "greedy stays ahead", optimality follows.

## Pitfalls

```viz
{ "type": "callout", "props": {
  "tone": "pitfall",
  "title": "Wrong sort key",
  "body": "Activity selection sorts by finish time, not start time, not duration. Each problem has a 'right' key; the wrong one is wrong, not slightly suboptimal. Always justify the key with the exchange argument before coding."
} }
```

```viz
{ "type": "callout", "props": {
  "tone": "pitfall",
  "title": "Greedy without proof is a guess",
  "body": "Many problems look greedy and are not. 0/1 knapsack, longest path in a graph, traveling salesman — all admit greedy heuristics that get most cases right and the worst case spectacularly wrong. Never ship without either a proof or an exhaustive test."
} }
```

```viz
{ "type": "callout", "props": {
  "tone": "pitfall",
  "title": "Confusing greedy with approximation",
  "body": "Some greedy algorithms are provably approximate (e.g., greedy set cover gives an O(log n)-approximation). That is a different guarantee. 'It's an approximation' means it can be arbitrarily far from optimal up to a logarithmic factor — useful, but not optimal."
} }
```

## Practice
- Activity selection.
- Jump game I (can you reach the end?). Jump game II (minimum jumps).
- Gas station — find the starting index that can complete the
  circuit.
- Minimum number of platforms (interval scheduling on multiple
  resources).
- Fractional knapsack.
- Huffman coding.
- Job sequencing with deadlines and profits.
- Show by counterexample that coin change with coins $\{1, 3, 4\}$,
  amount 6 is not greedy-optimal.

## References
1. Cormen, Leiserson, Rivest, Stein. *Introduction to Algorithms, 4th ed.*, Chapter 15.
2. Skiena. *The Algorithm Design Manual*, Chapter 1.
3. Sedgewick & Wayne. *Algorithms, 4th ed.*, Section 4.3.
