import { Elysia, t } from "elysia";
import { HTTP_STATUS, ERROR_CODES, ERROR_MESSAGES } from "@/lib/errors";
import { getTopicalQuestions } from "@/server/api/getTopicalQuestions";
import { getBookmarkById } from "@/server/api/getBookmarkById";
import { getRecentQueries } from "@/server/api/getRecentQueries";
import { getSavedActivities } from "@/server/api/getSavedActivities";
import { authHandler } from "@/server/api/authHandler";

const app = new Elysia({ prefix: "/api", aot: false })
  .onError(({ code, status }) => {
    if (code === "VALIDATION") {
      return status(HTTP_STATUS.BAD_REQUEST, {
        error: ERROR_MESSAGES[ERROR_CODES.BAD_REQUEST],
        code: ERROR_CODES.BAD_REQUEST,
      });
    }
    return status(HTTP_STATUS.INTERNAL_SERVER_ERROR, {
      error: ERROR_MESSAGES[ERROR_CODES.INTERNAL_SERVER_ERROR],
      code: ERROR_CODES.INTERNAL_SERVER_ERROR,
    });
  })
  .onRequest(({ request, status }) => {
    const url = new URL(request.url);
    if (url.pathname.startsWith("/api/auth")) {
      return;
    }

    const secFetchSite = request.headers.get("sec-fetch-site");
    if (secFetchSite !== "same-origin" && secFetchSite !== "same-site") {
      return status(HTTP_STATUS.FORBIDDEN, {
        error: ERROR_MESSAGES[ERROR_CODES.FORBIDDEN] || "Forbidden",
        code: ERROR_CODES.FORBIDDEN || "FORBIDDEN",
      });
    }
  })
  .all("/auth/*", authHandler)

  // GET /api/topical - Query questions with filters
  .get("/topical", getTopicalQuestions, {
    query: t.Object({
      curriculumId: t.String(),
      subjectId: t.String(),
      topic: t.String(),
      paperType: t.String(),
      year: t.String(),
      season: t.String(),
    }),
  })

  // GET /api/topical/bookmark/:bookmarkId - Get bookmark by ID
  .get("/topical/bookmark/:bookmarkId", getBookmarkById, {
    params: t.Object({
      bookmarkId: t.String(),
    }),
  })

  // GET /api/topical/recent-query - Get user's recent searches
  .get("/topical/recent-query", getRecentQueries)

  // GET /api/topical/saved-activities - Get all user saved data
  .get("/topical/saved-activities", getSavedActivities);

// Export type for Eden Treaty client
export type App = typeof app;

// Export handlers for Next.js
export const GET = app.handle;
export const POST = app.handle;
