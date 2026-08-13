---
slug: loop-invariants
title: Loop Invariants and Why You Should Write Them
summary: Asymptotic notation tells you how fast a loop is. A loop invariant tells you whether it's correct. The two questions are independent and both have to be answered.
topicSlug: complexity-analysis
level: INTERMEDIATE
order: 3
estimatedMins: 14
references:
  - { title: "Introduction to Algorithms, 4th ed., Ch. 2.1", author: "Cormen, Leiserson, Rivest, Stein", type: "book" }
  - { title: "Proofs and Algorithms", author: "Gilles Dowek", type: "book" }
  - { title: "Loop Invariants", url: "https://en.wikipedia.org/wiki/Loop_invariant", type: "web" }
  - { title: "Hoare logic", author: "C. A. R. Hoare, 1969", type: "paper" }
prerequisites: [asymptotic-notation]
---

## Overview

A loop is a promise to repeat something until a condition becomes false.
For the promise to be useful, two things must be true:

1. Each iteration makes some kind of progress.
2. When the loop ends, the *thing you wanted* is actually true.

A **loop invariant** is a property of the program state that holds before
the loop starts, is preserved by each iteration, and — combined with the
loop's termination condition — proves that the loop did what you intended.

Writing one down is the closest thing the discipline has to a compile-time
correctness check.

> [!MARGIN] Hoare logic in a sentence
> Pre-condition `P`, loop body that preserves invariant `I`, post-condition
> `Q = I ∧ ¬loop-condition`. Every algorithms textbook is teaching this
> framework even when it doesn't say so.

## The Three Things to Prove

For a candidate invariant `I` and a loop `while B do S`:

- **Initialization.** `I` holds before the first iteration.
- **Maintenance.** If `I ∧ B` holds at the top of the loop body, then `I`
  holds again at the bottom (after running `S`).
- **Termination.** The loop eventually exits, and at that point `I ∧ ¬B`
  implies what you wanted to prove.

