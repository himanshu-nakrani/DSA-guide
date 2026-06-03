---
slug: hash-collisions-load-factor
title: Collision Handling and Load Factor
summary: "Chaining versus open addressing, why load factor is the single knob that controls hash table performance, and what real implementations do when the table gets full."
topicSlug: hashing
level: INTERMEDIATE
order: 2
estimatedMins: 20
references:
  - { title: "Introduction to Algorithms, 4th ed., Ch. 11", author: "Cormen, Leiserson, Rivest, Stein", type: "book" }
  - { title: "Algorithms, 4th ed., Ch. 3.4", author: "Sedgewick & Wayne", type: "book" }
prerequisites: ["hash-tables"]
---

## Overview
A hash table's amortized $O(1)$ operations rest on two engineering
choices that the introductory article only sketched: how to handle
*collisions* (two keys hashing to the same bucket) and how to manage
*load factor* (how full the table gets before performance degrades).
This article goes deeper on both. The right answers are not the same
for every workload, and the wrong answer turns $O(1)$ into $O(n)$.

## The Two Collision Strategies

### Chaining

Each bucket holds a *secondary container* — almost always a linked
list, sometimes a dynamic array or even a tree — of all entries that
hash there. Insert prepends to the chain; lookup walks the chain
comparing keys.

```viz
{ "type": "hash-table", "props": {
  "size": 7,
  "initial": ["apple", "pear", "fig", "kiwi", "grape", "plum"],
  "strategy": "chaining"
} }
```

The expected lookup cost is $1 + \alpha$ where $\alpha = n / m$ is the
load factor — one to find the bucket, $\alpha$ on average to walk the
chain. Insert is $O(1)$ (prepend); delete is $O(1 + \alpha)$ (scan,
unlink).

The key property: load factor can exceed 1 without breaking anything.
Chains just get longer. Performance degrades smoothly.

### Open Addressing

Every entry lives in the bucket array itself. On collision, *probe*
forward according to some sequence — linear ($h + 1$, $h + 2$, …),
quadratic ($h + 1^2$, $h + 2^2$, …), or *double hashing* ($h + i \cdot
h_2(k)$) — until you find an empty slot or the key.

```viz
{ "type": "hash-table", "props": {
  "size": 7,
  "initial": ["apple", "pear", "fig", "kiwi", "grape", "plum"],
  "strategy": "linear-probing"
} }
```

The expected lookup cost is $1 / (1 - \alpha)$. As $\alpha \to 1$ the
cost diverges. The load factor *must* stay strictly below 1; in
practice, real open-addressing tables rehash when $\alpha$ exceeds
0.7.

Open addressing wins on cache behavior — every probe accesses
contiguous memory rather than pointer-chasing through chain nodes. The
cost is that the table breaks at high load, where chaining still works.

## Comparison Table

| Property                       | Chaining           | Open addressing            |
| ------------------------------ | ------------------ | -------------------------- |
| Lookup cost                    | $1 + \alpha$       | $1 / (1 - \alpha)$         |
| Max useful load factor         | ~10 (degrades smoothly) | ~0.7 (degrades sharply) |
| Cache behavior                 | poor (pointer chase) | excellent (linear scan)  |
| Memory per entry               | key + value + pointer | key + value only        |
| Delete                         | unlink chain node  | tombstone or rehash window |
| Adversarial worst case         | $O(n)$ chain       | $O(n)$ scan                |

In production:

- Java `HashMap` — chaining. Since Java 8, long chains convert to
  red-black trees, capping worst-case lookup at $O(\log n)$ even under
  attack.
- Python `dict` — open addressing with a perturbed probe sequence.
- Go `map` — chaining with bucket arrays of 8 entries each.
- C++ `std::unordered_map` — chaining (required by the standard).
- Rust `HashMap` — open addressing (Robin Hood hashing, by default
  with SipHash for adversary resistance).

## Probing Sequences in Detail

Linear probing (`h + i`) is simple and cache-friendly but suffers from
*primary clustering* — once a cluster forms, every new insertion that
hashes anywhere into it lands at its end, extending it further.
Lookups degrade as clusters merge.

Quadratic probing (`h + i^2`) breaks clusters but introduces *secondary
clustering*: keys with the same initial hash follow the same probe
sequence. It also requires careful table-size choice ($m$ a power of 2
with a quadratic of $i(i+1)/2$, or $m$ prime with restrictions) to
guarantee that the probe sequence visits every slot.

Double hashing uses a second independent hash for the probe step.
It eliminates both primary and secondary clustering and is the
strongest theoretical choice. The cost is the second hash computation
per probe.

Robin Hood hashing — a linear-probing variant — equalizes probe
distances by displacing entries during insertion. Lookups improve
because no entry sits far from its home if a closer slot is occupied
by a richer entry.

## Rehashing — The Hidden Cost

When the load factor crosses a threshold, the table allocates a new
bucket array (typically doubled in size), re-hashes every entry, and
frees the old one. Per-rehash cost is $\Theta(n)$. Across $n$
insertions the total rehash work is $\Theta(n)$, so amortized cost is
still $O(1)$ per insert.

