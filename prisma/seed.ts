import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import fs from "fs";
import path from "path";
import matter from "gray-matter";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

type ModuleSpec = {
  slug: string;
  name: string;
  description: string;
  order: number;
  topics: { slug: string; name: string; description: string; order: number }[];
};

const TRACK = {
  slug: "a2z-dsa-roadmap",
  name: "A2Z DSA Roadmap",
  description: "A structured path from basics to advanced DSA.",
};

const MODULES: ModuleSpec[] = [
  {
    slug: "complexity-and-analysis",
    name: "Complexity & Analysis",
    description: "Reason about algorithm performance independently of hardware.",
    order: 1,
    topics: [
      { slug: "complexity-analysis", name: "Complexity Analysis", description: "Asymptotic and amortized analysis.", order: 1 },
    ],
  },
  {
    slug: "arrays-and-strings",
    name: "Arrays & Strings",
    description: "The two most common containers in interviews.",
    order: 2,
    topics: [
      { slug: "arrays-and-strings", name: "Arrays and Strings", description: "Fundamentals, manipulation, and the two-pointer pattern.", order: 1 },
    ],
  },
  {
    slug: "hashing",
    name: "Hashing",
    description: "Constant-time lookups, and what can go wrong.",
    order: 3,
    topics: [
      { slug: "hashing", name: "Hashing", description: "Hash tables, collisions, and load factor.", order: 1 },
    ],
  },
  {
    slug: "prefix-sums-and-sliding-window",
    name: "Prefix Sums & Sliding Window",
    description: "Range queries and contiguous-subarray patterns.",
    order: 4,
    topics: [
      { slug: "prefix-sums-and-sliding-window", name: "Prefix Sums and Sliding Window", description: "Two of the most reused array techniques.", order: 1 },
    ],
  },
  {
    slug: "binary-search",
    name: "Binary Search",
    description: "Search sorted arrays and monotonic answer spaces.",
    order: 5,
    topics: [
      { slug: "binary-search", name: "Binary Search", description: "Search sorted arrays and binary-search the answer.", order: 1 },
    ],
  },
  {
    slug: "sorting",
    name: "Sorting",
    description: "The classical sorting toolkit.",
    order: 6,
    topics: [
      { slug: "sorting", name: "Sorting", description: "Comparison-based and non-comparison-based sorts.", order: 1 },
    ],
  },
  {
    slug: "linked-lists",
    name: "Linked Lists",
    description: "Singly, doubly, and the recurring patterns.",
    order: 7,
    topics: [
      { slug: "linked-lists", name: "Linked Lists", description: "Fundamentals and common patterns.", order: 1 },
    ],
  },
  {
    slug: "stacks-and-queues",
    name: "Stacks & Queues",
    description: "LIFO, FIFO, and the monotonic variants.",
    order: 8,
    topics: [
      { slug: "stacks-and-queues", name: "Stacks and Queues", description: "Fundamentals and monotonic variants.", order: 1 },
    ],
  },
  {
    slug: "recursion-and-backtracking",
    name: "Recursion & Backtracking",
    description: "Two ideas that unlock most non-trivial problems.",
    order: 9,
    topics: [
      { slug: "recursion-and-backtracking", name: "Recursion and Backtracking", description: "Recursive thinking and the backtracking template.", order: 1 },
    ],
  },
  {
    slug: "trees",
    name: "Trees",
    description: "Binary trees, BSTs, and heaps.",
    order: 10,
    topics: [
      { slug: "trees", name: "Trees", description: "Traversals, binary search trees, and heaps.", order: 1 },
    ],
  },
  {
    slug: "tries",
    name: "Tries",
    description: "Prefix trees for string sets.",
    order: 11,
    topics: [
      { slug: "tries", name: "Tries", description: "Prefix trees and their applications.", order: 1 },
    ],
  },
  {
    slug: "disjoint-set-union",
    name: "Disjoint Set Union",
    description: "Union-Find: the workhorse for connectivity problems.",
    order: 12,
    topics: [
      { slug: "disjoint-set-union", name: "Disjoint Set Union", description: "Union-Find with path compression and union by rank.", order: 1 },
    ],
  },
  {
    slug: "graph-fundamentals",
    name: "Graph Fundamentals",
    description: "Representations, traversals, and topological order.",
    order: 13,
    topics: [
      { slug: "graph-fundamentals", name: "Graph Fundamentals", description: "Representations, BFS, DFS, and topological sort.", order: 1 },
    ],
  },
  {
    slug: "shortest-paths",
    name: "Shortest Paths",
    description: "Dijkstra, Bellman-Ford, and 0-1 BFS.",
    order: 14,
    topics: [
      { slug: "shortest-paths", name: "Shortest Paths", description: "Single-source shortest path algorithms.", order: 1 },
    ],
  },
  {
    slug: "dynamic-programming-i",
    name: "Dynamic Programming I",
    description: "The introductory tier of DP.",
    order: 15,
    topics: [
      { slug: "dynamic-programming-i", name: "Dynamic Programming I", description: "Memoization, tabulation, 1D and 2D patterns.", order: 1 },
    ],
  },
  {
    slug: "greedy",
    name: "Greedy",
    description: "Greedy intuition and when it provably works.",
    order: 16,
    topics: [
      { slug: "greedy", name: "Greedy", description: "Greedy intuition and exchange arguments.", order: 1 },
    ],
  },
];

