import { getDb } from "@/drizzle/db.server";
import { auth } from "@/lib/auth/auth";
import "server-only";

export const authHandler = async ({ request }: { request: Request }) => {
  const db = await auth(getDb);
  return db.handler(request);
};
