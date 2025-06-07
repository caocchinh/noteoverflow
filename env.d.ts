// Extra env variables type definitions

declare namespace NodeJS {
  interface ProcessEnv {
    BETTER_AUTH_SECRET: string;
    BETTER_AUTH_URL: string;
    BETTER_AUTH_CLIENT_ID: string;
    BETTER_AUTH_CLIENT_SECRET: string;
    CLOUDFLARE_ACCOUNT_ID: string;
    MAIN_R2_BUCKET_URL: string;
    NFCACHE_R2_BUCKET_URL: string;
    OAUTH_GOOGLE_CLIENT_ID: string;
    OAUTH_GOOGLE_CLIENT_SECRET: string;
  }
}