const PROBLEM_TOPIC_BY_SLUG: Record<string, string> = {
  "two-sum": "arrays-and-strings",
  "best-time-to-buy-and-sell-stock": "arrays-and-strings",
  "maximum-subarray": "arrays-and-strings",
  "move-zeroes": "arrays-and-strings",
  "merge-sorted-array": "arrays-and-strings",
  "contains-duplicate": "hashing",
  "valid-anagram": "hashing",
  "longest-substring-without-repeating-characters": "prefix-sums-and-sliding-window",
  "maximum-average-subarray-i": "prefix-sums-and-sliding-window",
  "binary-search": "binary-search",
  "search-insert-position": "binary-search",
  "first-bad-version": "binary-search",
  "reverse-linked-list": "linked-lists",
  "merge-two-sorted-lists": "linked-lists",
  "valid-parentheses": "stacks-and-queues",
  "min-stack": "stacks-and-queues",
  "daily-temperatures": "stacks-and-queues",
  "subsets": "recursion-and-backtracking",
  "permutations": "recursion-and-backtracking",
  "invert-binary-tree": "trees",
  "maximum-depth-of-binary-tree": "trees",
  "implement-trie-prefix-tree": "tries",
  "number-of-islands": "graph-fundamentals",
  "flood-fill": "graph-fundamentals",
  "climbing-stairs": "dynamic-programming-i",
  "house-robber": "dynamic-programming-i",
  "coin-change": "dynamic-programming-i",
  "maximum-subarray-greedy": "greedy",
};

async function seedTaxonomy() {
  const track = await prisma.track.upsert({
    where: { slug: TRACK.slug },
    update: { name: TRACK.name, description: TRACK.description },
    create: TRACK,
  });

  const moduleSlugs = MODULES.map((m) => m.slug);
  const topicSlugs = MODULES.flatMap((m) => m.topics.map((t) => t.slug));

  for (const mod of MODULES) {
    const dbModule = await prisma.module.upsert({
      where: { slug: mod.slug },
      update: { name: mod.name, description: mod.description, order: mod.order, trackId: track.id },
      create: {
        slug: mod.slug,
        name: mod.name,
        description: mod.description,
        order: mod.order,
        trackId: track.id,
      },
    });

    for (const topic of mod.topics) {
      await prisma.topic.upsert({
        where: { slug: topic.slug },
        update: {
          name: topic.name,
          description: topic.description,
          order: topic.order,
          moduleId: dbModule.id,
        },
        create: {
          slug: topic.slug,
          name: topic.name,
          description: topic.description,
          order: topic.order,
          moduleId: dbModule.id,
        },
      });
    }
  }

  // Remove any stale topics or modules from previous seed runs.
  // Cascades will drop the legacy ProblemTopic / Article rows for those topics,
  // but we re-seed problems and articles below, so this is safe.
  const orphanedTopics = await prisma.topic.findMany({
    where: { slug: { notIn: topicSlugs } },
    select: { id: true, slug: true },
  });
  if (orphanedTopics.length > 0) {
    await prisma.topic.deleteMany({ where: { id: { in: orphanedTopics.map((t) => t.id) } } });
  }

  const orphanedModules = await prisma.module.findMany({
    where: { slug: { notIn: moduleSlugs } },
    select: { id: true, slug: true },
  });
  if (orphanedModules.length > 0) {
    await prisma.module.deleteMany({ where: { id: { in: orphanedModules.map((m) => m.id) } } });
  }
}

