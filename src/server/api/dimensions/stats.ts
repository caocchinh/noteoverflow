import { Context } from "elysia";
import { getDbAsync } from "@/drizzle/db.server";
import { question } from "@/drizzle/schema";
import { count, eq } from "drizzle-orm";
import { HTTP_STATUS, ERROR_CODES, ERROR_MESSAGES } from "@/lib/errors";
import { verifySession } from "@/dal/verifySession";

/**
 * Get statistics for image dimension processing
 * Owner-only endpoint
 */
export async function getDimensionStats({ status }: Context) {
  try {
    const session = await verifySession();
    if (!session?.session || session.user.role !== "owner") {
      return status(HTTP_STATUS.FORBIDDEN, {
        error: ERROR_MESSAGES[ERROR_CODES.FORBIDDEN],
        code: ERROR_CODES.FORBIDDEN,
      });
    }

    const db = await getDbAsync();

    // Count processed questions (with dimensions)
    const processedResult = await db
      .select({ count: count() })
      .from(question)
      .where(eq(question.isQuestionHasImageDimensions, 1));

    // Count not processed questions (without dimensions)
    const notProcessedResult = await db
      .select({ count: count() })
      .from(question)
      .where(eq(question.isQuestionHasImageDimensions, 0));

    return {
      processed: processedResult[0]?.count ?? 0,
      notProcessed: notProcessedResult[0]?.count ?? 0,
      total:
        (processedResult[0]?.count ?? 0) + (notProcessedResult[0]?.count ?? 0),
    };
  } catch (error) {
    console.error("Failed to fetch dimension stats:", error);
    return status(HTTP_STATUS.INTERNAL_SERVER_ERROR, {
      error: ERROR_MESSAGES[ERROR_CODES.INTERNAL_SERVER_ERROR],
      code: ERROR_CODES.INTERNAL_SERVER_ERROR,
    });
  }
}
