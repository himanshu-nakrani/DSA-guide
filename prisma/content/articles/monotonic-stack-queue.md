---
slug: monotonic-stack-queue
title: Monotonic Stack and Monotonic Deque
summary: "Maintain a stack or deque whose values stay in monotonic order — each element enters and leaves once, yielding O(n) solutions to next-greater, sliding-window-max, and histogram-rectangle problems."
topicSlug: stacks-and-queues
level: INTERMEDIATE
order: 2
estimatedMins: 22
references:
  - { title: "Competitive Programmer's Handbook, Ch. 8", author: "Antti Laaksonen", url: "https://cses.fi/book/book.pdf", type: "book" }
  - { title: "Introduction to Algorithms, 4th ed., Ch. 10", author: "Cormen, Leiserson, Rivest, Stein", type: "book" }
prerequisites: ["stack-queue-fundamentals"]
---

## Overview
A *monotonic stack* is a stack whose contents are kept in monotone
order (strictly increasing or strictly decreasing) as new elements
arrive. When a new value violates the order, you pop until the
invariant is restored, then push.

The technique turns a class of $O(n^2)$ algorithms into $O(n)$. Each
element enters the stack once and leaves once, so the total work
across the entire input is linear — even though the inner pop loop
*looks* like it could blow up.

The monotonic *deque* is the same idea with a queue, used when the
problem also has elements *leaving* from the other end (sliding
windows).

## Pattern 1: Next Greater Element

Classic problem: given an array $A$, for each $i$ find the next index
$j > i$ such that $A[j] > A[i]$. (Or report $-1$ if none.) Brute force
is $O(n^2)$. Monotonic stack does it in $O(n)$.

```python
def next_greater(A):
    n = len(A)
    ans = [-1] * n
    stack = []     # indices, with A[stack] strictly decreasing
    for i in range(n):
        while stack and A[stack[-1]] < A[i]:
            ans[stack.pop()] = i
        stack.append(i)
    return ans
```

The invariant: the values on the stack are strictly decreasing. When
$A[i]$ arrives, it is the *next greater element* for every value on
the stack that it exceeds — so we pop them, recording $i$ as their
answer, and then push $i$.

```viz
{ "type": "next-greater-stack", "props": {
  "caption": "Next-greater stack: pop smaller unresolved values",
  "values": [2, 1, 2, 4, 3, 5]
} }
```

```viz

{ "type": "callout", "props": {
  "tone": "intuition",
  "title": "Why this is O(n)",
  "body": "Each index is pushed onto the stack at most once and popped at most once. The inner while loop looks dangerous but its total body executions across all i is bounded by n. Two pointers in disguise — amortized linear."
} }
```

The pattern flips trivially for *next smaller*, *previous greater*,
and *previous smaller* — change the comparison direction, or scan from
right to left.

## Pattern 2: Largest Rectangle in a Histogram

Given bar heights $h_0, h_1, \ldots, h_{n-1}$, find the largest
axis-aligned rectangle inscribed under them.

The reduction: for each bar $i$, the widest rectangle whose height is
exactly $h_i$ extends *leftward* until a bar shorter than $h_i$
appears, and *rightward* similarly. Find the previous-smaller and
next-smaller indices for each bar; the rectangle's width is
$\text{next} - \text{prev} - 1$.

```python
def largest_rectangle(h):
    n = len(h)
    stack = []
    best = 0
    for i in range(n + 1):
        cur = h[i] if i < n else 0   # sentinel forces final flush
        while stack and h[stack[-1]] >= cur:
            top = stack.pop()
            left = stack[-1] if stack else -1
            best = max(best, h[top] * (i - left - 1))
        stack.append(i)
    return best
```

The trailing sentinel ($\text{cur} = 0$ at $i = n$) flushes every
remaining bar. The whole algorithm is one pass — $\Theta(n)$ time and
$\Theta(n)$ stack space.

