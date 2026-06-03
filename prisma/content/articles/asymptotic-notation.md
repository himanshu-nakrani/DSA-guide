---
slug: asymptotic-notation
title: Asymptotic Notation
summary: The mathematical framework — Big-O, Big-Omega, Big-Theta — for describing how an algorithm's cost grows with input size.
topicSlug: complexity-analysis
level: FOUNDATION
order: 1
estimatedMins: 18
references:
  - { title: "Introduction to Algorithms, 4th ed., Ch. 3", author: "Cormen, Leiserson, Rivest, Stein", type: "book" }
  - { title: "Algorithms, 4th ed., Ch. 1.4", author: "Sedgewick & Wayne", type: "book" }
  - { title: "Asymptotic Notation", url: "https://cp-algorithms.com/complexity/complexity.html", type: "web" }
  - { title: "The Algorithm Design Manual, Ch. 2", author: "Steven Skiena", type: "book" }
prerequisites: []
---

## Overview
Asymptotic notation is the language we use to talk about how an algorithm's
running time or memory consumption changes as the input grows. It throws away
constant factors, low-order terms, and hardware quirks so that we can compare
algorithms — and reason about which one will survive at scale — without ever
running them.

Concretely: if `T(n)` is the number of basic steps an algorithm performs on an
input of size `n`, asymptotic notation classifies `T` by its *growth rate*
rather than its exact value.

## The Three Notations

Three bounds appear over and over. They are formally defined for any pair of
non-negative functions `f, g : N → R⁺`:

- **$O(g(n))$** — *upper bound.* There exist constants $c > 0$ and $n_0$ such
  that $f(n) \le c \cdot g(n)$ for all $n \ge n_0$. Read it as: "for large
  enough inputs, $f$ does not grow faster than $g$."
- **$\Omega(g(n))$** — *lower bound.* There exist constants $c > 0$ and $n_0$
  with $f(n) \ge c \cdot g(n)$ for all $n \ge n_0$. "$f$ grows at least as
  fast as $g$."
- **$\Theta(g(n))$** — *tight bound.* $f \in O(g) \cap \Omega(g)$. "$f$ grows
  exactly like $g$, up to constants."

```viz
{ "type": "callout", "props": {
  "tone": "insight",
  "title": "A useful slogan",
  "body": "Big-O describes worst-case ceilings. Big-Ω describes best-case floors. Big-Θ pins the function between the two and is the tightest statement you can make."
} }
```

## Why Constants and Low-Order Terms Are Dropped

Suppose two algorithms cost $T_1(n) = 100n$ and $T_2(n) = n^2$. For $n = 50$,
$T_1 = 5000$ and $T_2 = 2500$ — the quadratic wins. But once $n > 100$ the
linear algorithm pulls ahead and never looks back. The constant `100` only
delays the inevitable; the *shape* of the curve is what dominates at scale.

Asymptotic notation deliberately discards constants so we can see this shape.

```viz
{ "type": "complexity-chart", "props": { "maxN": 64 } }
```

The vertical axis is logarithmic. Even on a log scale, $O(2^n)$ pulls almost
vertically out of the picture by $n \approx 30$ — which is why exponential
algorithms are dangerous even for tiny inputs.

## What Each Class Buys You in Practice

A useful sanity check: a modern single CPU core handles on the order of
$10^8$ simple operations per second. So an algorithm that runs in
$10^{10}$ operations on your input will take ~100 seconds; one that runs in
$10^{15}$ will not finish today.

```viz
{ "type": "growth-table", "props": {} }
```

Reading this table is a habit worth cultivating. Before you even open the
editor, glance at the input limits in the problem statement and use it to rule
out complexity classes:

- $n \le 20$ — $O(2^n)$ or $O(n!)$ might still be fine.
- $n \le 10^3$ — $O(n^2)$ is the sweet spot.
- $n \le 10^5$ — $O(n \log n)$ is the natural budget; $O(n \sqrt n)$ works.
- $n \le 10^7$ — you need $O(n)$ or $O(n \log n)$ with small constants.
- $n \ge 10^8$ — only $O(n)$ or $O(\log n)$ algorithms survive.

