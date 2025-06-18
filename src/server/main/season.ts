"use server";
import { getDb } from "@/drizzle/db";
import * as schema from "@/drizzle/schema";
import { and, eq } from "drizzle-orm";

export const createSeason = async ({
  season,
  subjectId,
}: {
  season: string;
  subjectId: string;
}) => {
  const db = getDb();
  await db.insert(schema.season).values({ season, subjectId });
};

export const getSeason = async (subjectId: string): Promise<string[]> => {
  const db = getDb();
  const result = await db
    .select()
    .from(schema.season)
    .where(eq(schema.season.subjectId, subjectId));
  return result.map((item) => item.season);
};

export const isSeasonExists = async (
  season: string,
  subjectId: string
): Promise<boolean> => {
  const db = getDb();
  const result = await db
    .select()
    .from(schema.season)
    .where(
      and(
        eq(schema.season.season, season),
        eq(schema.season.subjectId, subjectId)
      )
    )
    .limit(1);
  return result.length > 0;
};
