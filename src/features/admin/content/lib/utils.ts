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
