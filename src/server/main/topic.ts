import "server-only";
import { getDbAsync } from "@/drizzle/db";
import * as schema from "@/drizzle/schema";
import { and, eq } from "drizzle-orm";

export const createTopic = async ({
  topic,
  subjectId,
}: {
  topic: string;
  subjectId: string;
}) => {
  const db = await getDbAsync();
  await db.insert(schema.topic).values({ topic, subjectId });
};

export const getTopic = async (subjectId: string): Promise<string[]> => {
  const db = await getDbAsync();
  const result = await db
    .select()
    .from(schema.topic)
    .where(eq(schema.topic.subjectId, subjectId));
  return result.map((item) => item.topic);
};

export const isTopicExists = async (
  topic: string,
  subjectId: string
): Promise<boolean> => {
  const db = await getDbAsync();
  const result = await db
    .select()
    .from(schema.topic)
    .where(
      and(eq(schema.topic.topic, topic), eq(schema.topic.subjectId, subjectId))
    )
    .limit(1);
  return result.length > 0;
};
