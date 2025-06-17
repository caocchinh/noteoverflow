"use server";

import { eq } from "drizzle-orm";
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

export const uploadQuestion = async ({
  userId,
  yearId,
  seasonId,
  paperTypeId,
  paperVariant,
  subjectId,
  topicName,
  questionNumber,
  questionOrder,
  questionImageSrc,
  questionId,
}: {
  userId: string;
  yearId: string;
  seasonId: string;
  paperTypeId: string;
  paperVariant: string;
  subjectId: string;
  topicName: string;
  questionNumber: number;
  questionOrder: number;
  questionImageSrc: string;
  questionId: string;
}) => {
  const db = getDb();

  await db
    .insert(schema.question)
    .values({
      id: questionId,
      yearId,
      seasonId,
      paperTypeId,
      paperVariant,
      uploadedBy: userId,
      subjectId,
      topicName,
      questionNumber,
      questionOrder,
      questionImageSrc,
    })
    .onConflictDoUpdate({
      target: schema.question.id,
      set: {
        yearId,
        seasonId,
        paperTypeId,
        paperVariant,
        uploadedBy: userId,
        subjectId,
        topicName,
        questionNumber,
        questionOrder,
        questionImageSrc,
        updatedAt: new Date(),
      },
    });
};

export const uploadAnswer = async ({
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
      target: [schema.answer.questionId, schema.answer.answerOrder],
      set: {
        answerImageSrc,
      },
    });
};
