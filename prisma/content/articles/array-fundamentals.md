---
slug: array-fundamentals
title: Array Fundamentals
summary: Contiguous memory, O(1) random access, and the cost model behind every other data structure built on top of it.
topicSlug: arrays-and-strings
level: FOUNDATION
order: 1
estimatedMins: 14
references:
  - { title: "Introduction to Algorithms, 4th ed., Ch. 10", author: "Cormen, Leiserson, Rivest, Stein", type: "book" }
  - { title: "Algorithms, 4th ed., Ch. 1.3 (Bags, Queues, and Stacks)", author: "Sedgewick & Wayne", type: "book" }
  - { title: "What Every Programmer Should Know About Memory", author: "Ulrich Drepper", url: "https://akkadia.org/drepper/cpumemory.pdf", type: "paper" }
prerequisites: ["asymptotic-notation"]
---

## Overview
An array is the simplest non-trivial data structure: a block of memory laid
out contiguously, where elements of a single, known size sit next to each
other. From this single primitive — *random access in constant time* —
nearly every other practical data structure is built. Strings are arrays.
Hash tables are arrays. Heaps are arrays. The dynamic array that powers
`std::vector`, `ArrayList`, and Python's `list` is an array with a growth
policy stapled on top.

Understanding what an array is at the hardware level is, in a real sense,
understanding the cost model the rest of this guide assumes.

## The Address Calculation

If the array starts at memory address `base` and each element occupies
`stride` bytes, then the address of element `i` is

$$\text{addr}(i) = \text{base} + i \cdot \text{stride}.$$

That arithmetic is a single multiply-add. It does not depend on the size of
the array, which is what makes random access $O(1)$ — and which is also what
makes it *only* work for contiguous, fixed-size element layouts.

```viz
{ "type": "array-memory", "props": {
  "values": [17, 42, 8, 23, 4, 99, 5, 31],
  "base": 4096,
  "stride": 4
} }
```

Hover any cell to see the formula in action. The array stores nothing about
its own indices: index `i` is purely a name for an offset.

## Operation Costs

| Operation                     | Cost                | Notes                                            |
| ----------------------------- | ------------------- | ------------------------------------------------ |
| Access `A[i]`                 | $\Theta(1)$         | One pointer arithmetic, one load.                |
| Linear search                 | $\Theta(n)$         | Worst-case scan.                                 |
| Binary search (sorted)        | $\Theta(\log n)$    | Requires sortedness.                             |
| Insert / delete at end        | $\Theta(1)$ amortized | Dynamic array only; fixed array is full.       |
| Insert / delete at middle     | $\Theta(n)$         | Shift on average $n/2$ elements.                 |
| Insert / delete at front      | $\Theta(n)$         | Shift everything.                                |
| Reverse, sum, max             | $\Theta(n)$         | Single pass.                                     |
| Sort                          | $\Theta(n \log n)$  | Comparison-based.                                |

If a problem mutates the *middle* of an array repeatedly, an array is the
wrong data structure for the hot path. That is the whole reason linked lists,
balanced trees, and skip lists exist.

## Static vs. Dynamic Arrays

A *static* array has a fixed capacity baked in at allocation: `int A[1000]`,
`new int[1000]`. Once full, it is full. A *dynamic* array carries a separate
*capacity* (how much memory is reserved) and *size* (how many slots are in
use). Push appends to the next free slot; when capacity is exhausted, it
allocates a new buffer (typically twice as large), copies the old contents
across, and frees the old buffer.

