---
slug: linked-list-patterns
title: Linked List Patterns
summary: Reverse, two-pointer cycle detection, merge — the handful of patterns that solve most linked-list interview problems.
topicSlug: linked-lists
level: INTERMEDIATE
order: 2
estimatedMins: 16
references:
  - { title: "Introduction to Algorithms, 4th ed., Ch. 10", author: "Cormen, Leiserson, Rivest, Stein", type: "book" }
  - { title: "Floyd's Cycle Detection", url: "https://cp-algorithms.com/others/cycle-detection.html", type: "web" }
prerequisites: ["linked-list-fundamentals"]
---

## Overview
Almost every linked-list interview question reduces to one of a small set of patterns: reverse, two-pointer scan, cycle detection, merge sorted lists, or in-place rearrangement. Mastering these covers most of the design space.

## Prerequisites
- Linked List Fundamentals

## Core Idea
Linked lists are pointer manipulation. The patterns are templates for *which pointers to maintain* and *in what order to update them* so you never lose a reference.

## Mechanics

**1. Iterative reverse**:
```text
prev = null
curr = head
while curr != null:
    next = curr.next
    curr.next = prev
    prev = curr
    curr = next
return prev
```

**2. Fast/slow pointer (cycle detection — Floyd's tortoise and hare)**:
```text
slow = fast = head
while fast != null and fast.next != null:
    slow = slow.next
    fast = fast.next.next
    if slow == fast: return true  # cycle exists
return false
```
To find the cycle's entry point: after they meet, reset one pointer to head and advance both by one until they meet again. The meeting point is the cycle start. (Proof: number-theoretic, based on the lengths of the lead-in and the cycle.)

**3. Find the middle node**:
Same fast/slow setup. When `fast` reaches the end, `slow` is at the middle. With $n$ nodes, `slow` ends at index $\lfloor n/2 \rfloor$.

**4. Merge two sorted lists**: dummy head; pick the smaller current node from each list, link it, advance.

**5. Reverse a sublist `[l, r]` in place**: locate `l-1` and `l`, reverse the next `r - l + 1` nodes, splice.

## Complexity
All of the above are $O(n)$ time, $O(1)$ extra space. Recursive variants of reverse and merge are $O(n)$ stack depth.

## Common Patterns
1. **Cycle detection**: Floyd's algorithm. Don't allocate a visited set — that's $O(n)$ extra space.
2. **Find $k$-th from end in one pass**: Two pointers, one $k$ ahead.
3. **Reverse in groups of $k$**: Repeatedly identify a window of $k$ nodes, reverse it, splice. $O(n)$ total.
4. **Detect palindromic list**: Find midpoint, reverse second half, compare, restore.

## Pitfalls
- **Forgetting the dummy head when results may not start at the original head**. E.g. removing the first node.
- **Off-by-one in $k$-th from end**. Decide whether "1st from end" means the last node or the second-to-last; stay consistent.
- **Fast pointer overruns null**. Always guard both `fast != null` and `fast.next != null` before advancing two steps.
- **Modifying the list while traversing with external references**. Other code holding stale pointers may break.

## Practice
- Reverse a linked list (iterative and recursive).
- Detect a cycle and return the cycle's entry.
- Merge $k$ sorted linked lists.
- Reorder list: $L_0 \to L_1 \to \cdots \to L_{n-1}$ becomes $L_0 \to L_{n-1} \to L_1 \to L_{n-2} \to \cdots$.

## References
1. Cormen, Leiserson, Rivest, Stein. *Introduction to Algorithms, 4th ed.*, Chapter 10.
2. cp-algorithms.com. "Floyd's Cycle Detection Algorithm".
