import {type ClassValue, clsx} from "clsx";
import {twMerge} from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const parseQuestionId = ({
  curriculumName,
  subject,
  paperCode,
  questionNumber,
}: {
  curriculumName: string;
  subject: string;
  paperCode: string;
  questionNumber: string;
}): string => {
  return `${curriculumName};${subject};${paperCode};questions;Q${questionNumber}`;
};

export const isValidQuestionId = (id: string): boolean => {
  const questionIdRegex = /^[^;]+;[^;]+;[^;]+;questions;Q.+$/;
  return questionIdRegex.test(id);
};
