import { Elysia, t } from "elysia";
import { CloudflareAdapter } from "elysia/adapter/cloudflare-worker";
import { HTTP_STATUS, ERROR_CODES, ERROR_MESSAGES } from "@/lib/errors";
import { getTopicalQuestions } from "@/server/api/getTopicalQuestions";
import { getBookmarkById } from "@/server/api/getBookmarkById";
import { getRecentQueries } from "@/server/api/getRecentQueries";
import { getSavedActivities } from "@/server/api/getSavedActivities";
import { indexQuestions } from "@/server/api/visual-search/indexing";
import {
  searchByImage,
  searchByText,
} from "@/server/api/visual-search/searching";
import { getQuestionStats } from "@/server/api/visual-search/stats";
import { getDimensionStats } from "@/server/api/dimensions/stats";
import { processDimensions } from "@/server/api/dimensions/dimensions";

const app = new Elysia({
  prefix: "/api",
  aot: false,
  adapter: CloudflareAdapter,
})
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

  // GET /api/admin/visual-search/stats - Get indexing stats
  .get("/admin/visual-search/stats", getQuestionStats)

  // GET /api/admin/visual-search?offset=0 - Index 1 question at a time
  .get("/admin/visual-search", indexQuestions, {
    query: t.Object({
      offset: t.Numeric({ default: 0 }),
      limit: t.Numeric({ default: 1 }),
    }),
  })

  // ========== IMAGE DIMENSIONS ADMIN ROUTES ==========

  // GET /api/admin/dimensions/stats - Get dimension processing stats
  .get("/admin/dimensions/stats", getDimensionStats)

  // GET /api/admin/dimensions - Process image dimensions
  .get("/admin/dimensions", processDimensions, {
    query: t.Object({
      offset: t.Numeric({ default: 0 }),
      limit: t.Numeric({ default: 10 }),
    }),
  })

  // POST /api/visual-search/search - Search by image
  .post("/visual-search/search", searchByImage, {
    body: t.Object({
      imageBase64: t.String(),
      topK: t.Optional(t.Number({ default: 5 })),
      filter: t.Optional(
        t.Object({
          subject: t.Optional(t.String()),
          curriculum: t.Optional(t.String()),
          year: t.Optional(t.Array(t.String())),
          season: t.Optional(t.Array(t.String())),
          paperType: t.Optional(t.Array(t.String())),
        })
      ),
    }),
  })

  // POST /api/visual-search/text - Search by text
  .post("/visual-search/text", searchByText, {
    body: t.Object({
      query: t.String(),
      topK: t.Optional(t.Number({ default: 5 })),
      filter: t.Optional(
        t.Object({
          subject: t.Optional(t.String()),
          curriculum: t.Optional(t.String()),
          year: t.Optional(t.Array(t.String())),
          season: t.Optional(t.Array(t.String())),
          paperType: t.Optional(t.Array(t.String())),
        })
      ),
    }),
  })
  .compile();

// Export type for Eden Treaty client
export type App = typeof app;

// Export handlers for Next.js
export const GET = app.handle;
export const POST = app.handle;
