import "server-only";
import { cache } from "react";
import { auth } from "@/lib/auth/auth";
import { getDbAsync } from "@/drizzle/db";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export const verifySession = cache(async () => {
  const authInstance = await auth(getDbAsync);
  const session = await authInstance.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    redirect("/authentication");
  }
  return session;
});
