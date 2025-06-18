import { z } from "zod";
import { InferSelectModel } from "drizzle-orm";
import * as schema from "@/drizzle/schema";

export type CurriculumType = InferSelectModel<typeof schema.curriculum>;
export type SubjectType = InferSelectModel<typeof schema.subject>;
export type YearType = InferSelectModel<typeof schema.year>;
export type SeasonType = InferSelectModel<typeof schema.season>;
export type PaperTypeType = InferSelectModel<typeof schema.paperType>;
export type TopicType = InferSelectModel<typeof schema.topic>;

export const formSchema = z.object({
  curriculumName: z.string(),
  subjectId: z.string(),
  year: z.string(),
  season: z.string(),
  paperType: z.number(),
  topic: z.string(),
});
