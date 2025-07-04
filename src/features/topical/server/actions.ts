'use server';
import { and, asc, eq, type InferSelectModel, inArray } from 'drizzle-orm';
import type { ServerActionResponse } from '@/constants/types';
import { getDbAsync } from '@/drizzle/db';
import { question } from '@/drizzle/schema';
import {
  validateCurriculum,
  validateFilterData,
  validateSubject,
} from '@/features/topical/lib/utils';
import { PAGE_SIZE } from '../constants/constants';
import type { FilterData } from '../constants/types';

// Define a type for our selected question fields
type SelectedQuestion = Pick<InferSelectModel<typeof question>, 'topic'> & {
  questionImages: Array<{
    questionId: string;
    imageSrc: string;
    order: number;
  }>;
};

export const getTopicalData = async ({
  curriculumId,
  subjectId,
  topic = [],
  paperType = [],
  year = [],
  season = [],
  page = 0,
}: FilterData & {
  curriculumId: string;
  subjectId: string;
  page: number;
}): Promise<ServerActionResponse<SelectedQuestion[]>> => {
  try {
    if (!validateCurriculum(curriculumId)) {
      return {
        success: false,
        data: [],
        error: 'Invalid curriculum',
      };
    }
    if (!validateSubject(curriculumId, subjectId)) {
      return {
        success: false,
        data: [],
        error: 'Invalid subject',
      };
    }
    if (
      !validateFilterData({
        data: { topic, paperType, year, season },
        curriculumn: curriculumId,
        subject: subjectId,
      })
    ) {
      return {
        success: false,
        data: [],
        error: 'Invalid filters',
      };
    }

    const db = await getDbAsync();

    // Build query conditions
    const conditions = [
      eq(question.curriculumName, curriculumId),
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
      columns: {
        id: true,
        topic: true,
      },
      with: {
        questionImages: {
          orderBy: (table) => [asc(table.order)],
        },
      },
      limit: PAGE_SIZE,
      offset: page * PAGE_SIZE,
    });

    return {
      success: true,
      data,
    };
  } catch (error) {
    // biome-ignore lint/suspicious/noConsole: <Needed for debugging on server>
    console.error(error);
    return {
      success: false,
      data: [],
    };
  }
};
