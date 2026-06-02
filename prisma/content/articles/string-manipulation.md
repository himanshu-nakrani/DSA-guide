---
slug: string-manipulation
title: String Manipulation
summary: How strings are stored, why naive concatenation can be O(n²), and the techniques (hashing, sliding windows, two pointers) that show up in interviews.
topicSlug: arrays-and-strings
level: FOUNDATION
order: 2
estimatedMins: 14
references:
  - { title: "Introduction to Algorithms, 4th ed., Ch. 32 (String Matching)", author: "Cormen, Leiserson, Rivest, Stein", type: "book" }
  - { title: "String Processing", url: "https://cp-algorithms.com/string/", type: "web" }
prerequisites: ["array-fundamentals"]
---

## Overview
A string is logically a sequence of characters and physically an array — usually of bytes (UTF-8) or code units (UTF-16). Most interview "string" problems are array problems with extra encoding and immutability concerns layered on top.

## Prerequisites
- Array Fundamentals

## Core Idea
Two facts dominate string handling:
1. In many languages (Java, Python, JavaScript), strings are **immutable**. Every "modification" allocates a new string.
2. A "character" is not a byte. Unicode adds composing characters, surrogate pairs, and graphemes; iterating by index does not always iterate by user-visible character.

These two facts explain most string performance pitfalls.

## Mechanics
- **Random access by code-unit index**: $O(1)$ in fixed-width encodings (ASCII, UTF-32). $O(1)$ in UTF-16 by code unit but not by grapheme. UTF-8 random access is $O(n)$ unless you index a precomputed table.
- **Concatenation**: $O(n + m)$ to build a new string. Repeatedly concatenating in a loop (`s = s + c`) costs $O(n^2)$ — use a builder (`StringBuilder`, `list` + `"".join`, `bytes.Buffer`).
- **Comparison**: $O(\min(n, m))$ to detect equality or order.
- **Substring**: $O(k)$ where $k$ is the substring length, in languages that copy. Some languages return views in $O(1)$ but pin the parent buffer.

## Complexity
- Reverse, copy, hash: $O(n)$.
- Naive substring search: $O(nm)$.
- Linear-time substring search (KMP, Z, Rabin-Karp): $O(n + m)$, covered in Tier 2.

## Common Patterns
1. **Two pointers on strings**: Palindrome checks, valid anagram by sorted compare, reverse-words-in-place.
2. **Hash-map frequency counts**: Anagram detection, longest substring with $k$ distinct characters.
3. **Sliding window**: Longest substring without repeating characters, minimum window substring.
4. **Build with a buffer, not by re-concatenation**: Especially in Python and Java, where the naive loop is $O(n^2)$.

## Pitfalls
- **Mutating strings in a loop**. `result += c` in a loop is $O(n^2)$ in Python/Java. Use `"".join(parts)` or `StringBuilder`.
- **Confusing code units with characters**. Reversing a UTF-16 string by code unit can split a surrogate pair and produce an invalid string.
- **Locale-sensitive comparisons**. `"a".upper() == "A"` is not guaranteed across all locales (e.g., Turkish dotless `i`).
- **Using `==` for string equality in Java**. Compares references, not contents — use `.equals()`.

## Practice
- Reverse the words in a sentence in place.
- Check if two strings are anagrams.
- Find the longest substring without repeating characters.

## References
1. Cormen, Leiserson, Rivest, Stein. *Introduction to Algorithms, 4th ed.*, Chapter 32 (String Matching).
2. cp-algorithms.com. "String Processing".
