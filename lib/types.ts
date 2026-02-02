export interface AnalysisResult {
  atsScore: number;
  keySkills: string[];
  matchingStrengths: string[];
  gaps: string[];
  improvements: string[];
  SkillMatch?: number;
  ExperienceMatch?: number;
  TitleMatch?: number;
  SoftSkillMatch?: number;
  evidence?: {
    skillMatches?: string[];
    experienceMatches?: string[];
    titleMatches?: string[];
    softSkillMatches?: string[];
  };
}

export interface TailorResult {
  recommendation: "apply_as_is" | "tailor_resume" | "needs_resume";
  recommendationReason: string;
  analysis: AnalysisResult;
  tailoredResumeHtml: string;
  originalProvided: boolean;
  jobDescription?: string;
}

export interface ResumeVersion {
  id: string;
  html: string;
  timestamp: number;
  changeDescription: string;
}

export interface RefineResponse {
  updatedHtml: string;
  chatResponse: string;
}

export interface Theme {
  primary: string;
  link: string;
  h2: string;
  border: string;
  tech: string;
}
