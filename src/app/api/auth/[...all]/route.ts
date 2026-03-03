import { getDb } from "@/drizzle/db.server";
import { auth } from "@/lib/auth/auth";
import { NextRequest } from "next/server";

const handler = async (req: NextRequest) => {
  const db = await auth(getDb);
  return db.handler(req);
};

export { handler as GET, handler as POST };
