---
slug: bellman-ford-and-0-1-bfs
title: Bellman-Ford and 0-1 BFS
summary: Two shortest-path algorithms that fill the gaps Dijkstra leaves — Bellman-Ford handles negative weights and detects negative cycles; 0-1 BFS solves the special case where every edge weighs 0 or 1 in linear time.
topicSlug: shortest-paths
level: INTERMEDIATE
order: 2
estimatedMins: 22
references:
  - { title: "Introduction to Algorithms, 4th ed., Ch. 22", author: "Cormen, Leiserson, Rivest, Stein", type: "book" }
  - { title: "Bellman-Ford Algorithm", url: "https://cp-algorithms.com/graph/bellman_ford.html", type: "web" }
  - { title: "0-1 BFS", url: "https://cp-algorithms.com/graph/01_bfs.html", type: "web" }
prerequisites: ["dijkstra"]
---

## Overview
Dijkstra solves single-source shortest paths in $O((V + E) \log V)$
when all edge weights are non-negative. Two situations break that
guarantee: a single negative edge, and a graph dense enough that the
$\log V$ factor matters. Bellman-Ford and 0-1 BFS are the standard
answers.

- **Bellman-Ford.** Handles arbitrary edge weights (including
  negative), detects negative cycles, runs in $\Theta(VE)$. The
  textbook fallback when Dijkstra cannot apply.
- **0-1 BFS.** A special case for graphs where every edge weighs 0 or
  1. Replaces the heap with a deque and runs in $O(V + E)$ — the same
  cost as ordinary BFS.

This article covers both, the conditions under which each applies, and
the routing decisions between them and Dijkstra.

## Bellman-Ford

The idea: after $k$ iterations of "relax every edge", $d[v]$ holds the
shortest path from $s$ to $v$ using at most $k$ edges. A shortest path
in a graph with $V$ vertices uses at most $V - 1$ edges (a longer one
would repeat a vertex), so $V - 1$ iterations suffice.

```python
def bellman_ford(n, edges, src):
    INF = float("inf")
    dist = [INF] * n
    dist[src] = 0
    for _ in range(n - 1):
        updated = False
        for u, v, w in edges:
            if dist[u] + w < dist[v]:
                dist[v] = dist[u] + w
                updated = True
        if not updated:
            break
    # extra pass: any further relaxation means a negative cycle
    for u, v, w in edges:
        if dist[u] + w < dist[v]:
            return None    # negative cycle reachable from src
    return dist
```

Two passes' worth of insight in that code:

- The early-exit (`if not updated: break`) is the standard
optimization. If no edge relaxed during a full pass, no further pass will
change anything.
- The post-loop check is the *negative cycle detector*. Any edge that
still relaxes after $V - 1$ passes means a path of length $V$ is
shorter than a path of length $V - 1$ — only possible if a negative
cycle exists on the way.

### Watch a relaxation propagate

Step through the edges one at a time, then jump to the next full pass. The
negative-edge mode stabilizes at a finite answer; the negative-cycle mode
keeps improving on the extra detection pass and changes the correct answer
from a number to “undefined.”

```viz
{ "type": "bellman-ford-pass", "props": {
  "caption": "Bellman–Ford: pass invariant and negative-cycle detection",
  "variant": "negative-edge"
} }
```


```viz
{ "type": "callout", "props": {
  "tone": "intuition",
  "title": "Why V - 1 passes is enough",
  "body": "A simple shortest path uses at most V - 1 edges (any more would repeat a vertex). Each pass extends distances by one edge along every path simultaneously. After V - 1 passes, every path has had a chance to be discovered."
} }
```

## Complexity and When to Use

- Time: $\Theta(VE)$, which is $\Theta(V^3)$ on dense graphs — far
  worse than Dijkstra's $O((V + E) \log V)$.
- Space: $\Theta(V)$.
- Negative edges: yes, including negative cycles (which it detects).
- Sparse vs. dense: same complexity either way.

```viz
{ "type": "callout", "props": {
  "tone": "pitfall",
  "title": "Negative cycle vs. negative edge",
  "body": "Bellman-Ford handles negative edges. It also handles graphs with negative cycles — it correctly detects them. But once a negative cycle exists, 'shortest path' is undefined: you can loop the cycle forever, accumulating ever-smaller cost. Detection is the right answer; computing a value is wrong."
} }
```

Three flavors of shortest-path problem and the algorithm of choice:

| Graph                                | Algorithm                       |
| ------------------------------------ | ------------------------------- |
| Unweighted                           | BFS, $O(V + E)$                 |
| All weights ≥ 0                      | Dijkstra, $O((V+E) \log V)$     |
| Weights in $\{0, 1\}$                | 0-1 BFS, $O(V + E)$             |
| Arbitrary weights, no negative cycle | Bellman-Ford, $O(VE)$           |
| All-pairs, arbitrary weights         | Floyd-Warshall, $O(V^3)$        |
| Sparse + negative weights            | Johnson's algorithm             |

## 0-1 BFS

When every edge weighs either 0 or 1, Dijkstra's $\log V$ factor is
unnecessary — replace the heap with a *double-ended queue*. The
invariant: at any moment, distances of vertices in the deque differ by
at most 1, and the deque is sorted by distance.

