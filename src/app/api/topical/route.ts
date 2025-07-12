import { BAD_REQUEST, INTERNAL_SERVER_ERROR } from "@/constants/constants";
import {
  validateCurriculum,
  validateSubject,
} from "@/features/topical/lib/utils";
import { validateFilterData } from "@/features/topical/lib/utils";
import { question, questionTopic } from "@/drizzle/schema";
import { and, eq, inArray } from "drizzle-orm";
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
    } else {
      return NextResponse.json({ error: BAD_REQUEST }, { status: 400 });
    }

    if (year.length > 0) {
      const yearNumbers = year.map((y) => Number.parseInt(y, 10));
      conditions.push(inArray(question.year, yearNumbers));
    } else {
      return NextResponse.json({ error: BAD_REQUEST }, { status: 400 });
    }

    if (season.length > 0) {
      conditions.push(inArray(question.season, season));
    } else {
      return NextResponse.json({ error: BAD_REQUEST }, { status: 400 });
    }

    if (topic.length > 0) {
      const rows = await db
        .select({
          topic: questionTopic.topic,
          season: question.season,
          year: question.year,
          paperType: question.paperType,
          id: question.id,
          answers: question.answers,
          questionImages: question.questionImages,
        })
        .from(questionTopic)
        .innerJoin(
          question,
          and(
            eq(questionTopic.questionId, question.id),
            inArray(questionTopic.topic, topic)
          )
        )
        .where(and(...conditions));

      // Aggregate all topics for each question
      const questionMap = new Map<
        string,
        Omit<SelectedQuestion, "questionTopics"> & {
          questionTopics: Array<{ topic: string | null }>;
        }
      >();

      for (const row of rows) {
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
          });
        } else {
          existing.questionTopics.push({ topic: row.topic });
        }
      }

      const formattedData = Array.from(questionMap.values());
      return NextResponse.json(
        {
          data: formattedData as SelectedQuestion[],
          isRateLimited: session?.session ? false : true,
        },
        { status: 200 }
      );
    } else {
      return NextResponse.json({ error: BAD_REQUEST }, { status: 400 });
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: INTERNAL_SERVER_ERROR }, { status: 500 });
  }
}
