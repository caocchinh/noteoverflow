import "server-only";
import { getDb } from "@/drizzle/db";
import * as schema from "@/drizzle/schema";
import { and, eq } from "drizzle-orm";

export const createPaperType = async ({
  paperType,
  subjectId,
}: {
  paperType: number;
  subjectId: string;
}) => {
  const db = getDb();
  await db.insert(schema.paperType).values({ paperType, subjectId });
};

export const getPaperType = async (subjectId: string): Promise<number[]> => {
  const db = getDb();
  const result = await db
    .select()
    .from(schema.paperType)
    .where(eq(schema.paperType.subjectId, subjectId));
  return result.map((item) => item.paperType);
};

export const isPaperTypeExists = async (
  paperType: number,
  subjectId: string
): Promise<boolean> => {
  const db = getDb();
  const result = await db
    .select()
    .from(schema.paperType)
    .where(
      and(
        eq(schema.paperType.paperType, paperType),
        eq(schema.paperType.subjectId, subjectId)
      )
    )
    .limit(1);
  return result.length > 0;
};
