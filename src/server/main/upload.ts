"use server";

import { createCurriculum, isCurriculumExists } from "./curriculum";
import { createSubject, isSubjectExists } from "./subject";
import { createTopic, isTopicExists } from "./topic";
import { createPaperType, isPaperTypeExists } from "./paperType";
import { createSeason, isSeasonExists } from "./season";
import { createYear, isYearExists } from "./year";
import { createQuestion } from "./question";
import { verifySession } from "@/dal/verifySession";
import { redirect } from "next/navigation";

type BatchUploadPayload = {
  curriculumName: string;
  subjectId: string;
  topic: string;
  paperType: number;
  season: "Summer" | "Winter" | "Spring";
  year: number;
  questionId: string;
  questionNumber: number;
  paperVariant: number;
};

export async function createMetadataRecords(
  payload: BatchUploadPayload
): Promise<{
  success: boolean;
  error: string | undefined;
}> {
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
      error: undefined,
    };
  } catch (error) {
    console.error("Error creating metadata records:", error);
    return {
      success: false,
      error: "Internal Server Error",
    };
  }
}
