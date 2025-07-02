import 'server-only';
import { eq } from 'drizzle-orm';
import { getDbAsync } from '@/drizzle/db';
import { curriculum } from '@/drizzle/schema';

export const createCurriculum = async ({ name }: { name: string }) => {
  const db = await getDbAsync();
  await db.insert(curriculum).values({ name });
};

export const isCurriculumExists = async (name: string): Promise<boolean> => {
  const db = await getDbAsync();
  const result = await db
    .select()
    .from(curriculum)
    .where(eq(curriculum.name, name))
    .limit(1);

  return result.length > 0;
};

export const getCurriculum = async (): Promise<{ name: string }[]> => {
  const db = await getDbAsync();
  const result = await db.select().from(curriculum);
  return result;
};
