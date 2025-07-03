import 'server-only';
import { and, eq } from 'drizzle-orm';
import { getDbAsync } from '@/drizzle/db';
import { topic } from '@/drizzle/schema';

export const createTopic = async ({
  topic: topicProp,
  subjectId,
  curriculumName,
}: {
  topic: string;
  subjectId: string;
  curriculumName: string;
}) => {
  const db = await getDbAsync();
  await db
    .insert(topic)
    .values({ topic: topicProp, subjectId, curriculumName });
};

export const getTopic = async (
  subjectId: string,
  curriculumName: string
): Promise<string[]> => {
  const db = await getDbAsync();
  const result = await db
    .select()
    .from(topic)
    .where(
      and(
        eq(topic.subjectId, subjectId),
        eq(topic.curriculumName, curriculumName)
      )
    );
  return result.map((item) => item.topic);
};

export const isTopicExists = async (
  topicProp: string,
  subjectId: string,
  curriculumName: string
): Promise<boolean> => {
  const db = await getDbAsync();
  const result = await db
    .select()
    .from(topic)
    .where(
      and(
        eq(topic.topic, topicProp),
        eq(topic.subjectId, subjectId),
        eq(topic.curriculumName, curriculumName)
      )
    )
    .limit(1);
  return result.length > 0;
};
