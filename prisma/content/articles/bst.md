---
slug: bst
title: Binary Search Trees
summary: "A binary tree where in-order traversal produces sorted order — giving you search, insert, delete, and ranked queries in O(h). The catch: h degrades to n unless you balance."
topicSlug: trees
level: INTERMEDIATE
order: 2
estimatedMins: 22
references:
  - { title: "Introduction to Algorithms, 4th ed., Ch. 12, 13", author: "Cormen, Leiserson, Rivest, Stein", type: "book" }
  - { title: "Algorithms, 4th ed., Ch. 3.2, 3.3", author: "Sedgewick & Wayne", type: "book" }
prerequisites: ["binary-tree-traversals"]
---

## Overview
A binary search tree is a binary tree carrying one extra invariant: for
every node $x$, every key in $x$'s left subtree is less than $x$'s key
and every key in $x$'s right subtree is greater. That single rule
suffices to make in-order traversal produce sorted output — and to
make search, insertion, deletion, and a family of *ranked* queries
(predecessor, successor, $k$-th smallest, count-of-keys-less-than)
proportional to the tree's height $h$.

The catch is that $h$ is not bounded for a vanilla BST: insertions in
sorted order produce a degenerate, list-shaped tree with $h = n$. Real
BSTs in production are *self-balancing* — red-black, AVL, treap, or
splay — guaranteeing $h = O(\log n)$.

## The Defining Invariant

For every node $x$:

- every key in the left subtree of $x$ is less than $x.\text{key}$,
- every key in the right subtree of $x$ is greater than $x.\text{key}$.

The invariant has to hold *recursively* — not just for $x$'s immediate
children but for every descendant. A common interview bug is to check
only the children.

```viz
{ "type": "tree-traversal", "props": {
  "mode": "inorder",
  "tree": {
    "v": 8,
    "l": { "v": 3, "l": { "v": 1 }, "r": { "v": 6, "l": { "v": 4 }, "r": { "v": 7 } } },
    "r": { "v": 10, "r": { "v": 14, "l": { "v": 13 } } }
  }
} }
```

Walk the tree in-order with the player above. The output is the keys in
sorted ascending order — that is what makes the BST *the* data
structure for ordered set operations.

## Core Operations

### Search

The classic recursive descent:

```python
def search(node, key):
    if node is None or node.key == key:
        return node
    if key < node.key:
        return search(node.left, key)
    return search(node.right, key)
```

Cost is the length of the path from root to the target, which is at
most $h$.

### Insert

Walk down as if searching; when you fall off the tree, attach a new
leaf in that position.

```python
def insert(node, key):
    if node is None:
        return Node(key)
    if key < node.key:
        node.left = insert(node.left, key)
    elif key > node.key:
        node.right = insert(node.right, key)
    return node
```

Equal keys go either left or right depending on convention — be
consistent.

### Delete

The non-trivial case. Three sub-cases:

1. **Leaf** — just remove it.
2. **One child** — replace the node with its single child.
3. **Two children** — replace the node's *key* with the smallest key
   in its right subtree (its in-order successor), then recursively
   delete that successor in the right subtree. The successor has at
   most one child, so the recursion lands in case 1 or 2.

```python
def delete(node, key):
    if node is None:
        return None
    if key < node.key:
        node.left = delete(node.left, key)
    elif key > node.key:
        node.right = delete(node.right, key)
    else:
        if node.left is None:  return node.right
        if node.right is None: return node.left
        succ = min_node(node.right)
        node.key = succ.key
        node.right = delete(node.right, succ.key)
    return node
```

```viz
{ "type": "callout", "props": {
  "tone": "intuition",
  "title": "Why the in-order successor",
  "body": "The in-order successor is the smallest key larger than the deleted one — the next key in sorted order. Replacing with it preserves the BST invariant globally. The predecessor (largest key smaller than the deleted one) works just as well; use whichever is cleaner."
} }
```

## Ranked Queries

A vanilla BST supports these natively:

- **Min / max** — walk left / right to the bottom.
- **Predecessor / successor** — in-order neighbors. With parent
  pointers, find them in $O(h)$ without recursion.
- **$k$-th smallest** — augment each node with `size` (the number of
  keys in its subtree). Then descent uses the left-subtree size to
  decide which side to take.
- **Rank of a key** — number of keys less than it. The mirror of $k$-th
  smallest.

The size augmentation costs $\Theta(1)$ extra space per node and
$\Theta(h)$ extra work per insert/delete, but it earns ranked queries
in $\Theta(h)$.

