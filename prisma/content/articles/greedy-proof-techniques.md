---
slug: greedy-proof-techniques
title: Proving a Greedy Algorithm Correct
summary: Three rigorous tools — exchange argument, stay-ahead, and matroid — for showing that a greedy choice actually yields a global optimum. Without them, "greedy works" is a guess.
topicSlug: greedy
level: INTERMEDIATE
order: 2
estimatedMins: 16
references:
  - { title: "Introduction to Algorithms, 4th ed., Ch. 15", author: "Cormen, Leiserson, Rivest, Stein", type: "book" }
  - { title: "Algorithm Design, Ch. 4", author: "Kleinberg & Tardos", type: "book" }
  - { title: "Matroid Theory", author: "James Oxley", type: "book" }
  - { title: "Competitive Programmer's Handbook, Ch. 6", author: "Antti Laaksonen", type: "book" }
prerequisites: [greedy-fundamentals]
---

## Overview

A greedy algorithm makes the locally best choice at each step and never
revisits it. Sometimes that works — Kruskal's MST, Huffman codes, scheduling
to minimize lateness — and sometimes it doesn't, even when the problem looks
identical on the surface. The difference between the two is rarely obvious
from the algorithm itself; it's a *property of the problem* that has to be
proved.

This essay covers the three proof techniques you'll actually use:
**exchange arguments**, **stay-ahead**, and **matroid structure**.

> [!MARGIN] Why proofs and not benchmarks
> A greedy can pass every test you write and fail on the 1001st input.
> Correctness has to be argued, not measured — that's the whole point of
> the discipline.

## When a Greedy Might Even Work

The two properties any candidate greedy problem must satisfy:

- **Greedy-choice property.** A globally optimal solution can be reached by
  a sequence of locally optimal choices. The first greedy pick is "safe."
- **Optimal substructure.** After making that first choice, what's left is
  a smaller instance of the same problem whose optimum combined with the
  choice gives the original optimum.

These are necessary, not sufficient. They tell you a greedy *might* exist;
the proof tells you it does.

```viz
{ "type": "callout", "props": {
  "tone": "pitfall",
  "title": "Optimal substructure ≠ greedy works",
  "body": "Knapsack-0/1 has optimal substructure but no greedy solution — every item's value-density argument can be defeated by an adversarial input. Substructure tells you DP applies; only an exchange argument tells you greedy does."
} }
```

## Technique 1 — Exchange Argument

The exchange argument is the workhorse. **Take any optimal solution. Show
that you can transform it, one swap at a time, into the greedy solution
without ever making it worse.** If that's possible, greedy is at least as
good as the optimum — i.e., greedy *is* an optimum.

### Worked example: Activity selection

Given $n$ activities each with a start time $s_i$ and finish time $f_i$,
pick the largest subset of mutually non-overlapping activities.

The greedy: sort by finish time and pick the next activity that doesn't
overlap the last one picked.

**Claim.** Greedy produces an optimal subset.

**Proof.** Let $G = (g_1, g_2, \ldots, g_k)$ be greedy's output, ordered by
finish time. Let $O = (o_1, o_2, \ldots, o_m)$ be any optimal subset, also
ordered by finish time. We show $k = m$ by induction.

