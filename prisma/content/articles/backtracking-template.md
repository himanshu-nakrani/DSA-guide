---
slug: backtracking-template
title: Backtracking Template
summary: Choose, recurse, unchoose — the universal three-step skeleton behind subsets, permutations, combinations, and every constraint puzzle you will meet.
topicSlug: recursion-and-backtracking
level: INTERMEDIATE
order: 2
estimatedMins: 22
references:
  - { title: "The Algorithm Design Manual, Ch. 9", author: "Steven Skiena", type: "book" }
  - { title: "Introduction to Algorithms, 4th ed., Ch. 34", author: "Cormen, Leiserson, Rivest, Stein", type: "book" }
  - { title: "Backtracking", url: "https://cp-algorithms.com/", type: "web" }
prerequisites: ["recursion-fundamentals"]
---

## Overview
Backtracking is the systematic way to enumerate a structured search
space. The space is described as a tree — each node is a *partial
solution*, each edge a *choice* — and the algorithm performs a DFS,
extending partial solutions until they either complete or violate a
constraint. When they violate, the algorithm rolls back ("backs up")
and tries a different choice.

The same skeleton handles subsets, permutations, combinations, N-queens,
Sudoku, the knight's tour, graph colorings, and every constraint
satisfaction problem in the basic toolbox. The implementation is short
enough to memorize, and the bookkeeping is the interesting part.

## The Three-Step Skeleton

Every backtracking function has the same shape:

```python
def backtrack(state, choices):
    if is_complete(state):
        record(state)
        return
    for choice in choices(state):
        if not valid(state, choice):
            continue
        apply(state, choice)        # choose
        backtrack(state, choices)   # recurse
        undo(state, choice)         # unchoose
```

Three steps, in this order: **choose**, **recurse**, **unchoose**. The
final step is what makes it backtracking rather than enumeration — it
restores the state so the next iteration of the loop sees the same
context it started with.

```viz
{ "type": "callout", "props": {
  "tone": "intuition",
  "title": "Why explicit undo",
  "body": "If you mutate state going in, you must mutate it back going out. Otherwise the next iteration of the for loop sees the wrong state, and the recursion explores the wrong tree. Forgetting the unchoose step is the single most common backtracking bug."
} }
```

## Subsets

Enumerate all $2^n$ subsets of a list. Each element is either *in* or
*out* of the current partial subset.

```python
def subsets(nums):
    out = []
    path = []
    def backtrack(i):
        if i == len(nums):
            out.append(path[:])      # snapshot — list is mutable
            return
        # exclude nums[i]
        backtrack(i + 1)
        # include nums[i]
        path.append(nums[i])
        backtrack(i + 1)
        path.pop()                   # undo
    backtrack(0)
    return out
```

`path[:]` is non-negotiable — without the copy, every entry in `out`
points at the same mutating list and they all end up empty at the end.

## Permutations

Enumerate all $n!$ orderings. The bookkeeping tracks which elements
have already been placed.

```python
def permutations(nums):
    out = []
    path = []
    used = [False] * len(nums)
    def backtrack():
        if len(path) == len(nums):
            out.append(path[:])
            return
        for i in range(len(nums)):
            if used[i]:
                continue
            used[i] = True
            path.append(nums[i])
            backtrack()
            path.pop()              # undo path
            used[i] = False         # undo used
    backtrack()
    return out
```

Two pieces of state to maintain (`path` and `used`), so two undo
steps. The pattern is consistent: every choice gets its own undo.

## Combinations

Enumerate all $\binom{n}{k}$ subsets of size $k$ from $[1, n]$. The key
constraint: combinations are unordered, so we only pick *forward* (each
recursive call starts from `start + 1`) to avoid duplicates.

```python
def combinations(n, k):
    out = []
    path = []
    def backtrack(start):
        if len(path) == k:
            out.append(path[:])
            return
        for i in range(start, n + 1):
            path.append(i)
            backtrack(i + 1)
            path.pop()
    backtrack(1)
    return out
```

The `start` parameter is the standard trick for de-duplicating
backtracking output. It also appears in *subsets with duplicates* and
*combination sum*.

## The Bigger Picture

