import 'server-only';
import { and, eq } from 'drizzle-orm';
import { getDbAsync } from '@/drizzle/db';
import { season } from '@/drizzle/schema';

export const createSeason = async ({
  season: seasonProp,
  subjectId,
  curriculumName,
}: {
  season: string;
  subjectId: string;
  curriculumName: string;
}) => {
  const db = await getDbAsync();
  await db
    .insert(season)
    .values({ season: seasonProp, subjectId, curriculumName });
};

export const getSeason = async (
  subjectId: string,
  curriculumName: string
): Promise<string[]> => {
  const db = await getDbAsync();
  const result = await db
    .select()
    .from(season)
    .where(
      and(
        eq(season.subjectId, subjectId),
        eq(season.curriculumName, curriculumName)
      )
    );
  return result.map((item) => item.season);
};

export const isSeasonExists = async (
  seasonProp: string,
  subjectId: string,
  curriculumName: string
): Promise<boolean> => {
  const db = await getDbAsync();
  const result = await db
    .select()
    .from(season)
    .where(
      and(
        eq(season.season, seasonProp),
        eq(season.subjectId, subjectId),
        eq(season.curriculumName, curriculumName)
      )
    )
    .limit(1);
  return result.length > 0;
};
