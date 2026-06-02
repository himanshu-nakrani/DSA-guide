---
slug: monotonic-stack-queue
title: Monotonic Stack and Queue
summary: Maintain a stack or deque whose values stay in monotonic order to answer next-greater-element and sliding-window-max in O(n).
topicSlug: stacks-and-queues
level: INTERMEDIATE
order: 2
estimatedMins: 18
references:
  - { title: "Competitive Programmer's Handbook, Ch. 8 (Amortized Analysis)", author: "Antti Laaksonen", type: "book" }
  - { title: "Monotonic Stack", url: "https://cp-algorithms.com/", type: "web" }
prerequisites: ["stack-queue-fundamentals"]
---

## Overview
A monotonic stack (or monotonic deque) is a stack/deque maintained in non-increasing or non-decreasing order. Whenever a new element would break the order, you pop elements until it doesn't. This single discipline turns several "for each element, find something" problems from $O(n^2)$ into $O(n)$.

## Prerequisites
- Stack and Queue Fundamentals

## Core Idea
Each element is pushed once and popped at most once over the entire scan, so the total work is $O(n)$ even though any single step may pop many elements. This is amortized analysis in its most readable form.

## Mechanics

**Next greater element (monotonic decreasing stack)**:
```text
result[i] = -1 for all i
stack = []   # stores indices; the values at these indices are strictly decreasing
for i in 0..n-1:
    while stack not empty and a[stack.top()] < a[i]:
        result[stack.pop()] = a[i]
    stack.push(i)
```
At the end, every index $i$ has `result[i]` equal to the next greater value to the right, or $-1$ if none exists.

**Sliding window maximum (monotonic deque)**:
```text
deque = []   # stores indices; values at these indices are non-increasing
for i in 0..n-1:
    while deque not empty and deque.front() <= i - k:
        deque.pop_front()
    while deque not empty and a[deque.back()] < a[i]:
        deque.pop_back()
    deque.push_back(i)
    if i >= k - 1:
        emit a[deque.front()]   # max of window ending at i
```

## Complexity
- Time: $O(n)$. Each index enters and leaves the stack/deque at most once.
- Space: $O(n)$ for the stack/deque in the worst case.

## Common Patterns
1. **Next greater / smaller element** to the left or right: pick the comparison and direction; everything else is template.
2. **Sliding window minimum / maximum**: monotonic deque keyed by index.
3. **Largest rectangle in a histogram**: monotonic increasing stack of bar indices; when a smaller bar arrives, pop and compute the area each popped bar can span.
4. **Stock-span / trapping-rain-water**: variants of next-greater with accumulation.

## Pitfalls
- **Strict vs. non-strict comparison**. `<` and `<=` differ by which equal element "wins." Decide based on the problem (e.g., for next-strictly-greater, pop on `<`).
- **Storing values instead of indices**. You usually need the index for window expiration or distance computation.
- **Forgetting to drain at the end**. Elements left on the stack have no "next greater" — they take the default sentinel.
- **Confusing monotonic with sorted**. The structure is monotonic in *push order*, not in arbitrary access.

## Practice
- Next Greater Element I / II.
- Daily Temperatures.
- Sliding Window Maximum.
- Largest Rectangle in Histogram.
- Trapping Rain Water (monotonic stack solution).

## References
1. Laaksonen, Antti. *Competitive Programmer's Handbook*, Chapter 8.
2. cp-algorithms.com. "Monotonic Stack / Queue".
