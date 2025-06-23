"use server";

import { verifySession } from "@/dal/verifySession";
import { redirect } from "next/navigation";
import { ServerActionResponse, UploadPayload } from "@/constants/types";
import {
  createCurriculum,
  getCurriculum,
  isCurriculumExists,
} from "./main/curriculum";
import { getSubjectByCurriculum, isSubjectExists } from "./main/subject";
import { createSubject } from "./main/subject";
import { getYear, isYearExists } from "./main/year";
import { createYear } from "./main/year";
import { getSeason, isSeasonExists } from "./main/season";
import { createSeason } from "./main/season";
import { getPaperType, isPaperTypeExists } from "./main/paperType";
import { createPaperType } from "./main/paperType";
import { getTopic, isTopicExists } from "./main/topic";
import { createTopic } from "./main/topic";
import {
  createQuestion,
  overwriteQuestion,
  overwriteQuestionImage,
  createQuestionImage,
} from "./main/question";
import { createAnswer, overwriteAnswer } from "./main/answer";
import {
  CurriculumType,
  SubjectType,
} from "@/features/admin/content/constants/types";
import { isQuestionExists } from "./main/question";
import { INTERNAL_SERVER_ERROR } from "@/constants/constants";
import { auth } from "@/lib/auth/auth";
import { getDbAsync } from "@/drizzle/db";
import { headers } from "next/headers";
import * as schema from "@/drizzle/schema";
import { eq } from "drizzle-orm";

export const updateUserAvatarAction = async (
  userId: string,
  avatar: string
) => {
  if (!userId || !avatar) {
    throw new Error("User ID and avatar are required");
  }

  if (typeof userId !== "string" || typeof avatar !== "string") {
    throw new Error("User ID and avatar must be strings");
  }
  const authInstance = await auth(getDbAsync);
  const session = await authInstance.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    throw new Error("Unauthorized");
  }
  if (session.user.role !== "admin" && session.user.role !== "owner") {
    throw new Error("Unauthorized");
  }
  const db = await getDbAsync();
  const response = await db
    .update(schema.user)
    .set({ image: avatar })
    .where(eq(schema.user.id, userId));
  if (response.rowCount === 0) {
    throw new Error("User not found");
  }
};

export const legacyUploadAction = async ({
  curriculum,
  subjectFullName,
  year,
  season,
  paperType,
  paperVariant,
  topic,
  questionId,
  questionNumber,
  contentType,
  imageSrc,
  order,
}: {
  curriculum: string;
  subjectFullName: string;
  year: string;
  season: "Summer" | "Winter" | "Spring";
  paperType: number;
  paperVariant: number;
  topic: string;
  questionId: string;
  questionNumber: string;
  contentType: "questions" | "answers";
  imageSrc: string;
  order: number;
}): Promise<ServerActionResponse<void>> => {
  try {
    const session = await verifySession();
    if (session.user.role !== "admin" && session.user.role !== "owner") {
      redirect("/app");
    }
    const userId = session.user.id;
    // Check and create curriculum if needed
    if (!(await isCurriculumExists(curriculum))) {
      await createCurriculum({ name: curriculum });
    }

    // Check and create subject if needed
    if (!(await isSubjectExists(subjectFullName))) {
      await createSubject({
        id: subjectFullName,
        curriculumName: curriculum,
      });
    }
    // Check and create year, season, paperType, and topic concurrently
    await Promise.all([
      // Check and create year if needed
      (async () => {
        if (!(await isYearExists(parseInt(year), subjectFullName))) {
          await createYear({
            year: parseInt(year),
            subjectId: subjectFullName,
          });
        }
      })(),

      // Check and create season if needed
      (async () => {
        if (!(await isSeasonExists(season, subjectFullName))) {
          await createSeason({
            season: season,
            subjectId: subjectFullName,
          });
        }
      })(),

      // Check and create paperType if needed
      (async () => {
        if (!(await isPaperTypeExists(paperType, subjectFullName))) {
          await createPaperType({
            paperType: paperType,
            subjectId: subjectFullName,
          });
        }
      })(),

      // Check and create topic if needed
      (async () => {
        if (!(await isTopicExists(topic, subjectFullName))) {
          await createTopic({
            topic: topic,
            subjectId: subjectFullName,
          });
        }
      })(),
    ]);

    // Create or overwrite question/answer based on content type
    if (contentType === "questions") {
      await overwriteQuestion({
        questionId: questionId,
        year: parseInt(year),
        season: season,
        paperType: paperType,
        paperVariant: paperVariant,
        userId: userId,
        subjectId: subjectFullName,
        topic: topic,
        questionNumber: parseInt(questionNumber[1]),
      });

      await overwriteQuestionImage({
        questionId: questionId,
        imageSrc: imageSrc,
        order: order,
      });
    } else if (contentType === "answers") {
      await overwriteAnswer({
        questionId: questionId,
        answerImageSrc: imageSrc,
        answerOrder: order,
      });
    }

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error processing curriculum data:", error);
    return {
      success: false,
      error: INTERNAL_SERVER_ERROR,
    };
  }
};

