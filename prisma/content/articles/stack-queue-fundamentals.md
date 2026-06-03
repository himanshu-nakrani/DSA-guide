---
slug: stack-queue-fundamentals
title: Stack and Queue Fundamentals
summary: The two simplest abstract data types — LIFO and FIFO — and the implementations every language ships.
topicSlug: stacks-and-queues
level: FOUNDATION
order: 1
estimatedMins: 13
references:
  - { title: "Introduction to Algorithms, 4th ed., Ch. 10", author: "Cormen, Leiserson, Rivest, Stein", type: "book" }
  - { title: "Algorithms, 4th ed., Ch. 1.3", author: "Sedgewick & Wayne", type: "book" }
prerequisites: ["array-fundamentals", "linked-list-fundamentals"]
---

## Overview
A **stack** is a last-in, first-out (LIFO) collection: the last element
pushed is the first popped. A **queue** is first-in, first-out (FIFO):
the first enqueued is the first dequeued. Both are abstract types — they
say *what* operations exist but not *how* — and both admit several
equally correct implementations.

The point of restricting access to one end (stack) or two specific ends
(queue) is that it makes the operations $O(1)$: there is less to keep
track of, and no traversal is ever required.

## The Two ADTs Side by Side

```viz
{ "type": "stack-queue", "props": { "mode": "both", "initial": ["A", "B", "C", "D"] } }
```

Press *push*, *pop*, *enqueue*, *dequeue* and watch how the two
structures differ. In the stack, the most recent insertion is the next
removal — the order is reversed. In the queue, the oldest insertion is
the next removal — the order is preserved.

```viz
{ "type": "callout", "props": {
  "tone": "intuition",
  "title": "Why the restriction earns you O(1)",
  "body": "A general list supports insert/delete anywhere — costly, because you have to find the position. A stack and a queue let you touch only one or two designated ends, which means the implementation only ever has to maintain pointers (or indices) to those ends. No search, no shift, no traversal."
} }
```

## Implementations

| Implementation              | Stack             | Queue             | Notes                                  |
| --------------------------- | ----------------- | ----------------- | -------------------------------------- |
| Dynamic array               | $O(1)$ amortized | front $O(n)$      | Use `vector`, `ArrayList` for stacks; awkward as a queue. |
| Linked list (head + tail)   | $O(1)$            | $O(1)$            | Two pointers, no resize.               |
| Circular buffer             | $O(1)$            | $O(1)$            | Fixed capacity, no allocation per op.  |
| Two-stack queue             | n/a               | $O(1)$ amortized  | Famous interview trick.                |
| Deque                       | $O(1)$            | $O(1)$            | Generalizes both. Prefer this default. |

In real code, reach for your language's deque type — `std::deque`,
`collections.deque`, `ArrayDeque` — by default. It supports both stack
and queue access patterns with constant-time guarantees and good
constants.

```viz
{ "type": "callout", "props": {
  "tone": "pitfall",
  "title": "Java's java.util.Stack is legacy",
  "body": "It extends Vector and is synchronized for no reason that matters today. Use ArrayDeque as a stack: faster, cleaner API, same Big-O."
} }
```

```viz
{ "type": "callout", "props": {
  "tone": "pitfall",
  "title": "Python's list is not a queue",
  "body": "list.pop(0) is O(n) because it shifts everything left. Use collections.deque for FIFO access."
} }
```

## Why They Show Up Everywhere

Stacks and queues power a surprising fraction of the algorithms in this
guide. A few examples to keep in mind:

- **Function calls** — every language uses a call stack to remember
  return addresses and locals. Recursion is a stack in disguise.
- **Iterative DFS** — explicit stack replaces the call stack.
- **Iterative BFS** — queue holds the frontier; FIFO ordering is what
  makes BFS find shortest paths.
- **Backtracking** — push a choice, recurse, pop on undo.
- **Parsing** — expression evaluation, balanced-brackets checking,
  shunting-yard, function call expansion.
- **Monotonic stack/queue** — push only values that beat the current top,
  used for "next greater element" and sliding-window max in $O(n)$.

## The Two-Stack Queue

The classic interview question: build a queue using only two stacks. The
amortized analysis is worth understanding because the pattern repeats.

```python
class Queue:
    def __init__(self):
        self.inbox, self.outbox = [], []
    def enqueue(self, x):
        self.inbox.append(x)
    def dequeue(self):
        if not self.outbox:
            while self.inbox:
                self.outbox.append(self.inbox.pop())
        return self.outbox.pop()
```

Each element is pushed onto `inbox`, eventually moved once onto `outbox`,
and popped once from `outbox`. Total work per element across its lifetime
is $O(1)$, so amortized cost is $O(1)$ per operation even though a single
dequeue can move $n$ items.

## Practice
- Implement a queue using two stacks.
- Build a stack with an $O(1)$ `getMin()` operation.
- Evaluate a postfix expression with a stack.
- Validate balanced parentheses.
- Level-order traversal of a tree using a queue.

## References
1. Cormen, Leiserson, Rivest, Stein. *Introduction to Algorithms, 4th ed.*, Chapter 10.
2. Sedgewick & Wayne. *Algorithms, 4th ed.*, Chapter 1.3.
