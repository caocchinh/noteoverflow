"use server";

import {redirect} from "next/navigation";
import {BAD_REQUEST, INTERNAL_SERVER_ERROR} from "@/constants/constants";
import type {ServerActionResponse, UploadPayload} from "@/constants/types";
import {verifySession} from "@/dal/verifySession";
import {isValidQuestionId} from "@/lib/utils";
import {createCurriculum, isCurriculumExists} from "@/server/main/curriculum";
import {createPaperType, isPaperTypeExists} from "@/server/main/paperType";
import {createQuestion} from "@/server/main/question";
import {createSeason, isSeasonExists} from "@/server/main/season";
import {createSubject, isSubjectExists} from "@/server/main/subject";
import {createTopic, isTopicExists} from "@/server/main/topic";
import {createYear, isYearExists} from "@/server/main/year";
import {
  validateCurriculum,
  validatePaperType,
  validatePaperVariant,
  validateQuestionNumber,
  validateSeason,
  validateSubject,
  validateTopic,
  validateYear,
} from "../lib/utils";

export async function uploadAction(payload: UploadPayload): Promise<ServerActionResponse<void>> {
  if (
    typeof payload.curriculumName !== "string" ||
    typeof payload.subjectId !== "string" ||
    typeof payload.year !== "number" ||
    typeof payload.season !== "string" ||
    typeof payload.paperType !== "number" ||
    typeof payload.topic !== "string" ||
    typeof payload.questionNumber !== "number" ||
    typeof payload.paperVariant !== "number" ||
    !payload.questionId ||
    !payload.questionNumber ||
    !payload.year ||
    !payload.season ||
    !payload.paperType ||
    !payload.topic ||
    !payload.paperVariant ||
    validateSubject(payload.subjectId) ||
    validateCurriculum(payload.curriculumName) ||
    validateTopic(payload.topic) ||
    validatePaperType(payload.paperType.toString()) ||
    validateSeason(payload.season) ||
    validateYear(payload.year.toString()) ||
    validateQuestionNumber(payload.questionNumber.toString()) ||
    validatePaperVariant(payload.paperVariant.toString()) ||
    !isValidQuestionId(payload.questionId)
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
    // Check and create curriculum if needed
    if (!(await isCurriculumExists(payload.curriculumName))) {
      await createCurriculum({name: payload.curriculumName});
    }

    // Check and create subject if needed
    if (!(await isSubjectExists(payload.subjectId, payload.curriculumName))) {
      await createSubject({
        subjectId: payload.subjectId,
        curriculumName: payload.curriculumName,
      });
    }

    // Run parallel operations for the rest of the metadata
    await Promise.all([
      // Check and create year if needed
      (async () => {
        if (!(await isYearExists(payload.year, payload.subjectId, payload.curriculumName))) {
          await createYear({
            year: payload.year,
            subjectId: payload.subjectId,
            curriculumName: payload.curriculumName,
          });
        }
      })(),

      // Check and create season if needed
      (async () => {
        if (!(await isSeasonExists(payload.season, payload.subjectId, payload.curriculumName))) {
          await createSeason({
            season: payload.season,
            subjectId: payload.subjectId,
            curriculumName: payload.curriculumName,
          });
        }
      })(),

      // Check and create paper type if needed
      (async () => {
        if (!(await isPaperTypeExists(payload.paperType, payload.subjectId, payload.curriculumName))) {
          await createPaperType({
            paperType: payload.paperType,
            subjectId: payload.subjectId,
            curriculumName: payload.curriculumName,
          });
        }
      })(),

      // Check and create topic if needed
      (async () => {
        if (!(await isTopicExists(payload.topic, payload.subjectId, payload.curriculumName))) {
          await createTopic({
            topic: payload.topic,
            subjectId: payload.subjectId,
            curriculumName: payload.curriculumName,
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
      curriculumName: payload.curriculumName,
      subjectId: payload.subjectId,
      topic: payload.topic,
      questionNumber: payload.questionNumber,
    });

    return {
      success: true,
    };
  } catch (error) {
    console.error("Content:: Error creating metadata records:", error);
    return {
      success: false,
      error: INTERNAL_SERVER_ERROR,
    };
  }
}
