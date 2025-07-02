import 'server-only';
import { and, eq } from 'drizzle-orm';
import { getDbAsync } from '@/drizzle/db';
import { year } from '@/drizzle/schema';

export const createYear = async ({
  year: yearProp,
  subjectId,
}: {
  year: number;
  subjectId: string;
}) => {
  const db = await getDbAsync();
  await db.insert(year).values({ year: yearProp, subjectId });
};

export const getYear = async (subjectId: string): Promise<number[]> => {
  const db = await getDbAsync();
  const result = await db
    .select()
    .from(year)
    .where(eq(year.subjectId, subjectId));
  return result.map((item) => item.year);
};

export const isYearExists = async (
  yearProp: number,
  subjectId: string
): Promise<boolean> => {
  const db = await getDbAsync();
  const result = await db
    .select()
    .from(year)
    .where(and(eq(year.year, yearProp), eq(year.subjectId, subjectId)))
    .limit(1);
  return result.length > 0;
};
