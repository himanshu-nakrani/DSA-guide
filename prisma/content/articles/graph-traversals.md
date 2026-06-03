---
slug: graph-traversals
title: Graph Representations and Traversal (BFS/DFS)
summary: Adjacency lists plus BFS and DFS — the foundation for shortest paths, connectivity, and cycle detection.
topicSlug: graph-fundamentals
level: INTERMEDIATE
order: 1
estimatedMins: 22
references:
  - { title: "Introduction to Algorithms, 4th ed., Ch. 22", author: "Cormen, Leiserson, Rivest, Stein", type: "book" }
  - { title: "Algorithms, 4th ed., Ch. 4", author: "Sedgewick & Wayne", type: "book" }
  - { title: "Graph Traversal: BFS and DFS", url: "https://cp-algorithms.com/", type: "web" }
prerequisites: ["binary-tree-traversals", "stack-queue-fundamentals"]
---

## Overview
A graph is the most general data structure in this curriculum: a set $V$ of
vertices and a set $E$ of pairs of vertices we call edges. Trees, linked
lists, grids, dependency DAGs, social networks, road maps — they are all
graphs. Two traversals — breadth-first and depth-first — give you the
toolkit to attack the vast majority of graph problems. Almost every other
graph algorithm in this guide is a refinement of one of these two.

The defining complication, compared to trees, is that graphs may contain
*cycles*. A naïve recursive descent would loop forever; we maintain a
`visited` set to keep the search finite.

## Representing the Graph

You will pick one of three representations.

| Representation     | Space         | $u, v$ adjacent?      | Iterate neighbors of $u$  | Use when |
| ------------------ | ------------- | --------------------- | -------------------------- | -------- |
| Adjacency list     | $O(V + E)$    | $O(\deg u)$           | $O(\deg u)$                | Sparse graphs (most real ones). |
| Adjacency matrix   | $O(V^2)$      | $O(1)$                | $O(V)$                     | Dense graphs, or many edge queries. |
| Edge list          | $O(E)$        | $O(E)$                | $O(E)$                     | Kruskal's MST, batched edge work. |

Almost always: adjacency list. Stored as `vector<vector<int>>` (C++), `List<List<Integer>>` (Java), or `dict[int, list[int]]` (Python).

```python
# Adjacency list, undirected
adj = [[] for _ in range(n)]
for u, v in edges:
    adj[u].append(v)
    adj[v].append(u)   # drop this line for directed graphs
```

## The Two Traversals

Both BFS and DFS visit every vertex reachable from a source exactly once,
in time $O(V + E)$. The only difference is which vertex they expand next —
and that choice dictates everything else.

```viz
{ "type": "graph-traversal", "props": { "mode": "bfs", "start": 0 } }
```

Toggle between BFS and DFS to compare how the frontier evolves. The frontier
is a **queue** for BFS (first-in, first-out — the oldest unexplored vertex
expands next) and a **stack** for DFS (last-in, first-out — the newest does).

```viz
{ "type": "callout", "props": {
  "tone": "intuition",
  "title": "BFS = expanding wave; DFS = single thread",
  "body": "BFS spreads out one layer at a time, like ink on paper. DFS shoots down a single path until it dead-ends, backtracks, and tries another. The same vertices, the same edges — only the order changes."
} }
```

## The Common Skeleton

A single iterative template handles both. Swap the frontier and you have
swapped the algorithm:

```python
def traverse(adj, src, kind="bfs"):
    from collections import deque
    visited = [False] * len(adj)
    frontier = deque([src])
    visited[src] = True
    while frontier:
        u = frontier.popleft() if kind == "bfs" else frontier.pop()
        # visit u
        for v in adj[u]:
            if not visited[v]:
                visited[v] = True
                frontier.append(v)
```

The `visited[v] = True` *before* pushing matters. If you mark on pop
instead, the same neighbor can be queued multiple times and the visited set
doesn't bound the queue size. For unweighted graphs the difference is
correctness; for weighted ones (Dijkstra) it changes the entire data
structure.

