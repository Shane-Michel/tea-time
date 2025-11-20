/**
 * Core data models used across the Tea Time study experience.
 */

/**
 * @typedef {Object} Reading
 * @property {string} reference - Book, chapter, and verses (e.g., "Matthew 1:1-17").
 * @property {string} focus - What to pay attention to in the passage.
 * @property {string} [note] - Optional historical or literary context to display alongside the reading.
 */

/**
 * @typedef {Object} Prompt
 * @property {string} question - A guided prompt to consider while reading.
 * @property {string} [type] - The prompt category (prayer, observation, application, gratitude, etc.).
 */

/**
 * @typedef {Object} StudyDay
 * @property {number} day - The day number inside the plan.
 * @property {string} title - Short summary for the day.
 * @property {string} summary - A brief description of the focus for this session.
 * @property {Reading[]} readings - Passages to read for the day.
 * @property {Prompt[]} prompts - Prompts to guide reading and note taking.
 * @property {string[]} reflection - Reflection questions to journal at the end of the day.
 */

/**
 * @typedef {Object} StudyPlan
 * @property {string} id - Unique identifier for the plan.
 * @property {string} title - Display title for the study (e.g., "Gospel of Matthew").
 * @property {string} subtitle - Subtitle describing the tone of the plan.
 * @property {string} summary - Paragraph describing what to expect in the study.
 * @property {string} [theme] - Optional theme or category for the plan.
 * @property {number} estimatedMinutes - Average minutes required per day.
 * @property {StudyDay[]} days - Ordered days that make up the journey.
 */

export const modelDocumentation = {
  reading: 'A passage and focus statement for each day.',
  prompt: 'Guided prompts that sit next to the daily reading.',
  day: 'Daily entry combining scripture readings, prompts, and reflection.',
  plan: 'Top-level study plan that stitches together all days.',
}
