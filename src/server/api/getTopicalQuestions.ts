import "server-only";
import {
  validateCurriculum,
  validateSubject,
  validateFilterData,
  hashQuery,
} from "@/features/topical/lib/utils";
import { question } from "@/drizzle/schema";
import { and, eq, inArray, like, or } from "drizzle-orm";
import { verifySession } from "@/dal/verifySession";
import { getDbAsync } from "@/drizzle/db.server";
import {
  FilterData,
  SelectedQuestion,
} from "@/features/topical/constants/types";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { HTTP_STATUS, ERROR_CODES, ERROR_MESSAGES } from "@/lib/errors";

interface TopicalQuery {
  curriculumId: string;
  subjectId: string;
  topic: string;
  paperType: string;
  year: string;
  season: string;
}

export const getTopicalQuestions = async ({
  query,
  status,
}: {
  query: TopicalQuery;
  status: (code: number, body: { error: string; code: string }) => void;
}) => {
  const curriculumId = decodeURIComponent(query.curriculumId);
  const subjectId = decodeURIComponent(query.subjectId);
  const topic = JSON.parse(
    decodeURIComponent(query.topic)
  ).toSorted() as string[];
  const paperType = JSON.parse(
    decodeURIComponent(query.paperType)
  ).toSorted() as string[];
  const year = JSON.parse(
    decodeURIComponent(query.year)
  ).toSorted() as string[];
  const season = JSON.parse(
    decodeURIComponent(query.season)
  ).toSorted() as string[];

  if (!validateCurriculum(curriculumId)) {
    return status(HTTP_STATUS.BAD_REQUEST, {
      error: ERROR_MESSAGES[ERROR_CODES.BAD_REQUEST],
      code: ERROR_CODES.BAD_REQUEST,
    });
  }
  if (!validateSubject(curriculumId, subjectId)) {
    return status(HTTP_STATUS.BAD_REQUEST, {
      error: ERROR_MESSAGES[ERROR_CODES.BAD_REQUEST],
      code: ERROR_CODES.BAD_REQUEST,
    });
  }
  if (
    !validateFilterData({
      data: { topic, paperType, year, season },
      curriculumn: curriculumId,
      subject: subjectId,
    })
  ) {
    return status(HTTP_STATUS.BAD_REQUEST, {
      error: ERROR_MESSAGES[ERROR_CODES.BAD_REQUEST],
      code: ERROR_CODES.BAD_REQUEST,
    });
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

    if (paperType.length > 0) {
      const paperTypeNumbers = paperType.map((p: string) =>
        Number.parseInt(p, 10)
      );
      conditions.push(inArray(question.paperType, paperTypeNumbers));
    } else {
      return status(HTTP_STATUS.BAD_REQUEST, {
        error: ERROR_MESSAGES[ERROR_CODES.BAD_REQUEST],
        code: ERROR_CODES.BAD_REQUEST,
      });
    }

    if (year.length > 0) {
      const yearNumbers = year.map((y: string) => Number.parseInt(y, 10));
      conditions.push(inArray(question.year, yearNumbers));
    } else {
      return status(HTTP_STATUS.BAD_REQUEST, {
        error: ERROR_MESSAGES[ERROR_CODES.BAD_REQUEST],
        code: ERROR_CODES.BAD_REQUEST,
      });
    }

    if (season.length > 0) {
      conditions.push(inArray(question.season, season));
    } else {
      return status(HTTP_STATUS.BAD_REQUEST, {
        error: ERROR_MESSAGES[ERROR_CODES.BAD_REQUEST],
        code: ERROR_CODES.BAD_REQUEST,
      });
    }

    if (topic.length === 0) {
      return status(HTTP_STATUS.BAD_REQUEST, {
        error: ERROR_MESSAGES[ERROR_CODES.BAD_REQUEST],
        code: ERROR_CODES.BAD_REQUEST,
      });
    }

    const topicsCondition = topic.map((t: string) =>
      like(question.topics, "%" + t.slice(0, 45) + "%")
    );
    const topicsOrCondition = or(...topicsCondition);
    if (topicsOrCondition) {
      conditions.push(topicsOrCondition);
    }

    const dbResult = await db.query.question.findMany({
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
    });

    const data: SelectedQuestion[] = dbResult.map((item) => {
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

    const baseQuery: {
      curriculumId: string;
      subjectId: string;
      isRateLimited?: boolean;
    } & FilterData = {
      curriculumId,
      subjectId,
      topic,
      paperType,
      year,
      season,
    };

    const rateLimitedHash = await hashQuery(
      JSON.stringify({ ...baseQuery, isRateLimited: true })
    );
    const nonRateLimitedHash = await hashQuery(
      JSON.stringify({ ...baseQuery, isRateLimited: false })
    );

    await Promise.all([
      env.TOPICAL_CACHE.put(
        rateLimitedHash,
        JSON.stringify(data.toSpliced(25)),
        {
          expirationTtl: 60 * 60 * 24 * 14,
        }
      ),
      env.TOPICAL_CACHE.put(nonRateLimitedHash, JSON.stringify(data), {
        expirationTtl: 60 * 60 * 24 * 14,
      }),
    ]);

    return {
      data: isRateLimited ? data.toSpliced(25) : data,
      isRateLimited,
    };
  } else {
    return {
      data: JSON.parse(result) as SelectedQuestion[],
      isRateLimited,
    };
  }
};
