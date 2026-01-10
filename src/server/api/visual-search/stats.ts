import { Context } from "elysia";
import { getDbAsync } from "@/drizzle/db.server";
import { question } from "@/drizzle/schema";
import { count, eq } from "drizzle-orm";
import { HTTP_STATUS, ERROR_CODES, ERROR_MESSAGES } from "@/lib/errors";
import { verifySession } from "@/dal/verifySession";

export async function getQuestionStats({ status }: Context) {
  try {
    const session = await verifySession();
    if (!session?.session || session.user.role !== "owner") {
      return status(HTTP_STATUS.FORBIDDEN, {
        error: ERROR_MESSAGES[ERROR_CODES.FORBIDDEN],
        code: ERROR_CODES.FORBIDDEN,
      });
    }
    const db = await getDbAsync();

    // Count indexed questions
    const indexedResult = await db
      .select({ count: count() })
      .from(question)
      .where(eq(question.isQuestionImageIndexed, 1));

    // Count not indexed questions
    const notIndexedResult = await db
      .select({ count: count() })
      .from(question)
      .where(eq(question.isQuestionImageIndexed, 0));

    return {
      indexed: indexedResult[0]?.count ?? 0,
      notIndexed: notIndexedResult[0]?.count ?? 0,
      total: (indexedResult[0]?.count ?? 0) + (notIndexedResult[0]?.count ?? 0),
    };
  } catch (error) {
    console.error("Failed to fetch stats:", error);
    return status(HTTP_STATUS.INTERNAL_SERVER_ERROR, {
      error: ERROR_MESSAGES[ERROR_CODES.INTERNAL_SERVER_ERROR],
      code: ERROR_CODES.INTERNAL_SERVER_ERROR,
    });
  }
}
