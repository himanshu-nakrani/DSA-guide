---
slug: tree-dp
title: Dynamic Programming on Trees
summary: Subtree-rooted recurrences turn tree problems into clean linear-time scans. Plus the rerooting trick for when you need the answer at every node, not just the root.
topicSlug: trees
level: INTERMEDIATE
order: 4
estimatedMins: 17
references:
  - { title: "Competitive Programmer's Handbook, Ch. 19", author: "Antti Laaksonen", type: "book" }
  - { title: "Introduction to Algorithms, 4th ed., Ch. 14", author: "Cormen, Leiserson, Rivest, Stein", type: "book" }
  - { title: "Trees · DP on Trees", url: "https://cp-algorithms.com/graph/tree-painting.html", type: "web" }
  - { title: "USACO Guide — DP on Trees", url: "https://usaco.guide/gold/dp-trees", type: "web" }
prerequisites: [binary-tree-traversals, dp-fundamentals]
---

## Overview

Most tree problems have an answer that is naturally defined in terms of
**subtree-rooted quantities**: "the longest path passing through $v$,"
"the maximum independent set in the subtree rooted at $v$," "the number of
nodes within distance $k$ of $v$." These are dynamic-programming questions
in disguise — the substructure is the tree itself, and the recurrence is
parent-to-child.

The trick: do a single DFS and compute the subtree answer for each node
*after* you've computed it for all its children. The total work is
$\Theta(n)$ for $n$ nodes; each edge is traversed twice.

> [!MARGIN] Why trees and not graphs
> Trees have no cycles, so a subtree-rooted recurrence has a well-defined
> recursion order. Generalising to DAGs is fine. To arbitrary graphs it
> isn't — the state space explodes.

## The Standard Pattern

Every tree DP looks the same:

```python
def solve(u, parent):
    state = base_case(u)
    for v in children(u, parent):
        sub = solve(v, u)
        state = combine(state, sub, u, v)
    return state
```

The three slots you have to fill in for any particular problem are:

- **What's the subtree-rooted "state" at $u$?** Usually a small tuple of
  numbers. Pick the smallest set of values such that you can compute the
  parent's state from its children's.
- **How do you start at a leaf?** A leaf has no children; its state is the
  trivial answer for a one-node subtree.
- **How do you combine children?** This is the heart of the problem.

### Worked example: Maximum independent set on a tree

An *independent set* is a set of nodes with no two adjacent. On a general
graph, finding the maximum is NP-hard. On a tree, it's a textbook DP.

State: for each node $u$, two values —
- $f(u, 0)$ = max independent set in subtree of $u$ when $u$ is *not* taken.
- $f(u, 1)$ = max independent set when $u$ *is* taken.

Recurrence:

$$
f(u, 0) = \sum_{v \in \text{children}(u)} \max(f(v, 0), f(v, 1))
$$

$$
f(u, 1) = 1 + \sum_{v \in \text{children}(u)} f(v, 0)
$$

The answer is $\max(f(r, 0), f(r, 1))$ at the root $r$. Time:
$\Theta(n)$ — each edge contributes one summand to one parent.

```viz
{ "type": "callout", "props": {
  "tone": "insight",
  "title": "Why two states and not one",
  "body": "If you only track 'max IS in subtree of u', you can't combine because the parent's choice depends on whether u was taken. The 'taken' / 'not taken' split is what makes the recurrence work — it pre-resolves the parent's question."
} }
```

> [!PITFALL] Watch out for the root
> The recursion assumes nodes have a unique parent. If the input gives you
> an undirected tree, you must fix an arbitrary root and pass the parent
> down to skip the edge back up. Otherwise you'll recurse forever.

## Worked Example: Tree Diameter

The diameter of a tree is the longest path between any two nodes. Surprisingly,
a single DFS computes it.

State: for each node $u$, return $\text{height}(u)$ = the length of the
longest downward path from $u$ to a leaf in its subtree. As a side effect,
track the running maximum of $\text{height}(a) + \text{height}(b) + 2$
across all pairs of *distinct children* of $u$ — that's a path going down
into one subtree, up through $u$, and down into another.

