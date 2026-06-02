---
slug: hash-tables
title: "Hash Tables: How They Work"
summary: How hash functions, buckets, and collision resolution combine to give average O(1) insert, delete, and lookup.
topicSlug: hashing
level: FOUNDATION
order: 1
estimatedMins: 15
references:
  - { title: "Introduction to Algorithms, 4th ed., Ch. 11", author: "Cormen, Leiserson, Rivest, Stein", type: "book" }
  - { title: "Hashing", url: "https://cp-algorithms.com/data_structures/hash_table.html", type: "web" }
prerequisites: ["array-fundamentals"]
---

## Overview
A hash table is a data structure that implements an associative array, mapping keys to values. It uses a hash function to compute an index into an array of buckets or slots, from which the desired value can be found.

## Prerequisites
- Array Fundamentals

## Core Idea
Instead of searching through elements one by one ($O(n)$), a hash function $h(k)$ transforms the key $k$ into an integer index. If the hash function is good and the table is sufficiently large, this allows for $O(1)$ average-time complexity for insertions, deletions, and lookups.

## Mechanics
1. **Hash Function**: Converts a key into an integer. A simple example is $h(k) = k \mod m$, where $m$ is the table size (preferably a prime number).
2. **Collision Resolution**: When two keys hash to the same index, a collision occurs. Common strategies include:
   - **Chaining**: Each bucket contains a linked list of entries that hash to the same index.
   - **Open Addressing**: All elements are stored in the array itself. Upon collision, the algorithm probes subsequent slots (e.g., linear probing, quadratic probing) until an empty slot is found.

## Complexity
- **Time**: $O(1)$ average case for search, insert, and delete. $O(n)$ worst case if all keys collide (e.g., poor hash function or malicious input).
- **Space**: $O(n)$ to store $n$ elements, plus overhead for empty buckets to maintain a low load factor.

## Common Patterns
1. **Frequency Counting**: Using a hash map to count occurrences of elements in an array (e.g., finding duplicates or anagrams).
2. **Two Sum**: Storing seen elements in a hash map to find a complementary pair in a single pass.

## Pitfalls
- **Ignoring Load Factor**: If the load factor ($\alpha = n/m$) grows too high, performance degrades towards $O(n)$. Dynamic resizing is required.
- **Using mutable objects as keys**: If a key's hash code changes after insertion, it will be lost in the table.
- **Assuming $O(1)$ worst-case**: In competitive programming, adversaries can craft inputs to cause worst-case $O(n)$ behavior in standard library hash maps (hash collisions). Using a custom hash or `std::map` (Red-Black Tree) may be necessary.

## Practice
- Implement a hash table with chaining.
- Find the first non-repeating character in a string.
- Group anagrams together.

## References
1. Cormen, Leiserson, Rivest, Stein. *Introduction to Algorithms, 4th ed.*, Chapter 11.
2. cp-algorithms.com. "Hash Tables".
