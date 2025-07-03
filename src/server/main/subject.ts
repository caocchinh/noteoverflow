import 'server-only';
import { and, eq } from 'drizzle-orm';
import { getDbAsync } from '@/drizzle/db';
import { subject } from '@/drizzle/schema';

export const createSubject = async ({
  id,
  curriculumName,
}: {
  id: string;
  curriculumName: string;
}) => {
  const db = await getDbAsync();
  await db.insert(subject).values({ id, curriculumName });
};

export const getSubjectByCurriculum = async (
  curriculumName: string
): Promise<{ id: string; curriculumName: string }[]> => {
  const db = await getDbAsync();
  const result = await db
    .select()
    .from(subject)
    .where(eq(subject.curriculumName, curriculumName));
  return result;
};

export const isSubjectExists = async (
  id: string,
  curriculumName: string
): Promise<boolean> => {
  const db = await getDbAsync();
  const result = await db
    .select()
    .from(subject)
    .where(and(eq(subject.id, id), eq(subject.curriculumName, curriculumName)))
    .limit(1);
  return result.length > 0;
};
