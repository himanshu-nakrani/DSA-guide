---
slug: topological-sort
title: Topological Sort
summary: "Order the vertices of a DAG so every edge points forward — Kahn's BFS algorithm and DFS post-order, both in O(V+E), plus cycle detection and DAG DP."
topicSlug: graph-fundamentals
level: INTERMEDIATE
order: 2
estimatedMins: 20
references:
  - { title: "Introduction to Algorithms, 4th ed., Ch. 22", author: "Cormen, Leiserson, Rivest, Stein", type: "book" }
  - { title: "Topological Sorting", url: "https://cp-algorithms.com/graph/topological-sort.html", type: "web" }
  - { title: "The Algorithm Design Manual, Ch. 7", author: "Steven Skiena", type: "book" }
prerequisites: ["graph-traversals"]
---

## Overview
A *topological sort* of a directed graph is an ordering of its
vertices such that every edge $u \to v$ has $u$ appearing before $v$.
Such an order exists iff the graph is a *directed acyclic graph*
(DAG); a cycle would force a vertex to come before itself.

Topological sort is the backbone of dependency resolution — build
systems, course prerequisites, package managers, spreadsheet
recalculation, function inlining order in a compiler. It also enables
*DAG DP*: a single pass over a topological ordering computes optimal
values for all vertices in $O(V + E)$.

## Two Algorithms, Both Linear

The two standard approaches:

- **Kahn's algorithm (BFS-based).** Repeatedly remove a vertex with
  in-degree zero. The order in which vertices are removed is a
  topological order.
- **DFS post-order reversal.** Run DFS; output each vertex when its
  recursion *returns*. Reverse the resulting list.

Both run in $\Theta(V + E)$. Choose by what else you need:

- Kahn detects cycles naturally (if some vertices remain unprocessed
  at the end, they form a cycle).
- DFS yields finishing times, useful for strongly connected components
  (Kosaraju, Tarjan).
- Kahn is easier to parallelize (all in-degree-zero vertices can be
  processed concurrently).

## Kahn's Algorithm

```python
from collections import deque

def kahn(n, adj):
    in_deg = [0] * n
    for u in range(n):
        for v in adj[u]:
            in_deg[v] += 1
    q = deque(u for u in range(n) if in_deg[u] == 0)
    order = []
    while q:
        u = q.popleft()
        order.append(u)
        for v in adj[u]:
            in_deg[v] -= 1
            if in_deg[v] == 0:
                q.append(v)
    if len(order) != n:
        return None    # cycle exists
    return order
```

The frontier is a queue of "currently free" vertices — those with no
unresolved dependencies. Removing one might free others; add them to the
queue. When the queue is empty, you have either a complete
ordering or a non-empty residual that must contain a cycle.

### Schedule the dependencies one choice at a time

Choose the next vertex from the zero-in-degree frontier. The graph includes a
DAG mode with multiple valid answers and a cycle mode that leaves a residual
subgraph when the frontier empties too early.

```viz
{ "type": "dag-scheduler", "props": {
  "caption": "Kahn's algorithm: choose from the zero-in-degree frontier",
  "mode": "acyclic"
} }
```


```viz
{ "type": "architecture", "props": {
  "caption": "Kahn's algorithm — process by in-degree zero",
  "cols": 12, "rows": 4, "height": 280,
  "boxes": [
    { "id": "init", "label": "compute in-degree for every vertex", "col": 0, "row": 0, "colSpan": 6, "emphasis": "muted" },
    { "id": "q0",   "label": "enqueue all vertices with in-degree 0", "col": 6, "row": 0, "colSpan": 6, "emphasis": "primary" },
    { "id": "deq",  "label": "dequeue u → output u", "col": 0, "row": 2, "colSpan": 4 },
    { "id": "decr", "label": "for each edge u→v: decrement in-degree[v]", "col": 4, "row": 2, "colSpan": 5 },
    { "id": "push", "label": "if in-degree[v] hits 0: enqueue v", "col": 9, "row": 2, "colSpan": 3, "emphasis": "primary" }
  ],
  "arrows": [
    { "from": "init", "to": "q0" },
    { "from": "q0",   "to": "deq" },
    { "from": "deq",  "to": "decr" },
    { "from": "decr", "to": "push" },
    { "from": "push", "to": "deq" }
  ]
} }
```

## DFS Post-Order

