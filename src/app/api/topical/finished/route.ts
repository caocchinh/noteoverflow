import { INTERNAL_SERVER_ERROR, UNAUTHORIZED } from "@/constants/constants";
import { verifySession } from "@/dal/verifySession";
import { getDbAsync } from "@/drizzle/db";
import { finishedQuestions, question, questionTopic } from "@/drizzle/schema";
import { SelectedQuestion } from "@/features/topical/constants/types";
import { eq, and } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await verifySession();
    if (!session) {
      return NextResponse.json({ error: UNAUTHORIZED }, { status: 401 });
    }
    const userId = session.user.id;
    const db = await getDbAsync();
    const finishedQuestionsData = await db
      .select({
        topic: questionTopic.topic,
        season: question.season,
        year: question.year,
        paperType: question.paperType,
        updatedAt: finishedQuestions.updatedAt,
        id: question.id,
        answers: question.answers,
        questionImages: question.questionImages,
      })
      .from(finishedQuestions)
      .innerJoin(
        question,
        and(
          eq(finishedQuestions.userId, userId),
          eq(question.id, finishedQuestions.questionId)
        )
      )
      .innerJoin(questionTopic, eq(questionTopic.questionId, question.id));

    const questionMap = new Map<
      string,
      Omit<SelectedQuestion, "questionTopics"> & {
        questionTopics: Array<{ topic: string | null }>;
        updatedAt: Date;
      }
    >();

    for (const row of finishedQuestionsData) {
      const parsedImages = JSON.parse(row.questionImages ?? "[]");
      const parsedAnswers = JSON.parse(row.answers ?? "[]");
      const existing = questionMap.get(row.id);

      if (!existing) {
        questionMap.set(row.id, {
          id: row.id,
          year: row.year,
          paperType: row.paperType,
          season: row.season,
          questionImages: parsedImages,
          answers: parsedAnswers,
          questionTopics: [{ topic: row.topic }],
          updatedAt: row.updatedAt,
        });
      } else {
        existing.questionTopics.push({ topic: row.topic });
      }
    }

    const formattedData = Array.from(questionMap.values());

    return NextResponse.json({ data: formattedData }, { status: 200 });
  } catch (error) {
    if (error instanceof Error && error.message === UNAUTHORIZED) {
      return NextResponse.json({ error: UNAUTHORIZED }, { status: 401 });
    }
    console.error(error);
    return NextResponse.json({ error: INTERNAL_SERVER_ERROR }, { status: 500 });
  }
}
