import { getAuthDb } from "@/drizzle/auth/db";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

import * as schema from "@/drizzle/auth/schema";

export const auth = () =>
  betterAuth({
    database: drizzleAdapter(getAuthDb(), {
      provider: "sqlite",
      schema: schema,
    }),
    baseURL: process.env.BETTER_AUTH_URL,
    secret: process.env.BETTER_AUTH_SECRET,
    socialProviders: {
      google: {
        prompt: "select_account",
        clientId: process.env.OAUTH_GOOGLE_CLIENT_ID,
        clientSecret: process.env.OAUTH_GOOGLE_CLIENT_SECRET,
      },
    },
  });
