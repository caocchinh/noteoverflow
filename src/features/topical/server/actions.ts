"use server";
import {
  and,
  asc,
  eq,
  type InferSelectModel,
  inArray,
  exists,
} from "drizzle-orm";
import type { ServerActionResponse } from "@/constants/types";
import { getDbAsync } from "@/drizzle/db";
import { question, questionTopic, userBookmarks } from "@/drizzle/schema";
import {
  validateCurriculum,
  validateFilterData,
  validateSubject,
} from "@/features/topical/lib/utils";
import type { FilterData } from "../constants/types";
import { verifySession } from "@/dal/verifySession";

// Define a type for our selected question fields
export type SelectedQuestion = Pick<
  InferSelectModel<typeof question>,
  "year" | "paperType" | "season" | "id"
> & {
  questionImages: Array<{
    imageSrc: string;
    order: number;
  }>;
  answers: Array<{
    answer: string;
    order: number;
  }>;
  questionTopics: Array<{
    topic: string;
  }>;
};

export const getTopicalData = async ({
  curriculumId,
  subjectId,
  topic = [],
  paperType = [],
  year = [],
  season = [],
}: FilterData & {
  curriculumId: string;
  subjectId: string;
}): Promise<
  ServerActionResponse<{
    data: SelectedQuestion[];
    isRateLimited: boolean;
  }>
> => {
  try {
    if (!validateCurriculum(curriculumId)) {
      return {
        success: false,
        data: {
          data: [],
          isRateLimited: false,
        },
        error: "Invalid curriculum",
      };
    }
    if (!validateSubject(curriculumId, subjectId)) {
      return {
        success: false,
        data: {
          data: [],
          isRateLimited: false,
        },
        error: "Invalid subject",
      };
    }
    if (
      !validateFilterData({
        data: { topic, paperType, year, season },
        curriculumn: curriculumId,
        subject: subjectId,
      })
    ) {
      return {
        success: false,
        data: {
          data: [],
          isRateLimited: false,
        },
        error: "Invalid filters",
      };
    }

    const session = await verifySession();

    const db = await getDbAsync();

    // Build query conditions
    const conditions = [
      eq(question.curriculumName, curriculumId),
      eq(question.subjectId, subjectId),
    ];

    // Add optional filters when they have values

    if (paperType.length > 0) {
      const paperTypeNumbers = paperType.map((p) => Number.parseInt(p, 10));
      conditions.push(inArray(question.paperType, paperTypeNumbers));
    }

    if (year.length > 0) {
      const yearNumbers = year.map((y) => Number.parseInt(y, 10));
      conditions.push(inArray(question.year, yearNumbers));
    }

    if (season.length > 0) {
      conditions.push(inArray(question.season, season));
    }

    if (topic.length > 0) {
      conditions.push(
        exists(
          db
            .select()
            .from(questionTopic)
            .where(
              and(
                eq(questionTopic.questionId, question.id),
                inArray(questionTopic.topic, topic)
              )
            )
        )
      );
    }

    const data = await db.query.question.findMany({
      where: and(...conditions),
      columns: {
        id: true,
        year: true,
        paperType: true,
        season: true,
      },
      with: {
        questionImages: {
          orderBy: (table) => [asc(table.order)],
          columns: {
            imageSrc: true,
            order: true,
          },
        },
        answers: {
          orderBy: (table) => [asc(table.order)],
          columns: {
            answer: true,
            order: true,
          },
        },
        questionTopics: {
          columns: {
            topic: true,
          },
        },
      },
      limit: session?.session ? undefined : 5,
    });

    return {
      success: true,
      data: {
        data: data as SelectedQuestion[],
        isRateLimited: session?.session ? false : true,
      },
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      data: {
        data: [],
        isRateLimited: false,
      },
    };
  }
};

export const getUserBookmarksAction = async (): Promise<
  ServerActionResponse<Set<string>>
> => {
  try {
    const session = await verifySession();
    if (!session) {
      throw new Error("Unauthorized");
    }
    const userId = session.user.id;
    const db = await getDbAsync();
    const bookmarks = await db.query.userBookmarks.findMany({
      where: eq(userBookmarks.userId, userId),
      columns: {
        questionId: true,
      },
    });
    return {
      success: true,
      data: new Set(bookmarks.map((b) => b.questionId)),
    };
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      throw new Error("Unauthorized");
    }
    console.error(error);
    throw new Error("Internal Server Error");
  }
};

export const addBookmarkAction = async ({
  questionId,
}: {
  questionId: string;
}) => {
  try {
    const session = await verifySession();
    if (!session) {
      throw new Error("Unauthorized");
    }
    const userId = session.user.id;
    const db = await getDbAsync();
    await db.insert(userBookmarks).values({
      userId,
      questionId,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      throw new Error("Unauthorized");
    }
    console.error(error);
    throw new Error("Internal Server Error");
  }
};

export const removeBookmarkAction = async ({
  questionId,
}: {
  questionId: string;
}) => {
  try {
    const session = await verifySession();
    if (!session) {
      throw new Error("Unauthorized");
    }
    const userId = session.user.id;
    const db = await getDbAsync();
    await db
      .delete(userBookmarks)
      .where(
        and(
          eq(userBookmarks.userId, userId),
          eq(userBookmarks.questionId, questionId)
        )
      );
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      throw new Error("Unauthorized");
    }
    console.error(error);
    throw new Error("Internal Server Error");
  }
};
