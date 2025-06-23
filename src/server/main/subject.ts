import "server-only";
import { getDbAsync } from "@/drizzle/db";
import * as schema from "@/drizzle/schema";
import { eq } from "drizzle-orm";

export const createSubject = async ({
  id,
  curriculumName,
}: {
  id: string;
  curriculumName: string;
}) => {
  const db = await getDbAsync();
  await db.insert(schema.subject).values({ id, curriculumName });
};

export const getSubjectByCurriculum = async (
  curriculumName: string
): Promise<{ id: string; curriculumName: string }[]> => {
  const db = await getDbAsync();
  const result = await db
    .select()
    .from(schema.subject)
    .where(eq(schema.subject.curriculumName, curriculumName));
  return result;
};

export const isSubjectExists = async (id: string): Promise<boolean> => {
  const db = await getDbAsync();
  const result = await db
    .select()
    .from(schema.subject)
    .where(eq(schema.subject.id, id))
    .limit(1);
  return result.length > 0;
};
