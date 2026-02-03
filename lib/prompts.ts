import { SCORING_WEIGHTS } from "./weights";

export const HTML_TEMPLATE = `
<header class="resume-header">
  <div class="profile-container">
    <div class="contact-info">
      <h1 class="name">[FULL NAME CAPS]</h1>
      <span class="title-line">[Title | Specializations]</span>
      <div class="contact">
        [City, Country]<br />
        [email] • [phone]<br />
        <a class="[Github/Site]" href="[url1]" target="_blank" rel="noopener noreferrer">[Site/GitHub display]</a> • <a class="Linkedin" href="[url2]" target="_blank" rel="noopener noreferrer">[LinkedIn display]</a><br />
        [Languages/Certs]
      </div>
    </div>
  </div>
</header>

<section class="about-section">
  <h2 class="about-header">ABOUT</h2>
  <p class="summary">[50-56 words, highlight AI tools use for accelerated development, tailor to role and company (if company details available)]</p>
</section>

<section class="skills-section">
  <h2 class="skills-header">SKILLS</h2>
  <div class="skills">
    <!-- Repeat this block for each skill category (max 3) -->
    <div class="skill-level" id="1"><div class="skill-level-title">[Category]:</div><div class="skill-items">[Max 9 words from resume]</div></div>
  </div>
</section>

<section class="experience-section">
  <h2 class="experience-header">EXPERIENCE</h2>
      <!-- FOR WORK EXPERIENCE: [Role] | [Company Name] -->
      <!-- FOR PROJECTS ONLY RESUME: [Predicted Role] | [Short Project Name] (Project)-->
      <!-- TOTAL PROJECT TITLE div SHOULD NOT EXCEED 8 WORDS. -->
  <div class="project" id="[unique numbered id]">
    <div class="project-header">
      <div class="project-title" id="[unique numbered id]"><p>[Role] |  [Company/Project Name]</p><p class="project-time" id="[unique numbered id]">[Dates] • [Location]</p></div>
      <div class="project-sub"><p class="project-tech" id="[unique numbered id]">[Technologies/Prominent skills]</p></div>
    </div>
    <p class="project-description" id="[unique numbered id]">[50-54 words, <strong> for achievements/optimizations done or specific important info relevent to job skill needed]</p>
  </div>
  <!-- Max 3 experiences / Never Invent Experience -->
</section>

<section class="education-section">
  <h2 class="education-header">EDUCATION</h2>
  <div class="education">
    <div class="education-date"><div class="education-title">[University, Location]</div><div>[Date]</div></div>
    <div class="education-details"><div class="education-degree">[Degree]</div><div class="education-gpa">[GPA or omit]</div></div>
    <p class="courses">[Coursework max 8 words or omit]</p>
  </div>
</section>
`;

export const RULES = `RULES:
1. Extract details from resume only
2. Never invent data - omit if absent
3. When Rewriting wording, preserve facts/metrics
4. Links must be <a href>, omit if no URL (like Github/Live/Demo etc.)
5. For Projects, mentioning "(Project)" is mandatory, follow the Format
6. Don't use "N/A" anywhere, just leave blank
7. Do not try to push hard on a profile that doesn't fit the job description. Just be factual and objective
8. Ignore separators like | , • when not needed`;

export const SCORING_CRITERIA = `SCORING (0-100 each, include evidence):
SkillMatch (${SCORING_WEIGHTS.SkillMatch}%): Technical Skills (more points for exact Match with Job than just related skills)
ExperienceMatch (${SCORING_WEIGHTS.ExperienceMatch}%): Role/project relevance | Give higher points for commercial roles than projects (2+ years commercial = 70+ baseline)
TitleMatch (${SCORING_WEIGHTS.TitleMatch}%): Title/level/domain similarity  
SoftSkillMatch (${SCORING_WEIGHTS.SoftSkillMatch}%): soft skill fit

ATS = round(Σ(weight × score)) + production_bonus (8-15 points for deployment signals)
Cap at 97.`;

export const createAnalysisPrompt = (
  jobDescription: string,
  resumeText: string,
) => `
Expert resume analyzer. Calculate Job Compatibility Score (job-resume match.)

${SCORING_CRITERIA}

JOB:
${jobDescription}

RESUME:
${resumeText}

JSON format:
{
  "atsScore": <0-100>,
  "SkillMatch": <0-100>,
  "ExperienceMatch": <0-100>,
  "TitleMatch": <0-100>,
  "SoftSkillMatch": <0-100>,
  "evidence": {"skillMatches":[{"token":"","count":0}],"experienceMatches":[{"phrase":"","count":0}],"titleMatches":[{"phrase":"","count":0}],"softSkillMatches":[{"phrase":"","count":0}]},
  "keySkills": [<6-10 from job>],
  "matchingStrengths": [<4-6, around 10 words each - hyper focused>],
  "gaps": [<3-5, around 10 words each - hyper focused>],
}`;

export const createHtmlPrompt = (
  jobDescription: string,
  resumeText: string,
) => `
You are an expert resume writer and ATS optimization specialist.

Task:
- Generate a tailored resume in valid HTML using the provided TEMPLATE.
- Customize content based on the JOB description.
- Preserve the TEMPLATE structure.
- Improve clarity, relevance, and impact without fabricating experience.

Output rules:
- Do NOT mention instructions, rules, or constraints.
- Return ONLY valid JSON in the exact format specified.

RULES:
${RULES}

TEMPLATE:
${HTML_TEMPLATE}

JOB DESCRIPTION:
${jobDescription}

ORIGINAL RESUME:
${resumeText}

Return JSON:
{
"tailoredResumeHtml": "<complete HTML>",
"improvements": [<4-5 changes, around 10 words each - hyper focused>]
}`;

type RefinePromptData = {
  userMessage: string;
  currentResumeHtml: string;
  originalTailoredHtml?: string;
  jobDescription?: string;
};

export const generateRefineDiffPrompt = (data: RefinePromptData): string => {
  const {
    userMessage,
    currentResumeHtml,
    originalTailoredHtml,
    jobDescription,
  } = data;

  const ctx = [
    originalTailoredHtml &&
      `ORIGINAL TAILORED VERSION:\n${originalTailoredHtml}`,
    jobDescription && `JOB DESCRIPTION:\n${jobDescription}`,
  ]
    .filter(Boolean)
    .join("\n\n");

  return `You are an expert resume HTML editor.

TASK
Apply the user’s requested change to the resume.

CURRENT_RESUME_HTML:
${currentResumeHtml}

${ctx}

USER_REQUEST:
"${userMessage}"

RULES
- CRITICAL: The "newHtml" value is a JSON string. All double quotes (") inside the HTML code itself MUST be escaped with a backslash (\\").
- Return ONLY modified blocks (never the full document)
- Each block must be COMPLETE (opening tag → closing tag)
- Preserve all class names, ids and structure
- Edit the SMALLEST uniquely identifiable block only
- For entire div/block removal requests, return the nearest parent block with the target content removed
- You can insert inline styles if specific style changes are requested

EXAMPLES OF VALID CHANGES: 

User: "Make the summary shorter"
Return: <p class="summary">Concise new summary text here</p>

User: "Remove the second skill category"
Return: The immediate entire outer block with removal changes; <div class="skills">...</div>

OUTPUT (STRICT)
Return ONLY valid JSON:
{
  "blocks": [
    { "newHtml": "<complete unique HTML block with escaped quotes>" }
  ],
  "chatResponse": "short friendly reply to user"
}
`;
};
