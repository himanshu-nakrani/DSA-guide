---
slug: backtracking-template
title: Backtracking Template
summary: Choose, recurse, unchoose — the universal template for subsets, permutations, combinations, and constraint puzzles like N-queens.
topicSlug: recursion-and-backtracking
level: INTERMEDIATE
order: 2
estimatedMins: 18
references:
  - { title: "Introduction to Algorithms, 4th ed., Ch. 35 (NP-Completeness)", author: "Cormen, Leiserson, Rivest, Stein", type: "book" }
  - { title: "The Algorithm Design Manual, Ch. 9 (Combinatorial Search)", author: "Steven Skiena", type: "book" }
  - { title: "Backtracking", url: "https://cp-algorithms.com/", type: "web" }
prerequisites: ["recursion-fundamentals"]
---

## Overview
Backtracking is a systematic way to enumerate candidates: extend a partial solution one step at a time, recurse, and undo the step before trying the next. The structure is identical across subsets, permutations, combinations, Sudoku, and N-queens — only the constraints and the pruning differ.

## Prerequisites
- Recursion Fundamentals

## Core Idea
Treat the search space as a tree where each node is a partial solution and each edge is one choice. Depth-first traverse the tree, abandoning a subtree as soon as the partial solution cannot be extended to a valid one. The "unchoose" step restores the partial solution so the next sibling can be tried.

## Mechanics

The canonical template:
```text
backtrack(state, choices):
    if is_solution(state):
        emit(state)
        return
    for choice in choices(state):
        if not feasible(state, choice):
            continue
        apply(state, choice)
        backtrack(state, choices_after(state, choice))
        undo(state, choice)
```

**Subsets** of `[1..n]`:
```text
backtrack(i, current):
    if i == n:
        emit(current)
        return
    backtrack(i + 1, current)              # exclude a[i]
    current.push(a[i])
    backtrack(i + 1, current)              # include a[i]
    current.pop()
```

**Permutations** of `a[0..n)`:
```text
backtrack(current, used):
    if len(current) == n:
        emit(current); return
    for j in 0..n-1:
        if used[j]: continue
        used[j] = true; current.push(a[j])
        backtrack(current, used)
        current.pop(); used[j] = false
```

**N-queens** (place $n$ queens, no two attacking):
- State: columns chosen so far, plus sets of forbidden columns and diagonals.
- Choice at row $r$: any column not in forbidden sets.
- Prune by maintaining the forbidden sets incrementally.

## Complexity
- Subsets: $2^n$ leaves, $O(n \cdot 2^n)$ to emit (each subset has length up to $n$).
- Permutations: $n!$ leaves, $O(n \cdot n!)$ total.
- N-queens: worst case factorial, but pruning keeps practical $n$ in the dozens.

Backtracking does **not** beat brute force in the worst case; it beats it on average by pruning early.

## Common Patterns
1. **Generate all subsets / power set**: binary include-or-exclude tree.
2. **Generate all permutations**: maintain a `used` mask or swap-in-place.
3. **Combination sum / k-of-n combinations**: sort, then skip duplicates by index.
4. **Constraint puzzles**: Sudoku, N-queens, word-search-in-grid. Encode the constraint as a fast `feasible` check.
5. **Early termination**: throw or return a sentinel as soon as one solution is found, if only one is needed.

## Pitfalls
- **Forgetting to undo**. The recursive call returns and the *next* sibling starts. If state isn't restored, you'll explore the wrong subtree.
- **Mutating shared collections without copying**. When emitting solutions, push a *copy* of the current state, not the reference.
- **Duplicate solutions from duplicate inputs**. Sort and skip equal siblings at the same depth.
- **No pruning**. A backtracker without pruning is just exhaustive search; you must encode constraints to be useful.

## Practice
- Subsets / Subsets II (with duplicates).
- Permutations / Permutations II.
- Combination Sum.
- N-Queens.
- Sudoku Solver.

## References
1. Cormen, Leiserson, Rivest, Stein. *Introduction to Algorithms, 4th ed.*, Chapter 35.
2. Skiena, Steven. *The Algorithm Design Manual*, Chapter 9.
3. cp-algorithms.com. "Backtracking".
