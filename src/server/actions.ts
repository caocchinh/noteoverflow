"use server";

import { and, eq } from "drizzle-orm";
import { getDb } from "@/drizzle/db";
import * as schema from "@/drizzle/schema";
import { auth } from "@/lib/auth/auth";

export const updateUserAvatar = async (userId: string, avatar: string) => {
  if (!userId || !avatar) {
    throw new Error("User ID and avatar are required");
  }

  if (typeof userId !== "string" || typeof avatar !== "string") {
    throw new Error("User ID and avatar must be strings");
  }
  const response = await getDb()
    .update(schema.user)
    .set({ image: avatar })
    .where(eq(schema.user.id, userId));
  if (response.rowCount === 0) {
    throw new Error("User not found");
  }
};

export const isAdmin = async (userId: string): Promise<boolean> => {
  const response = await auth().api.userHasPermission({
    body: {
      userId,
      permission: {
        project: ["create", "update", "delete"],
      },
    },
  });
  if (response.error) {
    throw new Error("Failed to check admin status");
  }
  return response.success;
};

export const isOwner = async (userId: string): Promise<boolean> => {
  const response = await auth().api.userHasPermission({
    body: {
      userId,
      permission: {
        project: ["create", "update", "delete"],
        user: [
          "create",
          "list",
          "set-role",
          "ban",
          "impersonate",
          "delete",
          "set-password",
        ],
      },
    },
  });
  if (response.error) {
    throw new Error("Failed to check admin status");
  }
  return response.success;
};

export const createCurriculum = async ({ name }: { name: string }) => {
  const db = getDb();
  await db.insert(schema.curriculum).values({ name });
};

export const isCurriculumExists = async (name: string): Promise<boolean> => {
  const db = getDb();
  const result = await db
    .select()
    .from(schema.curriculum)
    .where(eq(schema.curriculum.name, name))
    .limit(1);

  return result.length > 0;
};

export const createSubject = async ({
  id,
  curriculumName,
}: {
  id: string;
  curriculumName: string;
}) => {
  const db = getDb();
  await db.insert(schema.subject).values({ id, curriculumName });
};

export const isSubjectExists = async (id: string): Promise<boolean> => {
  const db = getDb();
  const result = await db
    .select()
    .from(schema.subject)
    .where(eq(schema.subject.id, id))
    .limit(1);
  return result.length > 0;
};

export const createYear = async ({
  year,
  subjectId,
}: {
  year: number;
  subjectId: string;
}) => {
  const db = getDb();
  await db.insert(schema.year).values({ year, subjectId });
};

export const isYearExists = async (
  year: number,
  subjectId: string
): Promise<boolean> => {
  const db = getDb();
  const result = await db
    .select()
    .from(schema.year)
    .where(
      and(eq(schema.year.year, year), eq(schema.year.subjectId, subjectId))
    )
    .limit(1);
  return result.length > 0;
};

export const createSeason = async ({
  season,
  subjectId,
}: {
  season: string;
  subjectId: string;
}) => {
  const db = getDb();
  await db.insert(schema.season).values({ season, subjectId });
};

export const isSeasonExists = async (
  season: string,
  subjectId: string
): Promise<boolean> => {
  const db = getDb();
  const result = await db
    .select()
    .from(schema.season)
    .where(
      and(
        eq(schema.season.season, season),
        eq(schema.season.subjectId, subjectId)
      )
    )
    .limit(1);
  return result.length > 0;
};

export const createPaperType = async ({
  paperType,
  subjectId,
}: {
  paperType: number;
  subjectId: string;
}) => {
  const db = getDb();
  await db.insert(schema.paperType).values({ paperType, subjectId });
};

export const isPaperTypeExists = async (
  paperType: number,
  subjectId: string
): Promise<boolean> => {
  const db = getDb();
  const result = await db
    .select()
    .from(schema.paperType)
    .where(
      and(
        eq(schema.paperType.paperType, paperType),
        eq(schema.paperType.subjectId, subjectId)
      )
    )
    .limit(1);
  return result.length > 0;
};

export const createTopic = async ({
  topic,
  subjectId,
}: {
  topic: string;
  subjectId: string;
}) => {
  const db = getDb();
  await db.insert(schema.topic).values({ topic, subjectId });
};

