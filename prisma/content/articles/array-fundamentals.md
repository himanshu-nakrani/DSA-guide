---
slug: array-fundamentals
title: Array Fundamentals
summary: Contiguous memory, O(1) random access, and the cost model behind every other data structure built on top of it.
topicSlug: arrays-and-strings
level: FOUNDATION
order: 1
estimatedMins: 10
references:
  - { title: "Introduction to Algorithms, 4th ed., Ch. 10", author: "Cormen, Leiserson, Rivest, Stein", type: "book" }
  - { title: "Algorithms, 4th ed., Ch. 1.3 (Bags, Queues, and Stacks)", author: "Sedgewick & Wayne", type: "book" }
prerequisites: ["asymptotic-notation"]
---

## Overview
An array is a contiguous block of memory that stores elements of the same type. It is the most fundamental data structure, serving as the building block for more complex structures like strings, matrices, and hash tables.

## Prerequisites
- Asymptotic Notation

## Core Idea
Because array elements are stored contiguously, the memory address of any element can be calculated in constant time using the formula: `address = base_address + (index * element_size)`. This enables $O(1)$ random access.

## Mechanics
- **Access**: $O(1)$ by index.
- **Search**: $O(n)$ for unsorted arrays (linear search), $O(\log n)$ for sorted arrays (binary search).
- **Insertion/Deletion**: $O(n)$ in the worst case, as elements may need to be shifted to maintain contiguity. Dynamic arrays (like `std::vector` or `ArrayList`) amortize insertion to $O(1)$ by doubling capacity when full.

## Complexity
- **Time**: Access is $O(1)$. Insertion/deletion at the end is $O(1)$ amortized for dynamic arrays, but $O(n)$ at the beginning or middle.
- **Space**: $O(n)$ for $n$ elements. Dynamic arrays may use up to $O(n)$ extra space for future capacity.

## Common Patterns
1. **Two Pointers**: Using a left and right pointer to traverse the array from both ends, often to find pairs or reverse the array in $O(n)$ time and $O(1)$ space.
2. **Sliding Window**: Maintaining a subset of contiguous elements to solve subarray problems efficiently.

## Pitfalls
- **Off-by-one errors**: Confusing 0-based indexing with 1-based logic, leading to `IndexOutOfBoundsException`.
- **Assuming dynamic array append is always $O(1)$**: It is $O(1)$ *amortized*, but individual appends that trigger a resize are $O(n)$.
- **Modifying an array while iterating**: Can lead to skipped elements or concurrent modification exceptions.

## Practice
- Reverse an array in place.
- Find the maximum subarray sum (Kadane's Algorithm).
- Move all zeroes to the end of an array while maintaining relative order.

## References
1. Cormen, Leiserson, Rivest, Stein. *Introduction to Algorithms, 4th ed.*, Chapter 10.
2. cp-algorithms.com. "Data Structures: Arrays".
