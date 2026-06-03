---
slug: comparison-sorts
title: "Comparison-Based Sorts: Merge, Quick, and Heap"
summary: "The three workhorse comparison sorts, the Omega(n log n) lower bound, and the engineering tradeoffs that decide which one your standard library actually uses."
topicSlug: sorting
level: FOUNDATION
order: 1
estimatedMins: 24
references:
  - { title: "Introduction to Algorithms, 4th ed., Ch. 2, 6, 7", author: "Cormen, Leiserson, Rivest, Stein", type: "book" }
  - { title: "Algorithms, 4th ed., Ch. 2", author: "Sedgewick & Wayne", type: "book" }
  - { title: "Programming Pearls, Column 11", author: "Jon Bentley", type: "book" }
prerequisites: ["recursion-fundamentals", "asymptotic-notation"]
---

## Overview
A *comparison sort* puts items in order using only pairwise
comparisons — no peeking at internal structure of the elements, no
arithmetic on keys, no hash. The three classics — mergesort, quicksort,
and heapsort — all run in $\Theta(n \log n)$ comparisons in their good
cases. None of the three is strictly best at everything; the choice is
an engineering decision among a handful of tradeoffs that this article
makes explicit.

There is also a *lower bound* that nobody can break: $\Omega(n \log n)$
comparisons in the worst case for any comparison-based sort. Knowing
why it holds is half the reason to study these algorithms.

## The Decision-Tree Lower Bound

Any comparison sort, on any input, traces a path through a *decision
tree* whose internal nodes are comparisons and whose leaves are the
$n!$ possible permutations. To distinguish all $n!$ outcomes the tree
must have at least $n!$ leaves. A binary tree with $L$ leaves has
height at least $\log_2 L$. So the worst-case comparison count is at
least $\log_2(n!) = \Theta(n \log n)$ by Stirling's approximation.

This bound applies to *any* comparison sort, however clever. To beat
it you have to look at something besides comparisons — see the next
article on non-comparison sorts.

```viz
{ "type": "callout", "props": {
  "tone": "intuition",
  "title": "Why log(n!) is n log n",
  "body": "Stirling gives log(n!) approximately n log n - n. For n = 1024 that's 9000 comparisons. Mergesort hits 10240 (n times log n with n = 1024). Reading the worst-case constant off the lower bound predicts how much room there is to improve — and the answer is, not much."
} }
```

## Mergesort: Predictable, Stable, External

The canonical divide-and-conquer sort. Split the array in half, sort
each half recursively, merge.

```python
def mergesort(A):
    if len(A) <= 1: return A
    mid = len(A) // 2
    L, R = mergesort(A[:mid]), mergesort(A[mid:])
    return merge(L, R)

def merge(L, R):
    out = []
    i = j = 0
    while i < len(L) and j < len(R):
        if L[i] <= R[j]: out.append(L[i]); i += 1
        else:            out.append(R[j]); j += 1
    out.extend(L[i:]); out.extend(R[j:])
    return out
```

The recurrence $T(n) = 2T(n/2) + \Theta(n)$ gives $\Theta(n \log n)$ —
worst case and best case alike. No surprises.

- **Stable**: equal elements keep their relative order, because the
  merge uses `<=`.
- **External**: handles inputs larger than memory. Sort each block that
  fits in RAM, then merge passes from disk.
- **Auxiliary space**: $\Theta(n)$ — the merge needs scratch.