```python
best = 0  # global diameter answer

def height(u, parent):
    nonlocal best
    h1, h2 = 0, 0  # two longest child heights
    for v in adj[u]:
        if v == parent: continue
        h = height(v, u) + 1
        if h > h1: h2, h1 = h1, h
        elif h > h2: h2 = h
    best = max(best, h1 + h2)  # path through u
    return h1
```

The answer is `best` after one DFS from any node. The two-longest-heights
trick is a recurring tree-DP idiom — keep the *top two* values you've seen
among children because the answer at the parent may need both.

```viz
{ "type": "callout", "props": {
  "tone": "intuition",
  "title": "The path through u",
  "body": "Any path in a tree has a unique 'highest' node where it turns around. At that node, the path goes down two distinct subtrees. Iterating over every node as the candidate turn-around point and taking the best is what makes one DFS sufficient."
} }
```

## The Rerooting Trick

The DP above gives the answer rooted at one fixed node. What if you need
the answer *at every node* — e.g., for each $u$, the longest path starting
at $u$?

Naive: run the DP $n$ times, one per root. $\Theta(n^2)$.

Better: run it once at an arbitrary root to fill in subtree answers, then
do a *second* DFS that propagates the "out-of-subtree" answer down. At
each step you peel off the contribution of the child you're moving to and
add the contribution from the rest of the tree.

> [!MARGIN] When to reach for rerooting
> If a problem asks "for every node, compute X(u)" and X has a clean
> subtree-DP definition, rerooting almost always works. It's the
> tree-DP analogue of "compute prefix sums plus suffix sums."

### Sketch

Let $f(u)$ be the answer when $u$ is the root. After the first DFS we know
$f(r)$ for the chosen root $r$. To move the root from $u$ to its child $v$:

- Remove $v$'s contribution from $f(u)$. Call the result $g(u, v)$ — the
  answer at $u$ if the subtree of $v$ were cut off.
- $f(v) = \text{combine}(f(v\text{-subtree}), g(u, v))$.

Apply recursively from the root down. Total work is $\Theta(n)$ because
each edge is touched a constant number of times in each direction.

```viz
{ "type": "callout", "props": {
  "tone": "pitfall",
  "title": "Reroot updates need to be invertible",
  "body": "If `combine` is sum or max, peeling off a child is easy. If it's something like 'distinct elements seen,' you can't reverse a child's contribution in O(1) — rerooting then needs heavier machinery (offline tree decompositions, small-to-large merging)."
} }
```

## Recursion Depth and the Stack

A tree-DP DFS goes as deep as the tree's height. On a skewed tree of $n$
nodes that's $\Theta(n)$ — and Python's default recursion limit (1000)
will blow up.[^pyrec] For large $n$, convert to an explicit stack or use
`sys.setrecursionlimit(n + 100)` plus a generous OS stack.

[^pyrec]: CPython's `sys.setrecursionlimit` raises only the Python-side
counter; the underlying C stack still has a fixed size set by the OS. On
Linux you can bump it with `resource.setrlimit(resource.RLIMIT_STACK, ...)`
before starting the thread.

## Complexity

| Quantity        | Cost          |
|-----------------|---------------|
| Single-rooted DP   | $\Theta(n)$        |
| Rerooting (full) | $\Theta(n)$        |
| Memory (states + recursion) | $\Theta(n)$ |

Every tree DP that fits the pattern above is linear in the size of the
tree. Anything slower is usually a sign that the state isn't small enough.

```viz
{ "type": "callout", "props": {
  "tone": "insight",
  "title": "The right state is small",
  "body": "If your tree DP needs state proportional to subtree size, you're not doing tree DP — you're enumerating subtrees. Successful tree DPs almost always have O(1) state per node (sometimes O(k) for small k, like 'top two values')."
} }
```

## References
