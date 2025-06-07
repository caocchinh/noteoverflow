// Extra env variables type definitions

declare namespace NodeJS {
  interface ProcessEnv {
    BETTER_AUTH_SECRET: string;
    BETTER_AUTH_URL: string;
    CLOUDFLARE_ACCOUNT_ID: string;
    OAUTH_GOOGLE_CLIENT_ID: string;
    OAUTH_GOOGLE_CLIENT_SECRET: string;
    DISCORD_CLIENT_ID: string;
    DISCORD_CLIENT_SECRET: string;
    REDDIT_CLIENT_ID: string;
    REDDIT_CLIENT_SECRET: string;
  }
}