```viz
{ "type": "architecture", "props": {
  "caption": "Backtracking — the recursion tree as a search space",
  "cols": 12, "rows": 4, "height": 280,
  "boxes": [
    { "id": "root", "label": "root", "sub": "empty partial solution", "col": 4, "row": 0, "colSpan": 4, "emphasis": "primary" },
    { "id": "c1",   "label": "choice 1", "col": 0, "row": 1, "colSpan": 3 },
    { "id": "c2",   "label": "choice 2", "col": 4, "row": 1, "colSpan": 3 },
    { "id": "c3",   "label": "choice 3", "col": 8, "row": 1, "colSpan": 3 },
    { "id": "p1",   "label": "valid → recurse", "col": 0, "row": 2, "colSpan": 3, "emphasis": "primary" },
    { "id": "p2",   "label": "prune (constraint violated)", "col": 4, "row": 2, "colSpan": 3, "emphasis": "warn" },
    { "id": "p3",   "label": "complete → record", "col": 8, "row": 2, "colSpan": 3, "emphasis": "primary" }
  ],
  "arrows": [
    { "from": "root", "to": "c1" },
    { "from": "root", "to": "c2" },
    { "from": "root", "to": "c3" },
    { "from": "c1", "to": "p1" },
    { "from": "c2", "to": "p2" },
    { "from": "c3", "to": "p3" }
  ]
} }
```

The art of backtracking is *pruning*: detecting that a partial
solution cannot extend to a valid complete solution, and abandoning it
immediately. Without pruning, backtracking explores the whole tree.
With aggressive pruning, the tree often collapses dramatically — a
50-queens problem with naive backtracking would not finish today; with
the standard column/diagonal constraints it finishes in milliseconds.

## N-Queens — A Constraint Puzzle

Place $n$ queens on an $n \times n$ board so no two attack each other.
Constraint: no two queens share a row, column, or diagonal.

```python
def n_queens(n):
    out = []
    cols, diag1, diag2 = set(), set(), set()
    path = []
    def backtrack(r):
        if r == n:
            out.append(path[:])
            return
        for c in range(n):
            if c in cols or (r - c) in diag1 or (r + c) in diag2:
                continue
            cols.add(c); diag1.add(r - c); diag2.add(r + c)
            path.append(c)
            backtrack(r + 1)
            path.pop()
            cols.discard(c); diag1.discard(r - c); diag2.discard(r + c)
    backtrack(0)
    return out
```

The two diagonal sets encode the two diagonal families: cells with the
same $r - c$ lie on the same major diagonal; same $r + c$ on the same
minor diagonal. Checking constraint validity is $\Theta(1)$ per
candidate. The total time is exponential in $n$ but with massive
pruning in practice.

## Pruning Strategies

- **Constraint check before recursing.** Reject candidates that
  violate constraints immediately.
- **Symmetry breaking.** If solutions come in equivalent pairs
  (mirror, rotation), explore only one and multiply at the end.
- **Ordering choices.** Choosing the *most constrained variable*
  first (constraint propagation, as in Sudoku solvers) prunes early
  in the tree.
- **Bounding.** For optimization variants, keep the best-so-far and
  prune any partial that cannot exceed it.

## Pitfalls

```viz
{ "type": "callout", "props": {
  "tone": "pitfall",
  "title": "Skipping the undo",
  "body": "Every change to shared state — appending to path, marking used, occupying a board cell — needs an explicit undo after the recursive call returns. Skip one and the whole search reads from a wrong state."
} }
```

```viz
{ "type": "callout", "props": {
  "tone": "pitfall",
  "title": "Storing references, not copies",
  "body": "out.append(path) stores a reference; every later mutation of path is reflected. out.append(path[:]) stores a snapshot. The difference does not appear until the recursion returns, by which time path is empty and so is every saved result."
} }
```

```viz
{ "type": "callout", "props": {
  "tone": "pitfall",
  "title": "Duplicates without sorting",
  "body": "If the input has duplicates and you need unique outputs, sort first and skip duplicates at the same recursion depth: 'if i > start and nums[i] == nums[i-1]: continue'. Without sorting, the skip rule does not catch all duplicates."
} }
```

## Practice
- All subsets of `[1, 2, 3]`. Then with duplicates `[1, 2, 2]`.
- All permutations of `[1, 2, 3]`. Then with duplicates.
- Combinations: $k$ items chosen from $[1, n]$.
- Combination sum (each number can be reused). Combination sum II
  (each number used at most once, with duplicates).
- Word search in a 2D grid.
- N-queens.
- Sudoku solver (with constraint propagation as pruning).

## References
1. Skiena. *The Algorithm Design Manual*, Chapter 9.
2. Cormen, Leiserson, Rivest, Stein. *Introduction to Algorithms, 4th ed.*, Chapter 34.
