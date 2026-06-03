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
A linked list is a sequence built from nodes, each holding a value and a
pointer (or pointers) to the next node. It trades the array's $O(1)$
random access for $O(1)$ insertion and deletion *given a node reference*.
Despite being out of fashion in production code — modern hardware
overwhelmingly prefers contiguous layouts — it remains the canvas on
which a large class of interview problems is painted.

## The Picture

The fundamental object is a `Node`: a value field plus one or more
pointers. A singly linked list has only `next`; a doubly linked list adds
`prev`; a circular list closes the loop.

```viz
{ "type": "linked-list", "props": {
  "values": [3, 7, 1, 9, 5],
  "variant": "singly"
} }
```

```viz
{ "type": "linked-list", "props": {
  "values": [3, 7, 1, 9, 5],
  "variant": "doubly"
} }
```

The diagrams hide an important detail: those arrows are *pointers* into
the heap. Each `next` may point anywhere — the nodes are not adjacent in
memory the way array elements are. This is the source of both the
strength (constant-time splicing without moving anything else) and the
weakness (cache misses on every traversal step).

## Arrays vs. Linked Lists

| Operation                            | Array        | Linked list (singly) |
| ------------------------------------ | ------------ | -------------------- |
| Access by index $k$                  | $O(1)$       | $O(k)$               |
| Search by value (unsorted)           | $O(n)$       | $O(n)$               |
| Insert / delete at head              | $O(n)$       | $O(1)$               |
| Insert / delete at known position $p$ | $O(n)$ (shift) | $O(1)$ if `prev(p)` known |
| Insert / delete at tail (known tail) | $O(1)$       | $O(1)$               |
| Cache behavior                       | excellent    | poor (pointer chase) |
| Memory per element                   | sizeof(T)    | sizeof(T) + 1–2 ptrs |

The takeaway: in a CPU-cache-aware world, arrays win by enough that
linked lists are rarely the right production choice. They earn their
keep when you splice large lists together, when you need $O(1)$ deletion
given a node handle, or when the problem is small and the algorithm is
clearer with explicit pointers.

```viz
{ "type": "callout", "props": {
  "tone": "intuition",
  "title": "Why pointer chasing is slow",
  "body": "Each `next` deref may land on a fresh cache line, causing a 100+ cycle stall while main memory is fetched. An array scan touches one cache line per 16 ints. Same Big-O, very different wall clock — often 10× or more."
} }
```

## The Sentinel Head Trick

The single largest source of linked-list bugs is the special case for the
*head*. "Delete every node with value `x`" branches on whether the head
matches; "merge two sorted lists" branches on which list's head wins; "add
two numbers as linked lists" branches on carry plus head. A *sentinel*
(or *dummy*) node — a permanent stand-in pointed to by `head` — collapses
all those special cases into one path:

```python
dummy = Node(0)
dummy.next = head
prev = dummy
curr = head
while curr:
    if curr.val == target:
        prev.next = curr.next
    else:
        prev = curr
    curr = curr.next
return dummy.next
```

No branch for `head`. No branch for the empty list. The bug surface
shrinks to zero.

## The Three Patterns You'll See Again

1. **Two pointers (fast/slow)** — used for cycle detection, finding the
   middle node, and the $k$-th-from-end problem. Slow advances by one,
   fast by two; when fast hits the end, slow is at the middle.
2. **Iterative reversal** — three pointers (`prev`, `curr`, `next`).
   Reverse the link, advance. The pattern generalizes to reverse-in-
   groups-of-$k$ and to reverse a sublist between indices.
3. **Merge two sorted lists** — uses a dummy head plus a single pointer
   that always points at the smaller front; advance that one and
   continue.

A clean iterative reversal:

```python
def reverse(head):
    prev = None
    curr = head
    while curr:
        nxt = curr.next
        curr.next = prev
        prev = curr
        curr = nxt
    return prev
```

```viz
{ "type": "callout", "props": {
  "tone": "pitfall",
  "title": "Save next *before* mutating",
  "body": "curr.next = prev overwrites the link, so you cannot read curr.next afterwards to advance — you have to cache it first. Half of all linked-list bugs are forgetting this single line."
} }
```

## Common Pitfalls

```viz
{ "type": "callout", "props": {
  "tone": "pitfall",
  "title": "Random access is not O(1)",
  "body": "Reading lst[k] walks k next pointers. If your algorithm calls lst[i] inside an i loop, you've written O(n²) — convert to a single pass with an explicit cursor."
} }
```

```viz
{ "type": "callout", "props": {
  "tone": "pitfall",
  "title": "Stack overflow on recursion",
  "body": "Recursive list algorithms cost O(n) stack frames. On a 10^5-node list, Python's default recursion limit (~10^3) crashes. Iterate."
} }
```

## Practice
- Reverse a singly linked list iteratively, then recursively.
- Find the middle node of a list in a single pass.
- Detect a cycle (Floyd's tortoise and hare).
- Merge two sorted lists.
- Remove the $k$-th node from the end of the list.

## References
1. Cormen, Leiserson, Rivest, Stein. *Introduction to Algorithms, 4th ed.*, Chapter 10.
2. Sedgewick & Wayne. *Algorithms, 4th ed.*, Chapter 1.3.