export async function uploadAction(
  payload: UploadPayload
): Promise<ServerActionResponse<void>> {
  try {
    const session = await verifySession();

    if (session.user.role !== "admin" && session.user.role !== "owner") {
      redirect("/app");
    }
    // Check and create curriculum if needed
    if (!(await isCurriculumExists(payload.curriculumName))) {
      await createCurriculum({ name: payload.curriculumName });
    }

    // Check and create subject if needed
    if (!(await isSubjectExists(payload.subjectId))) {
      await createSubject({
        id: payload.subjectId,
        curriculumName: payload.curriculumName,
      });
    }

    // Run parallel operations for the rest of the metadata
    await Promise.all([
      // Check and create year if needed
      (async () => {
        if (!(await isYearExists(payload.year, payload.subjectId))) {
          await createYear({
            year: payload.year,
            subjectId: payload.subjectId,
          });
        }
      })(),

      // Check and create season if needed
      (async () => {
        if (!(await isSeasonExists(payload.season, payload.subjectId))) {
          await createSeason({
            season: payload.season,
            subjectId: payload.subjectId,
          });
        }
      })(),

      // Check and create paper type if needed
      (async () => {
        if (!(await isPaperTypeExists(payload.paperType, payload.subjectId))) {
          await createPaperType({
            paperType: payload.paperType,
            subjectId: payload.subjectId,
          });
        }
      })(),

      // Check and create topic if needed
      (async () => {
        if (!(await isTopicExists(payload.topic, payload.subjectId))) {
          await createTopic({
            topic: payload.topic,
            subjectId: payload.subjectId,
          });
        }
      })(),
    ]);

    // Create the question
    await createQuestion({
      questionId: payload.questionId,
      year: payload.year,
      season: payload.season,
      paperType: payload.paperType,
      paperVariant: payload.paperVariant,
      userId: session.user.id,
      subjectId: payload.subjectId,
      topic: payload.topic,
      questionNumber: payload.questionNumber,
    });

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error creating metadata records:", error);
    return {
      success: false,
      error: INTERNAL_SERVER_ERROR,
    };
  }
}

export const getCurriculumAction = async (): Promise<
  ServerActionResponse<CurriculumType[]>
> => {
  try {
    const session = await verifySession();
    if (session.user.role !== "admin" && session.user.role !== "owner") {
      redirect("/app");
    }
    const data = await getCurriculum();
    return {
      success: true,
      data: data,
    };
  } catch (error) {
    console.error("Error getting curriculum data:", error);
    return {
      success: false,
      error: INTERNAL_SERVER_ERROR,
    };
  }
};

export const isQuestionExistsAction = async (
  questionId: string
): Promise<ServerActionResponse<boolean>> => {
  try {
    const session = await verifySession();
    if (session.user.role !== "admin" && session.user.role !== "owner") {
      redirect("/app");
    }
    const data = await isQuestionExists(questionId);
    return {
      success: true,
      data: data,
    };
  } catch (error) {
    console.error("Error checking if question exists:", error);
    return {
      success: false,
      error: INTERNAL_SERVER_ERROR,
    };
  }
};

export const getSubjectByCurriculumAction = async (
  curriculumName: string
): Promise<ServerActionResponse<SubjectType[]>> => {
  try {
    const session = await verifySession();
    if (session.user.role !== "admin" && session.user.role !== "owner") {
      redirect("/app");
    }
    const data = await getSubjectByCurriculum(curriculumName);
    return {
      success: true,
      data: data,
    };
  } catch (error) {
    console.error("Error getting subject data:", error);
    return {
      success: false,
      error: INTERNAL_SERVER_ERROR,
    };
  }
};

export const getSubjectInfoAction = async (
  subjectId: string
): Promise<
  ServerActionResponse<{
    topicData: string[];
    paperTypeData: number[];
    seasonData: string[];
    yearData: number[];
  }>
> => {
  try {
    const session = await verifySession();
    if (session.user.role !== "admin" && session.user.role !== "owner") {
      redirect("/app");
    }
    const data = await Promise.all([
      getTopic(subjectId ?? ""),
      getPaperType(subjectId ?? ""),
      getSeason(subjectId ?? ""),
      getYear(subjectId ?? ""),
    ]);
    const [topicData, paperTypeData, seasonData, yearData] = data;
    return {
      success: true,
      data: {
        topicData: topicData,
        paperTypeData: paperTypeData,
        seasonData: seasonData,
        yearData: yearData,
      },
    };
  } catch (error) {
    console.error("Error getting subject info:", error);
    return {
      success: false,
      error: INTERNAL_SERVER_ERROR,
    };
  }
};

export const createQuestionImageAction = async ({
  questionId,
  imageSrc,
  order,
}: {
  questionId: string;
  imageSrc: string;
  order: number;
}): Promise<ServerActionResponse<void>> => {
  try {
    const session = await verifySession();
    if (session.user.role !== "admin" && session.user.role !== "owner") {
      redirect("/app");
    }
    await createQuestionImage({
      questionId: questionId,
      imageSrc: imageSrc,
      order: order,
    });
    return {
      success: true,
    };
  } catch (error) {
    console.error("Error creating question image:", error);
    return {
      success: false,
      error: INTERNAL_SERVER_ERROR,
    };
  }
};

export const createAnswerAction = async ({
  questionId,
  answerImageSrc,
  answerOrder,
}: {
  questionId: string;
  answerImageSrc: string;
  answerOrder: number;
}): Promise<ServerActionResponse<void>> => {
  try {
    const session = await verifySession();
    if (session.user.role !== "admin" && session.user.role !== "owner") {
      redirect("/app");
    }
    await createAnswer({
      questionId: questionId,
      answerImageSrc: answerImageSrc,
      answerOrder: answerOrder,
    });
    return {
      success: true,
    };
  } catch (error) {
    console.error("Error creating answer:", error);
    return {
      success: false,
      error: INTERNAL_SERVER_ERROR,
    };
  }
};
