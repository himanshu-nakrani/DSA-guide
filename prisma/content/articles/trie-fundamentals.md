---
slug: trie-fundamentals
title: Trie Fundamentals
summary: "A tree where every path from root spells a prefix — insert, search, and prefix-query in O(length) independent of how many strings are stored. The data structure behind autocomplete, spell checking, and the Aho-Corasick string-matching automaton."
topicSlug: tries
level: INTERMEDIATE
order: 1
estimatedMins: 22
references:
  - { title: "Algorithms, 4th ed., Ch. 5.2", author: "Sedgewick & Wayne", type: "book" }
  - { title: "Introduction to Algorithms, 4th ed., Ch. 32", author: "Cormen, Leiserson, Rivest, Stein", type: "book" }
  - { title: "cp-algorithms.com — Aho-Corasick", url: "https://cp-algorithms.com/string/aho_corasick.html", type: "web" }
prerequisites: ["string-manipulation"]
---

## Overview
A trie (pronounced *try*, from re*trie*val) is a tree where each edge
is labeled with a single character and each root-to-node path spells a
prefix of some inserted string. Strings that share a prefix share the
same edges; strings that diverge branch.

The payoff: insert and search cost $O(L)$ where $L$ is the length of
the query string — *independent* of how many strings are already
stored. A trie with a million entries serves an autocomplete query for
a 10-character prefix in 10 steps. No comparable data structure
matches that bound for prefix queries.

## The Structure

Each node carries:

- A map from character to child node — typically an array of size 26
  (or 256) for fixed alphabets, a hash map for larger ones.
- A boolean flag: is this node the end of an inserted string?
- Optionally: a count, a stored value, or a list of references.

```viz
{ "type": "architecture", "props": {
  "caption": "Trie holding {cat, car, can, dog, dot}",
  "cols": 12, "rows": 4, "height": 280,
  "boxes": [
    { "id": "r",  "label": "root", "col": 5, "row": 0, "colSpan": 2, "emphasis": "muted" },
    { "id": "c",  "label": "c", "col": 1, "row": 1, "colSpan": 2 },
    { "id": "d",  "label": "d", "col": 9, "row": 1, "colSpan": 2 },
    { "id": "ca", "label": "ca", "col": 1, "row": 2, "colSpan": 2 },
    { "id": "do", "label": "do", "col": 9, "row": 2, "colSpan": 2 },
    { "id": "cat", "label": "cat ★", "col": 0, "row": 3, "colSpan": 2, "emphasis": "primary" },
    { "id": "car", "label": "car ★", "col": 2, "row": 3, "colSpan": 2, "emphasis": "primary" },
    { "id": "can", "label": "can ★", "col": 4, "row": 3, "colSpan": 2, "emphasis": "primary" },
    { "id": "dog", "label": "dog ★", "col": 8, "row": 3, "colSpan": 2, "emphasis": "primary" },
    { "id": "dot", "label": "dot ★", "col": 10, "row": 3, "colSpan": 2, "emphasis": "primary" }
  ],
  "arrows": [
    { "from": "r", "to": "c" },
    { "from": "r", "to": "d" },
    { "from": "c", "to": "ca" },
    { "from": "d", "to": "do" },
    { "from": "ca", "to": "cat" },
    { "from": "ca", "to": "car" },
    { "from": "ca", "to": "can" },
    { "from": "do", "to": "dog" },
    { "from": "do", "to": "dot" }
  ]
} }
```

The ★ marks nodes flagged as end-of-string. Notice that intermediate
prefixes (`c`, `ca`, `d`, `do`) are *not* themselves inserted strings
unless we also flag them.

## Implementation

```python
class TrieNode:
    __slots__ = ("children", "end")
    def __init__(self):
        self.children = {}
        self.end = False

class Trie:
    def __init__(self):
        self.root = TrieNode()

    def insert(self, word):
        node = self.root
        for ch in word:
            if ch not in node.children:
                node.children[ch] = TrieNode()
            node = node.children[ch]
        node.end = True

    def search(self, word):
        node = self._walk(word)
        return node is not None and node.end

    def starts_with(self, prefix):
        return self._walk(prefix) is not None

    def _walk(self, s):
        node = self.root
        for ch in s:
            node = node.children.get(ch)
            if node is None:
                return None
        return node
```

The hash-map-per-node implementation is general; for fixed alphabets
(lowercase English, DNA bases) replace with a 26-element or 4-element
array indexed by `ch - 'a'`. That replaces hashing with one array
access, which matters in tight loops.

## Complexity

