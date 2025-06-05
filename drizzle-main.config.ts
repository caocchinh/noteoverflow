import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/drizzle/main/schema.ts",
  out: "./src/drizzle/main/migrations",
  dialect: "sqlite",
  strict: true,
  verbose: true,
});
