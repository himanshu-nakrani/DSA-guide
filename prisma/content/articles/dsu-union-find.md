---
slug: dsu-union-find
title: Disjoint Set Union (Union-Find)
summary: "Path compression plus union by rank collapses find and union to O(alpha(n)) amortized — effectively constant. The data structure behind Kruskal's MST and every offline connectivity problem."
topicSlug: disjoint-set-union
level: INTERMEDIATE
order: 1
estimatedMins: 22
references:
  - { title: "Introduction to Algorithms, 4th ed., Ch. 19", author: "Cormen, Leiserson, Rivest, Stein", type: "book" }
  - { title: "Disjoint Set Union", url: "https://cp-algorithms.com/data_structures/disjoint_set_union.html", type: "web" }
  - { title: "The Algorithm Design Manual, Ch. 6", author: "Steven Skiena", type: "book" }
prerequisites: ["array-fundamentals"]
---

## Overview
A *disjoint-set* data structure (also called *union-find* or *DSU*)
maintains a collection of disjoint sets under two operations:

- `find(x)` — return a representative of the set containing $x$.
- `union(x, y)` — merge the two sets containing $x$ and $y$.

Two elements are in the same set iff `find(x) == find(y)`. This sounds
modest, but it is the data structure behind Kruskal's minimum spanning
tree, dynamic connectivity, offline cycle detection, image
segmentation, and a long tail of "are these things connected yet?"
problems. With path compression and union by rank, both operations run
in $O(\alpha(n))$ amortized — *inverse Ackermann*, a function so slow
it never exceeds 4 for any input you could store on a computer.
Effectively constant.

## The Forest Representation

Represent each set as a *rooted tree*. The root's value identifies the
set; every other node points to its parent. `find` walks parent
pointers to the root. `union` merges two sets by pointing one root at
the other.

```python
class DSU:
    def __init__(self, n):
        self.parent = list(range(n))   # parent[i] = i means root
        self.rank = [0] * n            # tree depth upper bound

    def find(self, x):
        # path compression: make every node on the path point to the root
        if self.parent[x] != x:
            self.parent[x] = self.find(self.parent[x])
        return self.parent[x]

    def union(self, x, y):
        rx, ry = self.find(x), self.find(y)
        if rx == ry: return False       # already in the same set
        # union by rank: attach shorter tree under taller
        if self.rank[rx] < self.rank[ry]: rx, ry = ry, rx
        self.parent[ry] = rx
        if self.rank[rx] == self.rank[ry]: self.rank[rx] += 1
        return True
```

Two implementation tricks — *path compression* and *union by rank* —
each individually give $O(\log n)$ per operation. Together they
collapse to $O(\alpha(n))$ amortized.

```viz
{ "type": "callout", "props": {
  "tone": "intuition",
  "title": "Why both heuristics together",
  "body": "Union by rank keeps trees shallow on the way up. Path compression flattens trees on the way down. Each alone gives O(log n) per operation; combined, every find rebuilds the path as a direct child of the root, and union avoids ever growing a deep tree. The compound effect is inverse Ackermann."
} }
```

## A Worked Sequence

Start with `{0}, {1}, {2}, {3}, {4}`. After `union(0, 1)`, `union(2,
3)`, `union(0, 2)`, the forest is one tree with root 0 and four
leaves: 1, 2 (or 3), and a deeper one. After a `find(3)`, path
compression flattens the path so 3 points directly at 0.

```viz
{ "type": "architecture", "props": {
  "caption": "DSU after union(0,1), union(2,3), union(0,2), find(3)",
  "cols": 12, "rows": 4, "height": 280,
  "boxes": [
    { "id": "r",  "label": "0 (root)", "sub": "rank 2", "col": 4, "row": 0, "colSpan": 4, "emphasis": "primary" },
    { "id": "n1", "label": "1", "col": 0, "row": 2, "colSpan": 2 },
    { "id": "n2", "label": "2", "col": 5, "row": 2, "colSpan": 2 },
    { "id": "n3", "label": "3", "col": 10, "row": 2, "colSpan": 2 },
    { "id": "n4", "label": "4 (own set)", "col": 0, "row": 3, "colSpan": 4, "emphasis": "muted" }
  ],
  "arrows": [
    { "from": "n1", "to": "r", "label": "parent" },
    { "from": "n2", "to": "r", "label": "parent" },
    { "from": "n3", "to": "r", "label": "parent (compressed)" }
  ]
} }
```

The path from 3 to the root used to be two hops; after the `find(3)`
call, it is one. Path compression *amortizes* every subsequent
`find(3)` to $O(1)$.

### Watch the forest flatten

The explorer below replays the unions, keeps the component count visible, and then makes the path-compression rewrite explicit.

```viz
{ "type": "dsu-forest-trace", "props": {
  "caption": "Disjoint-set union: rank, roots, and path compression"
} }
```

### Watch Kruskal reject a cycle

