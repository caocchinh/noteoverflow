export interface TurnstileOptions {
  sitekey: string;
  callback: (token: string) => void;
  "error-callback"?: (error: unknown) => void;
  "expired-callback"?: () => void;
  "timeout-callback"?: () => void;
  "before-interactive-callback"?: () => void;
  "after-interactive-callback"?: () => void;
  "unsupported-callback"?: () => void;
  theme?: "light" | "dark" | "auto";
  language?: string;
  tabindex?: number;
  "response-field"?: boolean;
  "response-field-name"?: string;
  size?: "normal" | "compact" | "flexible";
  retry?: "auto" | "never";
  "retry-interval"?: number;
  "refresh-expired"?: "auto" | "manual" | "never";
  "refresh-timeout"?: "auto" | "manual" | "never";
  appearance?: "always" | "execute" | "interaction-only";
  "feedback-enabled"?: boolean;
  execution?: "render" | "execute";
  cData?: string;
  action?: string;
}

export type UploadPayload = {
  curriculumName: string;
  subjectId: string;
  topic: string;
  paperType: number;
  season: ValidSeason;
  year: number;
  questionId: string;
  questionNumber: number;
  paperVariant: number;
};

export type ServerActionResponse<T> = {
  success: boolean;
  error?: string;
  data?: T;
};

export type ValidSeason = "Summer" | "Winter" | "Spring";
export type ValidContentType = "questions" | "answers";
export type ValidCurriculum = "CIE IGCSE" | "CIE A-LEVEL";

export type CIE_A_LEVEL_SUBDIVISION = "AS-Level" | "A-Level";

interface Topic {
  topicName: string;
  topicCurriculumnSubdivision?: CIE_A_LEVEL_SUBDIVISION[];
  isTopicUpToDate: boolean;
}

interface PaperType {
  paperType: number;
  paperTypeCurriculumnSubdivision?: CIE_A_LEVEL_SUBDIVISION[];
}

export interface TopicalSubject {
  coverImage: string;
  syllabusLink?: string;
  code: string;
  topic: Topic[] | string[];
  year: number[];
  paperType: PaperType[] | number[];
  season: ValidSeason[];
}
export interface TopicalData {
  curriculum: ValidCurriculum;
  coverImage: string;
  subject: TopicalSubject[];
}

export type PastPaperNavigatorCache = {
  curriculum: ValidCurriculum;
  subject: string;
  paperType: string;
  variant: string;
  year: string;
  season: ValidSeason;
  quickCode: string;
};
