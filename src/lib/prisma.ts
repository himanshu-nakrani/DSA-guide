import { PrismaClient } from "@/generated/prisma";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createPrisma(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is required to initialize Prisma.");
  }

  const isNeonUrl = /(?:^|\.)neon\.tech(?::\d+)?$/i.test(
    new URL(connectionString).hostname,
  );
  const adapter = isNeonUrl
    ? new PrismaNeon({ connectionString })
    : new PrismaPg(new Pool({ connectionString }));

  return new PrismaClient({ adapter });
}

/**
 * Lazy Prisma client.
 *
 * The underlying `PrismaClient` (and its connection pool / Neon HTTP
 * adapter) is only constructed on the first property access, not at
 * module load. Two reasons this matters:
 *
 * 1. Serverless cold starts (Vercel et al.) — eager init at module load
 *    blocks the first request while the pool opens. A route that imports
 *    `@/lib/prisma` but never queries the DB (e.g. a `not-found.tsx` for
 *    an asset handler) still pays that cost.
 * 2. Build-time imports — `next build` walks every page; eager init would
 *    require `DATABASE_URL` to be set during the build.
 *
 * The `Proxy` forwards every property access to the lazily-constructed
 * instance, so callers keep using `prisma.user.findMany(...)` unchanged.
 * In development we cache the instance on `globalThis` so HMR reloads
 * don't drain the connection pool with a new client on every save.
 */
function makeLazyPrisma(): PrismaClient {
  return new Proxy({} as PrismaClient, {
    get(_target, prop) {
      if (!globalForPrisma.prisma) {
        globalForPrisma.prisma = createPrisma();
      }
      const value = Reflect.get(globalForPrisma.prisma, prop);
      return typeof value === "function"
        ? value.bind(globalForPrisma.prisma)
        : value;
    },
  });
}

export const prisma = makeLazyPrisma();
