---
slug: bst
title: Binary Search Trees
summary: A binary tree where in-order traversal is sorted — supporting search, insert, delete, and ranked queries in O(h).
topicSlug: trees
level: INTERMEDIATE
order: 2
estimatedMins: 18
references:
  - { title: "Introduction to Algorithms, 4th ed., Ch. 12 (Binary Search Trees)", author: "Cormen, Leiserson, Rivest, Stein", type: "book" }
  - { title: "Algorithms, 4th ed., Ch. 3.2 (Binary Search Trees)", author: "Sedgewick & Wayne", type: "book" }
prerequisites: ["binary-tree-traversals"]
---

## Overview
A binary search tree (BST) is a binary tree where every node satisfies the BST property: all keys in the left subtree are less than the node's key, all keys in the right subtree are greater. The structure makes ordered queries — search, predecessor, successor, $k$-th smallest — natural and $O(h)$, where $h$ is the tree's height.

## Prerequisites
- Binary Tree Traversals

## Core Idea
Search and insert follow the BST property: compare with the root, descend left or right. The tree's *shape* depends on insertion order. A balanced BST has $h = O(\log n)$; an adversarial sequence (sorted insertions) produces a linked list with $h = n$ and $O(n)$ operations. Real-world BSTs use self-balancing variants (AVL, red-black) to guarantee $O(\log n)$.

## Mechanics

**Search**:
```text
search(node, key):
    if node == null or node.key == key: return node
    if key < node.key: return search(node.left, key)
    else:              return search(node.right, key)
```

**Insert** (at a leaf — the only place an insertion can preserve the invariant for an unbalanced BST):
```text
insert(node, key):
    if node == null: return Node(key)
    if key < node.key: node.left  = insert(node.left, key)
    else if key > node.key: node.right = insert(node.right, key)
    return node
```

**Delete** — three cases:
1. Leaf: detach.
2. One child: replace the node with its child.
3. Two children: find the in-order successor (leftmost node of the right subtree), copy its key to the node, recursively delete the successor.

**Other ordered queries** at $O(h)$:
- `min`, `max`: walk left or right until null.
- `successor(node)`: if right subtree exists, leftmost of right; otherwise, walk up to the nearest ancestor where you came from the left.
- `kth_smallest`: in-order traversal with a counter, or augmented BST storing subtree sizes for $O(h)$ rank queries.

## Complexity
| Operation | Unbalanced BST | Balanced BST (AVL / red-black) |
|---|---|---|
| Search / Insert / Delete | $O(h)$, worst $O(n)$ | $O(\log n)$ |
| Min / Max | $O(h)$ | $O(\log n)$ |
| Successor / Predecessor | $O(h)$ | $O(\log n)$ |
| In-order traversal | $O(n)$ | $O(n)$ |

The constant factor of a self-balancing BST is higher than a hash table's, but ordered operations (range queries, $k$-th smallest) are not possible in hash tables.

## Common Patterns
1. **Ordered map / set in standard libraries**: C++'s `std::map` / `std::set` (red-black tree), Java's `TreeMap` / `TreeSet`.
2. **Range queries**: count keys in $[l, r]$, find the $k$-th element. Needs augmentation (subtree sizes) for $O(\log n)$.
3. **Lower bound / upper bound**: standard library operations on ordered sets.
4. **Sweep-line with ordered set**: maintain a dynamic set of intervals/lines, query neighbors.

## Pitfalls
- **Insertion order matters for an unbalanced BST**. Sorted input is the worst case. In production, prefer a balanced variant or a treap (randomized).
- **Deletion is the subtle case**. The successor swap is correct but easy to mis-implement. Test deletion of root with two children.
- **Implementing your own BST in an interview when a hash map suffices**. If you don't need ordering, use a hash map and avoid the complexity.
- **Recursion depth on degenerate trees**. Iterative versions avoid stack overflow.

## Practice
- Validate Binary Search Tree.
- Kth Smallest Element in a BST.
- Insert and delete into a BST.
- Lowest Common Ancestor in a BST.

## References
1. Cormen, Leiserson, Rivest, Stein. *Introduction to Algorithms, 4th ed.*, Chapter 12.
2. Sedgewick & Wayne. *Algorithms, 4th ed.*, Chapter 3.2.
