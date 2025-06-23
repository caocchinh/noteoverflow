import { InferSelectModel } from "drizzle-orm";
import {
  curriculum,
  paperType,
  topic,
  season,
  subject,
  year,
} from "@/drizzle/schema";

export type CurriculumType = InferSelectModel<typeof curriculum>;
export type SubjectType = InferSelectModel<typeof subject>;
export type TopicType = InferSelectModel<typeof topic>;
export type PaperTypeType = InferSelectModel<typeof paperType>;
export type SeasonType = InferSelectModel<typeof season>;
export type YearType = InferSelectModel<typeof year>;

export interface EnhancedSelectProps {
  selectedValue: string | undefined;
  onValueChange: (value: string) => void;
  existingItems: string[];
  placeholders: EnhancedSelectPlaceholders;
  labels: EnhancedSelectLabels;
  isLoading?: boolean;
  className?: string;
  disabled?: boolean;
  validator?: (value: string) => string | null;
  inputType?: "text" | "number";
}

export interface EnhancedSelectPlaceholders {
  loading: string;
  input: string;
  first?: string;
}

export interface EnhancedSelectLabels {
  existingItems: string;
  newItems: string;
  input: string;
  label: string;
}

export type ValidTabs = "information" | "image-preview" | "refetching";
