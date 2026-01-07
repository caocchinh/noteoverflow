import { Elysia, t } from "elysia";
import { HTTP_STATUS, ERROR_CODES, ERROR_MESSAGES } from "@/lib/errors";
import { getTopicalQuestions } from "@/server/api/getTopicalQuestions";
import { getBookmarkById } from "@/server/api/getBookmarkById";
import { getRecentQueries } from "@/server/api/getRecentQueries";
import { getSavedActivities } from "@/server/api/getSavedActivities";
import { indexQuestions, searchByImage } from "@/server/api/visualSearch";

const app = new Elysia({ prefix: "/api", aot: false })
  .onError(({ code, status, error }) => {
    console.error(error);
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
  .get("/topical/saved-activities", getSavedActivities)

  // ========== VISUAL SEARCH ADMIN ROUTES ==========

  // GET /api/admin/visual-search/index?offset=0 - Index 1 question at a time
  .get("/admin/visual-search/index", indexQuestions, {
    query: t.Object({
      offset: t.Optional(t.String({ default: "0" })),
    }),
    transform({ query }) {
      // Parse offset to number, default limit to 1
      (query as Record<string, unknown>).offset = parseInt(
        query.offset ?? "0",
        10
      );
      (query as Record<string, unknown>).limit = 1;
    },
  })

  // POST /api/visual-search/search - Search by image
  .post("/visual-search/search", searchByImage, {
    body: t.Object({
      imageBase64: t.String(),
      topK: t.Optional(t.Number({ default: 5 })),
    }),
  });

// Export type for Eden Treaty client
export type App = typeof app;

// Export handlers for Next.js
export const GET = app.handle;
export const POST = app.handle;