```python
def dfs_topo(n, adj):
    WHITE, GRAY, BLACK = 0, 1, 2
    color = [WHITE] * n
    order = []
    has_cycle = False

    def dfs(u):
        nonlocal has_cycle
        color[u] = GRAY
        for v in adj[u]:
            if color[v] == GRAY:
                has_cycle = True
                return
            if color[v] == WHITE:
                dfs(v)
        color[u] = BLACK
        order.append(u)

    for u in range(n):
        if color[u] == WHITE:
            dfs(u)
            if has_cycle: return None
    return list(reversed(order))
```

Three colors: white (unvisited), gray (in the current recursion
stack), black (finished). Encountering a gray vertex is a *back edge*
— the cycle indicator. Black vertices are off-limits but harmless;
they have already been ordered.

The reverse-of-post-order trick is one of those CS pearls. The
finishing time of $u$ is *after* the finishing time of every vertex
reachable from $u$ — so reversed finishing order puts $u$ before
everything it depends on.

## Worked Example: Course Schedule

Given $n$ courses and prerequisite pairs `(a, b)` meaning "$a$ depends
on $b$", produce an order in which the courses can be taken. Build
adjacency `b → a` (the dependency points to the dependent), run Kahn,
and either return the order or fail because of a cycle.

```python
def find_order(n, prereqs):
    adj = [[] for _ in range(n)]
    for a, b in prereqs:
        adj[b].append(a)
    return kahn(n, adj)
```

For 4 courses with prereqs `(1,0), (2,0), (3,1), (3,2)`, one valid
order is `[0, 1, 2, 3]` or `[0, 2, 1, 3]`. Both respect the
dependencies.

## DAG DP

Once you have a topological order, you can DP across the DAG in a
single forward pass:

```python
# Longest path in a DAG
def longest_path(n, adj_with_weight, order):
    dist = [0] * n
    for u in order:
        for v, w in adj_with_weight[u]:
            if dist[u] + w > dist[v]:
                dist[v] = dist[u] + w
    return max(dist)
```

This is $O(V + E)$ — strictly faster than Bellman-Ford for the
shortest- or longest-path problem when the graph is a DAG.

Common DAG-DP problems:

- Longest increasing subsequence (model the array as a DAG of "$j$
  can follow $i$ if $a_i < a_j$").
- Course schedule with maximum value, where each course pays $v_i$.
- Critical-path method in project planning.
- Word-break counting (string positions become vertices).

## Pitfalls

```viz
{ "type": "callout", "props": {
  "tone": "pitfall",
  "title": "Cycles are not always obvious",
  "body": "If you build the graph wrong (edges pointing the wrong direction), Kahn quietly produces a wrong order on what looks like a valid topological sort. Always verify: 'for every edge u → v, u must appear before v'. If you cannot verify, the order is suspect."
} }
```

```viz
{ "type": "callout", "props": {
  "tone": "pitfall",
  "title": "DFS on dense or deep DAGs",
  "body": "Recursive DFS topological sort blows the stack on a chain of 10^5 vertices. Either lift the recursion limit, use the iterative form (explicit stack + two-pass for post-order), or switch to Kahn."
} }
```

```viz
{ "type": "callout", "props": {
  "tone": "pitfall",
  "title": "Ambiguous order is the rule, not the exception",
  "body": "Most DAGs admit many valid topological orders. Your algorithm picks one; a tester comparing exact orders against a reference will fail. Verify by edge constraint, not by string equality."
} }
```

## Lexicographic Topological Sort

When the problem asks for the *lexicographically smallest* topological
order, replace Kahn's queue with a min-heap. Cost rises to $O((V + E)
\log V)$, the same as Dijkstra, but the output is uniquely determined.

```python
import heapq

def lex_kahn(n, adj):
    in_deg = [0] * n
    for u in range(n):
        for v in adj[u]:
            in_deg[v] += 1
    heap = [u for u in range(n) if in_deg[u] == 0]
    heapq.heapify(heap)
    order = []
    while heap:
        u = heapq.heappop(heap)
        order.append(u)
        for v in adj[u]:
            in_deg[v] -= 1
            if in_deg[v] == 0:
                heapq.heappush(heap, v)
    return order if len(order) == n else None
```

## Practice
- Course schedule I (can you complete all courses?).
- Course schedule II (output a valid order).
- Alien dictionary (derive a letter order from sorted word list).
- Longest path in a DAG.
- Minimum height trees (multi-source BFS from the leaves inward).
- Build order for a project with task dependencies.
- Detect a cycle in a directed graph two ways: DFS three-coloring,
  and Kahn (output size less than $V$).

## References
1. Cormen, Leiserson, Rivest, Stein. *Introduction to Algorithms, 4th ed.*, Chapter 22.
2. Skiena. *The Algorithm Design Manual*, Chapter 7.
3. cp-algorithms.com. "Topological Sorting."
