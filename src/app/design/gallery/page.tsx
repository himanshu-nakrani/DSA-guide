import { Viz } from "@/components/viz/Viz";
import { BFSHero } from "@/components/hero/BFSHero";
import { PageHeader, PageShell } from "@/components/layout/PageShell";

const VIZ_TYPES = [
  { id: "complexity-chart", title: "Complexity Chart", raw: '{"type":"complexity-chart"}' },
  { id: "growth-table", title: "Growth Table", raw: '{"type":"growth-table"}' },
  { id: "array-memory", title: "Array Memory Layout", raw: '{"type":"array-memory"}' },
  { id: "binary-search", title: "Binary Search", raw: '{"type":"binary-search"}' },
  { id: "binary-search-invariant", title: "Binary Search Invariant", raw: '{"type":"binary-search-invariant"}' },
  { id: "linear-vs-binary", title: "Linear vs Binary", raw: '{"type":"linear-vs-binary"}' },
  { id: "two-pointers", title: "Two Pointers", raw: '{"type":"two-pointers"}' },
  { id: "sliding-window", title: "Sliding Window", raw: '{"type":"sliding-window"}' },
  { id: "hash-table", title: "Hash Table", raw: '{"type":"hash-table"}' },
  { id: "linked-list", title: "Linked List", raw: '{"type":"linked-list"}' },
  { id: "stack-queue", title: "Stack and Queue", raw: '{"type":"stack-queue"}' },
  { id: "tree-traversal", title: "Tree Traversal", raw: '{"type":"tree-traversal"}' },
  { id: "graph-traversal", title: "Graph Traversal", raw: '{"type":"graph-traversal"}' },
  { id: "dp-grid", title: "Dynamic Programming Grid", raw: '{"type":"dp-grid"}' },
  { id: "dijkstra", title: "Dijkstra Algorithm", raw: '{"type":"dijkstra"}' },
  { id: "dijkstra-lazy-heap", title: "Dijkstra Lazy Heap Trace", raw: '{"type":"dijkstra-lazy-heap"}' },
  { id: "recursion-tree", title: "Recursion Tree", raw: '{"type":"recursion-tree"}' },
  { id: "architecture", title: "Architecture Diagram", raw: '{"type":"architecture","props":{"boxes":[{"id":"mem","label":"Memory Block","col":1,"row":1,"colSpan":6,"rowSpan":2}],"arrows":[]}}' },
  { id: "invariant-trace", title: "Invariant Trace", raw: '{"type":"invariant-trace"}' },
  { id: "knowledge-check", title: "Knowledge Check", raw: '{"type":"knowledge-check","props":{"question":"Which structure operates FIFO?","choices":[{"label":"Queue"},{"label":"Stack"}],"answer":0}}' },
  { id: "proof-builder", title: "Proof Builder", raw: '{"type":"proof-builder"}' },
  { id: "tree-dp", title: "Tree DP Explorer", raw: '{"type":"tree-dp"}' },
  { id: "dag-scheduler", title: "DAG Scheduler", raw: '{"type":"dag-scheduler"}' },
  { id: "bellman-ford-pass", title: "Bellman Ford Pass", raw: '{"type":"bellman-ford-pass"}' },
  { id: "dp-decision-trace", title: "DP Decision Trace", raw: '{"type":"dp-decision-trace"}' },
  { id: "edit-path-reconstructor", title: "Edit Path Reconstructor", raw: '{"type":"edit-path-reconstructor"}' },
  { id: "zero-one-deque", title: "0-1 Deque", raw: '{"type":"zero-one-deque"}' },
  { id: "unique-paths-grid", title: "Unique Paths Grid", raw: '{"type":"unique-paths-grid"}' },
  { id: "rolling-buffer-trace", title: "Rolling Buffer Trace", raw: '{"type":"rolling-buffer-trace"}' },
  { id: "rerooting-propagation", title: "Rerooting Propagation", raw: '{"type":"rerooting-propagation"}' },
  { id: "heap-operation-trace", title: "Heap Operation Trace", raw: '{"type":"heap-operation-trace"}' },
  { id: "dsu-forest-trace", title: "DSU Forest Trace", raw: '{"type":"dsu-forest-trace"}' },
  { id: "kruskal-mst-trace", title: "Kruskal MST Trace", raw: '{"type":"kruskal-mst-trace"}' },
  { id: "monotonic-deque-window", title: "Monotonic Deque Window", raw: '{"type":"monotonic-deque-window"}' },
  { id: "next-greater-stack", title: "Next Greater Stack Trace", raw: '{"type":"next-greater-stack"}' },
];

export default function VizGalleryPage() {
  return (
    <PageShell width="wide" className="space-y-12">
      <PageHeader
        eyebrow="Design System"
        title="Comprehensive Visualization Dark Gallery"
        lede="Inspection gallery for all 35 registered interactive algorithm visualizations plus the BFS graph hero."
      />

      <section className="space-y-10">
        <div id="viz-bfs-hero" className="surface-card p-6 space-y-3">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h2 className="text-lg font-semibold tracking-tight text-foreground">BFS Graph Hero</h2>
            <span className="text-caption font-mono text-muted-foreground">bfs-hero</span>
          </div>
          <div className="max-w-md mx-auto">
            <BFSHero />
          </div>
        </div>

        {VIZ_TYPES.map((v) => (
          <div key={v.id} id={`viz-${v.id}`} className="surface-card p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h2 className="text-lg font-semibold tracking-tight text-foreground">{v.title}</h2>
              <span className="text-caption font-mono text-muted-foreground">{v.id}</span>
            </div>
            <Viz raw={v.raw} />
          </div>
        ))}
      </section>
    </PageShell>
  );
}
