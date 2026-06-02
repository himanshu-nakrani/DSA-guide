---
slug: stack-queue-fundamentals
title: Stack and Queue Fundamentals
summary: The two simplest abstract data types — LIFO and FIFO — and the implementations every language ships.
topicSlug: stacks-and-queues
level: FOUNDATION
order: 1
estimatedMins: 12
references:
  - { title: "Introduction to Algorithms, 4th ed., Ch. 10", author: "Cormen, Leiserson, Rivest, Stein", type: "book" }
  - { title: "Algorithms, 4th ed., Ch. 1.3", author: "Sedgewick & Wayne", type: "book" }
prerequisites: ["array-fundamentals", "linked-list-fundamentals"]
---

## Overview
A **stack** is a last-in-first-out (LIFO) collection: the last element pushed is the first popped. A **queue** is first-in-first-out (FIFO): the first enqueued is the first dequeued. Both are abstract types with simple interfaces and several practical implementations.

## Prerequisites
- Array Fundamentals
- Linked List Fundamentals

## Core Idea
Stacks and queues are constraints, not implementations. A stack forbids access to anything but the top; a queue, anything but the head. The restriction is what makes the operations $O(1)$ — there is less to keep track of.

## Mechanics

**Stack operations**:
- `push(x)`: insert on top.
- `pop()`: remove and return the top.
- `peek()` / `top()`: read the top without removing.

**Queue operations**:
- `enqueue(x)`: insert at the back.
- `dequeue()`: remove and return the front.
- `peek()` / `front()`: read the front.

**Implementations**:
- *Dynamic array* (e.g., `std::vector`, `ArrayList`): stack in $O(1)$ amortized. Queue is awkward because removing the front is $O(n)$.
- *Linked list* (singly with both head and tail pointers): both stack and queue in $O(1)$.
- *Circular buffer* / *ring buffer*: array-backed queue with $O(1)$ ops, fixed capacity.
- *Two-stack queue*: simulate a queue with two stacks. Each element is moved at most twice across its lifetime — $O(1)$ amortized per operation.

**Deque** (double-ended queue) generalizes both: push/pop at either end in $O(1)$. `std::deque`, `collections.deque`, `ArrayDeque`.

## Complexity
- All operations $O(1)$ in standard implementations (amortized for dynamic arrays).
- Space $O(n)$ for $n$ elements.

## Common Patterns
1. **Stack for matched-pair problems**: parentheses, function call frames, the "next greater element" pattern (monotonic stack, covered separately).
2. **Queue for BFS**: Level-order traversal of trees, shortest path in unweighted graphs.
3. **Two-stack queue**: Classic "implement queue using stacks" interview question. The amortized argument is the lesson.
4. **Stack to evaluate or convert expressions**: Shunting-yard (infix → postfix), postfix evaluation.

## Pitfalls
- **Popping an empty stack / dequeuing an empty queue**. Most language libraries throw or return an undefined value. Always check.
- **Using `Stack` in Java**. The legacy `java.util.Stack` extends `Vector` and is synchronized. Use `ArrayDeque` as a stack instead.
- **Using a `List` as a queue in Python**. `list.pop(0)` is $O(n)$. Use `collections.deque`.
- **Treating two-stack queue as constant-time per operation**. It is $O(1)$ amortized, not per call — a single dequeue can move $n$ elements.

## Practice
- Implement a queue using two stacks.
- Implement a stack with a `getMin()` operation in $O(1)$.
- Evaluate a postfix expression.

## References
1. Cormen, Leiserson, Rivest, Stein. *Introduction to Algorithms, 4th ed.*, Chapter 10.
2. Sedgewick & Wayne. *Algorithms, 4th ed.*, Chapter 1.3.
