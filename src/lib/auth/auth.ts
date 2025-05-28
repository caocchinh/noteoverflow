import { db } from "@/drizzle/db";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { multiSession } from "better-auth/plugins";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  plugins: [multiSession()],
  socialProviders: {
    google: {
      prompt: "select_account",
      clientId: process.env.OAUTH_GOOGLE_CLIENT_ID,
      clientSecret: process.env.OAUTH_GOOGLE_CLIENT_SECRET,
    },
  },
});
