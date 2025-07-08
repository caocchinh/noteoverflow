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
