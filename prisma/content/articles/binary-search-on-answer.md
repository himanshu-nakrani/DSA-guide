---
slug: binary-search-on-answer
title: Binary Search on the Answer
summary: When the predicate is monotone and the answer is a number, binary search the answer space directly — not an array index.
topicSlug: binary-search
level: INTERMEDIATE
order: 2
estimatedMins: 18
references:
  - { title: "Introduction to Algorithms, 4th ed., Ch. 2", author: "Cormen, Leiserson, Rivest, Stein", type: "book" }
  - { title: "Binary Search", url: "https://cp-algorithms.com/num_methods/binary_search.html", type: "web" }
  - { title: "USACO Guide — Binary Search on the Answer", url: "https://usaco.guide/silver/binary-search", type: "web" }
prerequisites: ["binary-search-fundamentals"]
---

## Overview
Plain binary search locates a target inside a sorted array. *Binary
search on the answer* is the deeper version of the same idea: when the
quantity you are looking for is a number and a *yes/no predicate* on
candidate values is monotone, binary search the candidates directly.

The technique transforms optimization problems of the form *"what is
the smallest / largest $x$ such that property $P(x)$ holds?"* into a
$\Theta(\log R)$ wrapper around a feasibility check, where $R$ is the
size of the answer space. It is the workhorse behind capacity planning,
parametric search, percentile estimation, and a large fraction of
competition problems.

## The Required Property: Monotonicity

The binary-search wrapper only works if $P$ is monotone along the
candidate axis. *Monotone* means: there exists some threshold $x^\*$
such that $P(x)$ is false for all $x < x^\*$ and true for all $x \ge
x^\*$ (or the opposite). Geometrically, the predicate looks like a step
function — a single transition between "no" and "yes".

```viz
{ "type": "callout", "props": {
  "tone": "intuition",
  "title": "What you are actually searching",
  "body": "You are not searching an array. You are searching the integers (or reals) between lo and hi. Each candidate x is fed into a predicate. The binary search halves the candidate interval until lo and hi meet at the boundary between no and yes."
} }
```

If you cannot express the problem as a monotone yes/no predicate, this
technique is the wrong tool — pick a different approach.

## The Skeleton

For "smallest $x$ such that $P(x)$ is true":

```python
def smallest_feasible(lo, hi, P):
    # invariant: P(lo - 1) is false, P(hi) is true.
    while lo < hi:
        mid = lo + (hi - lo) // 2
        if P(mid):
            hi = mid          # mid is feasible — answer could be here
        else:
            lo = mid + 1      # mid is infeasible — answer is to the right
    return lo
```

A few notes that, in aggregate, prevent the four most common bugs:

- The loop uses `lo < hi`, *not* `lo <= hi`. The window shrinks to a
  single point that *is* the answer.
- `hi = mid`, not `mid - 1`, because `mid` is itself a candidate when
  $P(\text{mid})$ is true.
- `lo = mid + 1`, not `mid`, because `mid` is known infeasible.
- The midpoint formula `lo + (hi - lo) // 2` avoids overflow in
  fixed-width integer languages.

The symmetric variant for "largest feasible" swaps the predicate
direction and the pointer updates.

## A Worked Example: Koko Eats Bananas

*Given piles of bananas $p_1, \ldots, p_n$ and a time limit of $H$
hours, find the smallest eating speed $k$ (bananas/hour) such that Koko
finishes everything in $H$ hours. At speed $k$, pile $p_i$ takes
$\lceil p_i / k \rceil$ hours.*

Define $P(k) = $ "total hours required at speed $k$ is at most $H$".

- $P(k)$ is monotone: faster speed cannot take more time.
- Smallest $k$ is at least 1.
- Largest $k$ that could ever be needed is $\max p_i$ (any faster
  finishes each pile in one hour).

Binary search over $k \in [1, \max p_i]$:

```python
import math

def min_eating_speed(piles, H):
    def can_finish(k):
        return sum(math.ceil(p / k) for p in piles) <= H
    lo, hi = 1, max(piles)
    while lo < hi:
        mid = lo + (hi - lo) // 2
        if can_finish(mid):
            hi = mid
        else:
            lo = mid + 1
    return lo
```

Total cost: $O(n \log(\max p_i))$. The feasibility check is $O(n)$;
the binary search makes $O(\log R)$ calls to it.

```viz
{ "type": "complexity-chart", "props": { "maxN": 256, "curves": ["1", "logn", "n", "nlogn"] } }
```

The log factor is the wrapper; the linear factor inside is the
predicate. Most binary-search-on-answer problems have this shape.

