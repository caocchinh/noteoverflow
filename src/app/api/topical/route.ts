import { BAD_REQUEST, INTERNAL_SERVER_ERROR } from "@/constants/constants";
import {
  validateCurriculum,
  validateSubject,
} from "@/features/topical/lib/utils";
import { validateFilterData } from "@/features/topical/lib/utils";
import { question, questionTopic } from "@/drizzle/schema";
import { and, eq, inArray, exists } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { verifySession } from "@/dal/verifySession";
import { getDbAsync } from "@/drizzle/db";
import { SelectedQuestion } from "@/features/topical/constants/types";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const curriculumId = searchParams.get("curriculumId") as string;
    const subjectId = searchParams.get("subjectId") as string;
    const topic = JSON.parse(searchParams.get("topic") as string) as string[];
    const paperType = JSON.parse(
      searchParams.get("paperType") as string
    ) as string[];
    const year = JSON.parse(searchParams.get("year") as string) as string[];
    const season = JSON.parse(searchParams.get("season") as string) as string[];
    if (!validateCurriculum(curriculumId)) {
      return NextResponse.json({ error: BAD_REQUEST }, { status: 400 });
    }
    if (!validateSubject(curriculumId, subjectId)) {
      return NextResponse.json({ error: BAD_REQUEST }, { status: 400 });
    }
    if (
      !validateFilterData({
        data: { topic, paperType, year, season },
        curriculumn: curriculumId,
        subject: subjectId,
      })
    ) {
      return NextResponse.json({ error: BAD_REQUEST }, { status: 400 });
    }

    const session = await verifySession();

    const db = await getDbAsync();

    // Build query conditions
    const conditions = [
      eq(question.curriculumName, curriculumId),
      eq(question.subjectId, subjectId),
    ];

    // Add optional filters when they have values

    if (paperType.length > 0) {
      const paperTypeNumbers = paperType.map((p) => Number.parseInt(p, 10));
      conditions.push(inArray(question.paperType, paperTypeNumbers));
    }

    if (year.length > 0) {
      const yearNumbers = year.map((y) => Number.parseInt(y, 10));
      conditions.push(inArray(question.year, yearNumbers));
    }

    if (season.length > 0) {
      conditions.push(inArray(question.season, season));
    }

    if (topic.length > 0) {
      conditions.push(
        exists(
          db
            .select()
            .from(questionTopic)
            .where(
              and(
                eq(questionTopic.questionId, question.id),
                inArray(questionTopic.topic, topic)
              )
            )
        )
      );
    }

    const data = await db.query.question.findMany({
      where: and(...conditions),
      columns: {
        id: true,
        year: true,
        paperType: true,
        season: true,
      },
      with: {
        questionTopics: {
          columns: {
            topic: true,
          },
        },
      },
      limit: session?.session ? undefined : 5,
    });

    return NextResponse.json(
      {
        data: data as SelectedQuestion[],
        isRateLimited: session?.session ? false : true,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: INTERNAL_SERVER_ERROR }, { status: 500 });
  }
}