All three are needed. Many subtle bugs are *initialization* bugs (the
invariant doesn't hold on entry because you forgot to initialize a counter)
or *termination* bugs (the loop preserves the invariant forever and just
runs off into the sunset).

```viz
{ "type": "callout", "props": {
  "tone": "pitfall",
  "title": "Termination isn't free",
  "body": "Maintenance proves the loop body doesn't break the invariant. It does NOT prove the loop ends. You need a separate argument — usually 'some non-negative integer strictly decreases each iteration.'"
} }
```

## Worked Example: Linear Search

```python
def find(a, target):
    i = 0
    while i < len(a):
        if a[i] == target:
            return i
        i += 1
    return -1
```

**Invariant.** "`target` does not appear in `a[0..i-1]`."

- *Initialization.* Before the first iteration `i = 0`, so `a[0..-1]` is the
  empty slice and the statement is vacuously true.
- *Maintenance.* If the invariant holds at the top, two cases. Either
  `a[i] == target` and we return — the function is done. Or
  `a[i] != target`, we increment `i`, and the new invariant is "target
  does not appear in `a[0..i]`" — which is the old invariant plus the
  freshly checked $a[i]$.
- *Termination.* The non-negative integer `len(a) - i` strictly decreases
  each iteration; the loop exits in $\le |a|$ steps. On exit `i = len(a)`,
  so the invariant becomes "target does not appear in `a`" — and we return
  $-1$, which is correct.

Trivial example, deliberately. The point is that you write it out *once*
and now never have to wonder again whether `i` should have started at $0$ or
$1$, or whether the loop body's termination clause was off-by-one.

### Trace the claim, not just the code

The useful habit is to read a loop state as a claim about the data, rather
than as a collection of changing variables. Step through the prefix below:
the blue cells are the part you have already justified, while the ochre cell
is the only new fact the next iteration must establish.

```viz
{ "type": "invariant-trace", "props": {
  "values": [8, 3, 11, 6, 14, 2],
  "target": 14,
  "caption": "Linear search proof trace: grow the checked prefix one element at a time"
} }
```

At every **inspect** step, the target may still appear at `i`; the invariant
says only that it cannot be in the prefix to the left. Once the comparison
fails, advancing `i` turns that one new fact into part of the preserved
prefix. This is the maintenance proof in operational form.

> [!MARGIN] Off-by-one bugs as invariant violations
> An off-by-one bug is, almost always, an invariant that holds for the
> wrong half-open interval. Writing the invariant exposes the boundary
> immediately.

## Worked Example: Binary Search

```python
def bsearch(a, target):
    L, R = 0, len(a)  # half-open: a[L..R)
    while L < R:
        m = L + (R - L) // 2
        if a[m] == target: return m
        if a[m] < target: L = m + 1
        else: R = m
    return -1
```

**Invariant.** "If `target` is in `a`, then it is in `a[L..R)`."

- *Initialization.* `L = 0, R = len(a)`. The whole array `a[0..len(a))`
  trivially contains `target` if `target` is in `a`.
- *Maintenance.* Suppose the invariant holds and we compute `m`. Three
  cases. If `a[m] == target`, we return. If `a[m] < target`, then by the
  array's sorted order `target` cannot be in `a[L..m]`; restricting to
  `a[m+1..R)` preserves the invariant. Symmetric for `a[m] > target`.
- *Termination.* The non-negative integer `R - L` strictly decreases each
  iteration (because either `L` grows past `m` or `R` shrinks to `m`). The
  loop exits when `L == R`, leaving `a[L..R)` empty — and the invariant
  then says "if target is in a, it's in the empty set," i.e., target
  isn't in `a`. We return $-1$.

> [!PITFALL] Half-open is the secret
> Mixing `R = len(a)` (exclusive) with `R = len(a) - 1` (inclusive)
> midway through a function is the single most common source of binary
> search bugs. Pick one convention per function and write the invariant
> using its bracket style. The half-open `[L, R)` is usually cleaner.

## Check Your Proof

Before moving on, answer this without looking back at the code. A correct
answer names both the invariant and the loop condition; neither is sufficient
on its own.

```viz
{ "type": "knowledge-check", "props": {
  "question": "For the half-open binary search above, which fact lets an empty window justify returning -1?",
  "answer": 1,
  "choices": [
    { "label": "The midpoint always moves left or right by exactly one." },
    { "label": "The invariant says any target that exists must be in A[L..R), and termination gives L = R, so that range is empty.", "explanation": "The conclusion comes from combining the preserved candidate-range claim with the precise exit condition. Progress alone does not prove absence." },
    { "label": "The array is sorted, so an unsuccessful comparison proves the target is absent." },
    { "label": "L and R start at the first and last valid indices." }
  ]
} }
```

## Termination Functions ("Variants")

The dual of an invariant is a **termination function** or **variant** —
some quantity `V` such that:

- `V` is a non-negative integer (or any element of a well-founded order).
- `V` strictly decreases each iteration.

If you can write one down, the loop terminates in at most `V(initial)`
steps. For binary search, `V = R - L`. For linear search, `V = len(a) - i`.
For Euclid's GCD, `V = b` (the second argument shrinks each step).

```viz
{ "type": "callout", "props": {
  "tone": "insight",
  "title": "Variants for complexity bounds",
  "body": "The initial value of V is also an upper bound on the iteration count, so a variant doubles as a complexity proof. For binary search V starts at n and halves each iteration, giving log₂ n iterations. Same math you got from the asymptotic chapter, derived from the invariant side."
} }
```

## When to Write One

Not every loop deserves a four-line proof in the source. But you should
*be able to* write an invariant for any loop you ship, especially in:

- **Numerical code.** Off-by-ones in floating-point loops compound.
- **Index manipulation.** Two-pointer, sliding-window, partition routines.
- **Concurrent code.** Invariants are how you reason about what other
  threads can and can't observe between iterations.
- **Anything you'll come back to in a year.** Future-you will read the
  invariant first and the code second.

> [!MARGIN] In production code
> A short comment with the invariant — even three lines — pays for itself
> the next time someone touches the loop. Better than a long-winded
> explanation of what each line does.

A useful litmus test: if you can't write an invariant for your loop, you
probably don't fully understand why it works.[^dijkstra]

[^dijkstra]: Edsger Dijkstra's pithy version: "If you cannot derive a program from
its specification, you have not understood the specification." The
invariant *is* the specification of the loop.

## Practice

- Write a one-sentence invariant for a loop that reverses an array in place.
  Name exactly which prefix and suffix are already in their final positions.
- Prove that the two-pointer `while left < right` loop for checking a
  palindrome never compares characters outside the remaining undecided range.
- Take a loop you wrote recently and add a termination variant. If the variant
  does not strictly decrease on every non-returning path, find the path that
  can stall.

## References
