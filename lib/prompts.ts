import { SCORING_WEIGHTS } from "./weights";

export const HTML_TEMPLATE = `
<header class="resume-header" data-block="header">
  <div class="profile-container" data-block="profile">
    <div class="contact-info" data-block="contact-info">
      <h1 class="name" data-field="name">[FULL NAME CAPS]</h1>
      <span class="title-line" data-field="title">[Title | Specializations]</span>
      <div class="contact" data-block="contact-details">
        <span data-field="location">[City, Country]</span><br />
        <span data-field="email">[email]</span> • <span data-field="phone">[phone]</span><br />
        <a class="[Github/Site]" data-field="github" href="[url1]" target="_blank" rel="noopener noreferrer">[Site/GitHub display]</a> •
        <a class="Linkedin" data-field="linkedin" href="[url2]" target="_blank" rel="noopener noreferrer">[LinkedIn display]</a><br />
        <span data-field="extras">[Languages/Certs]</span>
      </div>
    </div>
  </div>
</header>
<section class="about-section" data-block="about">
  <h2 class="about-header" data-field="about-header">ABOUT</h2>
  <p class="summary" data-field="summary">[50-56 words, highlight AI tools use for accelerated development, tailor to role and company (if company details available)]</p>
</section>
<section class="skills-section" data-block="skills">
  <h2 class="skills-header" data-field="skills-header">SKILLS</h2>
  <div class="skills" data-block="skills-list">
    <!-- Repeat this entire block for each skill category (max 3) - data-index MUST be UNIQUE and sequential: 1, 2, 3 -->
    <div class="skill-level" data-block="skill-level" data-index="1">
      <div class="skill-level-title" data-field="category" data-index="1">[Category]:</div>
      <div class="skill-items" data-field="items" data-index="1">[Max 9 words from resume]</div>
    </div>
  </div>
</section>
<section class="experience-section" data-block="experience">
  <h2 class="experience-header" data-field="experience-header">EXPERIENCE</h2>
      <!-- FOR WORK EXPERIENCE: [Role] | [Company Name] -->
      <!-- FOR PROJECTS ONLY RESUME: [Predicted Role] | [Short Project Name] (Project)-->
      <!-- TOTAL PROJECT TITLE div SHOULD NOT EXCEED 8 WORDS. -->
  <!-- Repeat this entire project block (max 3) - data-index MUST be UNIQUE and sequential: 1, 2, 3 - All nested blocks MUST use the SAME index -->
  <div class="project" data-block="project" data-index="1">
    <div class="project-header" data-block="project-header" data-index="1">
      <div class="project-title" data-block="project-title" data-index="1">
        <p data-field="role-company" data-index="1">[Role] |  [Company/Project Name]</p>
        <p class="project-time" data-field="time" data-index="1">[Dates or omit] • [Location or omit]</p>
      </div>
      <div class="project-sub" data-block="project-sub" data-index="1">
        <p class="project-tech" data-field="tech" data-index="1">[Technologies/Prominent skills]</p>
        <div class="project-link" data-field="link" data-index="1"></div>
          <!-- Repeat this block with • separator inbetween them. MAX 2 Links per project -->
          <a href="[URL]" target="_blank" rel="noopener noreferrer">[Live/Demo/GitHub]</a>
        </div>
      </div>
    </div>
    <p class="project-description" data-field="description" data-index="1">[42–50 words per project, MAX 150 (STRICT) words total. If 3 projects, one must be under 40 words, (use <strong> intelligently to highlight achievements/optimizations done or any specific important info relevent to job skills)]</p>
  </div>
  <!-- Max 3 experiences / Never Invent Experience -->
</section>
<section class="education-section" data-block="education">
  <h2 class="education-header" data-field="education-header">EDUCATION</h2>
  <!-- Repeat if multiple (only university education, recent 2) - data-index MUST be UNIQUE and sequential -->
  <!-- If 2 degrees, Reduce Projects section description word count total to 135 words -->
  <div class="education" data-block="education-item" data-index="1">
    <div class="education-date" data-block="education-date" data-index="1">
      <div class="education-title" data-field="university" data-index="1">[University, Location]</div>
      <div data-field="date" data-index="1">[Date]</div>
    </div>
    <div class="education-details" data-block="education-details" data-index="1">
      <div class="education-degree" data-field="degree" data-index="1">[Degree]</div>
      <div class="education-gpa" data-field="gpa" data-index="1">[GPA or omit]</div>
    </div>
    <p class="courses" data-field="courses" data-index="1">[Coursework max 8 words or omit]</p>
  </div>
</section>
`;

