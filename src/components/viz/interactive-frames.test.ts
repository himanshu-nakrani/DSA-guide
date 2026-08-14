import { describe, expect, it } from "vitest";
import { advanceDAGState, buildInitialState } from "./DAGScheduler";
import { simulateBellmanFord, type BellmanFordEdge } from "./BellmanFordPass";
import { buildDPDecisionFrames } from "./DPDecisionTrace";

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
