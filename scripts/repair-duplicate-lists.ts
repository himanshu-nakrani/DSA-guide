import { prisma } from "@/lib/prisma";

type DuplicateGroup = { userId: string; name: string };
type TableCheck = { exists: boolean };

async function hasCustomListTable() {
  const [row] = await prisma.$queryRaw<TableCheck[]>`
    SELECT EXISTS (
      SELECT 1
      FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = 'CustomList'
    ) AS "exists"
  `;
  return row?.exists ?? false;
}

async function repairDuplicateGroup({ userId, name }: DuplicateGroup) {
  await prisma.$transaction(async (tx) => {
    const lists = await tx.customList.findMany({
      where: { userId, name },
      orderBy: [{ createdAt: "asc" }, { id: "asc" }],
      include: { items: { orderBy: [{ order: "asc" }, { createdAt: "asc" }] } },
    });
    const canonical = lists[0];
    if (!canonical || lists.length < 2) return;

    const retainedProblemIds = new Set(canonical.items.map((item) => item.problemId));
    let nextOrder = canonical.items.reduce((max, item) => Math.max(max, item.order), 0) + 1;

    for (const duplicate of lists.slice(1)) {
      for (const item of duplicate.items) {
        if (retainedProblemIds.has(item.problemId)) {
          await tx.customListItem.delete({ where: { id: item.id } });
          continue;
        }

        await tx.customListItem.update({
          where: { id: item.id },
          data: { listId: canonical.id, order: nextOrder },
        });
        retainedProblemIds.add(item.problemId);
        nextOrder += 1;
      }
      await tx.customList.delete({ where: { id: duplicate.id } });
    }
  });
}

async function main() {
  if (!(await hasCustomListTable())) {
    console.log("CustomList table is not present yet; no duplicate-list repair is required.");
    return;
  }

  const groups = await prisma.$queryRaw<DuplicateGroup[]>`
    SELECT "userId", "name"
    FROM "CustomList"
    GROUP BY "userId", "name"
    HAVING COUNT(*) > 1
  `;

  for (const group of groups) {
    await repairDuplicateGroup(group);
  }

  console.log(`Repaired ${groups.length} duplicate custom-list group${groups.length === 1 ? "" : "s"}.`);
}

main()
  .catch((error) => {
    console.error("Duplicate-list repair failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