export const isTopicExists = async (
  topic: string,
  subjectId: string
): Promise<boolean> => {
  const db = getDb();
  const result = await db
    .select()
    .from(schema.topic)
    .where(
      and(eq(schema.topic.topic, topic), eq(schema.topic.subjectId, subjectId))
    )
    .limit(1);
  return result.length > 0;
};

export const isQuestionExists = async (
  questionId: string
): Promise<boolean> => {
  const db = getDb();
  const result = await db
    .select()
    .from(schema.question)
    .where(eq(schema.question.id, questionId))
    .limit(1);
  return result.length > 0;
};

export const createQuestion = async ({
  questionId,
  year,
  season,
  paperType,
  paperVariant,
  userId,
  subjectId,
  topic,
  questionNumber,
}: {
  questionId: string;
  year: number;
  season: string;
  paperType: number;
  paperVariant: number;
  userId: string;
  subjectId: string;
  topic: string;
  questionNumber: number;
}) => {
  const db = getDb();
  await db.insert(schema.question).values({
    id: questionId,
    year,
    season,
    paperType,
    paperVariant,
    uploadedBy: userId,
    subjectId,
    topic,
    questionNumber,
  });
};

export const overwriteQuestion = async ({
  userId,
  year,
  season,
  paperType,
  paperVariant,
  subjectId,
  topic,
  questionNumber,

  questionId,
}: {
  userId: string;
  year: number;
  season: string;
  paperType: number;
  paperVariant: number;
  subjectId: string;
  topic: string;
  questionNumber: number;

  questionId: string;
}) => {
  const db = getDb();

  await db
    .insert(schema.question)
    .values({
      id: questionId,
      year,
      season,
      paperType,
      paperVariant,
      uploadedBy: userId,
      subjectId,
      topic,
      questionNumber,
    })
    .onConflictDoUpdate({
      target: schema.question.id,
      set: {
        year,
        season,
        paperType,
        paperVariant,
        uploadedBy: userId,
        subjectId,
        topic,
        questionNumber,
        updatedAt: new Date(),
      },
    });
};

export const isQuestionImageExists = async (
  questionId: string,
  order: number
): Promise<boolean> => {
  const db = getDb();
  const result = await db
    .select()
    .from(schema.questionImage)
    .where(
      and(
        eq(schema.questionImage.questionId, questionId),
        eq(schema.questionImage.order, order)
      )
    )
    .limit(1);
  return result.length > 0;
};

export const createQuestionImage = async ({
  questionId,
  imageSrc,
  order,
}: {
  questionId: string;
  imageSrc: string;
  order: number;
}) => {
  const db = getDb();
  await db.insert(schema.questionImage).values({ questionId, imageSrc, order });
};

export const overwriteQuestionImage = async ({
  questionId,
  imageSrc,
  order,
}: {
  questionId: string;
  imageSrc: string;
  order: number;
}) => {
  const db = getDb();

  await db
    .insert(schema.questionImage)
    .values({
      questionId,
      imageSrc,
      order,
    })
    .onConflictDoUpdate({
      target: [schema.questionImage.questionId, schema.questionImage.order],
      set: {
        imageSrc,
      },
    });
};

export const isAnswerExists = async (
  questionId: string,
  answerImageSrc: string
): Promise<boolean> => {
  const db = getDb();
  const result = await db
    .select()
    .from(schema.answer)
    .where(
      and(
        eq(schema.answer.questionId, questionId),
        eq(schema.answer.answerImageSrc, answerImageSrc)
      )
    )
    .limit(1);
  return result.length > 0;
};

export const createAnswer = async ({
  questionId,
  answerImageSrc,
  answerOrder,
}: {
  questionId: string;
  answerImageSrc: string;
  answerOrder: number;
}) => {
  const db = getDb();
  await db
    .insert(schema.answer)
    .values({ questionId, answerImageSrc, answerOrder });
};

export const overwriteAnswer = async ({
  questionId,
  answerImageSrc,
  answerOrder,
}: {
  questionId: string;
  answerImageSrc: string;
  answerOrder: number;
}) => {
  const db = getDb();

  await db
    .insert(schema.answer)
    .values({
      questionId,
      answerImageSrc,
      answerOrder,
    })
    .onConflictDoUpdate({
      target: [schema.answer.questionId, schema.answer.answerImageSrc],
      set: {
        answerImageSrc,
      },
    });
};
