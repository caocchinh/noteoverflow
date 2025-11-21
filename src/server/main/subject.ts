import "server-only";
import { and, eq } from "drizzle-orm";
import { getDbAsync } from "@/drizzle/db.server";
import { subject } from "@/drizzle/schema";

export const createSubject = async ({
  subjectId,
  curriculumName,
}: {
  subjectId: string;
  curriculumName: string;
}) => {
  const db = await getDbAsync();
  await db.insert(subject).values({ subjectId, curriculumName });
};

export const getSubjectByCurriculum = async (
  curriculumName: string
): Promise<{ subjectId: string; curriculumName: string }[]> => {
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
    .where(
      and(eq(subject.subjectId, id), eq(subject.curriculumName, curriculumName))
    )
    .limit(1);
  return result.length > 0;
};
