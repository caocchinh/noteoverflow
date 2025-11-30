import "server-only";
import { verifySession } from "@/dal/verifySession";
import { getDbAsync } from "@/drizzle/db.server";
import { recentQuery } from "@/drizzle/schema";
import { HTTP_STATUS, ERROR_CODES, ERROR_MESSAGES } from "@/lib/errors";
import { eq } from "drizzle-orm";

export const getRecentQueries = async ({
  status,
}: {
  status: (code: number, body: { error: string; code: string }) => void;
}) => {
  const session = await verifySession();
  if (!session) {
    return status(HTTP_STATUS.UNAUTHORIZED, {
      error: ERROR_MESSAGES[ERROR_CODES.UNAUTHORIZED],
      code: ERROR_CODES.UNAUTHORIZED,
    });
  }
  const userId = session.user.id;
  const db = await getDbAsync();
  const recentQueryData = await db.query.recentQuery.findMany({
    where: eq(recentQuery.userId, userId),
    columns: {
      queryKey: true,
      lastSearch: true,
    },
  });
  return recentQueryData;
};
