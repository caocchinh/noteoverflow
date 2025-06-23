import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const parseQuestionId = ({
  subject,
  paperCode,
  questionNumber,
}: {
  subject: string;
  paperCode: string;
  questionNumber: string;
}): string => {
  return `${subject}-${paperCode}-questions-Q${questionNumber}`;
};

export const isValidQuestionId = (id: string): boolean => {
  const questionIdRegex = /^.+-{1}.+-{1}questions-Q.+$/;
  return questionIdRegex.test(id);
};
