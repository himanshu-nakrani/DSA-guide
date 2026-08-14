import { describe, expect, it } from "vitest";
import { advanceDAGState, buildInitialState } from "./DAGScheduler";
import { simulateBellmanFord, type BellmanFordEdge } from "./BellmanFordPass";
import { buildDPDecisionFrames } from "./DPDecisionTrace";
import { buildEditPathFrames } from "./EditPathReconstructor";
import { buildZeroOneDequeFrames } from "./ZeroOneDeque";
import { buildUniquePathsFrames } from "./UniquePathsGrid";
import { buildRollingBufferFrames } from "./RollingBufferTrace";
import { buildRerootingFrames } from "./RerootingPropagation";

describe("DAG Scheduler frame transitions", () => {
  const edges = [
    { from: "A", to: "C" },
    { from: "B", to: "C" },
    { from: "C", to: "D" },
    { from: "C", to: "E" },
  ] as const;

  it("updates the frontier as prerequisites are removed", () => {
    let state = buildInitialState([...edges]);
    expect(state.queue).toEqual(["A", "B"]);
    state = advanceDAGState(state, [...edges], "A");
    expect(state.queue).toEqual(["B"]);
    expect(state.inDegree.C).toBe(1);
    state = advanceDAGState(state, [...edges], "B");
    expect(state.queue).toEqual(["C"]);
    expect(state.inDegree.C).toBe(0);
  });

  it("reports a cycle when the queue empties before all vertices are processed", () => {
    const cycleEdges = [...edges, { from: "E", to: "B" }] as const;
    let state = buildInitialState([...cycleEdges]);
    expect(state.queue).toEqual(["A"]);
    state = advanceDAGState(state, [...cycleEdges], "A");
    expect(state.status).toBe("cycle");
    expect(state.processed).toEqual(["A"]);
  });
});

describe("Bellman–Ford frame generation", () => {
  it("stabilizes after accepting a negative edge", () => {
    const edges: BellmanFordEdge[] = [
      { from: "A", to: "B", weight: 4 },
      { from: "A", to: "C", weight: 5 },
      { from: "B", to: "C", weight: -3 },
      { from: "C", to: "D", weight: 4 },
      { from: "B", to: "D", weight: 7 },
    ];
    const frames = simulateBellmanFord(edges);
    expect(frames.some((frame) => frame.updated && frame.edge?.weight === -3)).toBe(true);
    expect(frames.at(-1)?.status).toBe("complete");
    expect(frames.at(-1)?.dist.D).toBe(5);
  });

  it("flags a reachable negative cycle during the detection pass", () => {
    const edges: BellmanFordEdge[] = [
      { from: "A", to: "B", weight: 4 },
      { from: "A", to: "C", weight: 5 },
      { from: "B", to: "C", weight: -3 },
      { from: "C", to: "D", weight: 4 },
      { from: "D", to: "B", weight: -6 },
    ];
    const frames = simulateBellmanFord(edges);
    expect(frames.some((frame) => frame.status === "negative-cycle")).toBe(true);
  });
});

describe("Edit-distance path reconstruction", () => {
  it("recovers an optimal operation path from the completed table", () => {
    const frames = buildEditPathFrames("kitten", "sitting");
    const finalFrame = frames.at(-1);
    expect(finalFrame?.distance).toBe(3);
    expect(finalFrame?.current).toEqual({ i: 0, j: 0 });
    expect(finalFrame?.operations.map((operation) => operation.kind)).toEqual([
      "replace",
      "match",
      "match",
      "match",
      "replace",
      "match",
      "insert",
    ]);
    expect(finalFrame?.operations.filter((operation) => operation.kind !== "match")).toHaveLength(3);
  });

  it("handles empty-prefix insertion while walking to the origin", () => {
    const finalFrame = buildEditPathFrames("", "abc").at(-1);
    expect(finalFrame?.distance).toBe(3);
    expect(finalFrame?.operations.map((operation) => operation.kind)).toEqual(["insert", "insert", "insert"]);
    expect(finalFrame?.operations.map((operation) => operation.target)).toEqual(["a", "b", "c"]);
  });
});

describe("0–1 BFS deque frames", () => {
  it("puts weight-1 work at the back and weight-0 work at the front", () => {
    const frames = buildZeroOneDequeFrames([
      { from: "A", to: "B", weight: 1 },
      { from: "A", to: "C", weight: 0 },
    ]);
    const weightOne = frames.find((frame) => frame.edge?.to === "B");
    const weightZero = frames.find((frame) => frame.edge?.to === "C");
    expect(weightOne?.correctAction).toBe("back");
    expect(weightZero?.correctAction).toBe("front");
    expect(weightZero?.nextDeque).toEqual([
      { id: "C", distance: 0 },
      { id: "B", distance: 1 },
    ]);
  });

  it("completes valid inputs and rejects a weight-2 edge", () => {
    const validFrames = buildZeroOneDequeFrames([
      { from: "A", to: "B", weight: 1 },
      { from: "A", to: "C", weight: 0 },
      { from: "C", to: "D", weight: 1 },
    ]);
    expect(validFrames.at(-1)?.status).toBe("complete");
    expect(validFrames.at(-1)?.dist.D).toBe(1);

    const invalidFrames = buildZeroOneDequeFrames([
      { from: "A", to: "B", weight: 2 },
    ]);
    expect(invalidFrames.at(-1)?.status).toBe("invalid");
    expect(invalidFrames.at(-1)?.correctAction).toBe("invalid");
  });
});

describe("Priority 2 DP frame generation", () => {
  it("counts paths while treating obstacle cells as zero", () => {
    const frames = buildUniquePathsFrames(["1,2", "2,2"]);
    expect(frames.find((frame) => frame.current?.row === 1 && frame.current.col === 2)?.status).toBe("obstacle");
    expect(frames.at(-1)?.answer).toBe(8);
    expect(buildUniquePathsFrames([]).at(-1)?.answer).toBe(35);
  });

  it("preserves 0/1 knapsack semantics backward and exposes forward reuse", () => {
    const backward = buildRollingBufferFrames("backward");
    const forward = buildRollingBufferFrames("forward");
    expect(backward.at(-1)?.dp[6]).toBe(8);
    expect(backward.some((frame) => frame.reusesCurrentItem)).toBe(false);
    expect(forward.some((frame) => frame.reusesCurrentItem)).toBe(true);
    expect(forward.at(-1)?.dp[6]).toBe(9);
  });

  it("propagates every-root distance sums from one root answer", () => {
    const finalFrame = buildRerootingFrames().at(-1);
    expect(finalFrame?.answers).toEqual({ A: 6, B: 7, C: 7, D: 10, E: 10 });
    expect(finalFrame?.phase).toBe("complete");
  });
});

describe("1D DP decision frames", () => {
  it("selects the optimal include-or-skip branches for House Robber", () => {
    const frames = buildDPDecisionFrames("house-robber", [2, 7, 9, 3, 1]);
    expect(frames.map((frame) => frame.selected)).toEqual(["include", "include", "include", "skip", "include"]);
    expect(frames.at(-1)?.answer).toBe(12);
  });

  it("exposes restart and extend decisions for Kadane", () => {
    const frames = buildDPDecisionFrames("kadane", [-2, 1, -3, 4, -1, 2, 1, -5, 4]);
    expect(frames[3].selected).toBe("restart");
    expect(frames.at(-1)?.selected).toBe("extend");
    expect(frames.at(-1)?.answer).toBe(5);
  });
});