That extra $\Theta(n)$ is the reason mergesort is not the default
in-place sort. It is, however, the default for *linked lists* (the
linked-list merge is in-place) and for stable sorts in many standard
libraries (`Arrays.sort` for objects in Java, Python's Timsort).

## Quicksort: Average-Case Fast, Worst-Case Slow

Pick a pivot, partition the array into smaller-than-pivot and
larger-than-pivot, recurse on each side. The Lomuto and Hoare
partitions are two implementations; both are $\Theta(n)$.

```python
def quicksort(A, lo, hi):
    if lo >= hi: return
    p = partition(A, lo, hi)
    quicksort(A, lo, p - 1)
    quicksort(A, p + 1, hi)
```

Cost depends on the pivot:

- A pivot near the median yields $T(n) = 2T(n/2) + \Theta(n) = \Theta(n
  \log n)$.
- A pivot at the smallest or largest element yields $T(n) = T(n - 1) +
  \Theta(n) = \Theta(n^2)$.

Two fixes for the worst case:

- **Randomize the pivot.** Expected $\Theta(n \log n)$ over the
  algorithm's random choices, for *any* input. An adversary cannot
  craft a worst case.
- **Median-of-three.** Pick three candidates and use their median.
  Heuristic but effective in practice.

Quicksort is in-place ($\Theta(\log n)$ auxiliary stack space) and has
exceptionally good cache behavior, which is why it tends to win
benchmarks on raw integer arrays despite mergesort's tighter bound.

```viz
{ "type": "callout", "props": {
  "tone": "intuition",
  "title": "Why randomization is the right fix",
  "body": "A deterministic median-of-three pivot can still hit O(n²) on adversarial inputs (Bentley and McIlroy's 'antiqsort' is the famous example). Randomization moves the worst case from the input to the random tape — the adversary cannot beat the algorithm by choosing input."
} }
```

## Heapsort: Tight Bound, Constant Memory

Build a max-heap in place (the array doubles as a complete binary tree)
in $\Theta(n)$. Then $n$ times: swap the root with the last unsorted
element, decrement the heap size, sift the new root down. Each
sift-down is $\Theta(\log n)$.

```python
def heapsort(A):
    build_max_heap(A)                # O(n)
    for end in range(len(A) - 1, 0, -1):
        A[0], A[end] = A[end], A[0]
        sift_down(A, 0, end)         # O(log n)
```

Total $\Theta(n \log n)$, worst case and best case. Heapsort is
in-place with $\Theta(1)$ auxiliary memory, but its constants are
worse than quicksort's because the access pattern jumps around the
array (children at $2i+1, 2i+2$), defeating the cache.

## The Comparison Table

| Sort     | Average    | Worst      | Aux space | Stable | Cache | In place |
| -------- | ---------- | ---------- | --------- | ------ | ----- | -------- |
| Mergesort | $n \log n$ | $n \log n$ | $n$       | yes    | good  | no       |
| Quicksort | $n \log n$ | $n^2$      | $\log n$  | no     | excellent | yes  |
| Heapsort  | $n \log n$ | $n \log n$ | $1$       | no     | poor  | yes      |
| Insertion | $n^2$      | $n^2$      | $1$       | yes    | excellent | yes  |

```viz
{ "type": "complexity-chart", "props": { "maxN": 256, "curves": ["nlogn", "n2"] } }
```

The chart makes the failure mode visible. Below $n \approx 30$, the
$\Theta(n^2)$ curve is competitive — that is why production sorts use
*insertion sort* on small subarrays.

## Why Your Standard Library Uses a Hybrid

The actual sorts in Python (`sorted`/`list.sort`), Java (`Arrays.sort`
for primitives), and C++ (`std::sort`) are not pure mergesort,
quicksort, or heapsort. They are hybrids:

- **Timsort** (Python, Java for objects). Mergesort variant that finds
  pre-existing sorted runs and merges them. Linear on nearly-sorted
  input.
- **Introsort** (C++ `std::sort`, Java for primitives). Quicksort,
  with a depth guard: if recursion gets too deep (signaling bad
  pivots), fall back to heapsort to guarantee $O(n \log n)$ worst
  case.
- **Pattern-defeating quicksort (pdqsort)** (Rust `sort_unstable`,
  some C++ libraries). Introsort plus pattern detection that recognizes
  and handles common inputs (already sorted, reverse sorted, many
  duplicates) in linear time.

The lesson: real-world sort implementations are tuned for *common
shapes* of real input, not for worst-case adversarial inputs.

## When Stability Matters

A sort is *stable* if equal elements keep their original order. This is
free for mergesort, expensive (and often skipped) for quicksort and
heapsort. Stability matters when you sort by a secondary key after a
primary one — e.g., sort employees by department, then by name within
department. Use a stable sort and the second pass preserves the first.

## Pitfalls

```viz
{ "type": "callout", "props": {
  "tone": "pitfall",
  "title": "Quicksort without randomization",
  "body": "On sorted, reverse-sorted, or many-duplicate inputs, a fixed-pivot quicksort hits O(n²). Always randomize the pivot or use a hybrid (introsort) for production code."
} }
```

```viz
{ "type": "callout", "props": {
  "tone": "pitfall",
  "title": "Trusting comparators",
  "body": "A comparator must be a total order: reflexive, antisymmetric, transitive. Returning floats for comparison (NaN propagating) breaks transitivity and yields nonsense. Java's Comparator.compareTo and C++'s strict-weak-ordering requirements are not optional."
} }
```

```viz
{ "type": "callout", "props": {
  "tone": "pitfall",
  "title": "In-place is not always free",
  "body": "Heapsort is in-place but slow because of cache misses. Mergesort is fast but allocates. In-place rarely means 'better' — measure on realistic inputs."
} }
```

## Practice
- Implement mergesort recursively. Verify stability on
  `[(1, "a"), (1, "b"), (1, "c")]`.
- Implement quicksort with the Lomuto partition. Then with Hoare.
  Compare comparison counts.
- Implement heapsort using an in-place max-heap.
- Count the number of inversions in an array in $O(n \log n)$.
- External merge sort: sort 10 GB of integers using only 1 GB of RAM.

## References
1. Cormen, Leiserson, Rivest, Stein. *Introduction to Algorithms, 4th ed.*, Chapters 2, 6, 7.
2. Sedgewick & Wayne. *Algorithms, 4th ed.*, Chapter 2.
3. Bentley. *Programming Pearls*, Column 11.
