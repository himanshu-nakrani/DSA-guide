---
slug: dijkstra
title: Dijkstra's Algorithm
summary: Single-source shortest paths in a graph with non-negative edge weights, in O((V + E) log V) with a binary heap.
topicSlug: shortest-paths
level: INTERMEDIATE
order: 1
estimatedMins: 20
references:
  - { title: "Introduction to Algorithms, 4th ed., Ch. 22 (Single-Source Shortest Paths)", author: "Cormen, Leiserson, Rivest, Stein", type: "book" }
  - { title: "A Note on Two Problems in Connexion with Graphs", author: "Edsger W. Dijkstra (1959)", type: "paper" }
  - { title: "Dijkstra's Algorithm", url: "https://cp-algorithms.com/graph/dijkstra.html", type: "web" }
prerequisites: ["graph-traversals", "heap-priority-queue"]
---

## Overview
Dijkstra's algorithm is the standard answer to *single-source shortest
paths* when edge weights are non-negative. Given a source $s$ in a
weighted graph, it computes the length of the shortest path from $s$ to
every reachable vertex in $O((V + E) \log V)$ — efficient enough for road
networks with tens of millions of edges and the foundation of every
production routing engine you've ever used.

It is also the natural generalization of BFS: BFS works in unit-weight
graphs by visiting in order of *number of edges*; Dijkstra visits in
order of *total path weight*.

## The Mental Model

Maintain a tentative distance $d[v]$ for every vertex, initialized to
$\infty$ except $d[s] = 0$. Repeatedly:

1. Pick the unsettled vertex $u$ with the smallest $d[u]$.
2. Mark $u$ settled. Its distance is final.
3. Relax every outgoing edge $u \to v$ with weight $w$: if $d[u] + w <
   d[v]$, update $d[v]$.

The trick is step 1 — finding the next vertex efficiently. A priority
queue (min-heap) does it in $O(\log V)$ per operation.

```viz
{ "type": "dijkstra", "props": { "source": 0 } }
```

Step through and watch the *frontier* of settled vertices grow outward
along the shortest-path tree. Once a vertex turns moss-green it is
settled and its distance label will not change again.

## Why Non-Negativity Matters

Dijkstra's correctness rests on a single invariant: when we settle vertex
$u$, the only paths we could have missed pass through *unsettled* vertices
$x$ with $d[x] \ge d[u]$. With non-negative edge weights, any such path
adds non-negative weight, so it cannot beat $d[u]$. Hence $d[u]$ is final.

The argument fails the moment a single negative edge exists: a later
relaxation could in principle shorten a vertex we already settled. Use
Bellman-Ford for graphs with negative edges; the cost is $O(VE)$, but
correctness returns.

```viz
{ "type": "callout", "props": {
  "tone": "pitfall",
  "title": "Even one negative edge breaks the algorithm",
  "body": "Don't try to repair Dijkstra by adding a constant to every weight — that scales paths by their edge count, not their original weight, and breaks shortest-path comparisons. Reach for Bellman-Ford or Johnson's algorithm instead."
} }
```

## The Implementation

The standard "lazy" version uses a binary heap (`std::priority_queue`,
`heapq`, `PriorityQueue`) and re-pushes a vertex every time its distance
improves. Stale heap entries are filtered on pop. No decrease-key needed.

```python
import heapq

def dijkstra(n, adj, src):
    INF = float("inf")
    dist = [INF] * n
    dist[src] = 0
    heap = [(0, src)]
    parent = [-1] * n
    while heap:
        d, u = heapq.heappop(heap)
        if d > dist[u]:           # stale entry — skip
            continue
        for v, w in adj[u]:
            nd = d + w
            if nd < dist[v]:
                dist[v] = nd
                parent[v] = u
                heapq.heappush(heap, (nd, v))
    return dist, parent
```

The stale-entry filter is the line that turns a slow $O(V^2)$ implementation
into an efficient one. Without it, vertices can be processed multiple times.

### Watch stale entries get rejected

