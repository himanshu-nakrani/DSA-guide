---
slug: binary-search-fundamentals
title: Binary Search on Sorted Arrays
summary: Halve the search space at every step to locate a target in a sorted array in O(log n).
topicSlug: binary-search
level: FOUNDATION
order: 1
estimatedMins: 12
references:
  - { title: "Introduction to Algorithms, 4th ed., Ch. 2", author: "Cormen, Leiserson, Rivest, Stein", type: "book" }
  - { title: "Binary Search", url: "https://cp-algorithms.com/num_methods/binary_search.html", type: "web" }
prerequisites: ["array-fundamentals", "asymptotic-notation"]
---

## Overview
Binary search is an efficient algorithm for finding a target value within a sorted array. By repeatedly dividing the search interval in half, it achieves a logarithmic time complexity, making it vastly superior to linear search for large datasets.

## Prerequisites
- Array Fundamentals
- Asymptotic Notation

## Core Idea
If the array is sorted, we can compare the target value with the middle element. If they match, we are done. If the target is smaller, it must lie in the left half; if larger, in the right half. We discard the irrelevant half and repeat.

## Mechanics
```text
function binary_search(A, n, T):
    L := 0
    R := n - 1
    while L <= R:
        m := floor((L + R) / 2)
        if A[m] == T:
            return m
        else if A[m] < T:
            L := m + 1
        else:
            R := m - 1
    return unsuccessful
```
*Note: In languages with fixed-size integers, `m := L + floor((R - L) / 2)` is preferred to prevent overflow.*

## Complexity
- **Time**: $O(\log n)$ because the search space is halved in each iteration.
- **Space**: $O(1)$ for the iterative approach. (Recursive approach is $O(\log n)$ due to call stack).

## Common Patterns
1. **Finding First/Last Occurrence**: Modify the condition to continue searching in the left/right half even after a match is found.
2. **Binary Search on Answer**: When the answer space is monotonic (e.g., "can we achieve X with capacity Y?"), we can binary search the answer itself, not just an array index.

## Pitfalls
- **Infinite loops**: Using `L < R` without proper pointer updates (e.g., `L = m` instead of `L = m + 1`) can cause the loop to stall.
- **Integer overflow**: Calculating `(L + R) / 2` can overflow in languages like Java or C++ if `L` and `R` are large. Use `L + (R - L) / 2`.
- **Applying to unsorted data**: Binary search strictly requires the data to be sorted or monotonic.

## Practice
- Implement standard binary search.
- Find the first and last position of an element in a sorted array.
- Search in a rotated sorted array.

## References
1. Cormen, Leiserson, Rivest, Stein. *Introduction to Algorithms, 4th ed.*, Chapter 2.
2. cp-algorithms.com. "Binary Search".
