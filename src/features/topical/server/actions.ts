import { and, eq, inArray } from 'drizzle-orm';
import { getDb } from '@/drizzle/db';
import { question, subject } from '@/drizzle/schema';
import type { FilterData } from '../constants/types';

export const getTopicalData = async ({
  curriculumId,
  subjectId,
  topic = [],
  paperType = [],
  year = [],
  season = [],
}: Partial<FilterData> & {
  curriculumId: string;
  subjectId: string;
}) => {
  try {
    const db = getDb();

    // Build query conditions
    const conditions = [
      eq(subject.curriculumName, curriculumId),
      eq(question.subjectId, subjectId),
    ];

    // Add optional filters when they have values
    if (topic.length > 0) {
      conditions.push(inArray(question.topic, topic));
    }

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

    const data = await db.query.question.findMany({
      where: and(...conditions),
    });

    return data;
  } catch (error) {
    // biome-ignore lint/suspicious/noConsole: <Needed for debugging on server>
    console.error(error);
    return [];
  }
};
