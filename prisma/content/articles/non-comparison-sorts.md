---
slug: non-comparison-sorts
title: "Non-Comparison Sorts: Counting, Radix, and Bucket"
summary: "Three sorts that crack open the key to escape the Omega(n log n) lower bound — the assumptions they require, and the constant factors they pay."
topicSlug: sorting
level: INTERMEDIATE
order: 2
estimatedMins: 20
references:
  - { title: "Introduction to Algorithms, 4th ed., Ch. 8", author: "Cormen, Leiserson, Rivest, Stein", type: "book" }
  - { title: "Algorithms, 4th ed., Ch. 5", author: "Sedgewick & Wayne", type: "book" }
prerequisites: ["comparison-sorts"]
---

## Overview
The $\Omega(n \log n)$ lower bound applies to *comparison* sorts —
algorithms whose only access to elements is pairwise comparison. The
moment we look inside the key itself, the bound disappears. Counting
sort, radix sort, and bucket sort are the three classical
non-comparison sorts. Each pays for its linear running time with an
assumption about the keys that, when it holds, makes it the fastest
sort by a wide margin.

The lesson worth keeping is not "always reach for radix sort." It is
the opposite — *think about your keys before sorting them*. If they
are small integers, fixed-width strings, or floats in a known range,
the right sort is not the comparison sort your standard library ships
with.

## Counting Sort

Counting sort works when the keys are integers in a small known range
$[0, k)$. Build a histogram, then write each element back in sorted
order based on the histogram.

```python
def counting_sort(A, k):
    count = [0] * k
    for x in A:
        count[x] += 1
    out = []
    for v in range(k):
        out.extend([v] * count[v])
    return out
```

Time $\Theta(n + k)$; space $\Theta(n + k)$. When $k = O(n)$ this is
linear. When $k$ is much larger than $n$ (sorting an array of size 100
whose values are 64-bit integers), counting sort is wasteful.

A more careful implementation builds a *prefix-sum* of the histogram
and uses it to write elements into specific output slots, which
preserves stability and supports satellite data.

```python
def counting_sort_stable(A, key, k):
    count = [0] * (k + 1)
    for x in A:
        count[key(x) + 1] += 1
    for i in range(k):
        count[i + 1] += count[i]
    out = [None] * len(A)
    for x in A:                       # iterate in input order
        out[count[key(x)]] = x
        count[key(x)] += 1
    return out
```

This is what production radix sort uses as its inner pass.

```viz
{ "type": "callout", "props": {
  "tone": "intuition",
  "title": "What we exchanged",
  "body": "Counting sort never compares two elements. It reads each one, learns its key, and writes it. The price: extra memory proportional to the key range, and a fixed assumption that keys are small non-negative integers."
} }
```

## Radix Sort

Radix sort handles larger key ranges by sorting digit-by-digit. The
LSD (least-significant-digit) variant sorts by the lowest digit first,
then the next, and so on, using a stable inner sort at each pass. After
$d$ passes the array is sorted by all $d$ digits.

If digits are base $b$ and keys have $d$ digits, each pass is a
$\Theta(n + b)$ counting sort. Total: $\Theta(d \cdot (n + b))$.

For 32-bit integers with $b = 256$, $d = 4$, this is $4(n + 256)$ —
truly linear in $n$ once $n$ exceeds a few thousand.

```python
def radix_sort_lsd(A, num_digits, base=256):
    for d in range(num_digits):
        A = counting_sort_stable(A, key=lambda x: (x >> (8 * d)) & 0xff, k=base)
    return A
```

Stability of the inner counting sort is non-negotiable. Without it,
sorting by a higher digit destroys the order already established by
lower digits.

```viz
{ "type": "architecture", "props": {
  "caption": "LSD radix sort — three passes for a base-10 example",
  "cols": 12, "rows": 4, "height": 280,
  "boxes": [
    { "id": "in",   "label": "input", "sub": "329 457 657 839 436 720 355", "col": 0, "row": 0, "colSpan": 12 },
    { "id": "p1",   "label": "pass 1 (ones)", "sub": "720 355 436 457 657 329 839", "col": 0, "row": 1, "colSpan": 12, "emphasis": "primary" },
    { "id": "p2",   "label": "pass 2 (tens)", "sub": "720 329 436 839 355 457 657", "col": 0, "row": 2, "colSpan": 12, "emphasis": "primary" },
    { "id": "p3",   "label": "pass 3 (hundreds)", "sub": "329 355 436 457 657 720 839", "col": 0, "row": 3, "colSpan": 12, "emphasis": "primary" }
  ]
} }
```

