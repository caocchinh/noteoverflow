import { INTERNAL_SERVER_ERROR, UNAUTHORIZED } from "@/constants/constants";
import { verifySession } from "@/dal/verifySession";
import { getDbAsync } from "@/drizzle/db";
import { finishedQuestions } from "@/drizzle/schema";
import { SelectedFinishedQuestion } from "@/features/topical/constants/types";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await verifySession();
    if (!session) {
      return NextResponse.json({ error: UNAUTHORIZED }, { status: 401 });
    }
    const userId = session.user.id;
    const db = await getDbAsync();
    const finishedQuestionsData = await db.query.finishedQuestions.findMany({
      where: eq(finishedQuestions.userId, userId),
      columns: {
        updatedAt: true,
      },
      with: {
        question: {
          columns: {
            id: true,
            paperType: true,
            answers: true,
            questionImages: true,
            season: true,
            year: true,
          },
          with: {
            questionTopics: {
              columns: {
                topic: true,
              },
            },
          },
        },
      },
    });

    const data: SelectedFinishedQuestion[] = finishedQuestionsData.map(
      (item) => {
        return {
          updatedAt: item.updatedAt,
          questionId: item.question.id,
          question: {
            ...item.question,
            questionImages: JSON.parse(item.question.questionImages ?? "[]"),
            answers: JSON.parse(item.question.answers ?? "[]"),
          },
        };
      }
    );

    return NextResponse.json({ data }, { status: 200 });
  } catch (error) {
    if (error instanceof Error && error.message === UNAUTHORIZED) {
      return NextResponse.json({ error: UNAUTHORIZED }, { status: 401 });
    }
    console.error(error);
    return NextResponse.json({ error: INTERNAL_SERVER_ERROR }, { status: 500 });
  }
}
