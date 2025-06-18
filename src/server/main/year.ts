"use server";
import { getDb } from "@/drizzle/db";
import * as schema from "@/drizzle/schema";
import { and, eq } from "drizzle-orm";

export const createYear = async ({
  year,
  subjectId,
}: {
  year: number;
  subjectId: string;
}) => {
  const db = getDb();
  await db.insert(schema.year).values({ year, subjectId });
};

export const getYear = async (subjectId: string): Promise<number[]> => {
  const db = getDb();
  const result = await db
    .select()
    .from(schema.year)
    .where(eq(schema.year.subjectId, subjectId));
  return result.map((item) => item.year);
};

export const isYearExists = async (
  year: number,
  subjectId: string
): Promise<boolean> => {
  const db = getDb();
  const result = await db
    .select()
    .from(schema.year)
    .where(
      and(eq(schema.year.year, year), eq(schema.year.subjectId, subjectId))
    )
    .limit(1);
  return result.length > 0;
};
