import { getAuthDb } from "@/drizzle/auth/db";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { captcha } from "better-auth/plugins";
import * as schema from "@/drizzle/auth/schema";
import { type User } from "better-auth";

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

    plugins: [
      captcha({
        provider: "cloudflare-turnstile",
        secretKey: process.env.TURNSTILE_SECRET_KEY,
        endpoints: [`${process.env.BETTER_AUTH_URL}/authentication`],
      }),
    ],
    databaseHooks: {
      user: {
        create: {
          before: async (user: User) => {
            const avatars = [
              "/assets/avatar/blue.png",
              "/assets/avatar/coffee.png",
              "/assets/avatar/green.png",
              "/assets/avatar/indigo.png",
              "/assets/avatar/magenta.png",
              "/assets/avatar/orange.png",
              "/assets/avatar/purple.png",
              "/assets/avatar/red.png",
            ];

            return {
              data: {
                ...user,
                image: avatars[Math.floor(Math.random() * avatars.length)],
              },
            };
          },
        },
      },
    },
    onAPIError: {
      throw: true,
      errorURL: "/authentication",
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

      microsoft: {
        clientId: process.env.MICROSOFT_CLIENT_ID,
        clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
        // Optional
        tenantId: process.env.MICROSOFT_TENANT_ID,
        requireSelectAccount: true,
      },
    },
  });