## How to Spot the Pattern

The trigger phrases in a problem statement:

- "smallest / largest $x$ such that…"
- "minimize the maximum…", "maximize the minimum…"
- "find the smallest capacity / speed / size / threshold under which…"
- the answer is a *number*, and there is some natural feasibility check.

Once you suspect it, ask three questions:

1. **What is the answer space?** Find $[\text{lo}, \text{hi}]$ that
   provably contains the answer.
2. **What is the predicate?** Write `can(x)` returning a bool.
3. **Is `can` monotone?** If not, the technique does not apply.

```viz
{ "type": "architecture", "props": {
  "caption": "Binary search on the answer — the reduction",
  "cols": 12, "rows": 3, "height": 220,
  "boxes": [
    { "id": "opt", "label": "optimization problem", "sub": "smallest x with property P", "col": 0, "row": 0, "colSpan": 4, "emphasis": "muted" },
    { "id": "feas", "label": "feasibility predicate", "sub": "P(x) → bool", "col": 5, "row": 0, "colSpan": 3, "emphasis": "primary" },
    { "id": "mono", "label": "monotone in x?", "col": 9, "row": 0, "colSpan": 3, "emphasis": "warn" },
    { "id": "bs",  "label": "binary search over [lo, hi]", "sub": "O(log R) calls to P", "col": 2, "row": 2, "colSpan": 8, "emphasis": "primary" }
  ],
  "arrows": [
    { "from": "opt",  "to": "feas", "label": "reformulate" },
    { "from": "feas", "to": "mono", "label": "verify" },
    { "from": "mono", "to": "bs",   "label": "if yes" }
  ]
} }
```

## More Examples in Brief

- **Capacity to ship packages within D days.** Predicate: can we
  partition the packages into $D$ contiguous groups whose maxima are
  $\le c$? Monotone in $c$.
- **Minimum largest sum after splitting array into $k$ pieces.** Same
  shape as the shipping problem.
- **Smallest divisor giving result $\le t$.** Predicate: monotone in
  divisor (bigger divisor → smaller sum of $\lceil a_i / d \rceil$).
- **Find the $k$-th smallest element in a sorted matrix.** Predicate:
  count how many entries are $\le x$; monotone in $x$.
- **Aggressive cows.** Place $k$ cows in $n$ stalls so the minimum
  pairwise distance is maximized. Predicate: can we place $k$ cows with
  pairwise distance $\ge d$? Monotone in $d$.

## Real-Valued Variants

When the answer space is real, the loop terminates by precision rather
than by exact equality. Standard form:

```python
def binsearch_real(lo, hi, P, iters=100):
    for _ in range(iters):
        mid = (lo + hi) / 2
        if P(mid):
            hi = mid
        else:
            lo = mid
    return lo
```

One hundred iterations halve the interval by a factor of $2^{100}$ —
overkill for any reasonable precision target. Prefer this to an
epsilon-based termination, which is brittle near the boundary.

## Pitfalls

```viz
{ "type": "callout", "props": {
  "tone": "pitfall",
  "title": "Confirm monotonicity",
  "body": "Drawing the predicate as a step function on a few small inputs is worth more than a thousand intuitions. If the predicate flickers between true and false, the search is wrong and no amount of off-by-one tweaking will save it."
} }
```

```viz
{ "type": "callout", "props": {
  "tone": "pitfall",
  "title": "Answer space bounds",
  "body": "Set lo and hi so that P(lo - 1) is false and P(hi) is true — both, not just one. Loose bounds wastes a few iterations; wrong bounds returns garbage. Sanity-check on the smallest and largest possible answers."
} }
```

```viz
{ "type": "callout", "props": {
  "tone": "pitfall",
  "title": "Expensive predicates",
  "body": "If the feasibility check is O(n²), the wrapper inflates the total cost to O(n² log R). Sometimes that's fine; sometimes the problem is solvable directly in O(n log n). Don't reach for binary-search-on-answer when a single-pass algorithm exists."
} }
```

## Practice
- Koko eating bananas.
- Capacity to ship packages within $D$ days.
- Split array into $k$ subarrays minimizing the largest sum.
- Aggressive cows.
- Median of two sorted arrays (the standard binary search variant).
- $k$-th smallest in a sorted matrix.

## References
1. Cormen, Leiserson, Rivest, Stein. *Introduction to Algorithms, 4th ed.*, Chapter 2.
2. cp-algorithms.com. "Binary Search."
3. USACO Guide. "Binary Search on the Answer."
