const baseUrl = process.env.SMOKE_BASE_URL ?? "http://127.0.0.1:3000";

const checks: Array<{ name: string; path: string; init?: RequestInit; expected: number; marker?: string }> = [
  { name: "home page", path: "/", expected: 200, marker: "DSA" },
  { name: "learn index", path: "/learn", expected: 200, marker: "Learn" },
  { name: "Dijkstra article", path: "/learn/dijkstra", expected: 200, marker: "Dijkstra" },
  { name: "Dijkstra lazy-heap visualization article", path: "/learn/dijkstra", expected: 200, marker: "lazy" },
  { name: "missing article", path: "/learn/not-a-real-article", expected: 404, marker: "not found" },
  { name: "sitemap", path: "/sitemap.xml", expected: 200, marker: "dijkstra" },
  { name: "robots", path: "/robots.txt", expected: 200, marker: "Sitemap" },
  {
    name: "unauthenticated article progress",
    path: "/api/progress/article",
    init: { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ slug: "dijkstra" }) },
    expected: 401,
    marker: "ok",
  },
];

async function main() {
  let failures = 0;
  for (const check of checks) {
    const response = await fetch(new URL(check.path, baseUrl), check.init);
    const body = await response.text();
    const markerFound = !check.marker || body.toLowerCase().includes(check.marker.toLowerCase());
    const passed = response.status === check.expected && markerFound;
    console.log(`${passed ? "PASS" : "FAIL"} ${check.name}: ${response.status} ${check.path}${check.marker ? ` marker=${markerFound ? "found" : "missing"}` : ""}`);
    if (!passed) failures += 1;
  }

  if (failures > 0) {
    console.error(`${failures} production smoke check${failures === 1 ? "" : "s"} failed.`);
    process.exitCode = 1;
  } else {
    console.log(`Production smoke checks passed: ${checks.length}.`);
  }
}

void main();
