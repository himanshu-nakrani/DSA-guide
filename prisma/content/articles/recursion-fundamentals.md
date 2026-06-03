---
slug: recursion-fundamentals
title: Recursion Fundamentals
summary: "Base case plus recursive step — the mental model that predicts the behavior of every recursive function before it runs, and the foundation of divide-and-conquer, tree traversal, DP, and backtracking."
topicSlug: recursion-and-backtracking
level: FOUNDATION
order: 1
estimatedMins: 22
references:
  - { title: "Introduction to Algorithms, 4th ed., Ch. 4", author: "Cormen, Leiserson, Rivest, Stein", type: "book" }
  - { title: "Algorithms, 4th ed., Ch. 1", author: "Sedgewick & Wayne", type: "book" }
  - { title: "The Algorithm Design Manual, Ch. 4", author: "Steven Skiena", type: "book" }
prerequisites: []
---

## Overview
Recursion is the technique of solving a problem by reducing it to a
smaller instance of itself. The trick — and it really is one trick — is
to identify a *base case* small enough to solve directly, and a
*recursive step* that closes the gap toward it. Get those two pieces
right and the function is correct. Get them wrong and the function
loops forever or returns nonsense.

Every algorithm in the rest of this guide that touches trees, graphs,
divide-and-conquer, dynamic programming, or backtracking is recursion in
some form. Internalizing the discipline now pays out for the rest of the
curriculum.

## The Two Mandatory Pieces

A correct recursive function has exactly two things:

1. **A base case.** An input small enough that the answer is direct —
   no further recursion required. The smaller the better; one or zero
   is the typical landing point.
2. **A recursive step.** Express the answer for input $n$ in terms of
   the answer for some strictly smaller input. *Strictly smaller* is
   non-negotiable; if the recursive call could revisit the same input,
   the function does not terminate.

Together these form a *contract*: assume the recursive call works for
smaller inputs, and check that your code is correct on that assumption.
This is sometimes called the *inductive leap of faith*.

```viz
{ "type": "callout", "props": {
  "tone": "intuition",
  "title": "The leap of faith",
  "body": "When you write factorial(n) = n * factorial(n - 1), do not trace the recursion mentally. Assume factorial(n - 1) returns the correct value for the smaller input. Your only job is to verify that, given that assumption, your formula for n is right. The base case anchors the assumption to reality."
} }
```

## The Canonical Example

Factorial is the simplest demonstration:

```python
def factorial(n):
    if n <= 1:           # base case
        return 1
    return n * factorial(n - 1)   # recursive step
```

Three observations:

- The base case fires at $n \le 1$ and returns directly.
- The recursive call uses $n - 1$, which is strictly smaller.
- The combine step (`n * ...`) does the actual work of building up the
  answer.

That shape — *base case, smaller recursive call, combine* — recurs in
nearly every recursive function you will write.

## The Call Stack

Every recursive call costs a *stack frame* — a slot of memory holding
the local variables and the return address of that invocation. When the
recursion is $d$ levels deep, $d$ frames are live simultaneously.

```viz
{ "type": "architecture", "props": {
  "caption": "Anatomy of a recursive call",
  "cols": 12, "rows": 4, "height": 280,
  "boxes": [
    { "id": "f5", "label": "factorial(5)", "sub": "waiting on f(4)", "col": 0, "row": 0, "colSpan": 4, "emphasis": "muted" },
    { "id": "f4", "label": "factorial(4)", "sub": "waiting on f(3)", "col": 0, "row": 1, "colSpan": 4, "emphasis": "muted" },
    { "id": "f3", "label": "factorial(3)", "sub": "waiting on f(2)", "col": 0, "row": 2, "colSpan": 4, "emphasis": "muted" },
    { "id": "f2", "label": "factorial(2)", "sub": "waiting on f(1)", "col": 0, "row": 3, "colSpan": 4, "emphasis": "muted" },
    { "id": "f1", "label": "factorial(1)", "sub": "returns 1 immediately", "col": 5, "row": 3, "colSpan": 4, "emphasis": "primary" },
    { "id": "ret", "label": "values bubble up", "sub": "1, 2, 6, 24, 120", "col": 5, "row": 0, "colSpan": 7, "rowSpan": 3 }
  ],
  "arrows": [
    { "from": "f5", "to": "f4" },
    { "from": "f4", "to": "f3" },
    { "from": "f3", "to": "f2" },
    { "from": "f2", "to": "f1" },
    { "from": "f1", "to": "ret", "label": "return", "dashed": true }
  ]
} }
```

This matters for two reasons. First, the depth of recursion bounds the
auxiliary space — a recursive DFS over a tree of height $h$ costs $O(h)$
stack space. Second, runtime systems put a ceiling on the call stack
(typically a few thousand frames in Python, a few tens of thousands in
Java). Exceed it and the program crashes.

