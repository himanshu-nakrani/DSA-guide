from datetime import datetime
import os

journal_path = '.jules/bolt.md'
entry = """
## {date} - Prevent Array Allocations in Map/Set Initialization
**Learning:** Initializing a `Set` or `Map` by passing an intermediate array via chained mapping (e.g., `new Set(data.map(item => item.slug))`) creates a redundant array allocation. Converting it back to an Array and creating yet another Set amplifies this memory waste.
**Action:** When extracting a unique list of items, instantiate an empty `Set` and populate it directly using a single-pass `for...of` loop with `.add()` before converting to an Array. This avoids all intermediate allocations.
"""

date_str = datetime.now().strftime("%Y-%m-%d")
with open(journal_path, 'a') as f:
    f.write(entry.format(date=date_str))

print("Journal updated.")
