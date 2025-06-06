import { getAuthDb } from "@/drizzle/auth/db";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { multiSession } from "better-auth/plugins";
import { getCloudflareContext } from "@opennextjs/cloudflare";

export const auth = () =>
  betterAuth({
    database: drizzleAdapter(getAuthDb, {
      provider: "sqlite",
    }),
    plugins: [multiSession()],
    socialProviders: {
      google: {
        prompt: "select_account",
        clientId: getCloudflareContext().env.OAUTH_GOOGLE_CLIENT_ID,
        clientSecret: getCloudflareContext().env.OAUTH_GOOGLE_CLIENT_SECRET,
      },
    },
  });
