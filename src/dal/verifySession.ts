import "server-only";
import { headers } from "next/headers";
import { cache } from "react";
import { getDbAsync } from "@/drizzle/db";
import { auth } from "@/lib/auth/auth";

export const verifySession = cache(async () => {
  const authInstance = await auth(getDbAsync);
  const session = await authInstance.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    return null;
  }
  return session;
});
