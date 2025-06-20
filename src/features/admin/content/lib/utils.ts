export const validatePaperType = (value: string): string | null => {
  const paperTypeNumber = Number(value);
  if (isNaN(paperTypeNumber) || paperTypeNumber < 1 || paperTypeNumber > 9) {
    return "Paper type must be a number between 1 and 9";
  }
  return null;
};

export const validateYear = (value: string): string | null => {
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
  const validSeasons = ["Summer", "Winter", "Spring"];

  if (!validSeasons.includes(value)) {
    return "Season must be Summer, Winter, or Spring";
  }

  return null;
};

export const validateQuestionNumber = (value: string): string => {
  const questionNumber = Number(value);
  if (isNaN(questionNumber) || questionNumber < 1 || questionNumber > 100) {
    return "Question number must be between 1 and 100";
  }
  return "";
};

export const validateSubject = (value: string): string | null => {
  if (!value || value.trim() === "") {
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
}): Promise<string> => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append(
    "filename",
    `${subjectFullName}-${paperCode}-${contentType}-${questionNumber}-${order}`
  );
  formData.append("contentType", file.type);

  const response = await fetch("/api/r2", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Failed to upload file");
  }
  const result = await response.json();

  if (!result || !result.url) {
    throw new Error("Failed to upload file");
  }
  return result.url;
};

export const parseQuestionId = ({
  subject,
  paperCode,
  questionNumber,
  contentType,
}: {
  subject: string;
  paperCode: string;
  questionNumber: string;
  contentType: "questions" | "answers";
}): string => {
  return `${subject}-${paperCode}-${contentType}-Q${questionNumber}`;
};
