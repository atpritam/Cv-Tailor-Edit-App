export const SCORING_WEIGHTS = {
  SkillMatch: 40,
  ExperienceMatch: 30,
  TitleMatch: 14,
  SoftSkillMatch: 16,
} as const;

export type ScoringWeights = typeof SCORING_WEIGHTS;

export default SCORING_WEIGHTS;

export const MATCH_LEVELS = {
  high: 80, // above this value is considered a high match
  mid: 65, // above this value is considered a mid match
} as const;

export type MatchLevels = typeof MATCH_LEVELS;
