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
    APPLE_CLIENT_ID: string;
    APPLE_CLIENT_SECRET: string;
    APPLE_APP_BUNDLE_IDENTIFIER: string;
    MICROSOFT_CLIENT_ID: string;
    MICROSOFT_CLIENT_SECRET: string;
    MICROSOFT_TENANT_ID: string;
  }
}
