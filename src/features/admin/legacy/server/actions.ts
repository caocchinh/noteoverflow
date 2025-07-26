"use server";

import { redirect } from "next/navigation";
import { BAD_REQUEST, INTERNAL_SERVER_ERROR } from "@/constants/constants";
import type {
  ServerActionResponse,
  ValidContentType,
  ValidSeason,
} from "@/constants/types";
import { verifySession } from "@/dal/verifySession";
import { isValidQuestionId } from "@/lib/utils";
import { createCurriculum, isCurriculumExists } from "@/server/main/curriculum";
import { createPaperType, isPaperTypeExists } from "@/server/main/paperType";
import { createQuestion, isQuestionExists } from "@/server/main/question";
import { createSeason, isSeasonExists } from "@/server/main/season";
import { createSubject, isSubjectExists } from "@/server/main/subject";
import { createTopic, isTopicExists } from "@/server/main/topic";
import { createYear, isYearExists } from "@/server/main/year";
import {
  validateCurriculum,
  validatePaperType,
  validatePaperVariant,
  validateQuestionNumber,
  validateSeason,
  validateSubject,
  validateTopic,
  validateYear,
} from "../../content/lib/utils";
import { question, topic as topicTable } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import { getDbAsync } from "@/drizzle/db";

function insertAtIndex(array: string[], index: number, element: string) {
  const newArray = [...array];

  // Fill gaps with empty strings if needed
  if (index >= newArray.length) {
    for (let i = newArray.length; i < index; i++) {
      newArray[i] = "";
    }
    newArray[index] = element;
  } else {
    // If element at index is an empty string, replace it
    if (newArray[index] === "") {
      newArray[index] = element;
    } else {
      // Otherwise insert and shift existing elements
      newArray.splice(index, 0, element);
    }
  }

  return newArray;
}