- A weight-0 edge gets *pushed to the front* of the deque (same
  distance as the popped vertex).
- A weight-1 edge gets *pushed to the back* (one more than the popped
  vertex).

This preserves the sorted-by-distance invariant without the heap.

```python
from collections import deque

def zero_one_bfs(n, adj, src):
    INF = float("inf")
    dist = [INF] * n
    dist[src] = 0
    dq = deque([src])
    while dq:
        u = dq.popleft()
        for v, w in adj[u]:
            nd = dist[u] + w
            if nd < dist[v]:
                dist[v] = nd
                if w == 0: dq.appendleft(v)
                else:      dq.append(v)
    return dist
```

Total time: $O(V + E)$. Each vertex is processed at most a constant
number of times because the deque's invariant ensures vertices come
out in non-decreasing distance order.

```viz
{ "type": "architecture", "props": {
  "caption": "0-1 BFS — deque preserves sorted-by-distance order",
  "cols": 12, "rows": 4, "height": 280,
  "boxes": [
    { "id": "pop", "label": "popleft(u)", "sub": "u has smallest known distance", "col": 0, "row": 0, "colSpan": 4, "emphasis": "primary" },
    { "id": "w0",  "label": "edge u → v, weight 0", "sub": "appendleft(v) — same distance", "col": 4, "row": 0, "colSpan": 4 },
    { "id": "w1",  "label": "edge u → v, weight 1", "sub": "append(v) — distance + 1", "col": 8, "row": 0, "colSpan": 4 },
    { "id": "inv", "label": "invariant", "sub": "distances in the deque differ by ≤ 1 and stay sorted", "col": 1, "row": 2, "colSpan": 10, "rowSpan": 2, "emphasis": "primary" }
  ],
  "arrows": [
    { "from": "pop", "to": "w0" },
    { "from": "pop", "to": "w1" },
    { "from": "w0",  "to": "inv" },
    { "from": "w1",  "to": "inv" }
  ]
} }
```

The trick generalizes: for edges in $\{0, 1, 2\}$ you can use three
deques (or *bucket BFS*), and so on. For arbitrary small integer
weights up to $W$, *Dial's algorithm* uses $W$ buckets. None of these
asymptotic refinements matter on general-purpose graphs; they shine on
grid-like problems where weights come from a small alphabet.

## A Worked Example: Minimum Cost Path on a Grid

A grid where moving in the direction you face costs 0 and turning to
move in another direction costs 1. The graph has edges of weight 0 (in
the current heading) and weight 1 (any other heading). 0-1 BFS gives
the minimum number of turns in $O(VE)$.

This pattern appears in:

- **Maze with two move types**: free moves and expensive moves.
- **Sliding puzzles** with two action costs.
- **Network configuration**: routes go through the same node-type for
  free, switch types at cost 1.

## Pitfalls

```viz
{ "type": "callout", "props": {
  "tone": "pitfall",
  "title": "Don't run Bellman-Ford when Dijkstra works",
  "body": "If weights are all non-negative, Dijkstra's O((V+E) log V) crushes Bellman-Ford's Θ(VE). Use Bellman-Ford only when there is a negative edge or you need to detect a negative cycle."
} }
```

```viz
{ "type": "callout", "props": {
  "tone": "pitfall",
  "title": "0-1 BFS only handles {0, 1}",
  "body": "Edges of weight 2 require either splitting them into two unit edges through a phantom node, or using Dijkstra. Trying to push a weight-2 edge into a 0-1 BFS deque silently produces wrong distances."
} }
```

```viz
{ "type": "callout", "props": {
  "tone": "pitfall",
  "title": "Integer overflow in Bellman-Ford",
  "body": "After V - 1 passes, distances can be as large as V × max-edge-weight. With V = 10^5 and weights = 10^9, that's 10^14 — overflows 32-bit. Use 64-bit, and short-circuit relaxation when dist[u] is still infinity."
} }
```

## SPFA — A Word of Warning

The Shortest Path Faster Algorithm is a queue-based variant of
Bellman-Ford. Theoretically $O(VE)$, often much faster on random
graphs. It is a popular topic in competitive programming. However:

- Adversarial inputs can force its worst case ($O(VE)$).
- Modern problem-setters often craft anti-SPFA tests.
- On graphs without negative edges, Dijkstra is always safer.

Use SPFA only when Bellman-Ford is what you need and you have measured
that SPFA is faster on your input distribution.

## Practice
- Bellman-Ford with negative-cycle detection.
- Currency arbitrage: detect a cycle of exchange rates whose product
  exceeds 1.
- 0-1 BFS on a grid where some cells are blocked and unblocking a
  cell costs 1.
- Minimum number of edge reversals to go from $s$ to $t$ in a
  directed graph (0-1 BFS where original edges weigh 0, reversed
  edges weigh 1).
- Floyd-Warshall: $V \times V$ shortest paths in $O(V^3)$.

## References
1. Cormen, Leiserson, Rivest, Stein. *Introduction to Algorithms, 4th ed.*, Chapter 22.
2. cp-algorithms.com. "Bellman-Ford Algorithm" and "0-1 BFS."