```viz
{ "type": "architecture", "props": {
  "caption": "Anatomy of a dynamic array (e.g. std::vector)",
  "cols": 12, "rows": 3, "height": 240,
  "boxes": [
    { "id": "user", "label": "user code", "sub": "vec.push_back(x)", "col": 0, "row": 0, "colSpan": 3, "emphasis": "muted" },
    { "id": "vec",  "label": "vector header", "sub": "size · cap · ptr", "col": 4, "row": 0, "colSpan": 3, "emphasis": "primary" },
    { "id": "buf",  "label": "buffer (heap)", "sub": "contiguous capacity slots", "col": 8, "row": 0, "colSpan": 4 },
    { "id": "grow", "label": "grow() : new buffer of 2·cap", "sub": "memcpy old → new, free old", "col": 4, "row": 2, "colSpan": 8, "emphasis": "warn" }
  ],
  "arrows": [
    { "from": "user", "to": "vec",  "label": "push" },
    { "from": "vec",  "to": "buf",  "label": "ptr" },
    { "from": "vec",  "to": "grow", "label": "when size = cap", "dashed": true }
  ]
} }
```

```viz
{ "type": "callout", "props": {
  "tone": "intuition",
  "title": "Why doubling?",
  "body": "Doubling makes the amortized cost per push O(1). If you grew by a fixed amount k each time, n pushes would copy ~n²/(2k) elements total — that's O(n²) work spread across n pushes, or O(n) amortized per push. Doubling spends only O(n) total copies."
} }
```

## Locality and Why Arrays Are Fast in Practice

The asymptotic costs above hide a constant factor that, on real hardware,
swings by an order of magnitude. Modern CPUs fetch memory in 64-byte
**cache lines** — when you read `A[i]`, you also pull `A[i+1]..A[i+15]` into
L1 for free. A linear scan over an array is the friendliest memory access
pattern there is. A linear scan over a linked list, by contrast, is a
*pointer chase* — each `next` may live anywhere in memory, and the CPU
stalls waiting for L2 or main memory on every hop.

The result: in benchmarks an array scan often beats a linked-list scan by
10× or more even though both are $\Theta(n)$. The Big-O is honest; the
constants are not friendly.

> [!MARGIN] Cache line, briefly
> The unit your CPU reads at — 64 bytes on x86 and aarch64. The whole line
> arrives even if you asked for one byte, so the next 63 are "free."

## Common Patterns

Most array problems decompose into one of these three idioms:

1. **Two pointers** — left and right indices that move toward or with each
   other, eliminating the inner loop of a brute-force pair search.
2. **Sliding window** — a contiguous range `[L, R]` that expands and
   contracts, maintaining a running aggregate.
3. **Prefix sums** — precompute partial sums so any range sum is $O(1)$.

Each gets its own essay later in the curriculum.

## Pitfalls

```viz
{ "type": "callout", "props": {
  "tone": "pitfall",
  "title": "Off-by-one and half-open intervals",
  "body": "Decide once whether your range is [L, R) or [L, R] and stick to it. Mixing conventions in the same function is the single most reliable way to write a wrong loop."
} }
```

```viz
{ "type": "callout", "props": {
  "tone": "pitfall",
  "title": "Mutating while iterating",
  "body": "Removing an element shifts everything after it by one. Iterate backwards, or build a new list. Forward iteration with index increment after removal is the classic bug."
} }
```

```viz
{ "type": "callout", "props": {
  "tone": "pitfall",
  "title": "Push is amortized, not worst-case",
  "body": "A single push that triggers a grow is O(n). For low-latency code paths, reserve capacity up front (vec.reserve(n)) to flatten the worst case."
} }
```

## Practice
- Reverse an array in place using two pointers, $O(n)$ time, $O(1)$ space.
- Kadane's algorithm: maximum sum contiguous subarray in $O(n)$.
- Move all zeroes to the end while preserving the order of non-zero
  elements, in place.
- Rotate an array by $k$ positions in $O(n)$ time and $O(1)$ extra space.
  (Hint: three reversals.)

## References
1. Cormen, Leiserson, Rivest, Stein. *Introduction to Algorithms, 4th ed.*, Chapter 10.
2. Sedgewick & Wayne. *Algorithms, 4th ed.*, Section 1.3.
3. Drepper. "What Every Programmer Should Know About Memory."