```viz
{ "type": "architecture", "props": {
  "caption": "Hash table lifecycle: insert → grow → rehash",
  "cols": 12, "rows": 4, "height": 280,
  "boxes": [
    { "id": "ins", "label": "insert", "sub": "O(1) amortized", "col": 0, "row": 0, "colSpan": 3, "emphasis": "primary" },
    { "id": "loc", "label": "load factor monitor", "sub": "alpha = n / m", "col": 4, "row": 0, "colSpan": 4 },
    { "id": "grow", "label": "grow trigger", "sub": "alpha > threshold", "col": 9, "row": 0, "colSpan": 3, "emphasis": "warn" },
    { "id": "alloc", "label": "allocate new bucket array", "sub": "size 2m", "col": 1, "row": 2, "colSpan": 4 },
    { "id": "rehash", "label": "re-hash and re-insert all n entries", "sub": "O(n) once per growth", "col": 6, "row": 2, "colSpan": 5, "emphasis": "primary" }
  ],
  "arrows": [
    { "from": "ins",   "to": "loc" },
    { "from": "loc",   "to": "grow" },
    { "from": "grow",  "to": "alloc" },
    { "from": "alloc", "to": "rehash" }
  ]
} }
```

```viz
{ "type": "callout", "props": {
  "tone": "pitfall",
  "title": "Rehash is a tail-latency event",
  "body": "Amortized O(1) means the rehash cost is spread; the single push that triggers it still takes O(n). Real-time systems prefer pre-sized tables or incremental rehashing (Redis 'progressive rehash' moves a few buckets per operation) to flatten the spike."
} }
```

## Why Load Factor Is the Only Knob That Matters

Two tables, same hash function, same key distribution, different
sizes. The one with $\alpha = 0.3$ has short chains (or short probe
sequences) and lookups average about 1.3 cache lines. The one with
$\alpha = 0.95$ has long chains and lookups average 10+ cache lines.
The absolute size matters not at all; the *ratio* of entries to
buckets is the entire performance story.

This is why "memory vs. speed" is a tunable in real implementations:

- Java `HashMap` defaults to 0.75 — chosen to balance memory and lookup.
- Python `dict` resizes when 2/3 full.
- Go `map` resizes at ~6.5 entries per bucket.

You can usually tune the threshold via constructor parameters
(`new HashMap<>(initialCapacity, loadFactor)` in Java). For
predictable, latency-sensitive workloads, pick a lower load factor and
pre-size the table.

## Adversarial Hashing — Hash-Flooding

If an attacker can predict your hash function and craft input keys
that all hash to the same bucket, they can drive your $O(1)$
operations to $O(n)$ per call and DoS your service. This attack —
*hash flooding* — has hit Rails, PHP, Java HTTP frameworks, and more.

Defenses:

- **Per-process random seed.** CPython, Java, and Rust randomize the
  hash seed at process start. Two processes give different orderings
  for the same input.
- **Keyed cryptographic hash.** Rust uses SipHash, which is fast and
  resistant to forgery without the seed.
- **Fallback to balanced tree.** Java 8 `HashMap` converts a chain to
  a red-black tree once it exceeds 8 entries, capping worst case at
  $O(\log n)$ even if the seed leaks.
- **Avoid `unordered_map` in competitive programming when inputs are
  untrusted.** `std::map` (a balanced BST) is $O(\log n)$ guaranteed.

## Pitfalls

```viz
{ "type": "callout", "props": {
  "tone": "pitfall",
  "title": "Modifying a key after insertion",
  "body": "If a key's hash code changes after insertion, the table cannot find it. Mutable objects make terrible hash keys. Either freeze them (Python's tuple, Java's immutable records) or copy the relevant fields before insertion."
} }
```

```viz
{ "type": "callout", "props": {
  "tone": "pitfall",
  "title": "Linear probing with tombstones",
  "body": "Open addressing with deletes leaves 'tombstone' markers — empty slots that still terminate insert searches. Without periodic cleanup, the table fills with tombstones and probe sequences grow. Either tombstone-and-compact, or use a different probing scheme that handles deletion (Robin Hood does)."
} }
```

```viz
{ "type": "callout", "props": {
  "tone": "pitfall",
  "title": "Believing O(1) on competitive inputs",
  "body": "If your input is adversarial — a contest judge that knows your hash function — std::unordered_map can be forced to O(n) per operation. Use a custom hash (typically xor with a random constant) or switch to std::map."
} }
```

## Practice
- Implement chaining with a singly linked list. Measure average chain
  length at $\alpha = 0.5, 0.75, 1.0$.
- Implement open addressing with linear probing. Measure probe count
  at the same loads.
- Implement Robin Hood hashing.
- Custom hash for `int` in `std::unordered_map` that defeats hash
  flooding (xor with a random constant per process).
- Resize policy experiment: build $10^6$ inserts with thresholds
  0.5, 0.75, 0.9. Compare total time and peak memory.

## References
1. Cormen, Leiserson, Rivest, Stein. *Introduction to Algorithms, 4th ed.*, Chapter 11.
2. Sedgewick & Wayne. *Algorithms, 4th ed.*, Section 3.4.