```viz
{ "type": "callout", "props": {
  "tone": "pitfall",
  "title": "Recursion depth is real memory",
  "body": "If your recursive call can be 10^5 deep — a graph laid out as a chain, a linked list of 10^5 nodes — the default stack will not hold it. Either lift the limit (sys.setrecursionlimit in Python, -Xss in the JVM) or convert to an iterative form with an explicit stack."
} }
```

## Divide and Conquer

A particularly productive recursive pattern: split the input into pieces,
solve each piece recursively, and combine. Mergesort, quicksort, binary
search, FFT, and a long tail of geometric algorithms are all instances.

The pattern:

```text
def divide_and_conquer(P):
    if P is small enough:
        return solve_directly(P)
    split P into P1, P2, ..., Pk
    solutions = [divide_and_conquer(Pi) for Pi in pieces]
    return combine(solutions)
```

Cost is captured by a recurrence of the form $T(n) = a \cdot T(n/b) +
f(n)$, where $a$ is the number of subproblems, $n/b$ is the size of
each, and $f(n)$ is the cost of the combine step. The Master Theorem
solves this recurrence in three cases:

- If $f(n) = O(n^c)$ with $c < \log_b a$, then $T(n) = \Theta(n^{\log_b a})$.
- If $f(n) = \Theta(n^{\log_b a})$, then $T(n) = \Theta(n^{\log_b a} \log n)$.
- If $f(n) = \Omega(n^c)$ with $c > \log_b a$ (and a regularity
  condition holds), then $T(n) = \Theta(f(n))$.

Mergesort falls in case 2: $T(n) = 2T(n/2) + \Theta(n)$ gives $\Theta(n
\log n)$. Binary search is case 1 with $T(n) = T(n/2) + \Theta(1)$,
giving $\Theta(\log n)$.

## Overlapping vs. Disjoint Subproblems

A subtle distinction:

- **Disjoint subproblems** — divide-and-conquer in its purest form.
  Each subproblem appears once. Mergesort splits the array; each half
  is sorted exactly once. No reason to memoize.
- **Overlapping subproblems** — the recursion tree re-encounters the
  same subproblem repeatedly. The Fibonacci recurrence is the textbook
  case. Memoization (or its iterative cousin, tabulation) turns
  exponential recursion into polynomial DP. The DP article in this
  guide explores this in depth.

```viz
{ "type": "recursion-tree", "props": { "n": 6, "memoized": false } }
```

The fib(6) call tree above has $\Theta(\varphi^n)$ nodes — every shared
subtree is recomputed independently. That is the failure mode DP exists
to fix.

## Iterative or Recursive?

Most recursive code can be rewritten iteratively, and vice versa. The
question is which is *clearer*. A few heuristics:

- Tree traversals, backtracking, and divide-and-conquer read naturally
  as recursion. Force them iterative and you reintroduce the call stack
  by hand, with worse readability.
- Tight loops over linear data — array sums, string scans — are
  iterative by default. Recursive forms only obscure them.
- Tail recursion (the recursive call is the very last operation) can be
  mechanically converted to a loop. Some languages (Scheme, ML) do this
  automatically. Python and Java do not.

When the recursion depth could exceed the stack, the choice forces
itself: iterative or explicit-stack DFS.

## Pitfalls

```viz
{ "type": "callout", "props": {
  "tone": "pitfall",
  "title": "Missing or unreachable base case",
  "body": "If the recursive step does not strictly reduce the input toward the base case, the recursion does not terminate. Examples: forgetting to subtract one, recursing on the same argument under a different name, recursing into the same half of a sorted array (off-by-one on the midpoint)."
} }
```

```viz
{ "type": "callout", "props": {
  "tone": "pitfall",
  "title": "Combining the wrong way",
  "body": "Writing factorial(n) = factorial(n - 1) is missing the n. The base case is right; the recursive call is right; but the combine step does no work, so the function returns 1 for every input. Always write down what the call returns and how you combine it."
} }
```

```viz
{ "type": "callout", "props": {
  "tone": "pitfall",
  "title": "Exponential blow-up from naive recurrences",
  "body": "If the recurrence is T(n) = 2 T(n - 1) + O(1) or T(n) = T(n - 1) + T(n - 2) and you do not memoize, the cost is exponential. Spot the overlapping subproblems and add a cache, or rewrite as tabulation."
} }
```

## Practice
- Compute factorial both recursively and iteratively. Compare stack
  depth at $n = 10^5$.
- Sum the elements of a list recursively. Then do it tail-recursively.
- Implement mergesort. Walk through the recursion tree for an 8-element
  array.
- Find the maximum element of a binary tree recursively.
- Compute Fibonacci three ways: naive recursion, memoized recursion,
  iterative tabulation. Time each at $n = 35$.

## References
1. Cormen, Leiserson, Rivest, Stein. *Introduction to Algorithms, 4th ed.*, Chapter 4.
2. Sedgewick & Wayne. *Algorithms, 4th ed.*, Chapter 1.
3. Skiena. *The Algorithm Design Manual*, Chapter 4.
