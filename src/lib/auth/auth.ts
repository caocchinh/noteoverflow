import {betterAuth, type User} from "better-auth";
import {drizzleAdapter} from "better-auth/adapters/drizzle";
import {admin, captcha} from "better-auth/plugins";
import {AVATARS} from "@/constants/constants";
import * as schema from "@/drizzle/schema";
import {AdminRole, ac, OwnerRole, ROLE_ADMIN, ROLE_OWNER, ROLE_USER, UserRole} from "./permission";

//npx @better-auth/cli generate --config /src/lib/auth/auth.ts

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const auth = async (database: any) =>
  betterAuth({
    database: drizzleAdapter(await database(), {
      provider: "sqlite",
      schema,
    }),
    appName: "NoteOverflow",
    baseURL: process.env.BETTER_AUTH_URL,
    secret: process.env.BETTER_AUTH_SECRET,
    trustedOrigins: [process.env.BETTER_AUTH_URL],

    plugins: [
      admin({
        ac,
        roles: {
          [ROLE_ADMIN]: AdminRole,
          [ROLE_OWNER]: OwnerRole,
          [ROLE_USER]: UserRole,
        },
        defaultRole: ROLE_USER,

        bannedUserMessage: "You are banned from the platform.",
      }),
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
            return {
              data: {
                ...user,
                image: AVATARS[Math.floor(Math.random() * AVATARS.length)].src,
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
