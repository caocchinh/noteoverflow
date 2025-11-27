import { INTERNAL_SERVER_ERROR } from "@/constants/constants";
import { getDbAsync } from "@/drizzle/db.server";
import { userAnnotations } from "@/drizzle/schema";
import { and, eq } from "drizzle-orm";

export const AnnotationService = {
  async saveAnnotations(
    userId: string,
    questionId: string,
    questionXfdf: string,
    answerXfdf: string
  ) {
    try {
      const db = await getDbAsync();
      await db
        .insert(userAnnotations)
        .values({
          userId,
          questionId,
          questionXfdf,
          answerXfdf,
          updatedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: [userAnnotations.userId, userAnnotations.questionId],
          set: {
            questionXfdf,
            answerXfdf,
            updatedAt: new Date(),
          },
        });

      return { success: true };
    } catch (error) {
      console.error("Error saving annotations:", error);
      return { error: INTERNAL_SERVER_ERROR, success: false };
    }
  },

  async getAnnotations(
    userId: string,
    questionId: string
  ): Promise<
    | {
        success: true;
        data: { questionXfdf: string | null; answerXfdf: string | null };
      }
    | { success: true; data: null }
    | { error: string; success: false }
  > {
    try {
      const db = await getDbAsync();
      const result = await db.query.userAnnotations.findFirst({
        where: and(
          eq(userAnnotations.userId, userId),
          eq(userAnnotations.questionId, questionId)
        ),
        columns: {
          questionXfdf: true,
          answerXfdf: true,
        },
      });

      if (!result) {
        return { success: true, data: null };
      }

      return {
        success: true,
        data: {
          questionXfdf: result.questionXfdf,
          answerXfdf: result.answerXfdf,
        },
      };
    } catch (error) {
      console.error("Error getting annotations:", error);
      return { error: INTERNAL_SERVER_ERROR, success: false };
    }
  },

  async deleteAnnotations(userId: string, questionId: string) {
    try {
      const db = await getDbAsync();
      await db
        .delete(userAnnotations)
        .where(
          and(
            eq(userAnnotations.userId, userId),
            eq(userAnnotations.questionId, questionId)
          )
        );

      return { success: true };
    } catch (error) {
      console.error("Error deleting annotations:", error);
      return { error: INTERNAL_SERVER_ERROR, success: false };
    }
  },
};
