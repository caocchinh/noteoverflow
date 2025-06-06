import { getAuthDb } from "@/drizzle/auth/db";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import * as schema from "@/drizzle/auth/schema";

export const auth = () =>
  betterAuth({
    database: drizzleAdapter(getAuthDb(), {
      provider: "sqlite",
      schema: schema,
    }),
    baseURL: getCloudflareContext().env.BETTER_AUTH_URL,
    secret: getCloudflareContext().env.BETTER_AUTH_SECRET,
    socialProviders: {
      google: {
        prompt: "select_account",
        clientId: getCloudflareContext().env.OAUTH_GOOGLE_CLIENT_ID,
        clientSecret: getCloudflareContext().env.OAUTH_GOOGLE_CLIENT_SECRET,
      },
    },
  });
