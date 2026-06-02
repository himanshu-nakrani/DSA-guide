---
slug: amortized-analysis
title: Amortized Analysis
summary: Why a sequence of operations can be cheap on average even when individual operations are occasionally expensive.
topicSlug: complexity-analysis
level: INTERMEDIATE
order: 2
estimatedMins: 18
references:
  - { title: "Introduction to Algorithms, 4th ed., Ch. 16 (Amortized Analysis)", author: "Cormen, Leiserson, Rivest, Stein", type: "book" }
  - { title: "Amortized Analysis", url: "https://cp-algorithms.com/", type: "web" }
prerequisites: ["asymptotic-notation"]
---

## Overview
Amortized analysis bounds the **average** cost of an operation across a worst-case sequence of operations, even when individual operations may be expensive. It is the right tool for analyzing dynamic arrays, hash table resizing, and union-find — situations where a rare slow operation pays for many fast ones.

## Prerequisites
- Asymptotic Notation

## Core Idea
Worst-case analysis of a single operation can be misleading. A `push` on a dynamic array is occasionally $O(n)$ when the underlying buffer doubles, but $n$ pushes still cost a total of $O(n)$, so each push *amortizes* to $O(1)$. The amortized cost is the worst-case **average** over any sequence, not an expected value over random inputs.

## Mechanics
Three techniques formalize amortized cost:

1. **Aggregate method**: Bound the total cost of $n$ operations and divide by $n$.
2. **Accounting method**: Assign each operation a fixed charge. Cheap operations pre-pay credit that expensive operations later spend.
3. **Potential method**: Define a potential function $\Phi$ of the data structure's state. The amortized cost of an operation is its actual cost plus the change in potential $\Delta\Phi$.

## Complexity
- **Dynamic array `push`**: $O(1)$ amortized, $O(n)$ worst-case single operation.
- **Hash table resize**: $O(1)$ amortized insert, $O(n)$ on the resize step.
- **Union-Find with path compression + union by rank**: $O(\alpha(n))$ amortized per operation, where $\alpha$ is the inverse Ackermann function (effectively constant for any practical $n$).

## Common Patterns
1. **Doubling buffers**: Each resize doubles capacity, so the $i$-th resize costs $2^i$ work but is preceded by $2^i$ cheap operations. Total work is geometric and amortizes to $O(1)$.
2. **Two-pointer scans**: Each pointer advances at most $n$ times in a single pass, so even if the inner pointer moves variably, the total work across the loop is $O(n)$ — a form of aggregate analysis.

## Pitfalls
- **Confusing amortized with average-case**. Amortized is worst-case over a sequence; average-case is over a distribution of inputs. They are different guarantees.
- **Mixing amortized bounds with real-time requirements**. An $O(1)$ amortized `push` can still take $O(n)$ on a single call — unsuitable for hard real-time systems.
- **Forgetting the precondition**. Amortized bounds typically assume operations start from an empty (or known) structure. Mixing operations across structures can break the bound.

## Practice
- Prove that a stack supporting `push`, `pop`, and `multipop(k)` has $O(1)$ amortized cost per operation.
- Analyze the cost of incrementing a binary counter.
- Derive the amortized cost of `std::vector::push_back` using the potential method.

## References
1. Cormen, Leiserson, Rivest, Stein. *Introduction to Algorithms, 4th ed.*, Chapter 16.
2. cp-algorithms.com. "Amortized Analysis".
