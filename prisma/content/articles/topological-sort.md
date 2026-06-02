---
slug: topological-sort
title: Topological Sort
summary: Order the vertices of a DAG so every edge points forward — Kahn's BFS and DFS postorder give the two standard algorithms.
topicSlug: graph-fundamentals
level: INTERMEDIATE
order: 2
estimatedMins: 16
references:
  - { title: "Introduction to Algorithms, 4th ed., Ch. 22 (Elementary Graph Algorithms)", author: "Cormen, Leiserson, Rivest, Stein", type: "book" }
  - { title: "Topological Sorting", url: "https://cp-algorithms.com/graph/topological-sort.html", type: "web" }
prerequisites: ["graph-traversals"]
---

## Overview
A topological order of a directed acyclic graph (DAG) is a linear ordering of vertices such that for every edge $u \to v$, $u$ appears before $v$. Topological order exists iff the graph is acyclic; it is unique iff there is a Hamiltonian path. Build systems, course prerequisites, and scheduling problems are all topological sorts in disguise.

## Prerequisites
- Graph Representations and Traversal (BFS/DFS)

## Core Idea
Two algorithms, each natural in a different traversal:
1. **Kahn's algorithm (BFS-based)**: repeatedly remove a vertex with in-degree 0.
2. **DFS-based**: run DFS; emit each vertex on its way out (post-order); reverse the emission order.

Both run in $O(V + E)$.

## Mechanics

**Kahn's algorithm**:
```text
compute in-degree of every vertex
queue := all vertices with in-degree 0
order := []
while queue not empty:
    u := queue.pop()
    order.append(u)
    for each edge u -> v:
        in-degree[v] -= 1
        if in-degree[v] == 0: queue.push(v)
if len(order) < V: graph has a cycle
return order
```

**DFS post-order**:
```text
visited := empty set
order := []
dfs(u):
    visited.add(u)
    for each edge u -> v:
        if v not in visited: dfs(v)
    order.append(u)
for each vertex u: if u not in visited: dfs(u)
reverse(order)
```

For cycle detection during DFS, also maintain a "currently on the recursion stack" set; an edge into a vertex in that set indicates a back edge — i.e., a cycle.

## Complexity
- Time: $O(V + E)$ for both algorithms.
- Space: $O(V)$ for the queue/stack and auxiliary arrays.

## Common Patterns
1. **Course schedule / dependency resolution**: detect a cycle = unsatisfiable; otherwise return any topological order.
2. **DP on a DAG**: compute values in topological order so each node's dependencies are already resolved. Examples: longest path in a DAG, shortest path with negative weights in a DAG.
3. **Lexicographically smallest topological order**: replace Kahn's queue with a min-heap. $O((V + E) \log V)$.
4. **Multiple valid orders**: Kahn's lets you emit any order; useful for testing whether a candidate order is valid.

## Pitfalls
- **Running on a graph with a cycle**. Kahn's leaves vertices unprocessed; DFS still emits an order but it's not topological. Always check for cycles explicitly.
- **Confusing the DFS order**. The reversed post-order is topological; the pre-order is not.
- **Counting in-degrees wrong** when the graph has parallel edges or self-loops.
- **Using topological sort on undirected graphs**. The concept doesn't apply — there's no edge direction.

## Practice
- Course Schedule / Course Schedule II.
- Alien Dictionary.
- Longest Path in a DAG.
- Parallel Courses.

## References
1. Cormen, Leiserson, Rivest, Stein. *Introduction to Algorithms, 4th ed.*, Chapter 22.
2. cp-algorithms.com. "Topological Sorting".
