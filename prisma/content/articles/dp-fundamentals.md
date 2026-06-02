---
slug: dp-fundamentals
title: Dynamic Programming Fundamentals
summary: Optimal substructure plus overlapping subproblems — when memoization or tabulation turns exponential time into polynomial.
topicSlug: dynamic-programming-i
level: INTERMEDIATE
order: 1
estimatedMins: 25
references:
  - { title: "Introduction to Algorithms, 4th ed.", author: "Cormen, Leiserson, Rivest, Stein", type: "book" }
  - { title: "cp-algorithms.com", url: "https://cp-algorithms.com/", type: "web" }
prerequisites: []
---

## Overview
Dynamic Programming (DP) is a method for solving complex problems by breaking them down into simpler overlapping subproblems. It applies when the problem exhibits optimal substructure and overlapping subproblems.

## Prerequisites
- Recursion Fundamentals

## Core Idea
Instead of recomputing the same subproblem multiple times, DP stores the result of each subproblem (memoization) or builds up the solution iteratively from the smallest subproblems (tabulation).

## Mechanics
**Top-Down (Memoization)**: Add a cache to a recursive solution. Check cache before computing.
**Bottom-Up (Tabulation)**: Iterative approach. Define base cases in an array, then fill the array up to the target using a recurrence relation.

## Complexity
- **Time**: Reduces exponential time to polynomial time (e.g., O(n) or O(n^2)), proportional to the number of unique subproblems.
- **Space**: O(n) for the memoization table or DP array.

## Common Patterns
1. **1D DP**: Fibonacci, Climbing Stairs, House Robber.
2. **2D DP / Grid**: Unique Paths, Longest Common Subsequence (LCS).
3. **Knapsack**: 0/1 Knapsack, Unbounded Knapsack.

## Pitfalls
- **Missing the base case**: Failing to initialize the DP array correctly.
- **State definition**: Struggling to define what DP[i] actually represents. Write down the meaning clearly.

## Practice
- Climbing Stairs.
- Coin Change.
- Longest Increasing Subsequence (LIS).

## References
1. Cormen, Leiserson, Rivest, Stein. *Introduction to Algorithms, 4th ed.*, Chapter 14.
2. Laaksonen. *Competitive Programmer's Handbook*, Chapter 7.