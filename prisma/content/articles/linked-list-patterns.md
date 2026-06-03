---
slug: linked-list-patterns
title: Linked List Patterns
summary: "Reverse, fast-slow pointers, cycle detection, merge, reorder — the five pointer gymnastics that solve nearly every linked-list problem in one pass and O(1) space."
topicSlug: linked-lists
level: INTERMEDIATE
order: 2
estimatedMins: 22
references:
  - { title: "Introduction to Algorithms, 4th ed., Ch. 10", author: "Cormen, Leiserson, Rivest, Stein", type: "book" }
  - { title: "Floyd's Cycle Detection", url: "https://cp-algorithms.com/others/tortoise_and_hare.html", type: "web" }
  - { title: "Programming Pearls, Column 2", author: "Jon Bentley", type: "book" }
prerequisites: ["linked-list-fundamentals"]
---

## Overview
A small set of pointer-manipulation patterns covers almost every
non-trivial linked-list problem you will meet. Recognizing the
pattern matters more than implementing it — the implementations are
short, but the conditions under which each is correct are subtle
enough that brute-forcing the code rarely produces a clean solution.

The five patterns: iterative reversal, fast/slow pointers (the runner
technique), Floyd's cycle detection, dummy-head merging, and
reorder-by-splice. Each fits in twenty lines; each underlies a family
of problems.

## Pattern 1: Iterative Reversal

Maintain three pointers — `prev`, `curr`, `next` — and walk the list
once, redirecting each `next` pointer backwards as you go.

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
{ "type": "linked-list", "props": {
  "values": [1, 2, 3, 4, 5],
  "variant": "singly"
} }
```

Three things matter:

- Save `next` *before* mutating `curr.next`. Otherwise you lose the
  rest of the list.
- The new head is `prev` when the loop ends — `curr` is `None`.
- $\Theta(n)$ time, $\Theta(1)$ space.

The pattern generalizes immediately to: *reverse the list between two
indices*, *reverse in groups of $k$*, *check whether the list is a
palindrome by reversing the back half in place*.

## Pattern 2: Fast and Slow Pointers (Runner Technique)

Walk two pointers through the list at different speeds. The classic
case: `slow` advances by one, `fast` by two. When `fast` falls off the
end, `slow` is at the middle.

```python
def middle(head):
    slow, fast = head, head
    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next
    return slow
```

For an even-length list this returns the *second* middle. To get the
first middle, advance fast one step before the loop.

The same primitive solves:

- **Middle of the list** — one pass, no length precomputed.
- **$k$-th from the end** — advance `fast` $k$ steps first, then walk
  both until `fast` reaches the end.
- **Detect a cycle** — see the next pattern.

```viz
{ "type": "callout", "props": {
  "tone": "intuition",
  "title": "Why two-speed walks work",
  "body": "Doubling the gap between the pointers means slow is exactly half a length behind fast at all times. When fast reaches the end, slow is exactly at the midpoint — no length needed up front, one pass total."
} }
```

## Pattern 3: Floyd's Cycle Detection

Two phases. First, detect whether a cycle exists. Second, locate where
it begins.

```python
def find_cycle_start(head):
    # Phase 1: detect.
    slow, fast = head, head
    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next
        if slow is fast:
            break
    else:
        return None
    # Phase 2: locate the entry.
    finder = head
    while finder is not slow:
        finder = finder.next
        slow = slow.next
    return finder
```

The proof of correctness for phase 2 is short and beautiful. Suppose
the path from `head` to the cycle entry has length $\mu$, and the
cycle has length $\lambda$. When `slow` and `fast` meet, `slow` has
walked $\mu + k$ for some $k$ inside the cycle, and `fast` has walked
$2(\mu + k)$. Since `fast` is $\mu + k$ ahead of `slow` *modulo*
$\lambda$, we have $\mu + k \equiv 0 \pmod \lambda$ — i.e., $\mu + k$
is a multiple of $\lambda$. Walking $\mu$ more steps from `head` and
$\mu$ more steps from the meeting point lands both at the cycle
entry simultaneously.

The whole algorithm uses $\Theta(1)$ extra memory, which is what makes
it preferable to the hash-set approach (which costs $\Theta(n)$ space
to remember visited nodes).

## Pattern 4: Dummy-Head Merging

Merging two sorted lists — or interleaving, or building a new list
piece by piece — is much cleaner with a sentinel.

```python
def merge_sorted(a, b):
    dummy = Node(0)
    tail = dummy
    while a and b:
        if a.val <= b.val:
            tail.next = a; a = a.next
        else:
            tail.next = b; b = b.next
        tail = tail.next
    tail.next = a or b
    return dummy.next
