export interface AnalysisResult {
  atsScore: number;
  keySkills: string[];
  matchingStrengths: string[];
  gaps: string[];
  improvements: string[];
}

export interface TailorResult {
  recommendation: "apply_as_is" | "tailor_resume" | "needs_resume";
  recommendationReason: string;
  analysis: AnalysisResult;
  tailoredResumeHtml: string;
  originalProvided: boolean;
  resumeCss?: string;
}
