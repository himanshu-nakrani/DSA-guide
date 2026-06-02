---
slug: linked-list-fundamentals
title: Linked List Fundamentals
summary: Pointer-based sequences — singly and doubly linked — and what they trade against arrays.
topicSlug: linked-lists
level: FOUNDATION
order: 1
estimatedMins: 14
references:
  - { title: "Introduction to Algorithms, 4th ed., Ch. 10 (Elementary Data Structures)", author: "Cormen, Leiserson, Rivest, Stein", type: "book" }
  - { title: "Algorithms, 4th ed., Ch. 1.3", author: "Sedgewick & Wayne", type: "book" }
prerequisites: ["array-fundamentals"]
---

## Overview
A linked list is a sequence built from nodes, each holding a value and a pointer (or pointers) to the next node. It trades the array's $O(1)$ random access for $O(1)$ insertion and deletion *given a node reference*. Despite being unfashionable in production code, it is the canvas on which many interview problems are painted.

## Prerequisites
- Array Fundamentals

## Core Idea
Memory locality vs. structural flexibility. Arrays win on cache behavior and indexed access; linked lists win when you frequently splice nodes in the middle without moving everything else — provided you already hold a reference to the splice point.

## Mechanics

**Singly linked list node**:
```text
struct Node:
    value
    next   # pointer to the next Node, or null
```

**Doubly linked list node**: adds a `prev` pointer, enabling $O(1)$ deletion when given a node and $O(1)$ backward traversal.

**Core operations**:
- *Insert at head*: $O(1)$. New node points to old head; head becomes new node.
- *Insert after a given node `p`*: $O(1)$. New node's next is `p.next`; `p.next` is new node.
- *Delete a given node*: $O(1)$ for doubly linked. For singly linked, you usually need the *previous* node, which is $O(n)$ to find unless you already have it.
- *Access the k-th element*: $O(k)$. No random access.

**Sentinel nodes**: A "dummy" head node simplifies edge cases. Most insertion / deletion bugs come from special-casing the empty list and the head — sentinels remove both.

## Complexity
- Insert / delete at head: $O(1)$.
- Insert / delete at a known node: $O(1)$ for doubly; $O(1)$ if you have the predecessor for singly.
- Random access: $O(n)$.
- Memory: $O(n)$, with overhead per node (one or two pointers plus allocator metadata).

## Common Patterns
1. **Dummy head**: `dummy -> ...real list...`. Return `dummy.next` at the end. Simplifies "remove all nodes with value $x$" and "merge two sorted lists" enormously.
2. **Runner / two-pointer**: A fast pointer and a slow pointer for problems like middle-of-list and cycle detection (covered in the patterns article).
3. **Iterative reverse**: Maintain `prev`, `curr`, `next`. Reverse the link, advance.

## Pitfalls
- **Losing a reference before reassigning a link**. Reversing a list naively as `curr.next = prev; curr = curr.next` walks into nothing. Save `next` first.
- **Dangling pointers after delete**. In manually managed languages (C++), free the deleted node; otherwise leak.
- **Treating singly linked lists like doubly linked**. Without a `prev` pointer, the "delete node given just its reference" trick (overwrite value, splice next) leaks the last node and is sketchy when the node holds external resources.
- **Stack overflow on recursive operations** for long lists. Prefer iterative code.

## Practice
- Reverse a singly linked list iteratively.
- Find the middle node in one pass.
- Insert a value into a sorted singly linked list.

## References
1. Cormen, Leiserson, Rivest, Stein. *Introduction to Algorithms, 4th ed.*, Chapter 10.
2. Sedgewick & Wayne. *Algorithms, 4th ed.*, Chapter 1.3.
