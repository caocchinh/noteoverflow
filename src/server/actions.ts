"use server";

import { verifySession } from "@/dal/verifySession";
import { redirect } from "next/navigation";
import { ServerActionResponse } from "@/constants/types";
import { getCurriculum } from "./main/curriculum";
import { getSubjectByCurriculum } from "./main/subject";
import { getYear } from "./main/year";
import { getSeason } from "./main/season";
import { getPaperType } from "./main/paperType";
import { getTopic } from "./main/topic";
import { createQuestionImage } from "./main/question";
import { createAnswer } from "./main/answer";
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