For the base case, consider $g_1$ and $o_1$. By the greedy choice, $g_1$
has the *earliest* finish time among all activities, so $f_{g_1} \le f_{o_1}$.
Construct $O' = (g_1, o_2, \ldots, o_m)$: we removed $o_1$ and inserted $g_1$.
Because $g_1$ finishes no later than $o_1$, $g_1$ doesn't overlap $o_2$
(which $o_1$ didn't either). $O'$ is still a valid solution of size $m$.

The remaining problem — select the largest subset from activities starting
after $f_{g_1}$ — is the same problem on a smaller input. Induct.

> [!MARGIN] The swap is the proof
> Notice the structure: pick any optimum, show that swapping in the greedy
> choice doesn't hurt. The greedy is then "at least as good." Every
> exchange argument has this shape.

The exchange argument works whenever you can locally compare greedy's first
choice to any other first choice and show that swapping in greedy's leaves
the rest of the problem at least as solvable.

```viz
{ "type": "callout", "props": {
  "tone": "insight",
  "title": "Why earliest-finish-time, not earliest-start",
  "body": "An activity that finishes early leaves the most room for later activities. Picking by earliest start can saddle you with a long-running activity that blocks many short ones. The proof above breaks if you replace 'earliest finish' with anything else."
} }
```

## Technique 2 — Stay-Ahead

The stay-ahead argument is a *measure-based* induction. **Define some
quantity that you want greedy to maximize (or minimize) at every step.
Prove that after each step, greedy's measure is at least as good as any
other algorithm's. Conclude that greedy ends at least as well.**

This is more direct than the exchange when there's an obvious progress
metric.

### Worked example: Maximum number of selected activities again

Define $r_i^G$ = the finish time of greedy's $i$-th picked activity, and
similarly $r_i^O$ for any other algorithm. We claim $r_i^G \le r_i^O$ for
every $i$ where both exist.

- $i = 1$: greedy picked the activity with the earliest finish time
  globally, so trivially $r_1^G \le r_1^O$.
- Inductive step: assume $r_{i-1}^G \le r_{i-1}^O$. The $i$-th activity
  picked by either algorithm must start no earlier than its previous pick's
  finish time. So both candidates are available to greedy, and greedy
  picks the one with the smallest finish time. Thus $r_i^G \le r_i^O$.

Since greedy never falls behind on finish times, it can fit at least as
many activities. $\square$

> [!PITFALL] The metric has to be monotone
> Stay-ahead breaks if your metric can decrease — e.g., "number of items
> packed so far" works only if items never get removed. For problems where
> commitments can be undone (some scheduling variants), prefer the exchange
> argument.

## Technique 3 — Matroid Structure

When the problem has the structure of a **matroid**, *every* greedy
algorithm that picks the highest-weight available element is optimal. This
is the strongest of the three techniques — when it applies, you don't even
need to be clever about ordering.

A matroid is a pair $(E, \mathcal{I})$ where $E$ is a finite ground set
and $\mathcal{I} \subseteq 2^E$ is a family of **independent sets**
satisfying:

1. **Empty set.** $\emptyset \in \mathcal{I}$.
2. **Heredity.** If $A \in \mathcal{I}$ and $B \subseteq A$, then $B \in \mathcal{I}$.
3. **Exchange.** If $A, B \in \mathcal{I}$ and $|A| > |B|$, there exists
   $x \in A \setminus B$ such that $B \cup \{x\} \in \mathcal{I}$.

> [!MARGIN] Why "matroid"
> The name comes from "matrix-oid": linear independence of columns is the
> canonical matroid. Whitney introduced it in 1935 to capture what's shared
> between "subsets of independent vectors" and "forests in a graph."

**Theorem (Rado–Edmonds).** Given a matroid $(E, \mathcal{I})$ and a
weight function $w: E \to \mathbb{R}_{\ge 0}$, the greedy algorithm
"sort $E$ by descending weight, then include each element if its inclusion
keeps the set independent" produces a maximum-weight independent set.

### The two canonical matroid greedies

- **Kruskal's MST.** $E$ = edges of a graph, $\mathcal{I}$ = acyclic edge
  sets (forests). The exchange axiom is exactly the cycle property of
  graphs.
- **Linear independence.** $E$ = vectors in a vector space,
  $\mathcal{I}$ = linearly independent subsets. The exchange axiom is
  the Steinitz exchange lemma — taught in every first linear-algebra
  course.

```viz
{ "type": "callout", "props": {
  "tone": "insight",
  "title": "If you can show the exchange axiom holds, you're done",
  "body": "The hardest part of applying Rado–Edmonds is verifying axiom 3. The other two are usually trivial. Once exchange is proved, the greedy is automatically optimal — no per-problem proof needed."
} }
```

## How to Choose

A practical decision tree:

1. **Does the problem feel like 'always pick the cheapest / earliest / lightest'?**
   Try an exchange argument first. Most interview-shaped greedies fall here.
2. **Does the problem have an obvious monotone progress metric?**
   Stay-ahead is the cleanest proof.
3. **Is the feasible set closed under subset and does the exchange axiom hold?**
   It's a matroid; you're done.
4. **None of the above?**
   Greedy probably doesn't work. Reach for DP.

```viz
{ "type": "callout", "props": {
  "tone": "pitfall",
  "title": "Don't skip the proof",
  "body": "Interviewers and judges score you on the algorithm. Reviewers and future maintainers — and your own debugging self — score you on whether you can explain why it's correct. A greedy with no proof is a bug-in-waiting."
} }
```

## Complexity Footnote

Greedy proofs say nothing about running time. Most greedies are
$\Theta(n \log n)$ because of the initial sort; with the right data
structure (heap, BST) you can sometimes drop to $\Theta(n)$ amortized.[^heaprich]
The correctness proof and the complexity analysis are separate exercises.

[^heaprich]: Robert E. Tarjan, *Data Structures and Network Algorithms*, SIAM 1983,
gives heap-based amortized analyses for several classical greedies including
Kruskal and Prim.

## Practice

- For interval scheduling, write the exchange step that turns an optimal
  schedule into one that begins with the earliest-finishing compatible
  interval.
- For the problem "minimize the number of coins," find a coin system where
  the largest-first greedy choice fails. Explain which exchange claim breaks.
- In a shortest-path problem with non-negative edges, decide whether a
  stay-ahead argument or an exchange argument better matches Dijkstra's next
  settled vertex, and state the measure you would compare.

## References
