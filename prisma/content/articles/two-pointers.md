---
slug: two-pointers
title: Two Pointers Pattern
summary: A single-pass O(n) technique that replaces O(n²) nested loops for pair-search and palindrome-style problems on sorted data.
topicSlug: arrays-and-strings
level: INTERMEDIATE
order: 3
estimatedMins: 14
references:
  - { title: "Introduction to Algorithms, 4th ed.", author: "Cormen, Leiserson, Rivest, Stein", type: "book" }
  - { title: "Competitive Programmer's Handbook, Ch. 9", author: "Antti Laaksonen", url: "https://cses.fi/book/book.pdf", type: "book" }
  - { title: "Two Pointers Method", url: "https://cp-algorithms.com/", type: "web" }
prerequisites: ["array-fundamentals"]
---

## Overview
The two-pointers pattern is the simplest way to turn an $O(n^2)$ pair
search into $O(n)$ on sorted data. Place one index at each end of the
array and move them toward each other; each iteration discards an entire
column or row of the implicit pair matrix.

It is a special case of a more general principle: when the search space
is structured *and* the predicate is monotone in some direction, you can
exploit the monotonicity to advance only one pointer per step.

## Converging Pointers

The classic shape: find two numbers in a sorted array that sum to a
target. Brute force tries every pair, $O(n^2)$. Two pointers does it in
one sweep.

```viz
{ "type": "two-pointers", "props": {
  "values": [1, 3, 4, 5, 7, 8, 11, 14],
  "target": 11
} }
```

Step through and watch the logic: if $A[L] + A[R]$ is too small, the only
way to grow it is `L++` (since `R` is already as large as possible without
pairing with `L`). If too large, `R--`. Equality is the answer.

```python
def two_sum_sorted(A, target):
    L, R = 0, len(A) - 1
    while L < R:
        s = A[L] + A[R]
        if s == target: return (L, R)
        if s < target:  L += 1
        else:           R -= 1
    return None
```

```viz
{ "type": "callout", "props": {
  "tone": "intuition",
  "title": "Why this is O(n)",
  "body": "Each iteration moves exactly one of L or R by one step toward the other. The pointers can collide after at most n steps. Two pointers, both monotone — the loop is O(n)."
} }
```

## The Other Shape: Same-Direction Pointers

When both pointers move in the same direction at different speeds, the
pattern goes by other names — *sliding window*, *fast/slow*, *write/read*.
The general idea is the same: maintain an invariant between two indices
and advance one of them on each step.

A canonical example: *partition an array* in place so that all zeroes
move to the end while non-zero values keep their order.

```python
def move_zeroes(A):
    write = 0
    for read in range(len(A)):
        if A[read] != 0:
            A[write] = A[read]
            write += 1
    for i in range(write, len(A)):
        A[i] = 0
```

`read` walks the entire array; `write` only advances when we copy a
useful value. The invariant: everything to the left of `write` is the
prefix of the answer.

## The Three Pointer Patterns

| Pattern               | Shape                  | Used for                                  |
| --------------------- | ---------------------- | ----------------------------------------- |
| Converging            | $L \to \cdot \gets R$  | Sorted pair search, palindrome check.     |
| Same direction        | both advance forward   | Sliding window, in-place partition.       |
| Fast/slow             | one moves 2×           | Cycle detection in linked lists (Floyd's tortoise/hare). |

Each of these gets its own essay later; this article introduces the
common skeleton.

## When Two Pointers Does *Not* Apply

```viz
{ "type": "callout", "props": {
  "tone": "pitfall",
  "title": "Sortedness is the precondition",
  "body": "On unsorted data, A[L] + A[R] tells you nothing — the optimum could be anywhere. Sort first, but remember sorting is O(n log n); the technique only pays off when you do many queries against the same array, or when sorting is free."
} }
```

```viz
{ "type": "callout", "props": {
  "tone": "pitfall",
  "title": "Forgetting to advance",
  "body": "Every branch in the loop body must either advance a pointer or return. Branches that 'continue' without moving anything are infinite-loop bugs waiting to happen."
} }
```

## Practice
- Valid palindrome (skip non-alphanumerics, ignore case).
- Two-sum on a sorted array (return indices).
- Three-sum: fix one index, two-pointer the rest.
- Container with most water (converging pointers, $O(n)$).
- Remove duplicates from a sorted array in place.

## References
1. Laaksonen. *Competitive Programmer's Handbook*, Chapter 9.
2. cp-algorithms.com. "Two Pointers Method."
