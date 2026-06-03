---
slug: amortized-analysis
title: Amortized Analysis
summary: When a single operation can cost O(n) but a sequence of n operations costs O(n), the average is O(1). Three techniques (aggregate, accounting, potential) for proving that bound.
topicSlug: complexity-analysis
level: INTERMEDIATE
order: 2
estimatedMins: 20
references:
  - { title: "Introduction to Algorithms, 4th ed., Ch. 16", author: "Cormen, Leiserson, Rivest, Stein", type: "book" }
  - { title: "The Algorithm Design Manual, Ch. 2", author: "Steven Skiena", type: "book" }
prerequisites: ["asymptotic-notation"]
---

## Overview
Worst-case analysis asks: "what is the cost of the most expensive single
operation?" Amortized analysis asks a slightly different question that
is often more useful: "what is the average cost per operation over a
long sequence of operations?" When one isolated call can be expensive
but the expensive calls are *rare*, amortized analysis gives a much
tighter bound than worst-case.

The result is a guarantee that *holds across a sequence* without
assumptions about input distribution. Amortized $O(1)$ is a deterministic
statement — it is not the same as "average case $O(1)$ assuming uniform
input." The bound holds no matter what the adversary does.

## The Motivating Example: Dynamic Arrays

A dynamic array (`vector`, `ArrayList`, Python's `list`) supports
$O(1)$ amortized push by *doubling* its capacity when full. A single
push that triggers a resize costs $O(n)$ — every element gets copied
into a new buffer. But pushes that trigger resizes are rare: after a
doubling, the next resize is at twice the size.

Suppose we push $n$ items into a fresh dynamic array. The resizes happen
at capacities $1, 2, 4, 8, \ldots$, copying $1 + 2 + 4 + \cdots + n/2 +
n < 2n$ elements in total. Add $n$ pushes themselves, and total work is
$O(n)$. Divide by $n$ operations and the *amortized* cost per push is
$O(1)$.

```viz
{ "type": "callout", "props": {
  "tone": "intuition",
  "title": "Why doubling, and not adding a constant?",
  "body": "Grow by a fixed k each time and the resizes copy 1 + 2 + 3 + ... + n/k items in total — quadratic. Grow by a constant factor (any factor strictly greater than 1) and the total work is geometric: bounded by a constant multiple of n. The doubling is what makes the amortized bound work."
} }
```

## Three Techniques

CLRS distinguishes three formal methods for proving an amortized bound.
They all reach the same answer; they differ in how you set up the
bookkeeping.

### Aggregate analysis

The simplest. Compute the total cost $T(n)$ of an arbitrary sequence of
$n$ operations, divide by $n$, get the amortized cost per operation.

For dynamic-array pushes: $T(n) \le 3n$, so amortized cost is $O(1)$ per
push.

Aggregate analysis ignores per-operation type — every operation gets
the same amortized cost, even if they are different operations on the
data structure. When that is too coarse, use the next two methods.

### Accounting (banker's) method

Each operation is charged a fixed *amortized cost*, often higher than
its real cost. The difference accumulates as *credit* stored on the
data structure. Expensive operations pay for themselves by spending
accumulated credit.

For dynamic-array push, charge each push 3 units:

- 1 unit pays for the actual append.
- 1 unit is stored as credit on the new element.
- 1 unit is stored as credit on an old element from the second half of
  the array.

When a resize is triggered at size $n$, every element in the second
half has 2 units of stored credit — enough to pay for copying it to the
new buffer. The invariant ("every second-half element has 2 credits")
must hold before every resize; verifying it is the proof.

### Potential method

Define a *potential function* $\Phi$ that maps the state of the data
structure to a non-negative real. The amortized cost of an operation is
its real cost plus the change in potential:

$$\hat{c}_i = c_i + \Phi(D_i) - \Phi(D_{i-1}).$$

If $\Phi(D_n) \ge \Phi(D_0)$ (so the total potential never goes
negative), then the sum of amortized costs upper-bounds the sum of real
costs.

For dynamic-array push, let $\Phi$ be twice the number of elements
beyond half-capacity: $\Phi = 2(n - \text{cap}/2)$ when more than half
full, else 0. A non-resizing push increases $\Phi$ by 2 (one more
element above half) and does 1 unit of real work, for an amortized cost
of 3. A resizing push does $n$ units of real work, drops $\Phi$ from
$n$ to 0, for amortized cost $n + 1 - n = 1$. Amortized cost per
operation is $O(1)$.

The potential method is heavy machinery for a small example, but it is
the cleanest tool when several operation types interact in complex ways
(e.g., splay trees, Fibonacci heaps).

## Other Canonical Cases

```viz
{ "type": "architecture", "props": {
  "caption": "Where amortized analysis tightens the bound",
  "cols": 12, "rows": 4, "height": 280,
  "boxes": [
    { "id": "dyn", "label": "dynamic array push", "sub": "worst O(n), amort O(1)", "col": 0, "row": 0, "colSpan": 4, "emphasis": "primary" },
    { "id": "bin", "label": "binary counter increment", "sub": "worst O(log n), amort O(1)", "col": 4, "row": 0, "colSpan": 4, "emphasis": "primary" },
    { "id": "stk", "label": "stack multi-pop", "sub": "worst O(n), amort O(1)", "col": 8, "row": 0, "colSpan": 4, "emphasis": "primary" },
    { "id": "dsu", "label": "union-find op", "sub": "amortized O(alpha(n))", "col": 0, "row": 2, "colSpan": 4 },
    { "id": "splay", "label": "splay tree access", "sub": "amortized O(log n)", "col": 4, "row": 2, "colSpan": 4 },
    { "id": "fib",  "label": "Fibonacci heap decrease-key", "sub": "amortized O(1)", "col": 8, "row": 2, "colSpan": 4 }
  ]
} }
```

Each of these has a worst-case-per-operation that is strictly worse than
its amortized bound. The proofs use different methods — DSU uses
potential; Fibonacci heaps use a more intricate potential — but the
conclusion is the same: across a sequence, the average cost is what the
amortized bound says.

## Amortized vs. Average-Case vs. Probabilistic

Three terms that sound similar and are not:

- **Amortized** — a deterministic guarantee about a *sequence*. Holds
  for every adversarial input.
- **Average-case** — expected cost averaged over a *distribution* on
  inputs. Requires assumptions about the input.
- **Expected (randomized)** — average cost taken over the algorithm's
  random choices, not the input.

Quicksort's $\Theta(n \log n)$ is average-case (or, with a randomized
pivot, expected). It is *not* amortized — a single bad sequence of
inputs can still give $\Theta(n^2)$.

