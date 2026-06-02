---
slug: greedy-fundamentals
title: Greedy Algorithms
summary: When making the locally optimal choice at every step yields the globally optimal answer — and how to prove it does (or doesn't).
topicSlug: greedy
level: INTERMEDIATE
order: 1
estimatedMins: 16
references:
  - { title: "Introduction to Algorithms, 4th ed., Ch. 15 (Greedy Algorithms)", author: "Cormen, Leiserson, Rivest, Stein", type: "book" }
  - { title: "Algorithms, 4th ed., Ch. 2.4 (Priority Queues), Ch. 4.3 (MST)", author: "Sedgewick & Wayne", type: "book" }
prerequisites: ["asymptotic-notation", "comparison-sorts"]
---

## Overview
A greedy algorithm builds a solution one step at a time, taking the locally best option at each step without revisiting. It is the simplest design paradigm — and the most dangerous, because the locally optimal choice is only globally optimal for a narrow class of problems. The crucial part is the proof.

## Prerequisites
- Asymptotic Notation
- Comparison-Based Sorts

## Core Idea
Two properties are required for a greedy algorithm to produce an optimal solution:
1. **Greedy choice property**: a globally optimal solution can be reached by making a greedy choice. That is, the locally optimal step is part of *some* optimal solution.
2. **Optimal substructure**: an optimal solution to the remaining problem after a greedy choice combines with that choice to form an optimal global solution.

If either fails, greedy gives a wrong answer — sometimes off by an arbitrary factor.

## Mechanics

**Standard recipe**:
1. State the greedy choice precisely (e.g., "always take the activity with the earliest finish time").
2. Prove the *exchange argument*: take any optimal solution and show it can be transformed into one that makes the greedy choice first, without losing optimality.
3. Prove optimal substructure: after the greedy choice, the remaining problem is a smaller instance of the same problem.
4. Conclude by induction.

**Activity selection (canonical example)**:
- Sort activities by finish time.
- Iterate; pick the next activity whose start time is $\ge$ the finish time of the last selected one.
- Optimal because: among all activities compatible with what's chosen so far, the one finishing earliest leaves the most room — formal exchange argument.

**Huffman coding**:
- Greedy choice: merge the two least-frequent symbols.
- Optimal substructure: after merging, the problem is the same on a smaller alphabet.
- Result: an optimal prefix code.

## Complexity
- Usually $O(n \log n)$, dominated by an initial sort, plus $O(n)$ to scan.
- Sometimes $O(n)$ if the input is already structured.

## Common Patterns
1. **Sort by some key, then scan**: activity selection, scheduling to minimize lateness, fractional knapsack.
2. **Priority queue as the "always pick the best next" engine**: Huffman, Dijkstra's, Prim's MST.
3. **Two pointers as a greedy scheme**: container with most water, boats to save people.
4. **Interval problems**: meeting rooms, non-overlapping intervals, minimum arrows to burst balloons.
5. **Exchange / swap arguments**: whenever you can show that swapping a non-greedy step for a greedy one cannot decrease the answer.

## Pitfalls
- **Assuming greedy works because it seems to**. The classic counterexample: making change with coin denominations like $\{1, 3, 4\}$ for amount 6 — greedy gives $4 + 1 + 1 = 3$ coins, but the optimum is $3 + 3 = 2$ coins. The greedy choice property fails.
- **Picking the wrong greedy criterion**. For activity selection, "earliest start time" or "shortest duration" both fail. Only "earliest finish time" is correct.
- **Skipping the proof**. A greedy strategy without a correctness argument is a guess.
- **Trying greedy where DP is required**. If subproblems overlap and the locally best choice depends on the future, the problem usually needs DP.

## Practice
- Activity Selection / Non-overlapping Intervals.
- Jump Game I & II.
- Gas Station.
- Boats to Save People.
- Minimum Number of Arrows to Burst Balloons.
- Task Scheduler.

## References
1. Cormen, Leiserson, Rivest, Stein. *Introduction to Algorithms, 4th ed.*, Chapter 15.
2. Sedgewick & Wayne. *Algorithms, 4th ed.*, Chapters 2.4 and 4.3.
