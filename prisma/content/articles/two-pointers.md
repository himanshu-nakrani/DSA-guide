---
slug: two-pointers
title: Two Pointers Pattern
summary: A single-pass O(n) technique that replaces O(n²) nested loops for pair-search and palindrome-style problems on sorted data.
topicSlug: arrays-and-strings
level: INTERMEDIATE
order: 3
estimatedMins: 15
references:
  - { title: "Introduction to Algorithms, 4th ed.", author: "Cormen, Leiserson, Rivest, Stein", type: "book" }
  - { title: "cp-algorithms.com", url: "https://cp-algorithms.com/", type: "web" }
prerequisites: []
---

## Overview
The two pointers technique uses two indices to traverse a data structure in a single pass. It is highly effective for problems involving pairs or palindromes, often reducing time complexity from O(n^2) to O(n).

## Prerequisites
- Array Fundamentals

## Core Idea
Instead of using nested loops to check all pairs, we place one pointer at the beginning and one at the end. We move the pointers based on the problem's conditions, narrowing the search space efficiently.

## Mechanics
**Opposite Direction**: 
left = 0, right = n - 1
while left < right:
    if condition_met: return result
    else if need_larger_value: left++
    else: right--

## Complexity
- **Time**: O(n) since each element is visited at most once.
- **Space**: O(1) as no extra data structures are needed.

## Common Patterns
1. **Pair Sum**: Finding two numbers that add up to a target in a sorted array.
2. **Palindrome Check**: Comparing characters from both ends moving inward.

## Pitfalls
- **Forgetting to move pointers**: Leading to infinite loops.
- **Applying to unsorted data**: The opposite direction approach usually requires the array to be sorted.

## Practice
- Valid Palindrome.
- Two Sum II (Input array is sorted).

## References
1. Cormen, Leiserson, Rivest, Stein. *Introduction to Algorithms, 4th ed.*
2. cp-algorithms.com. "Two Pointers Method".