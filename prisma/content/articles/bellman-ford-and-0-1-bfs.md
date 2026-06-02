---
slug: bellman-ford-and-0-1-bfs
title: Bellman-Ford and 0-1 BFS
summary: Two specialized shortest-path algorithms — Bellman-Ford for negative weights, 0-1 BFS for graphs whose edges weigh only 0 or 1.
topicSlug: shortest-paths
level: INTERMEDIATE
order: 2
estimatedMins: 16
references:
  - { title: "Introduction to Algorithms, 4th ed., Ch. 22.1 (Bellman-Ford)", author: "Cormen, Leiserson, Rivest, Stein", type: "book" }
  - { title: "Bellman-Ford Algorithm", url: "https://cp-algorithms.com/graph/bellman_ford.html", type: "web" }
  - { title: "0-1 BFS", url: "https://cp-algorithms.com/graph/01_bfs.html", type: "web" }
prerequisites: ["dijkstra"]
---

## Overview
Dijkstra's $O((V + E) \log V)$ is the right answer when edge weights are non-negative and varied. Two specialized cases call for different tools:
- **Bellman-Ford**: handles negative weights and detects negative cycles, at $O(VE)$.
- **0-1 BFS**: when every edge weighs either 0 or 1, a deque-based BFS achieves $O(V + E)$ — beating Dijkstra's log factor.

## Prerequisites
- Dijkstra's Algorithm

## Core Idea

**Bellman-Ford** repeatedly relaxes every edge until no distance changes. The invariant: after $k$ rounds, $d[v]$ equals the shortest path using at most $k$ edges. In a graph with $V$ vertices, any acyclic shortest path uses at most $V - 1$ edges; hence $V - 1$ rounds suffice. A $V$-th round that still relaxes something implies a negative cycle reachable from the source.

**0-1 BFS** treats the BFS frontier as a deque. When traversing a 0-weight edge, push to the front (the new vertex has the same distance as the current one); when traversing a 1-weight edge, push to the back (one further). The deque always preserves non-decreasing distances, just like Dijkstra's heap but without the log factor.

## Mechanics

**Bellman-Ford**:
```text
dist[*] := infinity; dist[s] := 0
repeat V - 1 times:
    for each edge (u, v, w):
        if dist[u] + w < dist[v]:
            dist[v] := dist[u] + w
            parent[v] := u
# One more pass detects negative cycles:
for each edge (u, v, w):
    if dist[u] + w < dist[v]:
        report "negative cycle reachable"
```

**0-1 BFS**:
```text
dist[*] := infinity; dist[s] := 0
deque := { s }
while deque not empty:
    u := deque.pop_front()
    for each edge u -> v with weight w in {0, 1}:
        if dist[u] + w < dist[v]:
            dist[v] := dist[u] + w
            if w == 0: deque.push_front(v)
            else:      deque.push_back(v)
```

## Complexity
- Bellman-Ford: $O(VE)$ time, $O(V)$ space.
- SPFA (Shortest Path Faster Algorithm): a queue-based optimization of Bellman-Ford. Average case much better; worst case still $O(VE)$ and easy to construct.
- 0-1 BFS: $O(V + E)$ time, $O(V)$ space.

## Common Patterns
1. **Detect arbitrage / negative cycles**: model currencies as a graph with $-\log(\text{rate})$ as weight. A negative cycle is an arbitrage.
2. **Constraint graphs (difference constraints)**: each constraint $x_j - x_i \le c_{ij}$ becomes an edge $i \to j$ of weight $c_{ij}$. Bellman-Ford from a virtual source returns a feasible assignment or proves infeasibility.
3. **Grid with two kinds of moves**: free moves and costly moves. Model the costly ones as weight-1 edges and the free ones as weight-0 edges, then 0-1 BFS.
4. **Sliding doors / portals**: weight 0 for portal jumps, weight 1 for ordinary steps.

## Pitfalls
- **Stopping Bellman-Ford early without proving stability**. If you stop after $k$ rounds without checking that no relaxation occurred, you may miss longer paths.
- **Running 0-1 BFS on a graph with weights other than 0 or 1**. Doesn't work — use Dijkstra.
- **Confusing "no negative cycles" with "no negative edges."** Bellman-Ford handles negative edges fine; only negative *cycles* break shortest-path semantics (paths become $-\infty$).
- **Counting iterations**: $V - 1$ rounds, not $V$. The extra round is for cycle detection.

## Practice
- Cheapest Flights Within K Stops (limited-edges variant of Bellman-Ford).
- Network Delay Time with negative weights.
- 01 Matrix (0-1 BFS interpretation).
- Detect a negative cycle in a directed graph.

## References
1. Cormen, Leiserson, Rivest, Stein. *Introduction to Algorithms, 4th ed.*, Chapter 22.1.
2. cp-algorithms.com. "Bellman-Ford Algorithm".
3. cp-algorithms.com. "0-1 BFS".