The MSD variant is the symmetric option — sort by the highest digit
first, recurse on each bucket. It is the natural fit for strings of
variable length (top-down lexicographic sort).

## Bucket Sort

Bucket sort works when keys are *uniformly distributed* in some
interval. Partition the interval into $n$ buckets, drop each element
into its bucket, sort each bucket with an arbitrary sort, then
concatenate.

When the distribution is genuinely uniform, the expected size of any
single bucket is $O(1)$, so the per-bucket sort is constant work and
the total is $\Theta(n)$.

```python
def bucket_sort(A, lo, hi):
    n = len(A)
    buckets = [[] for _ in range(n)]
    span = (hi - lo) / n
    for x in A:
        buckets[min(int((x - lo) / span), n - 1)].append(x)
    for b in buckets:
        b.sort()    # or insertion sort
    return [x for b in buckets for x in b]
```

If the assumption is wrong — keys cluster, or the distribution is
skewed — one bucket can hold all of them and the cost degrades to the
inner sort's complexity. Bucket sort is fragile in a way counting and
radix are not.

## Comparison Across Tradeoffs

| Sort       | Time           | Aux space    | Assumption                          | Stable | In place |
| ---------- | -------------- | ------------ | ----------------------------------- | ------ | -------- |
| Counting   | $n + k$        | $n + k$      | integer keys in $[0, k)$            | yes    | no       |
| Radix LSD  | $d(n + b)$     | $n + b$      | $d$-digit keys, stable inner sort   | yes    | no       |
| Bucket     | $n$ expected   | $n$          | uniform distribution in known range | (depends) | no    |
| Quicksort  | $n \log n$     | $\log n$     | none (comparison)                   | no     | yes      |

When the assumption holds, the non-comparison sorts are dramatically
faster — *and* they sidestep the $\Omega(n \log n)$ lower bound because
they were never restricted to comparisons in the first place.

```viz
{ "type": "complexity-chart", "props": { "maxN": 256, "curves": ["n", "nlogn", "n2"] } }
```

The gap between $O(n)$ and $O(n \log n)$ is small at low $n$, growing
modestly. The interesting thing about the non-comparison sorts is not
the asymptotic gap — it is the absence of a lower bound that prevents
further improvement.

## Where They Are Used in Practice

- **Radix sort on integer keys**: many database indexers, some
  in-memory column stores, and (in carefully tuned form) the
  fastest published integer sorts.
- **Counting sort as a building block**: inside suffix-array
  construction (DC3 algorithm), bucketing in radix sort, and
  histogram-based image processing.
- **Bucket sort for floating-point**: when the input is known uniform
  (e.g., random samples on $[0, 1)$). The Java `DoubleStream.sorted` is
  *not* bucket sort — uniform-distribution assumptions are too brittle
  for a general-purpose API.

## Pitfalls

```viz
{ "type": "callout", "props": {
  "tone": "pitfall",
  "title": "Mind the key range",
  "body": "Counting sort with k = 10^9 on n = 100 inputs allocates a billion-entry array. The k in O(n + k) is real memory, not an asymptotic flourish. Check that k is comparable to n before using counting sort."
} }
```

```viz
{ "type": "callout", "props": {
  "tone": "pitfall",
  "title": "Radix sort needs a stable inner pass",
  "body": "If you accidentally use an unstable inner sort, the result is wrong — sorting by tens destroys the ones ordering. Always use stable counting sort inside radix."
} }
```

```viz
{ "type": "callout", "props": {
  "tone": "pitfall",
  "title": "Bucket sort assumes uniformity",
  "body": "On adversarial or skewed inputs, all elements land in one bucket and the running time is whatever the inner sort guarantees — usually O(n²) for insertion sort. Use comparison sort unless you can demonstrate the uniform assumption."
} }
```

## Practice
- Implement stable counting sort with an explicit key function.
- Sort 10⁶ 32-bit integers with LSD radix sort, base 256.
- Sort an array of strings of equal length using MSD radix sort.
- Sort an array of floating-point numbers uniformly distributed on
  $[0, 1)$ using bucket sort.
- Time-budget exercise: which sort would you use to sort 10⁹ 64-bit
  integers on a single machine with 8 GB of RAM? Justify.

## References
1. Cormen, Leiserson, Rivest, Stein. *Introduction to Algorithms, 4th ed.*, Chapter 8.
2. Sedgewick & Wayne. *Algorithms, 4th ed.*, Chapter 5.
