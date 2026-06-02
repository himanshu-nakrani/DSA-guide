---
slug: sliding-window
title: Sliding Window Patterns
summary: Maintain a contiguous window that slides over the input in O(n), updating the aggregate in O(1) as elements enter and leave.
topicSlug: prefix-sums-and-sliding-window
level: INTERMEDIATE
order: 2
estimatedMins: 15
references:
  - { title: "Introduction to Algorithms, 4th ed.", author: "Cormen, Leiserson, Rivest, Stein", type: "book" }
  - { title: "cp-algorithms.com", url: "https://cp-algorithms.com/", type: "web" }
prerequisites: []
---

## Overview
The sliding window technique involves maintaining a subset of contiguous elements (the "window") within a larger array or string. The window "slides" over the data structure to efficiently compute aggregates or find optimal subarrays.

## Prerequisites
- Array Fundamentals
- Two Pointers

## Core Idea
Instead of recalculating a metric for every possible subarray from scratch, we update the metric in O(1) time as the window moves by adding the new element entering and removing the old element leaving.

## Mechanics
**Fixed Size Window**:
window_sum = sum of first k elements
for i from k to n-1:
    window_sum = window_sum + arr[i] - arr[i-k]
    max_sum = max(max_sum, window_sum)

**Variable Size Window**: Use two pointers. Expand the right pointer until a condition is violated, then shrink the left pointer until the condition is met again.

## Complexity
- **Time**: O(n) because each element is added to the window at most once and removed at most once.
- **Space**: O(1) for fixed size, or O(k) if a hash map is used for variable windows.

## Common Patterns
1. **Maximum Sum Subarray of Size K**: Classic fixed window.
2. **Longest Substring Without Repeating Characters**: Variable window with a hash set.
3. **Minimum Window Substring**: Variable window seeking the smallest valid segment.

## Pitfalls
- **Incorrect window shrinkage**: Shrinking the left pointer too much or too little.
- **Applying to non-contiguous problems**: Sliding window only works for contiguous subarrays/substrings.

## Practice
- Maximum Average Subarray I.
- Longest Substring Without Repeating Characters.

## References
1. cp-algorithms.com. "Sliding Window Technique".
2. LeetCode Official Editorials (Sliding Window category).