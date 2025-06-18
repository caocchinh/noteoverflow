"use server";
import { getDb } from "@/drizzle/db";
import * as schema from "@/drizzle/schema";
import { and, eq } from "drizzle-orm";

export const createTopic = async ({
  topic,
  subjectId,
}: {
  topic: string;
  subjectId: string;
}) => {
  const db = getDb();
  await db.insert(schema.topic).values({ topic, subjectId });
};

export const isTopicExists = async (
  topic: string,
  subjectId: string
): Promise<boolean> => {
  const db = getDb();
  const result = await db
    .select()
    .from(schema.topic)
    .where(
      and(eq(schema.topic.topic, topic), eq(schema.topic.subjectId, subjectId))
    )
    .limit(1);
  return result.length > 0;
};
