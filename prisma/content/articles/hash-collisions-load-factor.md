---
slug: hash-collisions-load-factor
title: Collision Handling and Load Factor
summary: Chaining vs open addressing, why load factor governs performance, and what makes a real-world hash table degrade.
topicSlug: hashing
level: INTERMEDIATE
order: 2
estimatedMins: 16
references:
  - { title: "Introduction to Algorithms, 4th ed., Ch. 11 (Hash Tables)", author: "Cormen, Leiserson, Rivest, Stein", type: "book" }
  - { title: "Algorithms, 4th ed., Ch. 3.4 (Hash Tables)", author: "Sedgewick & Wayne", type: "book" }
prerequisites: ["hash-tables"]
---

## Overview
A hash table's $O(1)$ average behavior holds only when collisions are rare and the table is not too full. Two design choices govern this: the **collision resolution** strategy and the **load factor**. Both are tunable, and both are why your favorite language's hash map sometimes degrades.

## Prerequisites
- Hash Tables

## Core Idea
Two keys $k_1 \ne k_2$ can hash to the same slot. The table must either store both at that slot (chaining) or relocate one of them (open addressing). The choice trades cache behavior against worst-case clustering.

## Mechanics

**Chaining**: Each slot holds a linked list (or small dynamic array, or — at high load — a balanced tree, as Java's `HashMap` does). Insertion is $O(1)$; lookup walks the chain.

**Open addressing**: All entries live in the array itself. On collision, probe a sequence of slots until an empty one is found.
- *Linear probing*: probe $h(k), h(k)+1, h(k)+2, \ldots$ Simple and cache-friendly but suffers from **primary clustering** — long runs of occupied slots grow disproportionately.
- *Quadratic probing*: probe $h(k), h(k)+1, h(k)+4, h(k)+9, \ldots$ Mitigates primary but introduces secondary clustering.
- *Double hashing*: probe $h_1(k), h_1(k)+h_2(k), h_1(k)+2 h_2(k), \ldots$ Mixes the probe sequence per key and approaches uniform hashing in theory.

**Load factor** $\alpha = n / m$ where $n$ is the number of stored items and $m$ is the table size.
- Chaining: expected probe length is $1 + \alpha$. Tolerates $\alpha > 1$.
- Open addressing: expected probe count is $\frac{1}{1 - \alpha}$ for unsuccessful search under uniform hashing. Performance collapses as $\alpha \to 1$. Real implementations rehash at $\alpha \approx 0.5$–$0.75$.

## Complexity
- Average insert / lookup / delete: $O(1)$ assuming a good hash and bounded load factor.
- Worst case under adversarial input or a bad hash: $O(n)$.
- Resize (rehash all entries into a larger table) is $O(n)$ but amortizes to $O(1)$ per insert.

## Common Patterns
1. **Java `HashMap`'s treeification**: When a single bucket grows past 8 entries (and the table is large enough), the chain becomes a red-black tree, capping worst-case lookup at $O(\log n)$ per bucket. The classic defense against hash-flooding.
2. **Robin Hood hashing**: An open-addressing variant that minimizes the variance of probe distances. Widely used in Rust's `HashMap`.
3. **Random seeding**: Modern hash maps mix in a per-process random seed so an attacker cannot precompute colliding keys (hash-flooding mitigation).

## Pitfalls
- **Setting initial capacity too low**. Repeated resizes thrash. If you know the final size, allocate for it.
- **Using a non-uniform hash function**. Hashing tuples by XOR or by adding components produces clusters; use a proper mixer (FNV, MurmurHash, SipHash, language-built-ins).
- **Storing keys with mutable hash**. If a key's hash code changes after insertion, the table cannot find it. Make keys effectively immutable.
- **Assuming iteration order**. Most hash tables do not preserve insertion order. Python's `dict` does (since 3.7); Java's `HashMap` does not — use `LinkedHashMap` if order matters.

## Practice
- Implement a hash set with linear probing and dynamic resize.
- Compare lookup times on a uniformly-distributed key set vs. one designed to collide.
- Measure throughput of `HashMap` and `TreeMap` as a function of load factor.

## References
1. Cormen, Leiserson, Rivest, Stein. *Introduction to Algorithms, 4th ed.*, Chapter 11.
2. Sedgewick & Wayne. *Algorithms, 4th ed.*, Chapter 3.4.