function updateAtIndex<T>(arr: readonly T[], index: number, value: T): T[] {
  if (index < 0 || index >= arr.length) return [...arr]; // -- out of range
  return [...arr.slice(0, index), value, ...arr.slice(index + 1)];
}

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
    if (!session) {
      return redirect("/authentication");
    }
    if (session.user.role !== "admin" && session.user.role !== "owner") {
      redirect("/app");
    }
    const userId = session.user.id;
    // Check and create curriculum if needed
    if (!(await isCurriculumExists(curriculum))) {
      await createCurriculum({ name: curriculum });
    }

    // Check and create subject if needed
    if (!(await isSubjectExists(subjectFullName, curriculum))) {
      await createSubject({
        subjectId: subjectFullName,
        curriculumName: curriculum,
      });
    }
    // Check and create year, season, paperType, and topic concurrently
    await Promise.all([
      // Check and create year if needed
      (async () => {
        if (!(await isYearExists(year, subjectFullName, curriculum))) {
          await createYear({
            year,
            subjectId: subjectFullName,
            curriculumName: curriculum,
          });
        }
      })(),

      // Check and create season if needed
      (async () => {
        if (!(await isSeasonExists(season, subjectFullName, curriculum))) {
          await createSeason({
            season,
            subjectId: subjectFullName,
            curriculumName: curriculum,
          });
        }
      })(),

      // Check and create paperType if needed
      (async () => {
        if (
          !(await isPaperTypeExists(paperType, subjectFullName, curriculum))
        ) {
          await createPaperType({
            paperType,
            subjectId: subjectFullName,
            curriculumName: curriculum,
          });
        }
      })(),

      // Check and create topic if needed
      (async () => {
        if (
          !(await isTopicExists(
            JSON.stringify([topic]),
            subjectFullName,
            curriculum
          ))
        ) {
          await createTopic({
            topic: JSON.stringify([topic]),
            subjectId: subjectFullName,
            curriculumName: curriculum,
          });
        }
      })(),
    ]);

    // Create or overwrite question/answer based on content type
    if (contentType === "questions") {
      if (await isQuestionExists(questionId)) {
        const db = await getDbAsync();
        const existingQuestionImages = await db
          .select({ questionImages: question.questionImages })
          .from(question)
          .where(eq(question.id, questionId));
        if (
          existingQuestionImages[0].questionImages &&
          existingQuestionImages[0].questionImages.length > 0
        ) {
          const parsedQuestionImages = JSON.parse(
            existingQuestionImages[0].questionImages as unknown as string
          ) as string[];
          if (!parsedQuestionImages.includes(imageSrc)) {
            if (
              parsedQuestionImages[order] !== imageSrc &&
              (parsedQuestionImages[order] == "" ||
                parsedQuestionImages[order] !== undefined)
            ) {
              await db
                .update(question)
                .set({
                  questionImages: JSON.stringify(
                    updateAtIndex(parsedQuestionImages, order, imageSrc)
                  ),
                })
                .where(eq(question.id, questionId));
            } else {
              await db
                .update(question)
                .set({
                  questionImages: JSON.stringify(
                    insertAtIndex(parsedQuestionImages, order, imageSrc)
                  ),
                })
                .where(eq(question.id, questionId));
            }
          }
        }
      } else {
        createQuestion({
          questionId,
          year,
          season,
          paperType,
          paperVariant,
          userId,
          subjectId: subjectFullName,
          questionNumber,
          curriculumName: curriculum,
          questionImages: JSON.stringify(insertAtIndex([], order, imageSrc)),
        });
      }
    } else if (contentType === "answers") {
      // Answer always come after question creation so certain that no constraint error
      const db = await getDbAsync();
      const existingAnswers = await db
        .select({ answers: question.answers })
        .from(question)
        .where(eq(question.id, questionId));
      if (existingAnswers[0].answers && existingAnswers[0].answers.length > 0) {
        const parsedAnswers = JSON.parse(
          existingAnswers[0].answers as unknown as string
        ) as string[];
        const isNotMultipleChoice = parsedAnswers.some((answer) =>
          answer.includes("http")
        );
        if (!isNotMultipleChoice) {
          await db
            .update(question)
            .set({
              answers: JSON.stringify([imageSrc]),
            })
            .where(eq(question.id, questionId));
          return {
            success: true,
          };
        }

        if (!parsedAnswers.includes(imageSrc)) {
          if (
            parsedAnswers[order] !== imageSrc &&
            (parsedAnswers[order] == "" || parsedAnswers[order] !== undefined)
          ) {
            await db
              .update(question)
              .set({
                answers: JSON.stringify(
                  updateAtIndex(parsedAnswers, order, imageSrc)
                ),
              })
              .where(eq(question.id, questionId));
          } else {
            await db
              .update(question)
              .set({
                answers: JSON.stringify(
                  insertAtIndex(parsedAnswers, order, imageSrc)
                ),
              })
              .where(eq(question.id, questionId));
          }
        }
      } else {
        const answer = imageSrc.includes("http")
          ? insertAtIndex([], order, imageSrc)
          : [imageSrc];
        await db
          .update(question)
          .set({ answers: JSON.stringify(answer) })
          .where(eq(question.id, questionId));
      }
    }
    const db = await getDbAsync();

    const existingTopics = await db
      .select({ topics: question.topics })
      .from(question)
      .where(eq(question.id, questionId));

    const parsedTopics = JSON.parse(
      existingTopics[0] && existingTopics[0].topics
        ? existingTopics[0].topics
        : "[]"
    ) as string[];
    if (!parsedTopics.includes(topic)) {
      parsedTopics.push(topic);
      await db
        .insert(topicTable)
        .values({
          topic: JSON.stringify(parsedTopics.toSorted()),
          subjectId: subjectFullName,
          curriculumName: curriculum,
        })
        .onConflictDoNothing();
      await db
        .update(question)
        .set({
          topics: JSON.stringify(parsedTopics.toSorted()),
        })
        .where(eq(question.id, questionId));
    }

    return {
      success: true,
    };
  } catch (error) {
    console.error("Legacy:: Error creating metadata records:", error);
    return {
      success: false,
      error: INTERNAL_SERVER_ERROR,
    };
  }
};