## The Balance Problem

A BST of $n$ keys built by inserting them in random order has
*expected* height $\Theta(\log n)$ — Knuth's beautiful result from
TAOCP volume 3. But if the keys arrive sorted (or nearly sorted), the
tree degenerates to a right spine and every operation costs $\Theta(n)$.

```viz
{ "type": "architecture", "props": {
  "caption": "Vanilla BST: best vs. worst structural shape",
  "cols": 12, "rows": 4, "height": 280,
  "boxes": [
    { "id": "bal", "label": "balanced — random insertion", "sub": "h = log n", "col": 0, "row": 0, "colSpan": 6, "emphasis": "primary" },
    { "id": "skw", "label": "degenerate — sorted insertion", "sub": "h = n", "col": 6, "row": 0, "colSpan": 6, "emphasis": "warn" },
    { "id": "rb",  "label": "red-black", "sub": "h ≤ 2 log(n+1)", "col": 0, "row": 2, "colSpan": 3, "emphasis": "primary" },
    { "id": "avl", "label": "AVL", "sub": "h ≤ 1.44 log(n+2)", "col": 3, "row": 2, "colSpan": 3, "emphasis": "primary" },
    { "id": "tre", "label": "treap", "sub": "expected h = log n", "col": 6, "row": 2, "colSpan": 3 },
    { "id": "spl", "label": "splay", "sub": "amortized log n", "col": 9, "row": 2, "colSpan": 3 }
  ]
} }
```

In practice the standard library never gives you a vanilla BST:

- C++ `std::set` / `std::map` — typically a red-black tree.
- Java `TreeSet` / `TreeMap` — red-black tree.
- Linux kernel scheduler — red-black tree (for the CFS scheduler).
- Many functional languages — AVL trees in their persistent
  collections.

The balanced variants share the $\Theta(\log n)$ guarantees and differ
mostly in constants and in how aggressively they rebalance on each
operation. AVL has stricter balance (faster lookups, more rotations on
inserts); red-black is looser (fewer rotations, slightly slower
lookups). Treap and splay trade strict guarantees for simpler code.

## Complexity Summary

| Operation        | Vanilla BST (avg) | Vanilla BST (worst) | Balanced (worst) |
| ---------------- | ----------------- | ------------------- | ---------------- |
| Search           | $O(\log n)$       | $O(n)$              | $O(\log n)$      |
| Insert           | $O(\log n)$       | $O(n)$              | $O(\log n)$      |
| Delete           | $O(\log n)$       | $O(n)$              | $O(\log n)$      |
| Min / max        | $O(\log n)$       | $O(n)$              | $O(\log n)$      |
| $k$-th smallest  | $O(\log n)$       | $O(n)$              | $O(\log n)$      |
| In-order all     | $O(n)$            | $O(n)$              | $O(n)$           |

## Pitfalls

```viz
{ "type": "callout", "props": {
  "tone": "pitfall",
  "title": "Checking BST invariant by parent comparison only",
  "body": "node.left.key < node.key < node.right.key does not imply the whole tree is a BST — a left child can have a right grandchild larger than node. Validate by passing min and max bounds through recursion, or by checking that in-order traversal is strictly increasing."
} }
```

```viz
{ "type": "callout", "props": {
  "tone": "pitfall",
  "title": "Sorted insertion into a vanilla BST",
  "body": "If your data arrives sorted, build a balanced tree from the array directly (recursive midpoint), or use a self-balancing tree, or sort and use a sorted array. Inserting sorted into a vanilla BST gives O(n) per op."
} }
```

```viz
{ "type": "callout", "props": {
  "tone": "pitfall",
  "title": "Floating-point keys",
  "body": "BST comparisons assume a total order. NaN breaks it. Use integer or string keys when possible; if you must use floats, define a careful comparator and never insert NaN."
} }
```

## Practice
- Insert a sequence of integers into a BST. Then validate the BST
  property recursively with min/max bounds.
- Find the in-order predecessor and successor of a node.
- Delete a node. Handle all three cases.
- Find the $k$-th smallest element using a size-augmented BST.
- Lowest common ancestor of two nodes in a BST. (Hint: the unique
  node whose key sits between the two targets.)
- Convert a sorted array into a balanced BST.

## References
1. Cormen, Leiserson, Rivest, Stein. *Introduction to Algorithms, 4th ed.*, Chapters 12, 13.
2. Sedgewick & Wayne. *Algorithms, 4th ed.*, Sections 3.2 and 3.3.