The lazy heap keeps old distance pairs instead of mutating them in place. Step through the trace to see a fresh entry settle a vertex, then watch its older pair become stale and get skipped safely.

```viz
{ "type": "dijkstra-lazy-heap", "props": {
  "caption": "Dijkstra's lazy heap: fresh entries versus stale entries",
  "source": "A"
} }
```

To reconstruct a path from $s$ to $t$, walk `parent[]` back from $t$ until
you reach $s$, then reverse.

## The Tradeoffs Between Priority Queues

| Priority queue              | Time bound                | When to use                          |
| --------------------------- | ------------------------- | ------------------------------------ |
| Array (linear scan)         | $O(V^2)$                  | Dense graphs, $E = \Theta(V^2)$.     |
| Binary heap (lazy)          | $O((V + E) \log V)$       | Default. Production.                 |
| Binary heap (decrease-key)  | $O((V + E) \log V)$       | Theoretical; rare in practice.       |
| Fibonacci heap              | $O(E + V \log V)$         | Asymptotically optimal; large constants. |
| Indexed priority queue      | $O((V + E) \log V)$       | Useful when decrease-key dominates.  |

For most problems the lazy binary heap is correct, fast, and short to
write. Reach for the array variant only when you've measured a dense
graph and need the cache-friendly access pattern.

## Variants You'll Meet

- **Bidirectional Dijkstra** — launch the search from both source and
  destination, terminate when they meet. Roughly halves the explored
  area on real road networks.
- **A\*** — Dijkstra augmented with a heuristic $h(v)$ that estimates the
  remaining distance. Provided $h$ is admissible (never overestimates),
  A\* is optimal and dramatically faster than vanilla Dijkstra on
  geometric graphs.
- **Modified-state Dijkstra** — combine the vertex with extra state like
  *fuel remaining*, *number of stops*, or *parity of edges*. Run Dijkstra
  on the product graph.
- **K-shortest paths** — Yen's algorithm wraps Dijkstra to find the
  second, third, ..., $K$-th shortest path.

## Complexity Summary

- Time: $\Theta((V + E) \log V)$ with a binary heap. Each edge contributes
  at most one heap push; each vertex is popped at most once for real
  processing.
- Space: $\Theta(V + E)$ — adjacency list plus distance, parent, and heap
  arrays.
- Cannot handle negative edges. Period.

## Common Pitfalls

```viz
{ "type": "callout", "props": {
  "tone": "pitfall",
  "title": "Forgetting the stale-entry check",
  "body": "Without `if d > dist[u]: continue`, the lazy version re-processes already-settled vertices and the running time degrades. The check costs one comparison per pop and is non-negotiable."
} }
```

```viz
{ "type": "callout", "props": {
  "tone": "pitfall",
  "title": "Integer overflow on long paths",
  "body": "Summing 10^5 edges of weight 10^9 overflows 32-bit. Default to 64-bit (long long, i64) for the distance array unless you've checked the bounds explicitly."
} }
```

```viz
{ "type": "callout", "props": {
  "tone": "pitfall",
  "title": "Wrong heap ordering",
  "body": "Some languages (Java's PriorityQueue, Python's heapq) are min-heaps by default. Others are not. Confirm: the smallest distance should pop first. Storing (distance, vertex) tuples makes the ordering implicit and correct."
} }
```

## Practice
- Network delay time.
- Path with maximum probability (multiplicative weights — take logarithms
  and run Dijkstra).
- Cheapest flights within K stops (modified state: vertex × stops_used).
- Shortest path in a grid with obstacle elimination (modified state:
  cell × obstacles_removed).
- Implement bidirectional Dijkstra.

## References
1. Cormen, Leiserson, Rivest, Stein. *Introduction to Algorithms, 4th ed.*, Chapter 22.
2. Dijkstra. *A Note on Two Problems in Connexion with Graphs.* Numerische Mathematik 1, 1959.
3. cp-algorithms.com. "Dijkstra's Algorithm."