type SeedDifficulty = "EASY" | "MEDIUM" | "HARD";

function leetCodeProblem({
  slug,
  title,
  difficulty,
  statement,
}: {
  slug: string;
  title: string;
  difficulty: SeedDifficulty;
  statement: string;
}) {
  return {
    slug,
    title,
    difficulty,
    statementMd: `${statement}\n\nOpen the linked LeetCode problem to solve and submit the full challenge.`,
    examplesJson: [
      {
        input: "See LeetCode examples",
        output: "See LeetCode expected output",
      },
    ],
    starterCodeJson: {
      PYTHON: "# Use the starter template on LeetCode for this problem.",
      CPP: "// Use the starter template on LeetCode for this problem.",
      JAVA: "// Use the starter template on LeetCode for this problem.",
      JAVASCRIPT: "// Use the starter template on LeetCode for this problem.",
    },
    testCases: [
      {
        input: "External judge",
        output: "Submit on LeetCode",
        isHidden: false,
        order: 1,
      },
    ],
    hints: [
      "Read the linked problem carefully and identify the core pattern before coding.",
      "After solving externally, come back here and mark your status manually.",
    ],
    editorial: {
      intuitionMd: "This item is currently tracked as external practice. Use the linked LeetCode statement, then record your progress in DSA Guide.",
      optimizedMd: "Solve on LeetCode using the pattern from the associated module. DSA Guide stores your progress and saved-list state for revision.",
      complexityMd: "See the LeetCode editorial or your own accepted solution analysis.",
    },
  };
}

