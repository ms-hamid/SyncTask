// prisma.config.ts
// Prisma v7: Database connection URL dikonfigurasi di sini, bukan di schema.prisma
// Docs: https://pris.ly/d/prisma7-config
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env.DATABASE_URL,
  },
});
