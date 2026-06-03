---
slug: string-manipulation
title: String Manipulation
summary: "Strings are immutable arrays of Unicode code points — two facts that explain every performance pitfall. Techniques: hashing, sliding windows, two pointers, and the builder pattern."
topicSlug: arrays-and-strings
level: FOUNDATION
order: 2
estimatedMins: 20
references:
  - { title: "Introduction to Algorithms, 4th ed., Ch. 32", author: "Cormen, Leiserson, Rivest, Stein", type: "book" }
  - { title: "Programming Pearls, Column 2", author: "Jon Bentley", type: "book" }
  - { title: "Algorithms, 4th ed., Ch. 5", author: "Sedgewick & Wayne", type: "book" }
prerequisites: ["array-fundamentals"]
---

## Overview
A string is an array of characters. That is the boring part of the
definition; the interesting parts are the two design choices that make
strings different from generic arrays in every modern language:

1. **Strings are immutable.** Once allocated, you cannot overwrite a
   character of a `String`, `str`, or Java `String`. Appending or
   modifying creates a new string.
2. **Characters are Unicode code points, not bytes.** A naive `s[i]`
   may return a code unit, a code point, or a grapheme cluster
   depending on the language. Length and index are not always what you
   think.

Most string-algorithm bugs trace back to one of those two facts.

## Immutability and Its Discontents

Concatenating strings inside a loop is the textbook performance trap:

```python
# O(n²) — every += allocates a new string
s = ""
for ch in chars:
    s += ch
```

Each `+=` copies the entire accumulator to a fresh buffer, and the
accumulator grows on every iteration. The total work is $1 + 2 + 3 +
\cdots + n = \Theta(n^2)$.

