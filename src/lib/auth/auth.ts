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
    appName: "NoteOverflow",
    baseURL: process.env.BETTER_AUTH_URL,
    secret: process.env.BETTER_AUTH_SECRET,
    trustedOrigins: [process.env.BETTER_AUTH_URL],

    // databaseHooks:{

    // }
    onAPIError: {
      throw: true,
      errorURL: "/auth",
    },
    socialProviders: {
      google: {
        prompt: "select_account",
        clientId: process.env.OAUTH_GOOGLE_CLIENT_ID,
        clientSecret: process.env.OAUTH_GOOGLE_CLIENT_SECRET,
      },
      discord: {
        clientId: process.env.DISCORD_CLIENT_ID,
        clientSecret: process.env.DISCORD_CLIENT_SECRET,
      },
      reddit: {
        clientId: process.env.REDDIT_CLIENT_ID,
        clientSecret: process.env.REDDIT_CLIENT_SECRET,
        scope: ["identity"],
      },
      apple: {
        clientId: process.env.APPLE_CLIENT_ID,
        clientSecret: process.env.APPLE_CLIENT_SECRET,
        // Optional
        // appBundleIdentifier: process.env.APPLE_APP_BUNDLE_IDENTIFIER,
      },
      microsoft: {
        clientId: process.env.MICROSOFT_CLIENT_ID,
        clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
        // Optional
        tenantId: process.env.MICROSOFT_TENANT_ID,
        requireSelectAccount: true,
      },
    },
  });
