---
slug: graph-traversals
title: Graph Representations and Traversal (BFS/DFS)
summary: Adjacency lists plus BFS and DFS — the foundation for shortest paths, connectivity, and cycle detection.
topicSlug: graph-fundamentals
level: INTERMEDIATE
order: 1
estimatedMins: 20
references:
  - { title: "Introduction to Algorithms, 4th ed.", author: "Cormen, Leiserson, Rivest, Stein", type: "book" }
  - { title: "cp-algorithms.com", url: "https://cp-algorithms.com/", type: "web" }
prerequisites: []
---

## Overview
A graph consists of vertices (nodes) and edges (connections). Graph traversals are systematic ways of visiting all vertices, forming the foundation for advanced algorithms.

## Prerequisites
- Binary Tree Traversals
- Queue and Stack Fundamentals

## Core Idea
Unlike trees, graphs can contain cycles. Therefore, graph traversals require a mechanism (usually a boolean array or hash set) to keep track of "visited" nodes to prevent infinite loops.

## Mechanics
**Adjacency List**: An array or hash map where each index/key maps to a list of its neighboring vertices. Space: O(V + E).

**Breadth-First Search (BFS)**: Uses a queue. Guarantees the shortest path in an unweighted graph.
**Depth-First Search (DFS)**: Uses a stack (or recursion). Explores a path as deeply as possible before backtracking.

## Complexity
- **Time**: O(V + E) for both BFS and DFS using an adjacency list.
- **Space**: O(V) for the visited set and the queue/stack.

## Common Patterns
1. **Connected Components**: Run DFS/BFS from every unvisited node to count disconnected subgraphs.
2. **Shortest Path in Unweighted Graph**: BFS naturally finds the minimum number of edges.
3. **Cycle Detection**: In DFS, encountering a visited node that is not the immediate parent indicates a cycle.

## Pitfalls
- **Forgetting the visited set**: Leads to infinite loops in cyclic graphs.
- **Recursion depth in DFS**: Large graphs may cause stack overflow; iterative DFS is safer.

## Practice
- Number of Islands (Grid as graph).
- Clone Graph.
- Course Schedule (Topological Sort).

## References
1. Cormen, Leiserson, Rivest, Stein. *Introduction to Algorithms, 4th ed.*, Chapter 22.
2. cp-algorithms.com. "Graph Traversal: BFS and DFS".