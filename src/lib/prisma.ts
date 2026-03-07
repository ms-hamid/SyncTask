import { PrismaClient } from "@prisma/client";

// ============================================================
// Prisma Client Singleton untuk Next.js App Router
//
// Next.js hot-reload akan membuat module di-reinisialisasi
// berkali-kali — tanpa singleton, setiap reload membuat
// koneksi database baru hingga menghabiskan connection pool.
//
// Solusi: simpan instance di `globalThis`.
// Ref: https://www.prisma.io/docs/guides/other/troubleshooting-orm/help-articles/nextjs-prisma-client-dev-practices
// ============================================================

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  if (process.env.NODE_ENV === "development") {
    return new PrismaClient({
      log: ["query", "error", "warn"],
    });
  }
  return new PrismaClient({
    log: ["error"],
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
