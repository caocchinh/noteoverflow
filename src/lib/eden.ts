import { treaty } from "@elysiajs/eden";
import type { App } from "@/app/api/[[...slugs]]/route";

// Create Eden Treaty client for type-safe API calls
export const api = treaty<App>(
  typeof window !== "undefined"
    ? window.location.origin
    : "https://noteoverflow.com"
).api;
