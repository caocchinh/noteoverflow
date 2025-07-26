import "server-only";
import { eq } from "drizzle-orm";
import { getDbAsync } from "@/drizzle/db";
import { question } from "@/drizzle/schema";

export const isQuestionExists = async (
  questionId: string
): Promise<boolean> => {
  const db = await getDbAsync();
  const result = await db
    .select()
    .from(question)
    .where(eq(question.id, questionId))
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
  questionNumber,
  curriculumName,
  questionImages,
  answers,
}: {
  questionId: string;
  year: number;
  season: string;
  paperType: number;
  paperVariant: number;
  questionImages?: string;
  answers?: string;
  userId: string;
  subjectId: string;
  questionNumber: number;
  curriculumName: string;
}) => {
  const db = await getDbAsync();
  const field: {
    id: string;
    year: number;
    season: string;
    paperType: number;
    paperVariant: number;
    uploadedBy: string;
    subjectId: string;
    questionNumber: number;
    curriculumName: string;
    questionImages?: string;
    answers?: string;
  } = {
    id: questionId,
    year,
    season,
    paperType,
    paperVariant,
    uploadedBy: userId,
    subjectId,
    questionNumber,
    curriculumName,
  };
  if (questionImages) {
    field.questionImages = questionImages;
  }
  if (answers) {
    field.answers = answers;
  }
  await db.insert(question).values(field);
};