Kruskal's minimum-spanning-tree algorithm uses the same representative query before it accepts an edge. The next trace makes the cycle gate explicit: an edge is accepted only when its endpoints belong to different components.

```viz
{ "type": "kruskal-mst-trace", "props": {
  "caption": "Kruskal MST: accept safe edges, reject cycles"
} }
```

## Why Inverse Ackermann

The proof is one of the deepest in algorithms (Tarjan 1975, simplified
by Seidel and Sharir). The intuition: with both heuristics, after a
sequence of operations the trees are *so flat* that the average path
length is bounded by a function $\alpha(n)$ that grows slower than any
fixed iterated logarithm.

For $n = 10^{80}$ (more than the number of atoms in the observable
universe), $\alpha(n) \le 4$. In every problem you will ever solve,
the amortized cost per DSU operation is at most 4 pointer hops.

```viz
{ "type": "callout", "props": {
  "tone": "insight",
  "title": "Why 'effectively constant' is the honest claim",
  "body": "Strictly, the cost grows with α(n). But α(n) reaches 4 only when n exceeds 2^^65536 — a tower of 65536 twos. For physical inputs the bound is exactly constant. Most textbooks say 'amortized O(1)' for this reason."
} }
```

## Complexity Summary

| Variant                              | Per operation (amortized) |
| ------------------------------------ | ------------------------- |
| Plain (no heuristics)                | $O(n)$ worst case         |
| Union by rank only                   | $O(\log n)$               |
| Path compression only                | $O(\log n)$               |
| Union by rank + path compression     | $O(\alpha(n)) \approx O(1)$ |

Drop either heuristic and the bound degrades; drop both and you have a
linked list.

## Where DSU Shows Up

- **Kruskal's MST.** Sort edges by weight; for each, union if not
  already connected. $O(E \log E)$ total, dominated by the sort.
- **Cycle detection in an undirected graph.** Process edges; if
  endpoints share a root, there is a cycle.
- **Connected components on a stream of edges.** Add each edge with
  union; count the number of distinct roots.
- **Offline LCA (Tarjan's algorithm).** DSU is the bookkeeping engine
  for batched LCA queries on a tree.
- **Image segmentation / flood-fill on a grid.** Treat pixels as
  vertices, neighbors as edges; union same-color neighbors.
- **Equivalence classes.** Equation systems with `==` constraints
  resolve to a DSU; then `!=` constraints check whether endpoints
  have different roots.

## Two Useful Augmentations

### Size of each set

Track `size[root]` and update on union. Cheap and frequently needed
("how many people are in this person's friend group?").

```python
self.size = [1] * n
# in union, after attaching ry under rx:
self.size[rx] += self.size[ry]
```

### Number of components

Maintain a single integer, initialized to $n$, decremented every time
`union` actually merges two sets. Real-time component count without
extra scans.

### Weighted DSU

Each `parent` edge carries a *weight* representing some additive
relationship to the parent (a delta, a ratio, a coordinate offset).
`find` accumulates weights along the path and compresses them. Useful
for problems like "given constraints $a_i = a_j + d_{ij}$, are they
consistent?"

## Limitations

```viz
{ "type": "callout", "props": {
  "tone": "pitfall",
  "title": "DSU is union-only",
  "body": "There is no efficient split. Once two sets are merged, the data structure cannot un-merge them in O(α(n)). For dynamic connectivity supporting both edge addition and removal, you need link-cut trees or Holm-Lichtenberg-Thorup — both far more complex."
} }
```

```viz
{ "type": "callout", "props": {
  "tone": "pitfall",
  "title": "Recursive find blows the stack",
  "body": "On chains of 10^5 unions before any find, the recursive find with path compression recurses 10^5 deep on its first call. Convert to iterative or do path compression in two passes (first walk to root, then re-walk pointing every node at the root)."
} }
```

```viz
{ "type": "callout", "props": {
  "tone": "pitfall",
  "title": "Not all 'connectivity' problems are union-find shaped",
  "body": "DSU handles *batch* connectivity beautifully — given all edges, group nodes. It handles *dynamic adds* well. It does not handle *queries about specific paths* (use BFS/DFS) or *edges with deletion* (use a more sophisticated structure)."
} }
```

## Practice
- Implement DSU with both heuristics. Verify that `find(x)` after a
  sequence of unions actually compresses the path.
- Kruskal's minimum spanning tree.
- Number of connected components in an undirected graph given as an
  edge list.
- Friend circles / accounts merge (LeetCode 547, 721).
- Redundant connection: find the edge that creates a cycle.
- Given equality constraints `a = b`, `c = d`, …, and inequality
  constraints `e != f`, decide if they are all consistent.
- Weighted union find: given relationships `a - b = w` on a stream,
  detect contradictions.

## References
1. Cormen, Leiserson, Rivest, Stein. *Introduction to Algorithms, 4th ed.*, Chapter 19.
2. Skiena. *The Algorithm Design Manual*, Chapter 6.
3. cp-algorithms.com. "Disjoint Set Union."
