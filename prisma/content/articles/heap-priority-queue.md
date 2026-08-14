---
slug: heap-priority-queue
title: Heap and Priority Queue
summary: "A complete binary tree stored flat in an array — insert and extract in O(log n), build in O(n), and the engine inside heapsort, Dijkstra, and every top-k problem."
topicSlug: trees
level: INTERMEDIATE
order: 3
estimatedMins: 22
references:
  - { title: "Introduction to Algorithms, 4th ed., Ch. 6", author: "Cormen, Leiserson, Rivest, Stein", type: "book" }
  - { title: "Algorithms, 4th ed., Ch. 2.4", author: "Sedgewick & Wayne", type: "book" }
prerequisites: ["array-fundamentals", "binary-tree-traversals"]
---

## Overview
A *binary heap* is a complete binary tree where every parent dominates
its children — *max-heap* if parent ≥ children, *min-heap* if
parent ≤ children. Two invariants in tension that together make the
data structure efficient. *Complete* (filled left-to-right, every level
full except possibly the last) lets us store the tree implicitly in an
array. *Heap property* lets us extract the maximum (or minimum) in
$O(\log n)$.

A *priority queue* is the abstract data type — insert with a priority,
extract the highest-priority item. Heap is the standard
implementation. Together they power Dijkstra, A\*, K-way merge,
heap-sort, every top-$k$ problem, scheduling queues, and Huffman
coding.

## The Array Trick

Store the tree in an array indexed from 0. For node at index $i$:

- Parent is at $\lfloor (i - 1) / 2 \rfloor$.
- Left child is at $2i + 1$.
- Right child is at $2i + 2$.

No pointers. The complete-tree shape is preserved by always filling
the next array slot. The arithmetic gives navigation in $O(1)$.

```viz
{ "type": "architecture", "props": {
  "caption": "Heap layout — tree on top, array below",
  "cols": 12, "rows": 4, "height": 280,
  "boxes": [
    { "id": "r",  "label": "50", "sub": "i = 0", "col": 5, "row": 0, "colSpan": 2, "emphasis": "primary" },
    { "id": "l1", "label": "30", "sub": "i = 1", "col": 2, "row": 1, "colSpan": 2 },
    { "id": "r1", "label": "40", "sub": "i = 2", "col": 8, "row": 1, "colSpan": 2 },
    { "id": "l2", "label": "10", "sub": "i = 3", "col": 0, "row": 2, "colSpan": 2 },
    { "id": "r2", "label": "20", "sub": "i = 4", "col": 3, "row": 2, "colSpan": 2 },
    { "id": "l3", "label": "35", "sub": "i = 5", "col": 6, "row": 2, "colSpan": 2 },
    { "id": "r3", "label": "15", "sub": "i = 6", "col": 9, "row": 2, "colSpan": 2 },
    { "id": "arr", "label": "array: [50, 30, 40, 10, 20, 35, 15]", "col": 0, "row": 3, "colSpan": 12, "emphasis": "primary" }
  ]
} }
```

The whole tree is contiguous memory — excellent cache behavior, no
allocation per node.

## The Core Operations

### Sift up (after insert)

Append the new value at the end of the array. It may violate the heap
property with its parent. *Sift up*: while the new value is greater
than its parent, swap. Stop when the parent dominates or the new value
reaches the root.

```python
def push(heap, x):
    heap.append(x)
    i = len(heap) - 1
    while i > 0:
        parent = (i - 1) // 2
        if heap[parent] >= heap[i]: break
        heap[parent], heap[i] = heap[i], heap[parent]
        i = parent
```

Worst-case path length is the height, $O(\log n)$.

### Sift down (after extract)

To extract the max: swap the root with the last element, decrement the
size, then *sift down* the new root: while it is smaller than at least
one child, swap with the larger child.

```python
def pop_max(heap):
    if not heap: return None
    top = heap[0]
    last = heap.pop()
    if heap:
        heap[0] = last
        i = 0
        n = len(heap)
        while True:
            l, r = 2*i + 1, 2*i + 2
            largest = i
            if l < n and heap[l] > heap[largest]: largest = l
            if r < n and heap[r] > heap[largest]: largest = r
            if largest == i: break
            heap[i], heap[largest] = heap[largest], heap[i]
            i = largest
    return top
```

Each sift-down step descends one level, so $O(\log n)$ total.

### Build heap from an unordered array

Sift down starting from the last *internal* node ($i = (n / 2) - 1$)
backward to the root. This is $O(n)$, not $O(n \log n)$.

