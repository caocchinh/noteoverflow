"use server";

import {
  ServerActionResponse,
  ValidContentType,
  ValidSeason,
} from "@/constants/types";
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
import { BAD_REQUEST, INTERNAL_SERVER_ERROR } from "@/constants/constants";
import {
  validateCurriculum,
  validatePaperType,
  validateSubject,
  validateYear,
  validateQuestionNumber,
  validatePaperVariant,
  validateSeason,
  validateTopic,
} from "../../content/lib/utils";
import { isValidQuestionId } from "@/lib/utils";

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
  year: number;
  season: ValidSeason;
  paperType: number;
  paperVariant: number;
  topic: string;
  questionId: string;
  questionNumber: number;
  contentType: ValidContentType;
  imageSrc: string;
  order: number;
}): Promise<ServerActionResponse<void>> => {
  if (
    typeof curriculum !== "string" ||
    typeof subjectFullName !== "string" ||
    typeof year !== "number" ||
    typeof season !== "string" ||
    typeof paperType !== "number" ||
    typeof paperVariant !== "number" ||
    typeof topic !== "string" ||
    typeof questionId !== "string" ||
    typeof questionNumber !== "number" ||
    typeof contentType !== "string" ||
    typeof imageSrc !== "string" ||
    typeof order !== "number" ||
    !questionId ||
    !questionNumber ||
    !year ||
    !season ||
    !paperType ||
    !paperVariant ||
    !topic ||
    !contentType ||
    !imageSrc ||
    order < 0 ||
    (contentType !== "questions" && contentType !== "answers") ||
    validateCurriculum(curriculum) ||
    validateSubject(subjectFullName) ||
    validateYear(year.toString()) ||
    validateSeason(season) ||
    validatePaperType(paperType.toString()) ||
    validatePaperVariant(paperVariant.toString()) ||
    validateQuestionNumber(questionNumber.toString()) ||
    validateTopic(topic) ||
    !isValidQuestionId(questionId)
  ) {
    return {
      success: false,
      error: BAD_REQUEST,
    };
  }

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
        if (!(await isYearExists(year, subjectFullName))) {
          await createYear({
            year: year,
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
        year: year,
        season: season,
        paperType: paperType,
        paperVariant: paperVariant,
        userId: userId,
        subjectId: subjectFullName,
        topic: topic,
        questionNumber: questionNumber,
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