| Operation        | Time   | Notes                                  |
| ---------------- | ------ | -------------------------------------- |
| Insert           | $O(L)$ | $L$ is word length                     |
| Search           | $O(L)$ |                                        |
| Prefix exists?   | $O(L)$ |                                        |
| Count prefixes   | $O(L)$ | with size augmentation per node        |
| Delete           | $O(L)$ | trickier — prune empty subtrees on the way back up |
| Space            | $O(\Sigma_i L_i \cdot |\Sigma|)$ | worst case; shared prefixes amortize |

The space bound is the trie's weak spot. For 26-element arrays, every
non-shared node carries 26 pointers. Compressed variants — *radix
tree*, *Patricia trie* — collapse single-child chains and recover
some of the memory.

## When Tries Beat Alternatives

Hash maps support insert and lookup in expected $O(L)$ — same as a
trie. The trie wins when:

- You need **prefix queries** — "every word starting with `qu`",
  "longest prefix that exists". Hash maps cannot answer in less than
  scanning everything.
- You need **lexicographic ordering** — pre-order traversal of a
  trie yields the inserted strings in sorted order.
- The string set has **heavy prefix overlap** — words in a single
  language, URLs sharing a domain. The shared structure saves memory.
- You want **online membership** — check whether a *prefix* of a
  stream-in-progress is a valid word, character by character.

```viz
{ "type": "callout", "props": {
  "tone": "intuition",
  "title": "Why prefix queries are free",
  "body": "Walking from root to a node spells a prefix. Every string under that subtree starts with it. So 'words with prefix X' is exactly 'depth-first traversal from the node X resolves to'. Hash maps do not give you that for free."
} }
```

## Common Use Cases

- **Autocomplete.** Walk to the prefix node, DFS the subtree, collect
  the top $k$ by frequency. Augment with a priority hint at each node
  for faster ranking.
- **Spell checking.** Detect whether a query is in the dictionary; if
  not, walk neighbors with edit-distance ≤ 1.
- **Longest prefix match.** Used heavily in IP routing and Bloom
  filter sharding. Walk until the trie has no further match.
- **Aho-Corasick.** Trie + failure links — find all occurrences of a
  set of patterns in a text in $O(\text{text} + \text{matches})$.
- **0/1 trie (binary trie).** Store integers bit-by-bit. Queries like
  "maximum XOR with a given value" become greedy walks.

## A Variant Worth Knowing: Binary Trie

For integers — usually 32-bit — insert each value as a 32-character
string of `0`s and `1`s, MSB first. Then:

- **Maximum XOR with a query $q$.** Walk the trie greedily,
  preferring the opposite bit of $q$ at each level — that bit
  contributes the most to the XOR. The walk is 32 steps.
- **Count integers ≤ $q$.** Walk; whenever the current bit of $q$ is
  `1`, count the subtree of the `0`-side. Sum the partial counts.

The binary trie subsumes many integer set operations into clean
$O(\log U)$ algorithms where $U$ is the universe size.

## Pitfalls

```viz
{ "type": "callout", "props": {
  "tone": "pitfall",
  "title": "Forgetting the end marker",
  "body": "Walking to the node for 'car' does not prove 'car' was inserted — maybe only 'card' was, and we passed through 'car' as a prefix. The end flag separates 'inserted word' from 'intermediate prefix'."
} }
```

```viz
{ "type": "callout", "props": {
  "tone": "pitfall",
  "title": "Memory for sparse alphabets",
  "body": "A 26-pointer array per node wastes memory when most slots are unused. For large alphabets (Unicode), use a hash map per node, or a sorted list of (char, child) pairs."
} }
```

```viz
{ "type": "callout", "props": {
  "tone": "pitfall",
  "title": "Deletion that does not prune",
  "body": "Marking the end flag false is correct for 'remove the word' but leaves dangling subtrees. To actually free memory, recurse on the way back up and prune any node with no children and no end flag."
} }
```

## Practice
- Implement a trie with insert, search, and starts_with.
- Word search II — given a board and a list of words, find all words
  on the board using a trie of the dictionary.
- Replace words — replace every word in a sentence with the shortest
  dictionary root that is a prefix of it.
- Maximum XOR of two integers in an array (binary trie).
- Implement an autocomplete that returns the top-3 most frequent
  completions of a prefix.
- Design and implement an LRU autocomplete cache: query, then move the
  matched word to the front of the freshness order.

## References
1. Sedgewick & Wayne. *Algorithms, 4th ed.*, Section 5.2.
2. Cormen, Leiserson, Rivest, Stein. *Introduction to Algorithms, 4th ed.*, Chapter 32.
3. cp-algorithms.com. "Aho-Corasick algorithm."
