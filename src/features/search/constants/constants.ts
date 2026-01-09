/**
 * Motivational phrases displayed on the search page header.
 * A random phrase is selected on each page load.
 */
export const MOTIVATIONAL_PHRASES = [
  "What are we solving today?",
  "Ready to conquer some questions?",
  "Your next breakthrough starts here.",
  "Every problem has a solution.",
  "Think smart, solve smarter.",
  "One question at a time.",
  "Unlock your potential today.",
  "Learn. Solve. Repeat.",
  "Curiosity leads to mastery.",
  "Let's turn confusion into clarity.",
  "No question is too hard!",
  "Small steps, big achievements.",
] as const;

export type MotivationalPhrase = (typeof MOTIVATIONAL_PHRASES)[number];

/**
 * Returns a random motivational phrase from the collection.
 */
export const getRandomPhrase = (): string => {
  return MOTIVATIONAL_PHRASES[
    Math.floor(Math.random() * MOTIVATIONAL_PHRASES.length)
  ];
};
