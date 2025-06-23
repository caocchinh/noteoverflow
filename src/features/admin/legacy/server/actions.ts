"use server";

import { ServerActionResponse } from "@/constants/types";
import { verifySession } from "@/dal/verifySession";
import { redirect } from "next/navigation";
import { isCurriculumExists } from "@/server/main/curriculum";
import { createCurriculum } from "@/server/main/curriculum";
import { isSubjectExists } from "@/server/main/subject";
import { createSubject } from "@/server/main/subject";
import { isYearExists } from "@/server/main/year";
import { createYear } from "@/server/main/year";
import { isSeasonExists } from "@/server/main/season";
import { createSeason } from "@/server/main/season";
import { isPaperTypeExists } from "@/server/main/paperType";
import { createPaperType } from "@/server/main/paperType";
import { createTopic, isTopicExists } from "@/server/main/topic";
import { overwriteQuestion } from "@/server/main/question";
import { overwriteQuestionImage } from "@/server/main/question";
import { overwriteAnswer } from "@/server/main/answer";
import { INTERNAL_SERVER_ERROR } from "@/constants/constants";

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
