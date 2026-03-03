import { retryDatabase } from "@/dal/retry";
import { getDbAsync } from "@/drizzle/db.server";
import { globalSearchRateLimit } from "@/drizzle/schema";
import {
  DAILY_IMAGE_SEARCH_LIMIT,
  DAILY_TEXT_SEARCH_LIMIT,
} from "@/features/search/constants/constants";
import { ERROR_CODES, HTTP_STATUS } from "@/lib/errors";
import { eq, sql } from "drizzle-orm";
import { status as elysiaStatus } from "elysia";
import "server-only";

type SearchType = "image" | "text";

/**
 * Get today's date in YYYY-MM-DD format (UTC)
 */
function getTodayDateString(): string {
  return new Date().toISOString().split("T")[0];
}

/**
 * Check if global daily rate limit has been exceeded
 */
export async function checkRateLimit(searchType: SearchType, status: typeof elysiaStatus) {
  const db = await getDbAsync();
  const today = getTodayDateString();

  // Get today's rate limit record with retry logic
  const [record] = await retryDatabase(
    () => db.select().from(globalSearchRateLimit).where(eq(globalSearchRateLimit.date, today)),
    `check ${searchType} search rate limit`,
  );

  const limit = searchType === "image" ? DAILY_IMAGE_SEARCH_LIMIT : DAILY_TEXT_SEARCH_LIMIT;

  const currentCount = record
    ? searchType === "image"
      ? record.imageSearchCount
      : record.textSearchCount
    : 0;

  if (currentCount >= limit) {
    return status(HTTP_STATUS.TOO_MANY_REQUESTS, {
      error: `Global daily ${searchType} search quota for all users exceeded (${limit} searches per day). Resets at midnight UTC.`,
      code: ERROR_CODES.RATE_LIMIT_EXCEEDED,
    });
  }

  return null;
}

/**
 * Increment the global search counter
 */
export async function incrementSearchCount(searchType: SearchType) {
  const db = await getDbAsync();
  const today = getTodayDateString();

  const incrementField = searchType === "image" ? "imageSearchCount" : "textSearchCount";

  // Upsert the record with retry logic
  await retryDatabase(
    () =>
      db
        .insert(globalSearchRateLimit)
        .values({
          date: today,
          imageSearchCount: searchType === "image" ? 1 : 0,
          textSearchCount: searchType === "text" ? 1 : 0,
          updatedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: globalSearchRateLimit.date,
          set: {
            [incrementField]: sql`${globalSearchRateLimit[incrementField]} + 1`,
            updatedAt: new Date(),
          },
        }),
    `increment ${searchType} search count`,
  );
}
