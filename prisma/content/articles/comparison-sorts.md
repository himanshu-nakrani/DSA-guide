---
slug: comparison-sorts
title: Comparison-Based Sorts (Merge, Quick, Heap)
summary: The three workhorse general-purpose sorts, why O(n log n) is the comparison-based lower bound, and when to pick which.
topicSlug: sorting
level: FOUNDATION
order: 1
estimatedMins: 20
references:
  - { title: "Introduction to Algorithms, 4th ed., Ch. 2, 6, 7", author: "Cormen, Leiserson, Rivest, Stein", type: "book" }
  - { title: "Algorithms, 4th ed., Ch. 2 (Sorting)", author: "Sedgewick & Wayne", type: "book" }
prerequisites: ["recursion-fundamentals", "asymptotic-notation"]
---

## Overview
A comparison-based sort orders $n$ items using only pairwise comparisons. Any such algorithm must make at least $\Omega(n \log n)$ comparisons in the worst case — a lower bound established by a decision-tree argument. Three classical sorts achieve this bound (in average or worst case): merge sort, quicksort, and heapsort.

## Prerequisites
- Recursion Fundamentals
- Asymptotic Notation

## Core Idea
The $\Omega(n \log n)$ lower bound: a comparison sort's behavior is determined by the sequence of comparison outcomes. The decision tree has $n!$ leaves (one per permutation) and depth $\ge \log_2(n!) = \Theta(n \log n)$.

The three sorts achieve this through different decompositions:
- **Merge sort**: split, recurse, merge. Always balanced.
- **Quicksort**: partition around a pivot, recurse on both sides. Balance depends on the pivot.
- **Heapsort**: heapify in place, then repeatedly extract the max.

## Mechanics

**Merge sort**:
```text
mergeSort(A, l, r):
    if l + 1 >= r: return
    m = (l + r) / 2
    mergeSort(A, l, m)
    mergeSort(A, m, r)
    merge(A[l..m), A[m..r))   # linear merge using O(n) auxiliary buffer
```

**Quicksort** (Lomuto partition):
```text
quicksort(A, l, r):
    if l >= r: return
    p = partition(A, l, r)    # pivot lands at position p
    quicksort(A, l, p - 1)
    quicksort(A, p + 1, r)
```

**Heapsort**:
```text
build_max_heap(A)             # O(n)
for i in n-1 .. 1:
    swap(A[0], A[i])
    sift_down(A, 0, i)        # O(log n) each
```

## Complexity
| Sort | Best | Average | Worst | Extra space | Stable |
|---|---|---|---|---|---|
| Merge sort | $\Theta(n \log n)$ | $\Theta(n \log n)$ | $\Theta(n \log n)$ | $O(n)$ | Yes |
| Quicksort | $\Theta(n \log n)$ | $\Theta(n \log n)$ | $\Theta(n^2)$ | $O(\log n)$ stack | No (typical impl) |
| Heapsort | $\Theta(n \log n)$ | $\Theta(n \log n)$ | $\Theta(n \log n)$ | $O(1)$ | No |

Quicksort's worst case ($\Theta(n^2)$) requires an adversarial pivot. Production implementations randomize the pivot or use median-of-three to make worst-case inputs astronomically unlikely. Many standard libraries use **introsort** (quicksort that falls back to heapsort if recursion depth exceeds a threshold) to bound the worst case.

## Common Patterns
1. **Stable sorts for tie-breaking**: Sort by secondary key, then by primary with a stable sort. Merge sort and Python's Timsort (a merge-sort variant) are stable.
2. **In-place when memory matters**: Heapsort is $O(1)$ auxiliary; quicksort is $O(\log n)$. Merge sort needs $O(n)$.
3. **External / out-of-core sorting**: Merge sort's sequential access pattern is friendly to disk and tape; this is why classic external sorts are merge-based.

## Pitfalls
- **Quicksort on already-sorted input** with a naïve pivot (always pick first or last) degenerates to $O(n^2)$. Randomize or use median-of-three.
- **Using `sort()` and assuming stability**. C++'s `std::sort` is not stable; `std::stable_sort` is. Java's `Arrays.sort` is stable for objects but not for primitives.
- **Recursion depth**. Languages with small default stacks can blow up on deeply recursive sorts. Use an iterative impl or raise the stack limit.
- **Comparing floats with NaN**. NaN is unordered with everything; sorting can produce arbitrary results.

## Practice
- Implement merge sort and count inversions in the same pass.
- Implement randomized quicksort and run it on adversarial inputs.
- Use a heap to find the $k$ largest elements in a stream.

## References
1. Cormen, Leiserson, Rivest, Stein. *Introduction to Algorithms, 4th ed.*, Chapters 2, 6, 7.
2. Sedgewick & Wayne. *Algorithms, 4th ed.*, Chapter 2.
