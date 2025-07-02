import 'server-only';
import { and, eq } from 'drizzle-orm';
import { getDbAsync } from '@/drizzle/db';
import { topic } from '@/drizzle/schema';

export const createTopic = async ({
  topic: topicProp,
  subjectId,
}: {
  topic: string;
  subjectId: string;
}) => {
  const db = await getDbAsync();
  await db.insert(topic).values({ topic: topicProp, subjectId });
};

export const getTopic = async (subjectId: string): Promise<string[]> => {
  const db = await getDbAsync();
  const result = await db
    .select()
    .from(topic)
    .where(eq(topic.subjectId, subjectId));
  return result.map((item) => item.topic);
};

export const isTopicExists = async (
  topicProp: string,
  subjectId: string
): Promise<boolean> => {
  const db = await getDbAsync();
  const result = await db
    .select()
    .from(topic)
    .where(and(eq(topic.topic, topicProp), eq(topic.subjectId, subjectId)))
    .limit(1);
  return result.length > 0;
};
