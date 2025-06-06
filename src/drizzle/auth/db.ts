import { drizzle } from "drizzle-orm/d1";
import { cache } from "react";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import * as schema from "./schema";

//  npx wrangler d1 execute nfauth-dev --file=./src/drizzle/auth/migrations/{$filename} --remote
//  npx wrangler d1 execute nfauth --file=./src/drizzle/auth/migrations/{$filename} --remote

export const getAuthDb = cache(() => {
  const { env } = getCloudflareContext();

  console.log(typeof env.AUTH_DB, "env.AUTH_DB");
  return drizzle(env.AUTH_DB, { schema });
});

// This is the one to use for static routes (i.e. ISR/SSG)
export const getAuthDbAsync = cache(async () => {
  const { env } = await getCloudflareContext({ async: true });
  return drizzle(env.AUTH_DB, { schema });
});