## What Each Traversal Computes for Free

**BFS guarantees shortest paths in unweighted graphs.** The first time BFS
sees a vertex, the edge that put it on the queue lies on a shortest path
from the source. The proof is a one-line induction: BFS expands vertices in
order of distance from the source, so any path uncovered later is at least
as long. Store the parent edge and you can reconstruct the path.

**DFS partitions edges into four classes** on a directed graph:

- *Tree edges* — edges along which the DFS first discovers a new vertex.
- *Back edges* — to an ancestor (signal a cycle).
- *Forward edges* — to a descendant of the current vertex.
- *Cross edges* — neither.

These categories are the foundation of cycle detection, topological sort,
strongly connected components (Kosaraju / Tarjan), and bridge-finding.

```viz
{ "type": "callout", "props": {
  "tone": "insight",
  "title": "BFS for distance, DFS for structure",
  "body": "If the question is 'how far away?' or 'what's the minimum number of hops?', think BFS. If the question is 'is there a cycle / a topological order / a bridge / a strongly connected component?', think DFS."
} }
```

## Worked Patterns

1. **Connected components** — outer loop over vertices; if unvisited,
   start a fresh traversal and increment the component counter.
2. **Shortest path in an unweighted graph** — BFS with a `parent[]` array;
   reconstruct by walking parents from target to source.
3. **Cycle detection (undirected)** — DFS; a back edge to a non-parent
   neighbor means a cycle.
4. **Cycle detection (directed)** — DFS with three colors (white, gray,
   black). Seeing a gray vertex is a back edge.
5. **Grid problems** — `(r, c)` is a vertex, four edges per cell. Treat the
   2D grid as a graph and BFS/DFS through it.
6. **Bipartite check** — BFS while two-coloring; success iff no edge
   connects two same-color vertices.

## Complexity

| Variant            | Time          | Space  |
| ------------------ | ------------- | ------ |
| BFS                | $O(V + E)$    | $O(V)$ |
| DFS (recursive)    | $O(V + E)$    | $O(V)$ stack |
| DFS (iterative)    | $O(V + E)$    | $O(V)$ stack |
| Connected components | $O(V + E)$  | $O(V)$ |
| Bipartite check    | $O(V + E)$    | $O(V)$ |

The $O(V + E)$ figure is tight: every vertex is dequeued once and every
edge is inspected at most twice (once from each endpoint, for undirected
graphs).

## Pitfalls

```viz
{ "type": "callout", "props": {
  "tone": "pitfall",
  "title": "Mark on push, not on pop",
  "body": "Mark visited the moment you enqueue. Otherwise the same neighbor enters the queue multiple times and your visited check fires too late — the algorithm is still correct, but the queue grows beyond V and the running time degrades."
} }
```

```viz
{ "type": "callout", "props": {
  "tone": "pitfall",
  "title": "Recursive DFS on big graphs",
  "body": "Languages with shallow default stacks (Python ~1000, JVM ~10k) crash on graphs of 10^5+ vertices laid out as a path. Either lift the recursion limit, raise the JVM stack, or switch to an iterative DFS with an explicit stack."
} }
```

```viz
{ "type": "callout", "props": {
  "tone": "pitfall",
  "title": "BFS does not give shortest path in weighted graphs",
  "body": "BFS counts edges. If edges have weights, you need Dijkstra (non-negative weights) or 0-1 BFS (weights in {0,1}). The next module covers both."
} }
```

## Practice
- Number of connected components.
- Shortest path in an unweighted graph from $s$ to $t$, with path
  reconstruction.
- Grid traversal: Number of Islands.
- Detect a cycle in a directed graph.
- Check if a graph is bipartite.

## References
1. Cormen, Leiserson, Rivest, Stein. *Introduction to Algorithms, 4th ed.*, Chapter 22.
2. Sedgewick & Wayne. *Algorithms, 4th ed.*, Chapter 4.
3. cp-algorithms.com. "Graph Traversal: BFS and DFS."