export const RULES = `RULES:
1. Extract from resume only - never invent, omit if absent
2. Preserve facts/metrics when rewriting
3. Links as <a href>, omit if no URL
4. Projects: "(Project)" mandatory; Title ≤8 words
5. No "N/A" - leave blank
6. Be factual, don't oversell poor fits`;

export const SCORING_CRITERIA = `Ground your job compatibility evidence based on the SCORING CRITERIA (0-100 each) below:
SkillMatch (${SCORING_WEIGHTS.SkillMatch}%): Technical Skills (more points for exact Match with Job than just related skills)
ExperienceMatch (${SCORING_WEIGHTS.ExperienceMatch}%): Role/project relevance | Give higher points for commercial roles than projects (2+ years commercial = 70+ baseline)
TitleMatch (${SCORING_WEIGHTS.TitleMatch}%): Title/level/domain similarity  
SoftSkillMatch (${SCORING_WEIGHTS.SoftSkillMatch}%): soft skill fit

ATS = round(Σ(weight × score))
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
  "keySkills": [<6-10 items, 1-2 words each, only directly required skills taken verbatim from the job description; exclude resume-only or generic skills>],
  "matchingStrengths": [<4-6, around 10 words each - hyper focused>],
  "gaps": [<3-5, around 10 words each - hyper focused>],
  "jobTitle": "<short job title based on JD (not resume)>",
  "jobDescriptionSummary": "<concise summary of job description, max 50 words>"
}`;

export const createHtmlPrompt = (
  jobDescription: string,
  resumeText: string,
) => `Expert resume writer. Generate tailored HTML resume.

${RULES}
7. Work: [Role] | [Company]; Projects: [Predicted Role] | [Short Name] (Project)
8. Max 3 skills categories (9 words each), 3 experiences (150 words total STRICT), 2 RECENT education, If 2 education - Experience section to have 130 words
9. data-index="N" = sequential 1,2,3 per section. Preserve all class/data-* attributes

- Do not mention rules, templates, word limits, or prompt instructions in the "improvements":
   - Valid: "Rewrote About section to emphasize AI-driven product discovery and impact."
   - Invalid: "Shortened summary to 50 words as per template guidelines."

TEMPLATE:
${HTML_TEMPLATE}

JOB:
${jobDescription}

RESUME:
${resumeText}

JSON output:
{"tailoredResumeHtml":"<html>","improvements":["<4-5 substantive changes, around 10 words each not longer>"]}`;

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

  return `Resume editor. Apply user's change, return modified HTML blocks as JSON or chat response.
  You have full chat history context. Use it to understand references.

RULES
- CRITICAL: The "newHtml" value is a JSON string. All double quotes (") inside the HTML code itself MUST be escaped with a backslash (\\").
- Edit the SMALLEST possible uniquely identifiable block
- Return ONLY modified blocks. ALWAYS return the smallest uniquely identifiable (by data-* attributes) block
- Each block must be COMPLETE (opening tag → closing tag)
- Preserve all class names, and data-* attributes exactly as provided
- For entire div/block removal requests, return the nearest parent block with the target content removed
- You can insert tags and inline styles if specific style changes are requested

EXAMPLES OF VALID CHANGES: 
User: "Make the summary shorter"
Return: <p class="summary" data-field="summary">Concise new summary text here</p>
User: "make this text red: Integrated Stripe subscriptions"
Return: <p class="project-description" data-field="description" data-index="3">Made... <span style=\"color: red;\">Integrated Stripe subscriptions</span> ...experimental.</p>
User: "Remove the second skill category"
Return: The immediate entire outer block with removal changes; <div class="skills" data-block="skills-list">...</div>

OUTPUT JSON:
{"blocks":[{"newHtml":"<escaped html>"}],"chatResponse":"reply"}

CURRENT:
${currentResumeHtml}

${ctx}

REQUEST:
"${userMessage}"
`;
};
