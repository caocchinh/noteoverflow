import { BAD_REQUEST, INTERNAL_SERVER_ERROR } from "@/constants/constants";
import {
  validateCurriculum,
  validateSubject,
} from "@/features/topical/lib/utils";
import { validateFilterData } from "@/features/topical/lib/utils";
import { question } from "@/drizzle/schema";
import { and, eq, inArray, like, or } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { verifySession } from "@/dal/verifySession";
import { getDbAsync } from "@/drizzle/db";
import {
  FilterData,
  SelectedQuestion,
} from "@/features/topical/constants/types";
import { getCloudflareContext } from "@opennextjs/cloudflare";

// Function to hash the query string
async function hashQuery(queryString: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(queryString);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return hashHex;
}

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

    const { env } = await getCloudflareContext({ async: true });
    const isRateLimited = session?.session ? false : true;

    const currentQuery: {
      curriculumId: string;
      subjectId: string;
      isRateLimited: boolean;
    } & FilterData = {
      curriculumId,
      subjectId,
      topic,
      paperType,
      year,
      season,
      isRateLimited,
    };

    const queryString = JSON.stringify(currentQuery);
    const hashedKey = await hashQuery(queryString);
    const result = await env.TOPICAL_CACHE.get(hashedKey);

    if (result === null) {
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
      if (topic.length === 0) {
        return NextResponse.json({ error: BAD_REQUEST }, { status: 400 });
      }
      const topicsCondition = topic.map((t) =>
        like(question.topics, "%" + t.slice(0, 45) + "%")
      );
      const topicsOrCondition = or(...topicsCondition);
      if (topicsOrCondition) {
        conditions.push(topicsOrCondition);
      }

      const result = await db.query.question.findMany({
        where: and(...conditions),
        columns: {
          id: true,
          year: true,
          paperType: true,
          season: true,
          questionImages: true,
          topics: true,
          answers: true,
        },
        limit: !session?.session ? 5 : undefined,
      });

      const data: SelectedQuestion[] = result.map((item) => {
        return {
          id: item.id,
          year: item.year,
          paperType: item.paperType,
          season: item.season,
          questionImages: JSON.parse(item.questionImages ?? "[]"),
          answers: JSON.parse(item.answers ?? "[]"),
          topics: JSON.parse(item.topics ?? "[]"),
        };
      });

      await env.TOPICAL_CACHE.put(hashedKey, JSON.stringify(data), {
        expirationTtl: 60 * 60 * 24 * 14,
      });

      return NextResponse.json(
        {
          data: data,
          isRateLimited,
        },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        {
          data: JSON.parse(result) as SelectedQuestion[],
          isRateLimited,
        },
        { status: 200 }
      );
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: INTERNAL_SERVER_ERROR }, { status: 500 });
  }
}
