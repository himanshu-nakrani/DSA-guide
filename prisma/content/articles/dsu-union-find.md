---
slug: dsu-union-find
title: Disjoint Set Union (Union-Find)
summary: Path compression plus union by rank gives near-constant amortized find and union — the workhorse for offline connectivity problems.
topicSlug: disjoint-set-union
level: INTERMEDIATE
order: 1
estimatedMins: 18
references:
  - { title: "Introduction to Algorithms, 4th ed., Ch. 19 (Data Structures for Disjoint Sets)", author: "Cormen, Leiserson, Rivest, Stein", type: "book" }
  - { title: "Disjoint Set Union", url: "https://cp-algorithms.com/data_structures/disjoint_set_union.html", type: "web" }
prerequisites: ["array-fundamentals"]
---

## Overview
A disjoint-set union (DSU), also called Union-Find, maintains a partition of $n$ elements into disjoint sets. It supports two operations: `find(x)` returns a canonical representative of $x$'s set, and `union(x, y)` merges the sets containing $x$ and $y$. With two simple optimizations — path compression and union by rank — each operation runs in $O(\alpha(n))$ amortized time, where $\alpha$ is the inverse Ackermann function (effectively a small constant).

## Prerequisites
- Array Fundamentals

## Core Idea
Represent each set as a tree of "parent" pointers. `find(x)` walks parent pointers to the root; the root is the representative. `union(x, y)` attaches one tree under the other. Without optimizations, trees can degenerate to chains. Path compression flattens trees during `find`; union by rank ensures the smaller tree is attached under the larger.

## Mechanics

**Initialization**:
```text
parent[i] = i        # each element is its own root
rank[i]   = 0        # upper bound on tree height
```

**Find with path compression**:
```text
find(x):
    if parent[x] != x:
        parent[x] = find(parent[x])     # collapse x's path to the root
    return parent[x]
```

**Union by rank**:
```text
union(x, y):
    rx = find(x); ry = find(y)
    if rx == ry: return
    if rank[rx] < rank[ry]: swap(rx, ry)
    parent[ry] = rx
    if rank[rx] == rank[ry]: rank[rx] += 1
```

A common variant is **union by size** instead of rank — track subtree sizes and attach the smaller under the larger. Either gives the same asymptotic bound.

## Complexity
- With both optimizations: $O(\alpha(n))$ amortized per operation. $\alpha(n) \le 4$ for any $n \le 2^{2^{2^{2^2}}}$ — effectively constant.
- With only one optimization: $O(\log n)$ amortized.
- Without either: $O(n)$ worst case per operation.
- Space: $O(n)$.

## Common Patterns
1. **Kruskal's MST algorithm**: sort edges; for each, `union` the endpoints if they aren't already connected.
2. **Connectivity queries on an offline graph**: build the DSU as edges arrive; answer connectivity in $O(\alpha)$.
3. **Number of connected components**: maintain a counter; decrement on every successful union.
4. **Cycle detection in an undirected graph**: an edge $(u, v)$ closes a cycle iff `find(u) == find(v)` before union.
5. **Track auxiliary information per set**: store size, max, sum, etc. on the root and update on union.

## Pitfalls
- **Forgetting one of the optimizations**. Path compression *or* union by rank alone is good; both together are great. Neither is bad.
- **Storing data on non-root nodes**. Any per-set data must live on the root; other nodes' data goes stale on union.
- **Mixing union by rank with arbitrary attach order**. If you always attach `y` under `x` without consulting ranks, you lose the bound.
- **Using DSU when you need to *split* sets**. DSU is union-only. Splits are hard — usually requires reverse-time processing or a link-cut tree.

## Practice
- Number of Connected Components in an Undirected Graph.
- Friend Circles.
- Redundant Connection.
- Accounts Merge.
- Kruskal's Minimum Spanning Tree.

## References
1. Cormen, Leiserson, Rivest, Stein. *Introduction to Algorithms, 4th ed.*, Chapter 19.
2. cp-algorithms.com. "Disjoint Set Union".