```viz
{ "type": "callout", "props": {
  "tone": "pitfall",
  "title": "Amortized does not mean every call is fast",
  "body": "A single dynamic-array push can take a millisecond when others take a microsecond. For latency-sensitive code paths (real-time systems, game loops, web request handling), the worst-case-per-call matters even if the amortized bound is fine. Reserve capacity up front to flatten the tail."
} }
```

```viz
{ "type": "callout", "props": {
  "tone": "pitfall",
  "title": "Mixing amortized bounds across structures",
  "body": "Amortized bounds depend on the credit / potential not going negative. If you take a snapshot of the data structure and walk away with it, then run more operations on the original, the credit accounting breaks. Persistent data structures need amortization arguments that survive cloning — usually they don't."
} }
```

## A Worked Recurrence: Binary Counter

A counter starts at 0 and increments. Each increment may flip several
bits. The worst case is $\Theta(\log n)$ flips (when every bit rolls
over). But across $n$ increments, bit $i$ flips $\lfloor n / 2^i
\rfloor$ times. Summed:

$$\sum_{i \ge 0} \frac{n}{2^i} \le 2n.$$

Total flips $\le 2n$. Amortized per increment: $\le 2$. The amortized
cost is $O(1)$ despite the $O(\log n)$ worst case.

## Practice
- Prove the amortized cost of stack `push` and `multi-pop` (pop $k$
  elements at once) is $O(1)$ per operation.
- A queue implemented as two stacks: prove amortized $O(1)$ per
  enqueue/dequeue using the accounting method.
- Suppose the dynamic array grows by a factor of 1.5 instead of 2.
  Prove amortized $O(1)$.
- Suppose instead it grows by adding 100 each time. Show the amortized
  cost is $\Theta(n)$.

## References
1. Cormen, Leiserson, Rivest, Stein. *Introduction to Algorithms, 4th ed.*, Chapter 16.
2. Skiena. *The Algorithm Design Manual*, Chapter 2.
