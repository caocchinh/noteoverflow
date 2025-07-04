import {getCloudflareContext} from "@opennextjs/cloudflare";
import {drizzle} from "drizzle-orm/d1";
import {cache} from "react";
import * as schema from "./schema";

//  npx wrangler d1 execute noteoverflow --file=./src/drizzle/migrations/{$filename} --> Local development
//  npx wrangler d1 execute noteoverflow --file=./src/drizzle/migrations/{$filename} --remote --> Remote development

export const getDb = cache(() => {
  const {env} = getCloudflareContext();
  return drizzle(env.MAIN_DB, {schema});
});

// This is the one to use for static routes (i.e. ISR/SSG)
export const getDbAsync = cache(async () => {
  const {env} = await getCloudflareContext({async: true});
  return drizzle(env.MAIN_DB, {schema});
});
