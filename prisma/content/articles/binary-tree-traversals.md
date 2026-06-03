---
slug: binary-tree-traversals
title: Binary Tree Traversals
summary: Inorder, preorder, postorder, and level-order — the four ways to visit every node of a binary tree exactly once.
topicSlug: trees
level: FOUNDATION
order: 1
estimatedMins: 18
references:
  - { title: "Introduction to Algorithms, 4th ed., Ch. 12", author: "Cormen, Leiserson, Rivest, Stein", type: "book" }
  - { title: "Algorithms, 4th ed., Ch. 3.2", author: "Sedgewick & Wayne", type: "book" }
  - { title: "Tree Traversals", url: "https://cp-algorithms.com/", type: "web" }
prerequisites: ["recursion-fundamentals"]
---

## Overview
A binary tree is a hierarchy: every node has up to two children, and each
child is itself the root of a subtree. *Traversing* the tree means visiting
every node exactly once — and the order in which you visit them turns out
to encode a remarkable amount of information about what you can compute.

Four canonical orders cover practically every interview-shaped tree
problem. Three are depth-first (recursive descent into one subtree before
the other); one is breadth-first (entire level before the next). Pick one
to match the problem and the algorithm often writes itself.

## The Four Orders

Below is a single tree shown four times. Click the order buttons to play
through it; the sequence row underneath shows the visit order.

```viz
{ "type": "tree-traversal", "props": { "mode": "inorder" } }
```

Each order is named by the position of *root* relative to its subtrees:

- **Preorder** — root, then left subtree, then right subtree.
- **Inorder** — left subtree, then root, then right subtree.
- **Postorder** — left subtree, then right subtree, then root.
- **Level-order (BFS)** — by depth, left to right.

The first three are recursive one-liners. BFS needs a queue.

```python
def preorder(n, out):
    if not n: return
    out.append(n.v)
    preorder(n.left, out)
    preorder(n.right, out)

def inorder(n, out):
    if not n: return
    inorder(n.left, out)
    out.append(n.v)
    inorder(n.right, out)

def postorder(n, out):
    if not n: return
    postorder(n.left, out)
    postorder(n.right, out)
    out.append(n.v)

def bfs(root):
    from collections import deque
    q, out = deque([root]), []
    while q:
        n = q.popleft()
        if not n: continue
        out.append(n.v)
        q.append(n.left); q.append(n.right)
    return out
```

## What Each Order Buys You

- **Preorder** mirrors the *structure* of the tree. It's what you use to
  serialize a tree to a string for storage or transmission. Pair preorder
  with inorder and you can uniquely reconstruct any binary tree.
- **Inorder** on a *binary search tree* yields its keys in sorted order.
  That is the definition of a BST, in essence: the order that recovers
  the original sort.
- **Postorder** lets a node depend on its children's results. Computing a
  node's subtree size, height, or any roll-up aggregate is a one-line
  postorder.
- **Level-order** is the natural choice for shortest-path-style questions
  on trees (minimum depth, level averages, zigzag printing).

```viz
{ "type": "callout", "props": {
  "tone": "intuition",
  "title": "The mnemonic that explains itself",
  "body": "Pre = root visited *before* subtrees. In = root visited *between* subtrees. Post = root visited *after* subtrees. The root's position in the name is the position of the visit."
} }
```

## Iterative Traversals

The recursive forms above are clear but consume stack space proportional to
the tree height. When that matters — embedded systems, very deep trees,
languages without tail-call elimination — an explicit stack does the same
work.

```python
def inorder_iter(root):
    stack, out, n = [], [], root
    while stack or n:
        while n:
            stack.append(n)
            n = n.left
        n = stack.pop()
        out.append(n.v)
        n = n.right
    return out
```

The stack mirrors the recursion: each `while n` descent stacks the left
spine, and each pop visits a node before descending into its right child.
The trick is the same for preorder (push right then left); postorder is
trickier and usually warrants two stacks or a "visited" flag.

## Complexity

| Traversal     | Time     | Stack/Queue          | Notes                              |
| ------------- | -------- | -------------------- | ---------------------------------- |
| DFS recursive | $O(n)$   | $O(h)$ call stack    | $h$ = height; $\Theta(\log n)$ balanced, $\Theta(n)$ worst case. |
| DFS iterative | $O(n)$   | $O(h)$ explicit stack | Same memory model, just visible.   |
| BFS           | $O(n)$   | $O(w)$ queue          | $w$ = max width; up to $n/2$ for a balanced tree. |

Skewed trees — every node has only a left child — give $h = n$, blowing the
DFS stack. This is the recurring failure mode and the reason iterative
forms exist.

## Traversal-driven Algorithms

A surprising number of tree problems reduce to "do a traversal and
accumulate a result." A few examples:

- *Maximum depth* — postorder, return `1 + max(left, right)`.
- *Diameter* — postorder, track the best `left_depth + right_depth` seen.
- *Is a BST?* — inorder, check non-decreasing.
- *Serialize / deserialize* — preorder with explicit nulls, then the
  reverse to rebuild.
- *Lowest common ancestor* — postorder; a node "contains" both targets in
  its subtree if and only if it's an ancestor.

```viz
{ "type": "callout", "props": {
  "tone": "pitfall",
  "title": "Don't pass mutable state through recursion by accident",
  "body": "A shared `result` list passed by reference works in Python; an unintentional copy works in Java. Test on tiny inputs and check both that you visit each node once and that you accumulate exactly once per visit."
} }
```

```viz
{ "type": "callout", "props": {
  "tone": "pitfall",
  "title": "Stack overflow on skewed trees",
  "body": "If your input could be a degenerate linked-list-shaped tree (n = 10^5 nodes), recursion may blow the JVM/Python stack. Iterative form or sys.setrecursionlimit(...) becomes mandatory."
} }
```

## Practice
- Inorder traversal both recursively and iteratively.
- Maximum depth, diameter, balanced check.
- Level-order with per-level grouping.
- Reconstruct a binary tree from preorder + inorder arrays.
- Serialize and deserialize a binary tree.

## References
1. Cormen, Leiserson, Rivest, Stein. *Introduction to Algorithms, 4th ed.*, Chapter 12.
2. Sedgewick & Wayne. *Algorithms, 4th ed.*, Section 3.2.
3. cp-algorithms.com. "Tree Traversals."
