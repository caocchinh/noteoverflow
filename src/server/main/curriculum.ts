import "server-only";
import { getDbAsync } from "@/drizzle/db";
import * as schema from "@/drizzle/schema";
import { eq } from "drizzle-orm";

export const createCurriculum = async ({ name }: { name: string }) => {
  const db = await getDbAsync();
  await db.insert(schema.curriculum).values({ name });
};

export const isCurriculumExists = async (name: string): Promise<boolean> => {
  const db = await getDbAsync();
  const result = await db
    .select()
    .from(schema.curriculum)
    .where(eq(schema.curriculum.name, name))
    .limit(1);

  return result.length > 0;
};

export const getCurriculum = async (): Promise<{ name: string }[]> => {
  const db = await getDbAsync();
  const result = await db.select().from(schema.curriculum);
  return result;
};
