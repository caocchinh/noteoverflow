import { drizzle } from "drizzle-orm/d1";
import { cache } from "react";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import * as schema from "./schema";

//  npx wrangler d1 execute nfauth --file=./src/drizzle/main/migrations/{$filename} --> Local development
//  npx wrangler d1 execute nfauth --file=./src/drizzle/main/migrations/{$filename} --remote --> Remote development

export const getMainDb = cache(() => {
  const { env } = getCloudflareContext();
  return drizzle(env.MAIN_DB, { schema });
});

// This is the one to use for static routes (i.e. ISR/SSG)
export const getMainDbAsync = cache(async () => {
  const { env } = await getCloudflareContext({ async: true });
  return drizzle(env.MAIN_DB, { schema });
});
