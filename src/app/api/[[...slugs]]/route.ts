import { Elysia, t } from "elysia";
import { auth } from "@/lib/auth/auth";
import {
  validateCurriculum,
  validateSubject,
  validateFilterData,
  hashQuery,
} from "@/features/topical/lib/utils";
import { question } from "@/drizzle/schema";
import { and, eq, inArray, like, or } from "drizzle-orm";
import { verifySession } from "@/dal/verifySession";
import { getDb, getDbAsync } from "@/drizzle/db.server";
import {
  FilterData,
  SelectedQuestion,
} from "@/features/topical/constants/types";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import {
  userBookmarkList,
  userBookmarks,
  recentQuery,
  finishedQuestions,
  userAnnotations,
} from "@/drizzle/schema";
import {
  SelectedPublickBookmark,
  SelectedFinishedQuestion,
  SelectedAnnotation,
  SavedActivitiesResponse,
  SelectedBookmark,
} from "@/features/topical/constants/types";
import { HTTP_STATUS, ERROR_CODES, ERROR_MESSAGES } from "@/lib/errors";

const app = new Elysia({ prefix: "/api" })
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
  .all("/auth/*", async ({ request }) => {
    const db = await auth(getDb);
    return db.handler(request);
  })
  // GET /api/topical - Query questions with filters
  .get(
    "/topical",
    async ({ query, status }) => {
      const curriculumId = decodeURIComponent(query.curriculumId);
      const subjectId = decodeURIComponent(query.subjectId);
      const topic = JSON.parse(
        decodeURIComponent(query.topic)
      ).toSorted() as string[];
      const paperType = JSON.parse(
        decodeURIComponent(query.paperType)
      ).toSorted() as string[];
      const year = JSON.parse(
        decodeURIComponent(query.year)
      ).toSorted() as string[];
      const season = JSON.parse(
        decodeURIComponent(query.season)
      ).toSorted() as string[];

      if (!validateCurriculum(curriculumId)) {
        return status(HTTP_STATUS.BAD_REQUEST, {
          error: ERROR_MESSAGES[ERROR_CODES.BAD_REQUEST],
          code: ERROR_CODES.BAD_REQUEST,
        });
      }
      if (!validateSubject(curriculumId, subjectId)) {
        return status(HTTP_STATUS.BAD_REQUEST, {
          error: ERROR_MESSAGES[ERROR_CODES.BAD_REQUEST],
          code: ERROR_CODES.BAD_REQUEST,
        });
      }
      if (
        !validateFilterData({
          data: { topic, paperType, year, season },
          curriculumn: curriculumId,
          subject: subjectId,
        })
      ) {
        return status(HTTP_STATUS.BAD_REQUEST, {
          error: ERROR_MESSAGES[ERROR_CODES.BAD_REQUEST],
          code: ERROR_CODES.BAD_REQUEST,
        });
      }

      const session = await verifySession();
      const { env } = await getCloudflareContext({ async: true });
      const isRateLimited = session?.session ? false : true;

      const currentQuery: {
        curriculumId: string;
        subjectId: string;
        isRateLimited: boolean;
      } & FilterData = {
        curriculumId,
        subjectId,
        topic,
        paperType,
        year,
        season,
        isRateLimited,
      };

      const queryString = JSON.stringify(currentQuery);
      const hashedKey = await hashQuery(queryString);
      const result = await env.TOPICAL_CACHE.get(hashedKey);

      if (result === null) {
        const db = await getDbAsync();

        // Build query conditions
        const conditions = [
          eq(question.curriculumName, curriculumId),
          eq(question.subjectId, subjectId),
        ];

        if (paperType.length > 0) {
          const paperTypeNumbers = paperType.map((p) => Number.parseInt(p, 10));
          conditions.push(inArray(question.paperType, paperTypeNumbers));
        } else {
          return status(HTTP_STATUS.BAD_REQUEST, {
            error: ERROR_MESSAGES[ERROR_CODES.BAD_REQUEST],
            code: ERROR_CODES.BAD_REQUEST,
          });
        }

        if (year.length > 0) {
          const yearNumbers = year.map((y) => Number.parseInt(y, 10));
          conditions.push(inArray(question.year, yearNumbers));
        } else {
          return status(HTTP_STATUS.BAD_REQUEST, {
            error: ERROR_MESSAGES[ERROR_CODES.BAD_REQUEST],
            code: ERROR_CODES.BAD_REQUEST,
          });
        }

        if (season.length > 0) {
          conditions.push(inArray(question.season, season));
        } else {
          return status(HTTP_STATUS.BAD_REQUEST, {
            error: ERROR_MESSAGES[ERROR_CODES.BAD_REQUEST],
            code: ERROR_CODES.BAD_REQUEST,
          });
        }

        if (topic.length === 0) {
          return status(HTTP_STATUS.BAD_REQUEST, {
            error: ERROR_MESSAGES[ERROR_CODES.BAD_REQUEST],
            code: ERROR_CODES.BAD_REQUEST,
          });
        }

        const topicsCondition = topic.map((t) =>
          like(question.topics, "%" + t.slice(0, 45) + "%")
        );
        const topicsOrCondition = or(...topicsCondition);
        if (topicsOrCondition) {
          conditions.push(topicsOrCondition);
        }

        const dbResult = await db.query.question.findMany({
          where: and(...conditions),
          columns: {
            id: true,
            year: true,
            paperType: true,
            season: true,
            questionImages: true,
            topics: true,
            answers: true,
          },
        });

        const data: SelectedQuestion[] = dbResult.map((item) => {
          return {
            id: item.id,
            year: item.year,
            paperType: item.paperType,
            season: item.season,
            questionImages: JSON.parse(item.questionImages ?? "[]"),
            answers: JSON.parse(item.answers ?? "[]"),
            topics: JSON.parse(item.topics ?? "[]"),
          };
        });

        const baseQuery: {
          curriculumId: string;
          subjectId: string;
          isRateLimited?: boolean;
        } & FilterData = {
          curriculumId,
          subjectId,
          topic,
          paperType,
          year,
          season,
        };

        const rateLimitedHash = await hashQuery(
          JSON.stringify({ ...baseQuery, isRateLimited: true })
        );
        const nonRateLimitedHash = await hashQuery(
          JSON.stringify({ ...baseQuery, isRateLimited: false })
        );

        await Promise.all([
          env.TOPICAL_CACHE.put(
            rateLimitedHash,
            JSON.stringify(data.toSpliced(25)),
            {
              expirationTtl: 60 * 60 * 24 * 14,
            }
          ),
          env.TOPICAL_CACHE.put(nonRateLimitedHash, JSON.stringify(data), {
            expirationTtl: 60 * 60 * 24 * 14,
          }),
        ]);

        return {
          data: isRateLimited ? data.toSpliced(25) : data,
          isRateLimited,
        };
      } else {
        return {
          data: JSON.parse(result) as SelectedQuestion[],
          isRateLimited,
        };
      }
    },
    {
      query: t.Object({
        curriculumId: t.String(),
        subjectId: t.String(),
        topic: t.String(),
        paperType: t.String(),
        year: t.String(),
        season: t.String(),
      }),
    }
  )
  // GET /api/topical/bookmark/:bookmarkId - Get bookmark by ID
  .get(
    "/topical/bookmark/:bookmarkId",
    async ({ params, status }) => {
      const { bookmarkId } = params;
      const session = await verifySession();

      if (!session) {
        return status(HTTP_STATUS.UNAUTHORIZED, {
          error: ERROR_MESSAGES[ERROR_CODES.UNAUTHORIZED],
          code: ERROR_CODES.UNAUTHORIZED,
        });
      }

      const db = await getDbAsync();

      // Check if the bookmark list exists and is accessible
      const bookmarkList = await db.query.userBookmarkList.findFirst({
        where: eq(userBookmarkList.id, bookmarkId),
        columns: {
          visibility: true,
          userId: true,
        },
      });

      if (!bookmarkList) {
        return status(HTTP_STATUS.NOT_FOUND, {
          error: ERROR_MESSAGES[ERROR_CODES.BOOKMARK_LIST_NOT_FOUND],
          code: ERROR_CODES.NOT_FOUND,
        });
      }

      // Check permissions - only owner can access private lists
      if (
        bookmarkList.visibility === "private" &&
        session.user.id !== bookmarkList.userId
      ) {
        return status(HTTP_STATUS.FORBIDDEN, {
          error: ERROR_MESSAGES[ERROR_CODES.FORBIDDEN],
          code: ERROR_CODES.FORBIDDEN,
        });
      }

      // Fetch bookmark questions
      const selectedBookmarkQuestions = await db.query.userBookmarks.findMany({
        where: eq(userBookmarks.listId, bookmarkId),
        columns: { updatedAt: true },
        with: {
          question: {
            columns: {
              id: true,
              year: true,
              season: true,
              paperType: true,
              paperVariant: true,
              answers: true,
              questionImages: true,
              topics: true,
            },
          },
        },
      });

      const data: SelectedPublickBookmark[] = selectedBookmarkQuestions.map(
        (item) => {
          return {
            updatedAt: item.updatedAt,
            questionId: item.question.id,
            question: {
              ...item.question,
              questionImages: JSON.parse(item.question.questionImages ?? "[]"),
              answers: JSON.parse(item.question.answers ?? "[]"),
              topics: JSON.parse(item.question.topics ?? "[]"),
            },
          };
        }
      );

      return data;
    },
    {
      params: t.Object({
        bookmarkId: t.String(),
      }),
    }
  )
  // GET /api/topical/recent-query - Get user's recent searches
  .get("/topical/recent-query", async ({ status }) => {
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
  })
  // GET /api/topical/saved-activities - Get all user saved data
  .get("/topical/saved-activities", async ({ status }) => {
    const session = await verifySession();
    if (!session) {
      return status(HTTP_STATUS.UNAUTHORIZED, {
        error: ERROR_MESSAGES[ERROR_CODES.UNAUTHORIZED],
        code: ERROR_CODES.UNAUTHORIZED,
      });
    }
    const userId = session.user.id;

    // Helper functions
    async function fetchFinishedQuestions(userId: string) {
      const db = await getDbAsync();
      const finishedQuestionsData = await db.query.finishedQuestions.findMany({
        where: eq(finishedQuestions.userId, userId),
        columns: {
          updatedAt: true,
        },
        with: {
          question: {
            columns: {
              id: true,
              paperType: true,
              answers: true,
              questionImages: true,
              season: true,
              year: true,
              topics: true,
            },
          },
        },
      });

      const data: SelectedFinishedQuestion[] = finishedQuestionsData.map(
        (item) => {
          return {
            updatedAt: item.updatedAt,
            question: {
              ...item.question,
              questionImages: JSON.parse(item.question.questionImages ?? "[]"),
              answers: JSON.parse(item.question.answers ?? "[]"),
              topics: JSON.parse(item.question.topics ?? "[]"),
            },
          };
        }
      );

      return data;
    }

    async function fetchBookmarks(userId: string) {
      const db = await getDbAsync();
      const bookmarks = await db.query.userBookmarkList.findMany({
        where: eq(userBookmarkList.userId, userId),
        columns: {
          id: true,
          listName: true,
          visibility: true,
          createdAt: true,
          updatedAt: true,
        },
        with: {
          userBookmarks: {
            columns: {
              updatedAt: true,
            },
            with: {
              question: {
                columns: {
                  id: true,
                  paperType: true,
                  answers: true,
                  questionImages: true,
                  season: true,
                  year: true,
                  topics: true,
                },
              },
            },
          },
        },
      });

      const data: SelectedBookmark[] = bookmarks.map((bookmark) => {
        return {
          ...bookmark,
          userBookmarks: bookmark.userBookmarks.map((userBookmark) => {
            return {
              ...userBookmark,
              question: {
                ...userBookmark.question,
                questionImages: JSON.parse(
                  userBookmark.question.questionImages ?? "[]"
                ),
                answers: JSON.parse(userBookmark.question.answers ?? "[]"),
                topics: JSON.parse(userBookmark.question.topics ?? "[]"),
              },
            };
          }),
        };
      });

      return data;
    }

    async function fetchAnnotations(userId: string) {
      const db = await getDbAsync();
      const annotationsData = await db.query.userAnnotations.findMany({
        where: eq(userAnnotations.userId, userId),
        columns: {
          questionId: true,
          questionXfdf: true,
          answerXfdf: true,
          updatedAt: true,
        },
      });

      const data: SelectedAnnotation[] = annotationsData.map((item) => ({
        questionId: item.questionId,
        questionXfdf: item.questionXfdf ?? "",
        answerXfdf: item.answerXfdf ?? "",
        updatedAt: item.updatedAt,
      }));

      return data;
    }

    // Fetch finished questions, bookmarks, and annotations in parallel
    const [finishedQuestionsData, bookmarksData, annotationsData] =
      await Promise.all([
        fetchFinishedQuestions(userId),
        fetchBookmarks(userId),
        fetchAnnotations(userId),
      ]);

    const responseData: SavedActivitiesResponse = {
      finishedQuestions: finishedQuestionsData,
      bookmarks: bookmarksData,
      annotations: annotationsData,
    };

    return responseData;
  });

// Export type for Eden Treaty client
export type App = typeof app;

// Export handlers for Next.js
export const GET = app.handle;
export const POST = app.handle;
