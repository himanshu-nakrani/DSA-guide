---
slug: asymptotic-notation
title: Asymptotic Notation
summary: The mathematical framework — Big-O, Big-Omega, Big-Theta — for describing how an algorithm's cost grows with input size.
topicSlug: complexity-analysis
level: FOUNDATION
order: 1
estimatedMins: 15
references:
  - { title: "Introduction to Algorithms, 4th ed., Ch. 3", author: "Cormen, Leiserson, Rivest, Stein", type: "book" }
  - { title: "Asymptotic Notation", url: "https://cp-algorithms.com/complexity/complexity.html", type: "web" }
prerequisites: []
---

## Overview
Asymptotic notation provides a mathematical framework to describe the limiting behavior of an algorithm's time or space requirements as the input size grows towards infinity. It allows us to compare algorithms independently of hardware or implementation details, focusing purely on scalability.

## Prerequisites
None. This is a foundational topic.

## Core Idea
Instead of measuring exact execution time (which varies by machine), we count the number of basic operations relative to the input size $n$. We care about the *growth rate* of this function, ignoring constant factors and lower-order terms.

## Mechanics
The three primary notations are:
- **Big-O ($O$)**: Upper bound. The algorithm will take *at most* this much time. (Worst-case)
- **Big-Omega ($\Omega$)**: Lower bound. The algorithm will take *at least* this much time. (Best-case)
- **Big-Theta ($\Theta$)**: Tight bound. The algorithm's growth rate is exactly this. (Average/Tight-case)

In practice, Big-O is the most commonly used to describe worst-case performance guarantees.

## Complexity
- **Time**: Analyzing asymptotic notation itself is $O(1)$, but applying it to an algorithm depends on the algorithm (e.g., $O(n)$ for a single loop, $O(n \log n)$ for merge sort).
- **Space**: Similarly depends on the algorithm's auxiliary memory usage.

## Common Patterns
1. **Dropping Constants**: $O(2n)$ simplifies to $O(n)$.
2. **Dropping Non-Dominant Terms**: $O(n^2 + n)$ simplifies to $O(n^2)$ because $n^2$ grows much faster.
3. **Nested Loops**: Two nested loops over $n$ elements typically yield $O(n^2)$ time complexity.

## Pitfalls
- Assuming Big-O always means "worst-case". Big-O is just an upper bound; it can describe best-case too, though conventionally we use it for worst-case.
- Ignoring hidden constants. An $O(n)$ algorithm with a massive constant factor might be slower than an $O(n \log n)$ algorithm for small, realistic values of $n$.
- Confusing $O$ with $\Theta$. If an algorithm is $\Theta(n)$, it is also $O(n)$, but saying it is $O(n^2)$ is technically true yet unhelpfully loose.

## Practice
- Analyze the time complexity of a linear search.
- Analyze the time complexity of binary search.
- Determine the space complexity of recursive Fibonacci without memoization.

## References
1. Cormen, Leiserson, Rivest, Stein. *Introduction to Algorithms, 4th ed.*, Chapter 3.
2. cp-algorithms.com. "Asymptotic Notation".
