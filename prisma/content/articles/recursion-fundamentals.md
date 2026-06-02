---
slug: recursion-fundamentals
title: Recursion Fundamentals
summary: Base case plus recursive step — the mental model that powers divide-and-conquer, tree traversal, and backtracking.
topicSlug: recursion-and-backtracking
level: FOUNDATION
order: 1
estimatedMins: 20
references:
  - { title: "Introduction to Algorithms, 4th ed.", author: "Cormen, Leiserson, Rivest, Stein", type: "book" }
  - { title: "cp-algorithms.com", url: "https://cp-algorithms.com/", type: "web" }
prerequisites: []
---

## Overview
Recursion is a method of solving problems where the solution depends on solutions to smaller instances of the same problem. A recursive function calls itself with modified arguments until it reaches a base case.

## Prerequisites
- Asymptotic Notation

## Core Idea
Every recursive function must have two components:
1. **Base Case**: The condition under which the function stops calling itself.
2. **Recursive Step**: The part where the function calls itself with a simpler input, moving towards the base case.

## Mechanics
function factorial(n):
    if n == 0: return 1
    else: return n * factorial(n - 1)

## Complexity
- **Time**: Depends on the number of recursive calls. E.g., O(n) for linear recursion.
- **Space**: O(d) where d is the maximum depth of the recursion tree, due to the call stack.

## Common Patterns
1. **Divide and Conquer**: Breaking a problem into independent subproblems (e.g., Merge Sort).
2. **Tree Traversal**: Naturally recursive structure (e.g., DFS).
3. **Backtracking**: Exploring all potential solutions and abandoning paths that fail.

## Pitfalls
- **Missing base case**: Causes infinite recursion and stack overflow.
- **Redundant computations**: Overlapping subproblems lead to exponential time. Solved via memoization.

## Practice
- Compute the n-th Fibonacci number.
- Reverse a string recursively.

## References
1. Cormen, Leiserson, Rivest, Stein. *Introduction to Algorithms, 4th ed.*, Chapter 4.
2. MIT OCW 6.006. "Recursion and Recurrence Relations".