```

The dummy node removes the "is this the first iteration?" branch. The
returned list starts at `dummy.next`. This pattern repeats in:
mergesort on linked lists, k-way merge with a heap, "add two numbers"
where the result is a fresh list.

```viz
{ "type": "callout", "props": {
  "tone": "intuition",
  "title": "Why dummies pay off",
  "body": "Every linked-list algorithm has a special case for the empty list and another for the head. A dummy node makes both disappear. The cost is one extra allocation. The savings are clarity and the absence of a class of off-by-one bugs."
} }
```

## Pattern 5: Reorder by Splice

Build the result by splicing existing nodes into a new order, not by
allocating fresh ones. Splice is three or four pointer assignments and
no allocation, so reorderings of an $n$-node list cost $\Theta(n)$
total.

The textbook example: *reorder list*. Given $L_0 \to L_1 \to \cdots
\to L_n$, transform it in place to $L_0 \to L_n \to L_1 \to L_{n-1}
\to L_2 \to \cdots$. Three steps:

1. Find the middle (pattern 2).
2. Reverse the second half (pattern 1).
3. Interleave the two halves by splicing.

```python
def reorder(head):
    if not head or not head.next: return
    mid = middle(head)
    second = reverse(mid.next)
    mid.next = None
    first = head
    while second:
        t1, t2 = first.next, second.next
        first.next = second
        second.next = t1
        first, second = t1, t2
```

Each of the three sub-steps is $\Theta(n)$ time and $\Theta(1)$ space,
so the whole is $\Theta(n)$ — without ever allocating a node.

## A Mental Cheat Sheet

```viz
{ "type": "architecture", "props": {
  "caption": "Which pattern for which problem?",
  "cols": 12, "rows": 4, "height": 280,
  "boxes": [
    { "id": "rev", "label": "reverse / palindrome / k-group", "sub": "iterative reversal", "col": 0, "row": 0, "colSpan": 4, "emphasis": "primary" },
    { "id": "mid", "label": "middle / kth-from-end", "sub": "fast and slow pointers", "col": 4, "row": 0, "colSpan": 4, "emphasis": "primary" },
    { "id": "cyc", "label": "cycle detection / entry", "sub": "Floyd tortoise and hare", "col": 8, "row": 0, "colSpan": 4, "emphasis": "primary" },
    { "id": "mrg", "label": "merge / add / interleave", "sub": "dummy head", "col": 0, "row": 2, "colSpan": 4, "emphasis": "primary" },
    { "id": "spl", "label": "reorder / rotate / partition", "sub": "splice in place", "col": 4, "row": 2, "colSpan": 4, "emphasis": "primary" },
    { "id": "rec", "label": "complex transforms", "sub": "compose two or three of the above", "col": 8, "row": 2, "colSpan": 4 }
  ]
} }
```

Composition is the rule, not the exception. *Sort a linked list* is
mergesort: middle (pattern 2) + recursive sort + merge (pattern 4).
*Palindrome check in $\Theta(1)$ space* is middle + reverse + compare.
*Rotate by $k$* is fast/slow to find pivot + splice.

## Pitfalls

```viz
{ "type": "callout", "props": {
  "tone": "pitfall",
  "title": "Forgetting to null the tail",
  "body": "When you split a list in two — e.g. for reorder or mergesort — set the previous node's next to None. Otherwise the two halves share their tail and you reverse or merge across the boundary."
} }
```

```viz
{ "type": "callout", "props": {
  "tone": "pitfall",
  "title": "Off-by-one in fast/slow",
  "body": "Initializing slow = head, fast = head gives the second middle on even lengths. Initializing fast = head.next gives the first. Pick consciously based on what the problem wants."
} }
```

```viz
{ "type": "callout", "props": {
  "tone": "pitfall",
  "title": "Hash sets for cycle detection are wasteful",
  "body": "Storing every visited node in a hash set works but costs O(n) space. Floyd's algorithm is O(1) space. The hash-set trap is the first solution that comes to mind; the question is whether you can do better."
} }
```

## Practice
- Reverse a linked list. Then reverse it between indices $m$ and $n$.
- Reverse nodes in groups of $k$.
- Check if a linked list is a palindrome in $\Theta(1)$ space.
- Detect a cycle. Then return the node where the cycle begins.
- Merge two sorted lists. Then merge $k$ sorted lists with a heap.
- Reorder list (LeetCode 143).
- Add two numbers represented as linked lists, least-significant digit
  first.

## References
1. Cormen, Leiserson, Rivest, Stein. *Introduction to Algorithms, 4th ed.*, Chapter 10.
2. Bentley. *Programming Pearls*, Column 2.
3. cp-algorithms.com. "Floyd's Cycle Detection."
