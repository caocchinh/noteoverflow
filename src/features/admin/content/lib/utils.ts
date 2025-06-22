import {
  FAILED_TO_UPLOAD_IMAGE,
  INTERNAL_SERVER_ERROR,
} from "@/constants/constants";
import { redirect } from "next/navigation";

export const validateCurriculum = (value: string): string | null => {
  if (!value) {
    return "Curriculum cannot be empty";
  }
  if (value !== value.trim()) {
    return "Curriculum cannot have leading or trailing whitespace";
  }
  if (value.trim() === "") {
    return "Curriculum cannot be empty";
  }
  return null;
};

export const validateTopic = (value: string): string | null => {
  if (!value) {
    return "Topic cannot be empty";
  }
  if (value !== value.trim()) {
    return "Topic cannot have leading or trailing whitespace";
  }
  if (value.trim() === "") {
    return "Topic cannot be empty";
  }
  return null;
};

export const validatePaperType = (value: string): string | null => {
  if (value !== value.trim()) {
    return "Paper type cannot have leading or trailing whitespace";
  }
  const paperTypeNumber = Number(value);
  if (isNaN(paperTypeNumber) || paperTypeNumber < 1 || paperTypeNumber > 9) {
    return "Paper type must be a number between 1 and 9";
  }
  return null;
};

export const validateYear = (value: string): string | null => {
  if (value !== value.trim()) {
    return "Year cannot have leading or trailing whitespace";
  }
  const yearNumber = Number(value);
  const currentYear = new Date().getFullYear();

  if (isNaN(yearNumber)) {
    return "Year must be a valid number";
  }

  if (yearNumber < 2009) {
    return "Year must not be earlier than 2009";
  }

  if (yearNumber > currentYear) {
    return `Year must not exceed the current year (${currentYear})`;
  }

  return null;
};

export const validateSeason = (value: string): string | null => {
  if (value !== value.trim()) {
    return "Season cannot have leading or trailing whitespace";
  }
  const validSeasons = ["Summer", "Winter", "Spring"];

  if (!validSeasons.includes(value)) {
    return "Season must be Summer, Winter, or Spring";
  }

  return null;
};

export const validateQuestionNumber = (value: string): string => {
  if (value !== value.trim()) {
    return "Question number cannot have leading or trailing whitespace";
  }
  const questionNumber = Number(value);
  if (isNaN(questionNumber) || questionNumber < 1 || questionNumber > 100) {
    return "Question number must be between 1 and 100";
  }
  return "";
};

export const validateSubject = (value: string): string | null => {
  if (!value) {
    return "Subject cannot be empty";
  }

  if (value !== value.trim()) {
    return "Subject cannot have leading or trailing whitespace";
  }

  if (value.trim() === "") {
    return "Subject cannot be empty";
  }

  const regex = /^([^()]+) \(([0-9]+)\)$/;
  const match = value.match(regex);

  if (!match) {
    return "Subject must be in format 'Subject Name (Code)', e.g., 'Physics (9702)'";
  }

  const subjectName = match[1].trim();
  const subjectCode = match[2];

  if (subjectName === "") {
    return "Subject name cannot be empty";
  }

  if (subjectCode === "" || isNaN(Number(subjectCode))) {
    return "Subject code must be numeric";
  }

  return "";
};

export const validatePaperVariant = (value: string): string => {
  if (value !== value.trim()) {
    return "Paper variant cannot have leading or trailing whitespace";
  }
  const paperVariant = Number(value);

  if (value === "") {
    return "Paper variant cannot be empty";
  }
  if (isNaN(paperVariant) || paperVariant < 1 || paperVariant > 9) {
    return "Paper variant must be between 1 and 9";
  }

  return "";
};

export const seasonToCode = (
  season: "Summer" | "Winter" | "Spring"
): string => {
  switch (season) {
    case "Summer":
      return "MJ";
    case "Winter":
      return "ON";
    case "Spring":
      return "FM";
  }
};

export const paperCodeParser = ({
  subjectCode,
  paperType,
  variant,
  season,
  year,
}: {
  subjectCode: string;
  paperType: string;
  variant: string;
  season: "Summer" | "Winter" | "Spring";
  year: string;
}): string => {
  const seasonCode = seasonToCode(season);

  const yearCode = String(year).slice(-2);

  const paperTypeVariant = `${paperType}${variant}`;

  return `${subjectCode}_${paperTypeVariant}_${seasonCode}_${yearCode}`;
};

export const uploadImage = async ({
  file,
  subjectFullName,
  paperCode,
  contentType,
  questionNumber,
  order,
}: {
  file: File;
  subjectFullName: string;
  paperCode: string;
  contentType: "questions" | "answers";
  questionNumber: string;
  order: number;
}): Promise<{
  success: boolean;
  error: string | undefined;
  data: { imageSrc: string } | undefined;
}> => {
  const filename = `${subjectFullName}-${paperCode}-${contentType}-${questionNumber}-${order}`;
  const form = new FormData();
  form.append("key", filename);
  form.append("body", file);
  form.append(
    "options",
    JSON.stringify({
      httpMetadata: {
        contentType: file.type,
      },
    })
  );

  const response = await fetch("/api/r2", {
    method: "POST",
    body: form,
  });

  if (!response.ok) {
    if (response.status === 401) {
      redirect("/authentication");
    } else if (response.status === 403) {
      redirect("/app");
    } else if (response.status === 500) {
      return {
        success: false,
        error: INTERNAL_SERVER_ERROR,
        data: undefined,
      };
    } else {
      return {
        success: false,
        error: FAILED_TO_UPLOAD_IMAGE,
        data: undefined,
      };
    }
  }

  const data = await response.json();

  return {
    success: true,
    error: undefined,
    data: {
      imageSrc: data.imageSrc,
    },
  };
};

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
