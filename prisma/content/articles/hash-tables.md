---
slug: hash-tables
title: "Hash Tables: How They Work"
summary: How hash functions, buckets, and collision resolution combine to give average O(1) insert, delete, and lookup.
topicSlug: hashing
level: FOUNDATION
order: 1
estimatedMins: 18
references:
  - { title: "Introduction to Algorithms, 4th ed., Ch. 11", author: "Cormen, Leiserson, Rivest, Stein", type: "book" }
  - { title: "Hashing", url: "https://cp-algorithms.com/data_structures/hash_table.html", type: "web" }
  - { title: "Notes on Data Structures and Programming Techniques (Yale)", author: "James Aspnes", type: "web" }
prerequisites: ["array-fundamentals"]
---

## Overview
A hash table maps *keys* to *values* in (expected) constant time. The price
is two cooperating components: a **hash function** that scrambles keys into
integer slots, and a **collision-resolution strategy** that decides what to
do when two keys land on the same slot. Get either component wrong and the
$O(1)$ promise quietly becomes $O(n)$.

This essay is a tour of those two components and the load-factor knob that
controls the tradeoff between speed and memory.

## The Picture

```viz
{ "type": "architecture", "props": {
  "caption": "Anatomy of a hash table lookup",
  "cols": 12, "rows": 3, "height": 240,
  "boxes": [
    { "id": "key",   "label": "key", "sub": "\"orange\"", "col": 0, "row": 0, "colSpan": 2, "emphasis": "muted" },
    { "id": "hash",  "label": "hash function", "sub": "h(k) → int", "col": 2, "row": 0, "colSpan": 3, "emphasis": "primary" },
    { "id": "mod",   "label": "% m", "sub": "fold to table size", "col": 5, "row": 0, "colSpan": 2 },
    { "id": "buckets", "label": "bucket array", "sub": "m slots", "col": 7, "row": 0, "colSpan": 3 },
    { "id": "resolve", "label": "resolve collisions", "sub": "chaining or probing", "col": 10, "row": 0, "colSpan": 2, "emphasis": "warn" },
    { "id": "value",  "label": "stored value", "col": 7, "row": 2, "colSpan": 3, "emphasis": "primary" }
  ],
  "arrows": [
    { "from": "key",   "to": "hash" },
    { "from": "hash",  "to": "mod" },
    { "from": "mod",   "to": "buckets" },
    { "from": "buckets", "to": "resolve", "label": "if shared" },
    { "from": "buckets", "to": "value" }
  ]
} }
```

The hash function spreads keys across a small universe of integers; the
modulo folds that universe down to the $m$ slots in the bucket array. The
fold guarantees collisions whenever $n > m$ (and, by the birthday paradox,
much sooner).

## Try It

The visualization lets you insert keys and watch where they land under two
collision strategies. Notice how chaining keeps growing the chain at a
single slot; linear probing instead walks forward to find an empty seat.

```viz
{ "type": "hash-table", "props": {
  "size": 7,
  "initial": ["apple", "pear", "fig", "kiwi", "grape", "plum"],
  "strategy": "chaining"
} }
```

## Hash Functions

A good hash function is fast, deterministic, and *uniform* — it spreads
realistic key distributions evenly across $\{0, 1, \ldots, 2^{32}-1\}$.

For integers the simplest function is $h(k) = k \mod m$, but only if $m$ is
prime; otherwise common divisors leak structure into the bucket indices. A
better choice is *multiplicative hashing*:

$$h(k) = \lfloor m \cdot (k \cdot A \bmod 1) \rfloor, \quad A \approx (\sqrt{5} - 1)/2.$$

For strings, you composite the characters into an integer using a small
prime base — the polynomial rolling hash:

$$h(s) = \sum_{i=0}^{|s|-1} s[i] \cdot p^i \mod q.$$

