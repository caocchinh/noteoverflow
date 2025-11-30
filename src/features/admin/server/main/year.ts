import "server-only";
import { and, eq } from "drizzle-orm";
import { getDbAsync } from "@/drizzle/db.server";
import { year } from "@/drizzle/schema";

export const createYear = async ({
  year: yearProp,
  subjectId,
  curriculumName,
}: {
  year: number;
  subjectId: string;
  curriculumName: string;
}) => {
  const db = await getDbAsync();
  await db.insert(year).values({ year: yearProp, subjectId, curriculumName });
};

export const getYear = async (
  subjectId: string,
  curriculumName: string
): Promise<number[]> => {
  const db = await getDbAsync();
  const result = await db
    .select()
    .from(year)
    .where(
      and(
        eq(year.subjectId, subjectId),
        eq(year.curriculumName, curriculumName)
      )
    );
  return result.map((item) => item.year);
};

export const isYearExists = async (
  yearProp: number,
  subjectId: string,
  curriculumName: string
): Promise<boolean> => {
  const db = await getDbAsync();
  const result = await db
    .select()
    .from(year)
    .where(
      and(
        eq(year.year, yearProp),
        eq(year.subjectId, subjectId),
        eq(year.curriculumName, curriculumName)
      )
    )
    .limit(1);
  return result.length > 0;
};
