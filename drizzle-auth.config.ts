import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/drizzle/auth/schema.ts",
  out: "./src/drizzle/auth/migrations",
  dialect: "sqlite",
  strict: true,
  verbose: true,
});
