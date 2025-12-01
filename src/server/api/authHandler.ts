import "server-only";
import { auth } from "@/lib/auth/auth";
import { getDb } from "@/drizzle/db.server";

export const authHandler = async ({ request }: { request: Request }) => {
  console.log("Auth Handler - bodyUsed:", request.bodyUsed);
  const db = await auth(getDb);
  return db.handler(request);
};