async function seedProblems() {
  const problems = [
    {
      slug: "two-sum",
      title: "Two Sum",
      difficulty: "EASY" as const,
      statementMd:
        "Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.\n\nYou may assume that each input would have **exactly one solution**, and you may not use the same element twice.",
      examplesJson: [
        { input: "nums = [2,7,11,15], target = 9", output: "[0,1]", explanation: "Because nums[0] + nums[1] == 9, we return [0, 1]." },
        { input: "nums = [3,2,4], target = 6", output: "[1,2]" },
      ],
      starterCodeJson: {
        PYTHON: "class Solution:\n    def twoSum(self, nums: list[int], target: int) -> list[int]:\n        pass",
        CPP: "class Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        \n    }\n};",
        JAVA: "class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        \n    }\n}",
        JAVASCRIPT: "/**\n * @param {number[]} nums\n * @param {number} target\n * @return {number[]}\n */\nvar twoSum = function(nums, target) {\n    \n};",
      },
      testCases: [
        { input: "[2,7,11,15]\n9", output: "[0,1]", isHidden: false, order: 1 },
        { input: "[3,2,4]\n6", output: "[1,2]", isHidden: false, order: 2 },
        { input: "[3,3]\n6", output: "[0,1]", isHidden: true, order: 3 },
      ],
      hints: [
        "A really brute force way would be to search for all possible pairs of numbers but that would be too slow.",
        "Try to use the fact that we are looking for a pair of numbers that add up to the target.",
        "What if we could store the numbers we've seen so far in a hash map?",
      ],
      editorial: {
        intuitionMd: "We can use a hash map to store the numbers we've seen so far and their indices.",
        optimizedMd: "Iterate through the array. For each number, check if `target - num` exists in the hash map. If it does, we found our pair. Otherwise, add the current number and its index to the hash map.",
        complexityMd: "Time: O(n), Space: O(n)",
      },
    },
    {
      slug: "binary-search",
      title: "Binary Search",
      difficulty: "EASY" as const,
      statementMd:
        "Given an array of integers `nums` which is sorted in ascending order, and an integer `target`, write a function to search `target` in `nums`. If `target` exists, then return its index. Otherwise, return `-1`.",
      examplesJson: [
        { input: "nums = [-1,0,3,5,9,12], target = 9", output: "4", explanation: "9 exists in nums and its index is 4." },
      ],
      starterCodeJson: {
        PYTHON: "class Solution:\n    def search(self, nums: list[int], target: int) -> int:\n        pass",
        CPP: "class Solution {\npublic:\n    int search(vector<int>& nums, int target) {\n        \n    }\n};",
        JAVA: "class Solution {\n    public int search(int[] nums, int target) {\n        \n    }\n}",
        JAVASCRIPT: "/**\n * @param {number[]} nums\n * @param {number} target\n * @return {number}\n */\nvar search = function(nums, target) {\n    \n};",
      },
      testCases: [
        { input: "[-1,0,3,5,9,12]\n9", output: "4", isHidden: false, order: 1 },
        { input: "[-1,0,3,5,9,12]\n2", output: "-1", isHidden: false, order: 2 },
      ],
      hints: [
        "Binary search is an efficient algorithm for finding an item from a sorted list of items.",
        "Maintain two pointers, `left` and `right`, to represent the current search space.",
      ],
      editorial: {
        intuitionMd: "Since the array is sorted, we can eliminate half of the search space in each step by comparing the target with the middle element.",
        optimizedMd: "Initialize `left = 0` and `right = nums.length - 1`. While `left <= right`, calculate `mid = left + (right - left) / 2`. If `nums[mid] == target`, return `mid`. If `nums[mid] < target`, search the right half (`left = mid + 1`). Otherwise, search the left half (`right = mid - 1`).",
        complexityMd: "Time: O(log n), Space: O(1)",
      },
    },
    {
      slug: "valid-parentheses",
      title: "Valid Parentheses",
      difficulty: "EASY" as const,
      statementMd:
        "Given a string `s` containing just the characters `'('`, `')'`, `'{'`, `'}'`, `'['` and `']'`, determine if the input string is valid.\n\nAn input string is valid if:\n1. Open brackets must be closed by the same type of brackets.\n2. Open brackets must be closed in the correct order.\n3. Every close bracket has a corresponding open bracket of the same type.",
      examplesJson: [
        { input: 's = "()"', output: "true" },
        { input: 's = "()[]{}"', output: "true" },
        { input: 's = "(]"', output: "false" },
      ],
      starterCodeJson: {
        PYTHON: "class Solution:\n    def isValid(self, s: str) -> bool:\n        pass",
        CPP: "class Solution {\npublic:\n    bool isValid(string s) {\n        \n    }\n};",
        JAVA: "class Solution {\n    public boolean isValid(String s) {\n        \n    }\n}",
        JAVASCRIPT: "/**\n * @param {string} s\n * @return {boolean}\n */\nvar isValid = function(s) {\n    \n};",
      },
      testCases: [
        { input: '"()"', output: "true", isHidden: false, order: 1 },
        { input: '"()[]{}"', output: "true", isHidden: false, order: 2 },
        { input: '"(]"', output: "false", isHidden: false, order: 3 },
        { input: '"([)]"', output: "false", isHidden: true, order: 4 },
      ],
      hints: [
        "Use a stack to keep track of the open brackets.",
        "When you see a closing bracket, check if it matches the top of the stack.",
      ],
      editorial: {
        intuitionMd: "A stack is the perfect data structure for this problem because it follows the Last-In-First-Out (LIFO) principle, which matches the requirement that the most recently opened bracket must be closed first.",
        optimizedMd: "Iterate through the string. If the character is an opening bracket, push it onto the stack. If it's a closing bracket, check if the stack is empty or if the top of the stack doesn't match the corresponding opening bracket. If either is true, return false. Otherwise, pop the stack. At the end, return true if the stack is empty.",
        complexityMd: "Time: O(n), Space: O(n)",
      },
    },
    leetCodeProblem({
      slug: "best-time-to-buy-and-sell-stock",
      title: "Best Time to Buy and Sell Stock",
      difficulty: "EASY",
      statement: "Track the best single buy/sell transaction in one pass.",
    }),
    leetCodeProblem({
      slug: "maximum-subarray",
      title: "Maximum Subarray",
      difficulty: "MEDIUM",
      statement: "Find the contiguous subarray with the largest sum.",
    }),
    leetCodeProblem({
      slug: "move-zeroes",
      title: "Move Zeroes",
      difficulty: "EASY",
      statement: "Move all zeroes to the end while preserving non-zero order.",
    }),
    leetCodeProblem({
      slug: "merge-sorted-array",
      title: "Merge Sorted Array",
      difficulty: "EASY",
      statement: "Merge two sorted arrays into the first array in nondecreasing order.",
    }),
    leetCodeProblem({
      slug: "contains-duplicate",
      title: "Contains Duplicate",
      difficulty: "EASY",
      statement: "Detect whether any value appears at least twice.",
    }),
    leetCodeProblem({
      slug: "valid-anagram",
      title: "Valid Anagram",
      difficulty: "EASY",
      statement: "Decide whether two strings contain the same character counts.",
    }),
    leetCodeProblem({
      slug: "longest-substring-without-repeating-characters",
      title: "Longest Substring Without Repeating Characters",
      difficulty: "MEDIUM",
      statement: "Use a sliding window to find the longest substring with all unique characters.",
    }),
    leetCodeProblem({
      slug: "maximum-average-subarray-i",
      title: "Maximum Average Subarray I",
      difficulty: "EASY",
      statement: "Find the maximum average over every fixed-size window.",
    }),
    leetCodeProblem({
      slug: "search-insert-position",
      title: "Search Insert Position",
      difficulty: "EASY",
      statement: "Return the target index or the position where it should be inserted.",
    }),
    leetCodeProblem({
      slug: "first-bad-version",
      title: "First Bad Version",
      difficulty: "EASY",
      statement: "Binary search the first failing version in a monotonic sequence.",
    }),
    leetCodeProblem({
      slug: "reverse-linked-list",
      title: "Reverse Linked List",
      difficulty: "EASY",
      statement: "Reverse a singly linked list by rewiring next pointers.",
    }),
    leetCodeProblem({
      slug: "merge-two-sorted-lists",
      title: "Merge Two Sorted Lists",
      difficulty: "EASY",
      statement: "Merge two sorted linked lists into one sorted list.",
    }),
    leetCodeProblem({
      slug: "min-stack",
      title: "Min Stack",
      difficulty: "MEDIUM",
      statement: "Design a stack that can return the current minimum in constant time.",
    }),
    leetCodeProblem({
      slug: "daily-temperatures",
      title: "Daily Temperatures",
      difficulty: "MEDIUM",
      statement: "Use a monotonic stack to find how many days until a warmer temperature.",
    }),
    leetCodeProblem({
      slug: "subsets",
      title: "Subsets",
      difficulty: "MEDIUM",
      statement: "Generate every subset of a distinct integer array.",
    }),
    leetCodeProblem({
      slug: "permutations",
      title: "Permutations",
      difficulty: "MEDIUM",
      statement: "Generate every ordering of a distinct integer array.",
    }),
    leetCodeProblem({
      slug: "invert-binary-tree",
      title: "Invert Binary Tree",
      difficulty: "EASY",
      statement: "Swap every node's left and right subtrees.",
    }),
    leetCodeProblem({
      slug: "maximum-depth-of-binary-tree",
      title: "Maximum Depth of Binary Tree",
      difficulty: "EASY",
      statement: "Compute the maximum root-to-leaf depth of a binary tree.",
    }),
    leetCodeProblem({
      slug: "implement-trie-prefix-tree",
      title: "Implement Trie",
      difficulty: "MEDIUM",
      statement: "Implement insert, exact search, and prefix search for a trie.",
    }),
    leetCodeProblem({
      slug: "number-of-islands",
      title: "Number of Islands",
      difficulty: "MEDIUM",
      statement: "Count connected components of land cells in a grid.",
    }),
    leetCodeProblem({
      slug: "flood-fill",
      title: "Flood Fill",
      difficulty: "EASY",
      statement: "Recolor a connected region in a grid.",
    }),
    leetCodeProblem({
      slug: "climbing-stairs",
      title: "Climbing Stairs",
      difficulty: "EASY",
      statement: "Count ways to reach step n when you can climb one or two steps.",
    }),
    leetCodeProblem({
      slug: "house-robber",
      title: "House Robber",
      difficulty: "MEDIUM",
      statement: "Maximize non-adjacent house loot with a one-dimensional DP recurrence.",
    }),
    leetCodeProblem({
      slug: "coin-change",
      title: "Coin Change",
      difficulty: "MEDIUM",
      statement: "Find the minimum number of coins needed to make an amount.",
    }),
    leetCodeProblem({
      slug: "maximum-subarray-greedy",
      title: "Maximum Subarray (Greedy Review)",
      difficulty: "MEDIUM",
      statement: "Revisit Kadane's algorithm as a local greedy choice.",
    }),
  ];

  for (const p of problems) {
    const topicSlug = PROBLEM_TOPIC_BY_SLUG[p.slug];
    const topic = await prisma.topic.findUnique({ where: { slug: topicSlug } });
    if (!topic) throw new Error(`Topic ${topicSlug} not found for problem ${p.slug}`);

    await prisma.problem.upsert({
      where: { slug: p.slug },
      update: {
        title: p.title,
        difficulty: p.difficulty,
        statementMd: p.statementMd,
        examplesJson: p.examplesJson,
        starterCodeJson: p.starterCodeJson,
        status: "PUBLISHED",
      },
      create: {
        slug: p.slug,
        title: p.title,
        difficulty: p.difficulty,
        statementMd: p.statementMd,
        examplesJson: p.examplesJson,
        starterCodeJson: p.starterCodeJson,
        timeLimitMs: 1000,
        memoryLimitMb: 256,
      },
    });

    const problem = await prisma.problem.findUniqueOrThrow({ where: { slug: p.slug } });

    await prisma.problemTopic.upsert({
      where: { problemId_topicId: { problemId: problem.id, topicId: topic.id } },
      update: {},
      create: { problemId: problem.id, topicId: topic.id },
    });

    await prisma.testCase.deleteMany({ where: { problemId: problem.id } });
    await prisma.testCase.createMany({
      data: p.testCases.map((tc) => ({ ...tc, problemId: problem.id })),
    });

    await prisma.hint.deleteMany({ where: { problemId: problem.id } });
    await prisma.hint.createMany({
      data: p.hints.map((content, i) => ({ content, order: i + 1, problemId: problem.id })),
    });

    await prisma.editorial.upsert({
      where: { problemId: problem.id },
      update: p.editorial,
      create: { ...p.editorial, problemId: problem.id },
    });
  }

  await prisma.problem.deleteMany({
    where: { slug: { notIn: problems.map((problem) => problem.slug) } },
  });
}