```python
def heapify(A):
    for i in range(len(A) // 2 - 1, -1, -1):
        sift_down(A, i, len(A))
```

The $O(n)$ bound is not obvious: there are $n/2$ leaves (sift cost 0),
$n/4$ height-1 nodes (cost 1), $n/8$ height-2 nodes (cost 2), … The
total work is $\sum_{h \ge 0} h \cdot n / 2^{h+1} = O(n)$ by the
geometric-series argument.

```viz
{ "type": "heap-operation-trace", "props": {
  "caption": "Heap operations: preserve the parent-child invariant",
  "mode": "heapify"
} }
```

```viz
{ "type": "callout", "props": {
  "tone": "intuition",
  "title": "Build is faster than n inserts",
  "body": "Building a heap from an n-element array takes O(n) — the bulk of the work happens near the leaves, where the heap is shallow. Inserting one element at a time takes O(n log n). When you have all the data up front, heapify is the right tool."
} }
```

## Complexity Summary

| Operation               | Time          |
| ----------------------- | ------------- |
| Push                    | $O(\log n)$   |
| Pop max / min           | $O(\log n)$   |
| Peek                    | $O(1)$        |
| Build from array        | $O(n)$        |
| Decrease key (indexed)  | $O(\log n)$   |
| Merge two heaps         | $O(n + m)$    |

For "merge two heaps quickly" (better than $O(n + m)$), look at
*leftist heaps*, *skew heaps*, or *Fibonacci heaps* — they trade more
complex code for faster merges and decrease-key.

## Where Heaps Show Up

- **Heapsort.** Build a max-heap in $O(n)$, then repeatedly extract
  the max into the back of the array. $O(n \log n)$, in-place,
  $O(1)$ auxiliary memory.
- **Dijkstra's shortest paths.** A min-heap of `(distance, vertex)`
  pairs. Each edge contributes at most one push.
- **Top-$k$ problems.** Maintain a min-heap of size $k$; replace the
  root whenever a larger value arrives. $O(n \log k)$, much better
  than sorting when $k \ll n$.
- **K-way merge.** A heap of pointers, one per input stream. Pop the
  smallest, advance that stream, push the new front. Total cost
  $O(N \log K)$ for $N$ total elements across $K$ streams.
- **Median maintenance.** Two heaps — a max-heap for the lower half, a
  min-heap for the upper half — keep the median between their roots.

## Variants

- **Min-heap** vs. *max-heap* — flip the comparison. Many languages
  ship one (typically min); fake the other by negating keys.
- **D-ary heap** — each node has $d$ children. Push gets faster
  ($O(\log_d n)$); pop gets slower (must scan $d$ children).
  Sometimes worthwhile in Dijkstra on dense graphs.
- **Indexed heap** — supports decrease-key by maintaining a
  `position[]` map from element to its heap index.
- **Fibonacci heap** — $O(1)$ amortized push and decrease-key,
  $O(\log n)$ amortized extract-min. Beautiful asymptotics, brutal
  constants — rarely used in practice.

## Pitfalls

```viz
{ "type": "callout", "props": {
  "tone": "pitfall",
  "title": "Heap is not a sorted structure",
  "body": "Reading the heap array left-to-right does not give sorted order. Only the root is guaranteed to be the extreme. Heapsort works because it repeatedly extracts and rebuilds — there is no shortcut for 'give me everything in order' that avoids that work."
} }
```

```viz
{ "type": "callout", "props": {
  "tone": "pitfall",
  "title": "Python's heapq is a min-heap only",
  "body": "Python's heapq has no max-heap. Negate values on push and pop, or use a custom comparator via tuples. Forgetting to negate gives the wrong extreme silently."
} }
```

```viz
{ "type": "callout", "props": {
  "tone": "pitfall",
  "title": "Top-k with a max-heap is wrong",
  "body": "To keep the top k largest, use a min-heap of size k. Each new value compares against the smallest of the current top-k; if larger, replace. A max-heap keeps the largest k by repeated pop, which is O(n log n) — defeating the point."
} }
```

## Practice
- Implement a min-heap with push, pop, and peek. Verify on a stream
  of integers.
- Heapsort in place.
- Top $k$ frequent elements (heap of `(count, element)`).
- Merge $k$ sorted lists with a heap.
- Median of a data stream (two-heap maintenance).
- K closest points to the origin.

## References
1. Cormen, Leiserson, Rivest, Stein. *Introduction to Algorithms, 4th ed.*, Chapter 6.
2. Sedgewick & Wayne. *Algorithms, 4th ed.*, Section 2.4.
