---
slug: trie-fundamentals
title: Trie Fundamentals
summary: A tree where each path spells a string — fast prefix queries and autocomplete in O(length), not O(length × n).
topicSlug: tries
level: INTERMEDIATE
order: 1
estimatedMins: 15
references:
  - { title: "Algorithms, 4th ed., Ch. 5.2 (Tries)", author: "Sedgewick & Wayne", type: "book" }
  - { title: "Trie (Prefix Tree)", url: "https://cp-algorithms.com/string/aho_corasick.html", type: "web" }
prerequisites: ["string-manipulation"]
---

## Overview
A trie (pronounced "try", from re*trie*val) is a tree where each edge is labeled by a character. The path from the root to a node spells a string. Tries answer "does this prefix exist?" or "how many strings start with $P$?" in time proportional to the length of $P$, regardless of how many strings are stored.

## Prerequisites
- String Manipulation

## Core Idea
Hash maps support full-string lookup in expected $O(|s|)$ but cannot answer prefix queries efficiently. A trie shares all common prefixes among stored strings, making prefix queries native and storage subadditive when strings share prefixes.

## Mechanics

**Node**:
```text
struct TrieNode:
    children: map<char, TrieNode>     # or fixed-size array if alphabet is small
    is_end_of_word: bool              # marks a stored string ending here
```

**Insert(word)**:
```text
node = root
for c in word:
    if c not in node.children:
        node.children[c] = TrieNode()
    node = node.children[c]
node.is_end_of_word = true
```

**Search(word)**: walk by character; return true iff you can follow the whole word and the final node has `is_end_of_word` set.

**Starts-with(prefix)**: same walk; return true iff you can follow the whole prefix.

**Delete(word)**: walk and mark the leaf as not-end-of-word; optionally trim empty subtrees on the way back up.

## Complexity
- Insert / search / starts-with: $O(|s|)$ regardless of the number of stored strings.
- Space: $O(\text{total characters across all strings})$ in the worst case. With shared prefixes, less.
- Memory overhead per node depends on the children container — a fixed 26-entry array per node uses a lot of memory for sparse tries; a hash map saves memory at the cost of constant-factor speed.

## Common Patterns
1. **Autocomplete / type-ahead**: walk to the prefix, DFS the subtree to enumerate completions.
2. **Word search in a grid**: build a trie of the dictionary; DFS the grid while walking the trie. Prune as soon as the current grid cell isn't in the current node's children.
3. **Longest common prefix of a set of strings**: build a trie, walk while exactly one child exists.
4. **XOR-maximizing query**: binary trie over integer bits. For each query value, walk to maximize XOR.
5. **Aho-Corasick** (Tier 2): trie plus failure links for multi-pattern matching in linear time.

## Pitfalls
- **Wasteful memory** when storing few long strings with little overlap. A hash set may be smaller.
- **Forgetting `is_end_of_word`**. Without it, "car" and "carpet" are indistinguishable from each other or from any prefix walk.
- **Case sensitivity / Unicode**. Decide whether to normalize keys before insertion; mixing cases or encodings produces duplicate nodes.
- **Comparing trie depth to BST depth**. A trie's depth equals the longest stored string's length — independent of the number of strings.

## Practice
- Implement Trie (Insert / Search / StartsWith).
- Replace Words.
- Word Search II.
- Maximum XOR of Two Numbers in an Array.

## References
1. Sedgewick & Wayne. *Algorithms, 4th ed.*, Chapter 5.2.
2. cp-algorithms.com. "String Algorithms".
