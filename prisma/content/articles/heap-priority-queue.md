---
slug: heap-priority-queue
title: Heap and Priority Queue
summary: A complete binary tree maintained as an array, supporting O(log n) insert and O(log n) extract-min/max — the standard priority queue.
topicSlug: trees
level: INTERMEDIATE
order: 3
estimatedMins: 18
references:
  - { title: "Introduction to Algorithms, 4th ed., Ch. 6 (Heapsort)", author: "Cormen, Leiserson, Rivest, Stein", type: "book" }
  - { title: "Algorithms, 4th ed., Ch. 2.4 (Priority Queues)", author: "Sedgewick & Wayne", type: "book" }
prerequisites: ["array-fundamentals", "binary-tree-traversals"]
---

## Overview
A binary heap is a complete binary tree (every level filled except possibly the last, which is filled left to right) satisfying the heap property: a parent is $\ge$ all children (max-heap) or $\le$ all children (min-heap). Because the tree is complete, it stores compactly in an array, and parent/child indices are arithmetic — no pointers.

## Prerequisites
- Array Fundamentals
- Binary Tree Traversals

## Core Idea
The heap property is weaker than the BST property: it orders parents against descendants, but says nothing about left vs. right children. That weakness is the strength — restoring the property after an insert or extract takes only $O(\log n)$ via sift up or sift down along a single root-to-leaf path.

## Mechanics

**Array layout** (1-indexed for cleaner arithmetic; 0-indexed also common):
- Node at index $i$ has parent at $\lfloor i/2 \rfloor$, children at $2i$ and $2i+1$.
- 0-indexed: parent at $\lfloor (i-1)/2 \rfloor$, children at $2i+1$ and $2i+2$.

**Sift up** (after inserting at the end):
```text
while i > 0 and a[parent(i)] < a[i]:
    swap(a[i], a[parent(i)])
    i = parent(i)
```

**Sift down** (after replacing the root with the last element):
```text
while i has a child:
    largest = i
    if left(i)  < n and a[left(i)]  > a[largest]: largest = left(i)
    if right(i) < n and a[right(i)] > a[largest]: largest = right(i)
    if largest == i: break
    swap(a[i], a[largest])
    i = largest
```

**Build heap from an array**: sift down from index $n/2 - 1$ down to $0$. Despite each sift being $O(\log n)$, the total work is $O(n)$ (lower nodes have lower subtrees).

## Complexity
- Insert (`push`): $O(\log n)$.
- Extract top (`pop`): $O(\log n)$.
- Peek top: $O(1)$.
- Build from array: $O(n)$.
- Decrease-key (lower a node's value in a min-heap): $O(\log n)$ given the index; finding the index is $O(n)$ without an auxiliary map.

## Common Patterns
1. **Top-$k$ elements**: maintain a min-heap of size $k$; for each new element, push and pop if size exceeds $k$. Final heap holds the top-$k$.
2. **Heapsort**: build a max-heap in $O(n)$, then extract-max $n$ times. $O(n \log n)$, in-place, not stable.
3. **Merge $k$ sorted lists**: heap of head pointers keyed by current value; pop the smallest, advance, push the next from that list.
4. **Dijkstra's algorithm**: min-heap of (distance, node) pairs.
5. **Median maintenance**: two heaps (max-heap of lower half, min-heap of upper half) keep the median in $O(1)$ after $O(\log n)$ inserts.

## Pitfalls
- **Decrease-key without an index map**. The default heap doesn't track positions. For Dijkstra-style algorithms, either rebuild lazily (push duplicates, skip stale) or use a Fibonacci heap.
- **Mistaking a heap for a sorted array**. Iterating a heap does not yield sorted order — only repeated extract-min/max does.
- **Off-by-one in array indexing**. Confusing 0-indexed and 1-indexed formulas is a classic bug.
- **Using `std::priority_queue` as a min-heap in C++**. The default is a max-heap; pass `std::greater<>` for min.

## Practice
- Top K Frequent Elements.
- Kth Largest Element in a Stream.
- Find Median from Data Stream.
- Merge $k$ Sorted Lists.

## References
1. Cormen, Leiserson, Rivest, Stein. *Introduction to Algorithms, 4th ed.*, Chapter 6.
2. Sedgewick & Wayne. *Algorithms, 4th ed.*, Chapter 2.4.
