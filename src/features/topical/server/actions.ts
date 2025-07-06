"use server";
import { and, asc, eq, type InferSelectModel, inArray } from "drizzle-orm";
import type { ServerActionResponse } from "@/constants/types";
import { getDbAsync } from "@/drizzle/db";
import { question, userBookmarks } from "@/drizzle/schema";
import {
  validateCurriculum,
  validateFilterData,
  validateSubject,
} from "@/features/topical/lib/utils";
import { PAGE_SIZE } from "../constants/constants";
import type { FilterData } from "../constants/types";
import { verifySession } from "@/dal/verifySession";

// Define a type for our selected question fields
export type SelectedQuestion = Pick<
  InferSelectModel<typeof question>,
  "topic" | "year" | "paperType" | "season" | "id"
> & {
  questionImages: Array<{
    questionId: string;
    imageSrc: string;
    order: number;
  }>;
  answers: Array<{
    questionId: string;
    answer: string;
    order: number;
  }>;
};

export const getTopicalData = async ({
  curriculumId,
  subjectId,
  topic = [],
  paperType = [],
  year = [],
  season = [],
  page = 0,
}: FilterData & {
  curriculumId: string;
  subjectId: string;
  page: number;
}): Promise<ServerActionResponse<SelectedQuestion[]>> => {
  try {
    if (!validateCurriculum(curriculumId)) {
      return {
        success: false,
        data: [],
        error: "Invalid curriculum",
      };
    }
    if (!validateSubject(curriculumId, subjectId)) {
      return {
        success: false,
        data: [],
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
        data: [],
        error: "Invalid filters",
      };
    }

    const db = await getDbAsync();

    // Build query conditions
    const conditions = [
      eq(question.curriculumName, curriculumId),
      eq(question.subjectId, subjectId),
    ];

    // Add optional filters when they have values
    if (topic.length > 0) {
      conditions.push(inArray(question.topic, topic));
    }

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

    const data = await db.query.question.findMany({
      where: and(...conditions),
      columns: {
        id: true,
        year: true,
        paperType: true,
        season: true,
        topic: true,
      },
      with: {
        questionImages: {
          orderBy: (table) => [asc(table.order)],
        },
        answers: {
          orderBy: (table) => [asc(table.order)],
        },
      },
      limit: PAGE_SIZE,
      offset: page * PAGE_SIZE,
    });

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      data: [],
    };
  }
};

export const getUserBookmarksAction = async (): Promise<
  ServerActionResponse<{ questionId: string }[]>
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
    return { success: true, data: bookmarks };
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
