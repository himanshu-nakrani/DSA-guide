---
slug: binary-tree-traversals
title: Binary Tree Traversals
summary: Inorder, preorder, postorder, and level-order — the four ways to visit every node of a binary tree exactly once.
topicSlug: trees
level: FOUNDATION
order: 1
estimatedMins: 18
references:
  - { title: "Introduction to Algorithms, 4th ed.", author: "Cormen, Leiserson, Rivest, Stein", type: "book" }
  - { title: "cp-algorithms.com", url: "https://cp-algorithms.com/", type: "web" }
prerequisites: []
---

## Overview
A binary tree is a hierarchical data structure where each node has at most two children. Traversal refers to the process of visiting every node in the tree exactly once in a specific order.

## Prerequisites
- Recursion Fundamentals

## Core Idea
There are two primary approaches:
1. **Depth-First Search (DFS)**: Explores as far down a branch as possible before backtracking.
2. **Breadth-First Search (BFS)**: Explores all nodes at the current depth before moving to the next level.

## Mechanics
**DFS Variants**:
- **In-order** (Left, Root, Right): Yields sorted order for BSTs.
- **Pre-order** (Root, Left, Right): Useful for copying the tree.
- **Post-order** (Left, Right, Root): Useful for deleting the tree.

**BFS (Level-order)**: Uses a queue to process nodes level by level.

## Complexity
- **Time**: O(n) for all traversals.
- **Space**: O(h) for DFS (h = height), O(w) for BFS (w = max width).

## Common Patterns
1. **Maximum Depth**: Simple DFS to find the longest path to a leaf.
2. **Symmetric Tree**: Compare left subtree's left child with right subtree's right child.

## Pitfalls
- **Null pointer exceptions**: Forgetting to check if a node is null.
- **Deep recursion limits**: May cause stack overflow for unbalanced trees.

## Practice
- Inorder Traversal of a Binary Tree.
- Maximum Depth of Binary Tree.

## References
1. Cormen, Leiserson, Rivest, Stein. *Introduction to Algorithms, 4th ed.*, Chapter 12.
2. Sedgewick & Wayne. *Algorithms, 4th ed.*, Chapter 3.2.