```viz
{ "type": "callout", "props": {
  "tone": "intuition",
  "title": "What \"uniform\" means here",
  "body": "If you imagine the universe of all realistic keys, a uniform hash sends them to every slot with equal frequency. Bad hashes cluster — e.g., hashing strings only by their first character means every word starting with 'e' collides. Test your hash by counting bucket sizes on a real key set."
} }
```

## Collision Resolution

Two strategies dominate practice.

**Chaining.** Each slot holds a small dynamic structure — a linked list, an
array, or a tree — of all keys mapped there. Insert appends; lookup scans
the chain. Memory cost is one pointer per entry; lookup cost is proportional
to the expected chain length $1 + \alpha$ where $\alpha = n / m$.

**Open addressing.** All entries live in the bucket array itself. On
collision, probe forward (`(h + 1) mod m`, `(h + 2) mod m`, …) until an
empty slot is found. No pointers — much better cache behavior — but the
table can never be more than ~70% full without performance falling off a
cliff. Java's `HashMap` and Python's `dict` actually use a variant: open
addressing with sophisticated probe sequences.

```viz
{ "type": "hash-table", "props": {
  "size": 7,
  "initial": ["apple", "pear", "fig", "kiwi", "grape", "plum"],
  "strategy": "linear-probing"
} }
```

Compare the two visualizations: chaining tolerates higher load factors
because chains grow vertically, while linear probing forms *primary
clusters* that worsen lookup time superlinearly.

## Load Factor and Resizing

The load factor $\alpha = n / m$ is the single knob that controls
performance. The theorems say:

- **Chaining, average lookup cost:** $\Theta(1 + \alpha)$.
- **Open addressing, average successful lookup:** $\Theta(1/(1-\alpha))$.

So at $\alpha = 0.5$ open addressing averages 2 probes per lookup. At
$\alpha = 0.9$, it averages 10. At $\alpha = 0.99$, 100. Real tables hold
$\alpha$ below ~0.75 by doubling $m$ whenever the threshold is crossed —
the same amortization argument as dynamic arrays.

```viz
{ "type": "callout", "props": {
  "tone": "pitfall",
  "title": "Worst-case is still O(n)",
  "body": "If an adversary knows your hash function, they can craft a stream of keys that all collide. CPython randomizes string hashes per process for exactly this reason. In competitive programming, sticking to std::unordered_map without a custom hash exposes you to attacks; std::map (a balanced BST) is the safe alternative."
} }
```

## Complexity Summary

| Operation     | Expected     | Worst case  | Notes                              |
| ------------- | ------------ | ----------- | ---------------------------------- |
| Insert        | $O(1)$       | $O(n)$      | Amortized including rehash.        |
| Lookup        | $O(1)$       | $O(n)$      | Worst case when all keys collide.  |
| Delete        | $O(1)$       | $O(n)$      | Tombstones with open addressing.   |
| Resize (one)  | $O(n)$       | $O(n)$      | Amortizes to $O(1)$ per insert.    |

The expected times assume a uniform hash and a bounded load factor — the
hash table designer's job.

## Common Patterns

1. **Frequency counting** — `count[k] += 1` is the bread and butter of
   string and array problems.
2. **Seen-before checks** — `if k in seen` for two-sum, cycle detection,
   first-repeat problems.
3. **Group by key** — `groups[h(k)].append(item)`, where the key is some
   canonical form (sorted tuple of characters, prime factorization, etc.).
4. **Sliding window with character counts** — pair hash maps with the
   window technique for "longest substring with at most K distinct
   characters" and friends.

## Practice
- Implement a hash table with chaining and a load-factor-triggered rehash.
- Find the first non-repeating character in a string in one pass.
- Group anagrams in $O(n \cdot k)$ where $k$ is the max word length.
- Two-sum in one pass, $O(n)$.

## References
1. Cormen, Leiserson, Rivest, Stein. *Introduction to Algorithms, 4th ed.*, Chapter 11.
2. Aspnes. *Notes on Data Structures and Programming Techniques* (Yale CS 223).
3. cp-algorithms.com. "Hashing."