```viz
{ "type": "architecture", "props": {
  "caption": "Monotonic stack — the invariants",
  "cols": 12, "rows": 4, "height": 280,
  "boxes": [
    { "id": "in",   "label": "incoming A[i]", "col": 0, "row": 0, "colSpan": 4, "emphasis": "primary" },
    { "id": "pop",  "label": "while top violates order", "sub": "pop, record answer", "col": 4, "row": 0, "colSpan": 4, "emphasis": "warn" },
    { "id": "push", "label": "push i (or A[i])", "sub": "invariant restored", "col": 8, "row": 0, "colSpan": 4 },
    { "id": "amort", "label": "each index: 1 push + at most 1 pop", "sub": "total work across n iterations: O(n)", "col": 1, "row": 2, "colSpan": 10, "rowSpan": 2, "emphasis": "primary" }
  ],
  "arrows": [
    { "from": "in", "to": "pop" },
    { "from": "pop", "to": "push" }
  ]
} }
```

## Pattern 3: Sliding Window Maximum

Given an array and a window size $k$, output the maximum of every
contiguous window. A naive solution is $\Theta(nk)$. A monotonic
*deque* solves it in $\Theta(n)$.

Maintain a deque of indices where $A[\text{deque}]$ is strictly
decreasing. The front is always the index of the current window's
maximum.

```python
from collections import deque

def window_max(A, k):
    out, dq = [], deque()
    for i, x in enumerate(A):
        while dq and A[dq[-1]] <= x:    # maintain decreasing
            dq.pop()
        dq.append(i)
        if dq[0] <= i - k:              # drop expired
            dq.popleft()
        if i >= k - 1:
            out.append(A[dq[0]])
    return out
```

### Watch the deque maintain the maximum

Step through the two-ended discipline: remove dominated values from the back, expire indices from the front, and read the current maximum at the front.

```viz
{ "type": "monotonic-deque-window", "props": {
  "caption": "Monotonic deque: keep the window maximum at the front",
  "windowSize": 3,
  "values": [1, 3, -1, -3, 5, 3, 6, 7]
} }
```

Two flavors of monotonic discipline at once:

- *Push* from the back: drop any back element that the new value
  dominates.
- *Pop* from the front: drop the front when its index leaves the
  window.

The deque holds at most $k$ indices, and each index enters and leaves
once — $\Theta(n)$ total, $\Theta(k)$ space.

## When the Pattern Applies

The cheat sheet:

| Problem shape                                   | Use                |
| ----------------------------------------------- | ------------------ |
| Next/previous greater/smaller element           | Monotonic stack    |
| Largest rectangle in histogram                  | Monotonic stack    |
| Maximal rectangle in a binary matrix            | Monotonic stack (per row) |
| Sliding window max or min                       | Monotonic deque    |
| Stock span / daily temperatures                 | Monotonic stack    |
| Sum of subarray minimums                        | Monotonic stack    |
| Trap rainwater (two-pass or monotonic stack)    | Monotonic stack    |

The unifying signal: the problem asks about a *value relative to its
neighbors* on a range that may slide or extend. If yes, a monotone
data structure removes the inner loop.

## Pitfalls

```viz
{ "type": "callout", "props": {
  "tone": "pitfall",
  "title": "Strict vs. non-strict ordering",
  "body": "For next greater, use < when popping (strict): equal values do not get the same next-greater. For largest rectangle, use >= (non-strict): equal bars are correctly grouped under one rectangle. The right comparison depends on whether duplicates should share answers."
} }
```

```viz
{ "type": "callout", "props": {
  "tone": "pitfall",
  "title": "Index, not value, in many problems",
  "body": "When the answer is positional (next-greater index, rectangle width), store indices on the stack. Storing values loses the position information you need. The check is then 'A[stack[-1]]' rather than 'stack[-1]'."
} }
```

```viz
{ "type": "callout", "props": {
  "tone": "pitfall",
  "title": "Sentinel for the final flush",
  "body": "In largest-rectangle and several other patterns, iterate to n inclusive with a virtual zero or infinity at the end. Without it, the elements remaining on the stack at the end are never recorded."
} }
```

## Practice
- Next greater element. Then previous greater. Then circular variant
  (next-greater modulo $n$).
- Daily temperatures (LeetCode 739).
- Largest rectangle in a histogram.
- Maximal rectangle in a binary matrix (histogram per row).
- Sliding window maximum.
- Sum of subarray minimums (count contributions via prev-smaller and
  next-smaller).
- Trap rainwater, two ways: two pointers, and monotonic stack.

## References
1. Laaksonen. *Competitive Programmer's Handbook*, Chapter 8.
2. Cormen, Leiserson, Rivest, Stein. *Introduction to Algorithms, 4th ed.*, Chapter 10.
