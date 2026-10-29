1. **Optimize `DAGScheduler.tsx`:** Precompute a `NodeId -> Node` map (e.g., `nodeById`) to replace the `O(N)` `.find()` calls inside the `edges.map` render loop.
2. **Optimize `ZeroOneDeque.tsx`:** Precompute a `NodeId -> Node` map (e.g., `nodeById`) to replace the `O(N)` `.find()` calls inside the `edges.map` render loop.
3. **Optimize `BellmanFordPass.tsx`:** Precompute a `NodeId -> Node` map (e.g., `nodeById`) to replace the `O(N)` `.find()` calls inside the `edges.map` render loop.
4. **Update Journal:** Add an entry in `.jules/bolt.md` documenting this performance pattern (avoiding `.find()` in render loops by using precomputed Maps for O(1) lookups).
5. **Complete pre-commit steps to ensure proper testing, verification, review, and reflection are done.**