async function seedArticles() {
  const articlesDir = path.join(__dirname, "content", "articles");
  if (!fs.existsSync(articlesDir)) {
    console.log("No articles directory; skipping article seed.");
    return 0;
  }

  const files = fs.readdirSync(articlesDir).filter((f) => f.endsWith(".md"));
  let count = 0;

  for (const file of files) {
    const filePath = path.join(articlesDir, file);
    const fileContent = fs.readFileSync(filePath, "utf-8");
    const { data, content } = matter(fileContent);

    const missing = ["slug", "title", "summary", "topicSlug", "level", "order"].filter(
      (k) => data[k] === undefined || data[k] === null || data[k] === "",
    );
    if (missing.length > 0) {
      throw new Error(`Article ${file} missing required frontmatter: ${missing.join(", ")}`);
    }

    const topic = await prisma.topic.findUnique({ where: { slug: data.topicSlug } });
    if (!topic) {
      throw new Error(`Article ${file} references unknown topicSlug "${data.topicSlug}"`);
    }

    if (!hasAnyH2(content)) {
      console.warn(
        `  warn: ${file} has no ## headings — table of contents will be empty.`,
      );
    }

    await prisma.article.upsert({
      where: { slug: data.slug },
      update: {
        title: data.title,
        summary: data.summary,
        contentMd: content,
        references: data.references ?? [],
        prerequisites: data.prerequisites ?? [],
        estimatedMins: data.estimatedMins ?? 10,
        level: data.level,
        order: data.order,
        topicId: topic.id,
      },
      create: {
        slug: data.slug,
        title: data.title,
        summary: data.summary,
        contentMd: content,
        references: data.references ?? [],
        prerequisites: data.prerequisites ?? [],
        estimatedMins: data.estimatedMins ?? 10,
        level: data.level,
        order: data.order,
        topicId: topic.id,
      },
    });
    count++;
  }
  return count;
}

/**
 * True if the markdown contains at least one `## ` heading outside of fenced
 * code blocks. Mirrors `extractH2Toc` semantics. The trailing references h2
 * doesn't count — it's stripped before the TOC renders.
 */
function hasAnyH2(md: string): boolean {
  const lines = md.split("\n");
  let inFence = false;
  for (const line of lines) {
    if (/^```/.test(line)) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;
    const m = /^##\s+(.+?)\s*#*\s*$/.exec(line);
    if (!m) continue;
    if (m[1].trim().toLowerCase() === "references") continue;
    return true;
  }
  return false;
}

async function main() {
  console.log("Seeding taxonomy...");
  await seedTaxonomy();

  console.log("Seeding problems...");
  await seedProblems();

  console.log("Seeding articles...");
  const articleCount = await seedArticles();
  console.log(`Upserted ${articleCount} articles.`);

  console.log("Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
