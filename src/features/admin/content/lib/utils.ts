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

export const paperCodeParser = (
  subjectCode: string,
  paperType: number,
  variant: number,
  season: "Summer" | "Winter" | "Spring",
  year: number
): string => {
  let seasonCode: string;
  switch (season) {
    case "Summer":
      seasonCode = "MJ";
      break;
    case "Winter":
      seasonCode = "ON";
      break;
    case "Spring":
      seasonCode = "FM";
      break;
  }

  const yearCode = String(year).slice(-2);

  const paperTypeVariant = `${paperType}${variant}`;

  return `${subjectCode}_${paperTypeVariant}_${seasonCode}_${yearCode}`;
};
