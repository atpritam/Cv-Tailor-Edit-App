import { SCORING_WEIGHTS } from "./weights";

export const HTML_TEMPLATE = `
<header class="resume-header">
  <div class="profile-container">
    <div class="contact-info">
      <h1>[FULL NAME CAPS]</h1>
      <span class="title-line">[Title | Specializations]</span>
      <div class="contact">
        [City, Country]<br />
        [email] • [phone]<br />
        <a href="[url1]">[Site/GitHub display]</a> • <a href="[url2]">[LinkedIn display]</a><br />
        [Languages/Certs]
      </div>
    </div>
  </div>
</header>

<section>
  <h2>ABOUT</h2>
  <p class="summary">[50-56 words, highlight AI tools use for accelerated development, tailor to role and company (if company details available)]</p>
</section>

<section>
  <h2>SKILLS</h2>
  <div class="skills">
    <div class="skill-level"><div class="skill-level-title">[Category]:</div><div class="skill-items">[Max 9 words from resume]</div></div>
    <div class="skill-level"><div class="skill-level-title">[Category]:</div><div class="skill-items">[Max 9 words]</div></div>
    <div class="skill-level"><div class="skill-level-title">[Category]:</div><div class="skill-items">[Max 9 words]</div></div>
  </div>
</section>

<section>
  <h2>EXPERIENCE</h2>
    <!-- FOR WORK EXPERIENCE: [Role |]  [Company Name] -->
    <!-- FOR PROJECTS ONLY RESUME: [Predicted Role |]  [Short Project Name] (Project) – [2 to 3 words on primary descriptive project focus] -->
    <!-- example (FOR PROJECTS ONLY RESUME): Core AI Engineer | Ollama Bridge (Project) – LLM Orchestration System -->
   <!-- TOTAL PROJECT TITLE div SHOULD NOT EXCEED 8 WORDS. -->
  <div class="project">
    <div class="project-header">
      <div class="project-title"><p>[Role |]  [Company/Project Name]</p><p class="project-time">[Dates ][• Location]</p></div>
      <div class="project-sub"><p class="project-tech">[Technologies]</p></div>
    </div>
    <p class="project-description">[38-54 words, <strong> for achievements/metrics/optimizations done]</p>
  </div>
  <!-- Max 3 experiences / Never Invent Experience -->
</section>

<section>
  <h2>EDUCATION</h2>
  <div class="education">
    <div class="education-date"><div class="education-title">[University, Location]</div><div>[Date]</div></div>
    <div class="education-details"><div class="education-degree">[Degree]</div><div class="education-gpa">[GPA or omit]</div></div>
    [Coursework max 8 words]
  </div>
</section>
`;

export const RULES = `RULES:
1. Extract from resume, use socials if missing
2. Never invent data - omit if absent
3. Rewrite wording, preserve facts/metrics
4. Links must be <a href>, omit if no URL
5. For Projects, mentioning "(Project)" is mandatory, follow the Format
6. Omit missing dates/locations
7. Don't use "N/A" anywhere, just leave blank
8. Do not try to push hard on a profile that doesn't fit the job description. Just be factual and objective.

LIMITS:
About: 50-56 words | Skills: 9 words per category (3 total) | Experience: 3 items, 38-54 words each | Coursework: 8 words`;

export const SCORING_CRITERIA = `SCORING (0-100 each, include evidence):
SkillMatch (${SCORING_WEIGHTS.SkillMatch}%): Technical/domain skills overlap
ExperienceMatch (${SCORING_WEIGHTS.ExperienceMatch}%): Role/project relevance (2+ years relevant = 70+ baseline)
TitleMatch (${SCORING_WEIGHTS.TitleMatch}%): Title/level similarity  
SoftSkillMatch (${SCORING_WEIGHTS.SoftSkillMatch}%): Leadership/culture fit

ATS = round(Σ(weight × score)) + production_bonus (8-15 points for deployment signals)
Cap at 97.`;

type TailorPromptData = {
  jobDescription: string;
  resumeText?: string;
  linkedin?: string;
  github?: string;
};

export const generateTailorPrompt = (data: TailorPromptData): string => {
  const { jobDescription, resumeText, linkedin, github } = data;
  const hasResume = resumeText?.trim();

  const social = [
    linkedin?.trim() && `LinkedIn: ${linkedin}`,
    github?.trim() && `GitHub: ${github}`,
  ]
    .filter(Boolean)
    .join("\n");

  if (hasResume) {
    return `Expert resume writer. Analyze resume vs job. Recommend apply_as_is (ATS≥75) or tailor_resume.

${social ? `SOCIALS:\n${social}\n` : ""}
${RULES}
${SCORING_CRITERIA}
Recommend apply_as_is only if ATS ≥75.
JOB:
${jobDescription}

RESUME:
${resumeText}

TEMPLATE:
${HTML_TEMPLATE}

JSON:
{
  "recommendation": "apply_as_is"|"tailor_resume",
  "recommendationReason": "<1-2 sentences>",
  "analysis": {
    "atsScore": <0-100>,
    "SkillMatch": <0-100>,
    "ExperienceMatch": <0-100>,
    "TitleMatch": <0-100>,
    "SoftSkillMatch": <0-100>,
    "evidence": {
      "skillMatches": [{"token":"<>","count":<>}],
      "experienceMatches": [{"phrase":"<>","count":<>}],
      "titleMatches": [{"phrase":"<>","count":<>}],
      "softSkillMatches": [{"phrase":"<>","count":<>}]
    },
    "keySkills": [<6-10 from job>],
    "matchingStrengths": [<4-6 user strengths>],
    "gaps": [<3-5 areas>],
    "improvements": [<4-6 changes>]
  },
  "tailoredResumeHtml": "<complete HTML>"
}`;
  } else {
    return `Resume writer. User needs to upload resume.

${social ? `SOCIALS:\n${social}\n` : ""}JOB:
${jobDescription}

TEMPLATE:
${HTML_TEMPLATE}

JSON:
{
  "recommendation": "needs_resume",
  "recommendationReason": "Upload resume for analysis.",
  "analysis": {
    "atsScore": 0,
    "keySkills": [<6-10 from job>],
    "matchingStrengths": [],
    "gaps": ["Resume required"],
    "improvements": ["Upload resume"]
  },
  "tailoredResumeHtml": "<template with placeholders>"
}`;
  }
};

type RefinePromptData = {
  userMessage: string;
  currentResumeHtml: string;
  originalTailoredHtml?: string;
  jobDescription?: string;
};

export const generateRefinePrompt = (data: RefinePromptData): string => {
  const {
    userMessage,
    currentResumeHtml,
    originalTailoredHtml,
    jobDescription,
  } = data;

  const ctx = [
    originalTailoredHtml && `ORIGINAL:\n${originalTailoredHtml}`,
    jobDescription && `JOB:\n${jobDescription}`,
  ]
    .filter(Boolean)
    .join("\n\n");

  return `Resume editor. Apply user request. Keep structure. Return complete HTML.

RULES:
1. Change only what requested
2. Maintain all CSS classes
3. No style changes
4. If "restore/undo" use ORIGINAL

CURRENT:
${currentResumeHtml}

${ctx}

REQUEST:
${userMessage}

JSON:
{
  "updatedHtml": "<complete HTML>",
  "chatResponse": "<1-2 friendly user directed sentence>"
}`;
};
