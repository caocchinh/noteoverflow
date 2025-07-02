import 'server-only';
import { and, eq } from 'drizzle-orm';
import { getDbAsync } from '@/drizzle/db';
import { paperType } from '@/drizzle/schema';

export const createPaperType = async ({
  paperType: paperTypeProp,
  subjectId,
}: {
  paperType: number;
  subjectId: string;
}) => {
  const db = await getDbAsync();
  await db.insert(paperType).values({ paperType: paperTypeProp, subjectId });
};

export const getPaperType = async (subjectId: string): Promise<number[]> => {
  const db = await getDbAsync();
  const result = await db
    .select()
    .from(paperType)
    .where(eq(paperType.subjectId, subjectId));
  return result.map((item) => item.paperType);
};

export const isPaperTypeExists = async (
  paperTypeProp: number,
  subjectId: string
): Promise<boolean> => {
  const db = await getDbAsync();
  const result = await db
    .select()
    .from(paperType)
    .where(
      and(
        eq(paperType.paperType, paperTypeProp),
        eq(paperType.subjectId, subjectId)
      )
    )
    .limit(1);
  return result.length > 0;
};
