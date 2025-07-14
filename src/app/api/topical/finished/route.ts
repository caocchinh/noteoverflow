import { INTERNAL_SERVER_ERROR, UNAUTHORIZED } from "@/constants/constants";
import { verifySession } from "@/dal/verifySession";
import { getDbAsync } from "@/drizzle/db";
import { finishedQuestions } from "@/drizzle/schema";
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
        questionId: true,
        updatedAt: true,
      },
    });
    return NextResponse.json({ data: finishedQuestionsData }, { status: 200 });
  } catch (error) {
    if (error instanceof Error && error.message === UNAUTHORIZED) {
      return NextResponse.json({ error: UNAUTHORIZED }, { status: 401 });
    }
    console.error(error);
    return NextResponse.json({ error: INTERNAL_SERVER_ERROR }, { status: 500 });
  }
}