## Worst, Average, and Best Case

These three are *separate* from the three notations and frequently confused
with them. They describe *which* input you are analyzing:

- *Worst case* — the input that costs the most. The conventional Big-O target.
- *Average case* — expected cost over some distribution on the input.
- *Best case* — the input that costs the least. Rarely useful unless it's
  surprisingly bad.

You can apply any of $O$, $\Omega$, $\Theta$ to any of these cases. For
example: "quicksort's average-case running time is $\Theta(n \log n)$ but its
worst case is $\Theta(n^2)$." Both statements are tight, just for different
inputs.

## Amortized vs. Worst-Case

Some operations are cheap on average even though *some* invocations are
expensive. The standard example is appending to a dynamic array (`vector`,
`ArrayList`): most appends are $O(1)$, but when the underlying buffer is full
the array doubles its capacity and copies $n$ elements, costing $O(n)$ for
that one push. The *amortized* cost — total work divided by number of
operations — is still $O(1)$ per push.

When you see "$O(1)$ amortized," ask: what's the worst single call? Sometimes
it matters (real-time systems, latency-sensitive code paths); sometimes the
average is all you need.

## The Common Mistakes

```viz
{ "type": "callout", "props": {
  "tone": "pitfall",
  "title": "Big-O is not the running time",
  "body": "Big-O is an upper bound. Saying merge sort is O(n²) is technically true — it's not faster than quadratic — but it's not the tightest statement. Prefer Θ when you can pin both sides; only fall back to O when you can't."
} }
```

```viz
{ "type": "callout", "props": {
  "tone": "pitfall",
  "title": "Constants matter for small n",
  "body": "An O(n) algorithm with a 1000× constant overhead loses to an O(n log n) algorithm with a tiny one until n is enormous. Asymptotic analysis is a long-run statement, not a guarantee about your benchmark on n=100."
} }
```

```viz
{ "type": "callout", "props": {
  "tone": "pitfall",
  "title": "Logs hide their base",
  "body": "log₂ n and log₁₀ n differ by a constant factor, so both are O(log n). The base is irrelevant inside Big-O notation, though writing log₂ is conventional in CS."
} }
```

## How to Analyze a Snippet

A short procedure works for almost every interview-shaped problem:

1. Identify the input size `n`. Often there are several — a graph has both
   vertices `V` and edges `E`, a matrix has rows and columns.
2. Walk the code top to bottom. Each loop multiplies the cost of its body by
   its iteration count. Each recursive call contributes to a recurrence.
3. Apply the master theorem or substitution method for recurrences. For
   straight-line loops, multiply through.
4. Drop constants and low-order terms.

For example, the nested-loop snippet

```python
for i in range(n):
    for j in range(i, n):
        do_work()
```

does $n + (n-1) + \cdots + 1 = n(n+1)/2$ iterations, which is $\Theta(n^2)$.

## Space Complexity

Everything above applies equally to memory. The two budgets you'll typically
track:

- **Auxiliary space** — extra memory the algorithm allocates, *excluding* the
  input itself. An in-place reversal is $O(1)$ aux.
- **Total space** — auxiliary plus input. Rarely the interesting number
  because the input is given.

Recursion costs memory too: each call sits on the stack until it returns. A
recursive DFS over a graph with depth $d$ uses $O(d)$ stack space, which can
quietly blow up for deeply nested inputs.

## Practice
- Show that $3n^2 + 5n + 100$ is $\Theta(n^2)$ by finding witnesses $c_1, c_2, n_0$.
- A function does work proportional to the number of digits of `n`. Its time
  complexity in terms of `n`?
- Two nested loops, but the inner loop runs `n / i` times for outer index
  `i`. What's the total work?
- Why is `O(log log n)` an honest, occurring complexity class? Give an
  algorithm that achieves it.

## References
1. Cormen, Leiserson, Rivest, Stein. *Introduction to Algorithms, 4th ed.*, Chapter 3.
2. Sedgewick & Wayne. *Algorithms, 4th ed.*, Section 1.4.
3. Skiena. *The Algorithm Design Manual*, Chapter 2.
4. cp-algorithms.com. "Asymptotic Notation".
