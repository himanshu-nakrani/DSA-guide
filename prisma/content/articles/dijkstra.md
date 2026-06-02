---
slug: dijkstra
title: Dijkstra's Algorithm
summary: Single-source shortest paths in a graph with non-negative edge weights, in O((V + E) log V) with a binary heap.
topicSlug: shortest-paths
level: INTERMEDIATE
order: 1
estimatedMins: 18
references:
  - { title: "Introduction to Algorithms, 4th ed., Ch. 22 (Single-Source Shortest Paths)", author: "Cormen, Leiserson, Rivest, Stein", type: "book" }
  - { title: "Dijkstra's Algorithm", url: "https://cp-algorithms.com/graph/dijkstra.html", type: "web" }
prerequisites: ["graph-traversals", "heap-priority-queue"]
---

## Overview
Dijkstra's algorithm computes shortest paths from a single source to every reachable vertex in a graph with non-negative edge weights. It is the standard "shortest path with weights" answer when negative edges aren't present.

## Prerequisites
- Graph Representations and Traversal (BFS/DFS)
- Heap and Priority Queue

## Core Idea
Maintain a tentative distance $d[v]$ for every vertex, initialized to $\infty$ except $d[\text{source}] = 0$. Repeatedly:
1. Pick the unprocessed vertex $u$ with the smallest tentative distance.
2. Mark $u$ processed; its distance is now final.
3. Relax every edge $u \to v$ with weight $w$: if $d[u] + w < d[v]$, update $d[v]$.

Correctness depends crucially on non-negativity: once a vertex is processed, no later relaxation can decrease its distance, because every future path passes through unprocessed vertices with distance $\ge d[u]$ and adds non-negative weight.

## Mechanics

**With a binary heap**:
```text
dist[*] := infinity; dist[s] := 0
heap := { (0, s) }
while heap not empty:
    (d, u) := heap.pop_min()
    if d > dist[u]: continue        # stale entry
    for each edge u -> v with weight w:
        if dist[u] + w < dist[v]:
            dist[v] := dist[u] + w
            heap.push((dist[v], v))
```

Re-pushing instead of decrease-key is the "lazy" version. It can store $O(E)$ entries but stale ones are filtered on pop. This is what nearly all production implementations do.

To reconstruct paths, maintain `parent[v]` updated whenever you relax an edge.

## Complexity
- Binary heap (lazy): $O((V + E) \log V)$ time, $O(V + E)$ space.
- Fibonacci heap with decrease-key: $O(E + V \log V)$.
- Dense graph with an array as the priority queue: $O(V^2)$ — better than a heap when $E = \Theta(V^2)$.
- Cannot handle negative edges. Even one is enough to break correctness.

## Common Patterns
1. **Network shortest path**: routing, navigation, latency-based routing.
2. **Modified state graphs**: include "remaining fuel," "number of stops," etc. as part of the vertex, and run Dijkstra on the product graph.
3. **K-shortest paths**: extension via Yen's algorithm or a relaxation of Dijkstra that allows up to $K$ entries per node.
4. **Bidirectional search**: run Dijkstra from both source and target, meeting in the middle. Useful in practice for large graphs.

## Pitfalls
- **Using on graphs with negative edges**. Use Bellman-Ford instead. Even a graph with a single negative edge but no negative cycle is wrong for Dijkstra.
- **Forgetting the stale-entry check** in the lazy version. Without it, you process the same vertex multiple times.
- **Heap of `Pair<int, int>`** with the wrong ordering. Min-heap on the first element (distance) is the convention; double-check your language's default.
- **Integer overflow** when summing large weights. Use 64-bit if weights × $V$ can exceed $2^{31}$.

## Practice
- Network Delay Time.
- Path with Maximum Probability (logarithm trick + Dijkstra).
- Cheapest Flights Within K Stops (modified state graph).
- Shortest Path in a Grid with Obstacles Elimination.

## References
1. Cormen, Leiserson, Rivest, Stein. *Introduction to Algorithms, 4th ed.*, Chapter 22.
2. cp-algorithms.com. "Dijkstra's Algorithm".
