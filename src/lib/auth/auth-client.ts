import { createAuthClient } from "better-auth/react";
import { multiSessionClient } from "better-auth/client/plugins";

const host =
  process.env.NODE_ENV === "development"
    ? "http://localhost:3000"
    : "https://noteoverflow.com";

export const authClient = createAuthClient({
  baseURL: host,
  plugins: [multiSessionClient()],
});
