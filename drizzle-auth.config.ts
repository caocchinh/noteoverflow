import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/drizzle/schema.ts",
  out: "./src/drizzle/migrations",
  dialect: "sqlite",
  strict: true,
  verbose: true,
  dbCredentials: {
    url: process.env.NEON_DATABASE_URL,
  },
});
