import { z } from "zod";
const envVariables = z.object({
  NEON_DATABASE_URL: z.string(),
  BETTER_AUTH_SECRET: z.string(),
  BETTER_AUTH_URL: z.string(),
  OAUTH_GOOGLE_CLIENT_ID: z.string(),
  OAUTH_GOOGLE_CLIENT_SECRET: z.string(),
});

envVariables.parse(process.env);

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace NodeJS {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface ProcessEnv extends z.infer<typeof envVariables> {}
  }
}