The right idiom: append to a *builder* (list of chunks, `StringBuilder`,
`StringBuffer`, Python's `list` + `"".join`), then assemble once at the
end.

```python
# O(n)
parts = []
for ch in chars:
    parts.append(ch)
s = "".join(parts)
```

```viz
{ "type": "callout", "props": {
  "tone": "pitfall",
  "title": "Why the loop hurts",
  "body": "Strings are immutable, so += allocates. Allocating a string of length n costs O(n). Inside a loop with n iterations the total is O(n²) — fine for n = 100, fatal for n = 10^6. This bug ships to production constantly because small benchmarks hide it."
} }
```

## Unicode is Not ASCII

Three layers, all called "character" in casual usage:

| Layer            | What it is                                     | Examples |
| ---------------- | ---------------------------------------------- | -------- |
| Code unit        | One element of the storage encoding            | `'a'` in UTF-8 = 1 unit; `'€'` = 3 units |
| Code point       | One Unicode codepoint (`U+0061`, `U+1F600`)    | `'a'`, `'😀'` |
| Grapheme cluster | What a human sees as one character             | `'é'` (e + combining acute), `'👨‍👩‍👧'` |

Python 3 indexes by code point; Java by UTF-16 code unit (so an emoji
takes two indices); Rust by byte. None index by grapheme out of the box.

For algorithm problems you usually live in ASCII, but the moment a
problem mentions a "string", check the constraint. *26 lowercase
letters* is ASCII; *Unicode characters* is not.

## The Four Core Techniques

Most string problems decompose into one of:

- **Sliding window** with a character-frequency map. *Longest substring
  with at most $k$ distinct characters*, *longest substring without
  repeating characters*, *minimum window substring*.
- **Two pointers** converging from the ends. *Palindrome check*,
  *valid palindrome with one removal*.
- **Polynomial hashing** of substrings. *Detect repeated substrings*,
  *find all occurrences of a pattern in $O(n + m)$* (Rabin-Karp),
  *compare two substrings in $O(1)$ after $O(n)$ preprocessing*.
- **Tries** for prefix queries. *Autocomplete*, *spell check*,
  *longest common prefix among many strings*. Covered in its own
  article later.

Two more — KMP/Z-function for exact pattern matching, and suffix
arrays/automata for repeated-substring problems — appear in advanced
modules.

```viz
{ "type": "architecture", "props": {
  "caption": "Toolbox for string problems",
  "cols": 12, "rows": 4, "height": 280,
  "boxes": [
    { "id": "sw", "label": "sliding window", "sub": "longest / shortest substring with property P", "col": 0, "row": 0, "colSpan": 4, "emphasis": "primary" },
    { "id": "tp", "label": "two pointers", "sub": "palindrome, reverse, comparison from ends", "col": 4, "row": 0, "colSpan": 4 },
    { "id": "hash", "label": "polynomial hashing", "sub": "Rabin-Karp, substring equality", "col": 8, "row": 0, "colSpan": 4, "emphasis": "primary" },
    { "id": "trie", "label": "trie", "sub": "prefix queries, autocomplete", "col": 0, "row": 2, "colSpan": 4 },
    { "id": "kmp", "label": "KMP / Z-function", "sub": "linear pattern matching", "col": 4, "row": 2, "colSpan": 4 },
    { "id": "suf", "label": "suffix array / automaton", "sub": "repeated substrings, LCP", "col": 8, "row": 2, "colSpan": 4, "emphasis": "muted" }
  ]
} }
```

## Polynomial Hashing in One Page

For string $s$ of length $n$ and a prime base $p$ and modulus $q$,
define

$$h(s) = \sum_{i=0}^{n-1} s[i] \cdot p^i \mod q.$$

Two useful properties:

- $h$ can be computed in $\Theta(n)$ time using Horner's rule.
- $h$ can be *rolled*: given $h(s[l..r])$, computing $h(s[l+1..r+1])$
  is $\Theta(1)$ after $\Theta(n)$ precomputation of prefix hashes and
  powers of $p$. This is the heart of Rabin-Karp.

```python
P, Q = 257, (1 << 61) - 1   # a Mersenne prime modulus

def prefix_hashes(s):
    n = len(s)
    h = [0] * (n + 1)
    pw = [1] * (n + 1)
    for i in range(n):
        h[i + 1] = (h[i] * P + ord(s[i])) % Q
        pw[i + 1] = (pw[i] * P) % Q
    return h, pw

def substr_hash(h, pw, l, r):    # hash of s[l..r-1]
    return (h[r] - h[l] * pw[r - l]) % Q
```

With this, comparing two substrings of length $k$ is one subtraction
and one multiplication — $\Theta(1)$ instead of $\Theta(k)$.

```viz
{ "type": "callout", "props": {
  "tone": "insight",
  "title": "Two hashes are safer than one",
  "body": "A single 61-bit hash collides with probability roughly 2^-61 per query — fine for individual queries, dangerous when you do millions. Use two independent hashes with different bases and moduli; collision probability becomes about 2^-122, effectively zero."
} }
```

## In-Place Operations on Mutable Buffers

When the language gives you a mutable character buffer — Python's
`bytearray`, Java's `char[]`, C's `char *` — many string problems
collapse to two-pointer array work:

```python
# reverse in place
def reverse_inplace(buf):
    L, R = 0, len(buf) - 1
    while L < R:
        buf[L], buf[R] = buf[R], buf[L]
        L += 1
        R -= 1
```

Converting a problem from "manipulate a string" to "manipulate a
char array" is often the right preparatory step.

## Useful Identities

A few facts about strings worth memorizing:

- A string of length $n$ has $\Theta(n^2)$ substrings and $\Theta(n)$
  distinct prefixes.
- Two strings are anagrams iff they have identical character-frequency
  maps — $\Theta(n)$ comparison after $\Theta(n)$ counting.
- $s$ is a rotation of $t$ iff $s$ appears as a substring of $t + t$.
- A string is a palindrome iff it equals its reverse — but a single
  two-pointer pass is more efficient than constructing the reverse.

## Pitfalls

```viz
{ "type": "callout", "props": {
  "tone": "pitfall",
  "title": "Appending in a loop",
  "body": "If you write s = s + x inside a loop, you have written O(n²). Builder pattern: collect chunks in a list, join once."
} }
```

```viz
{ "type": "callout", "props": {
  "tone": "pitfall",
  "title": "String length is not character count",
  "body": "In Java, str.length() returns UTF-16 code units. In Python 3, len(s) returns code points. Neither is grapheme count. For an emoji-heavy string, the difference can be 4x."
} }
```

```viz
{ "type": "callout", "props": {
  "tone": "pitfall",
  "title": "Case and locale",
  "body": "String comparison and case folding are locale-dependent in real applications (Turkish dotted/dotless i, German ß). For algorithm problems, the constraint usually pins to a fixed alphabet — read it carefully."
} }
```

## Practice
- Reverse a string in-place using a `char[]` or `bytearray`.
- Check if two strings are anagrams in $\Theta(n)$ time.
- Implement Rabin-Karp using rolling polynomial hashing.
- Longest substring without repeating characters (sliding window).
- Group anagrams together.
- Valid palindrome ignoring non-alphanumerics and case.

## References
1. Sedgewick & Wayne. *Algorithms, 4th ed.*, Chapter 5.
2. Cormen, Leiserson, Rivest, Stein. *Introduction to Algorithms, 4th ed.*, Chapter 32.
3. Bentley. *Programming Pearls*, Column 2.
