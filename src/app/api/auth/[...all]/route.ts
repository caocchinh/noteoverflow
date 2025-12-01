import { auth } from "@/lib/auth/auth";
import { getDb } from "@/drizzle/db.server";
import { NextRequest } from "next/server";

const handler = async (req: NextRequest) => {
  const db = await auth(getDb);
  return db.handler(req);
};

export { handler as GET, handler as POST };
