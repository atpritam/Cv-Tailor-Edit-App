export const HTML_TEMPLATE = `
<header class="resume-header">
  <div class="profile-container">
    <div class="contact-info">
      <h1>[FULL NAME IN CAPS - EXTRACT EXACTLY FROM RESUME]</h1>
      <span class="title-line">[Professional Title | Key Specializations - tailored to job]</span>
      <div class="contact">
        [City, Country - EXTRACT FROM RESUME or leave blank] <br />
        [email - EXTRACT FROM RESUME] [• phone - EXTRACT FROM RESUME or leave blank]<br />
        <a href="[github_url]" target="_blank" rel="noopener noreferrer">[github display]</a>
        <a href="[linkedin_url]" target="_blank" rel="noopener noreferrer">[• linkedin display]</a><br />
        [Languages/Certifications - EXTRACT FROM RESUME or leave blank]
      </div>
    </div>
  </div>
</header>

<section>
  <h2>ABOUT</h2>
  <p class="summary">
    [Max 56 words. REWRITE user's summary. Highlight AI tools usage. Tailor 1-2 sentences to role.]
  </p>
</section>

<section>
  <h2>SKILLS</h2>
  <div class="skills">
    <div class="skill-level">
      <div class="skill-level-title">[Category 1]:</div>
      <div class="skill-items">[Max 9 words - ONLY from user's resume, prioritize job match]</div>
    </div>
    <div class="skill-level">
      <div class="skill-level-title">[Category 2]:</div>
      <div class="skill-items">[Max 9 words - ONLY from user's resume]</div>
    </div>
    <div class="skill-level">
      <div class="skill-level-title">[Category 3]:</div>
      <div class="skill-items">[Max 9 words - ONLY from user's resume]</div>
    </div>
  </div>
</section>

<section>
  <h2>EXPERIENCE</h2>

  <!-- FOR WORK EXPERIENCE: [Role] | [Company Name] -->
  <!-- FOR PROJECTS ONLY RESUME: [Predicted Role] | [Project Name] (Project) – [2 to 3 words on primary descriptive project focus] -->
  <!-- example (FOR PROJECTS ONLY RESUME): Core AI Engineer | Ollama Bridge (Project) – LLM Orchestration System-->
  <!-- TOTAL PROJECT TITLE div SHOULD NOT EXCEED 8 WORDS. -->
  
  <div class="project">
    <div class="project-header">
      <div class="project-title">
        <p>[Role/Position] | [Company/Project Name]</p>
        <p class="project-time">[Date Range if available otherwise leave blank] • [Location for this role (City, Country) | For Projects, use primary location from Contact Info]</p>
      </div>
      <div class="project-sub">
        <p class="project-tech">[Technologies]</p>
      </div>
    </div>
    <p class="project-description">
      [~30-46 words. REWRITE description. Use <strong> for achievements. PRESERVE metrics.]
    </p>
  </div>

  <!-- Include maximum 3 experiences total from resume, do not makr up experiences -->
</section>

<section>
  <h2>EDUCATION</h2>
  <div class="education">
    <div class="education-date">
      <div class="education-title">[University Name] [, Location or leave blank]</div>
      <div>[Graduation Date or leave blank]</div>
    </div>
    <div class="education-details">
      <div class="education-degree">[Degree]</div>
      <div class="education-gpa">[GPA or omit]: [X.X/X.X or omit]</div>
    </div>
    [Relevant Coursework - Max 8 words or leave blank]
  </div>
</section>
`;

export const RESUME_STYLES = `
.resume-container * {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.resume-container {
  font-family:
    -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue",
    Arial, sans-serif;
  line-height: 1.5;
  color: #1f2937;
  background-color: #ffffff;
  max-width: 850px;
  margin: 0 auto;
  padding: 40px 60px;
  position: relative;
}

@media print {
  .resume-container {
    padding: 12px 12px;
    padding-bottom: 0;
    margin-bottom: 0;
    max-width: 100%;
    font-size: 10.5pt;
    line-height: 1.25;
  }

  @page {
    margin: 0.3in 0.4in;
    size: letter;
  }
}

.resume-container .resume-header {
  margin-bottom: 18px;
}

@media print {
  .resume-container .resume-header {
    margin-bottom: 16px;
  }
}

.resume-container .profile-container {
  display: flex;
  align-items: flex-start;
  gap: 30px;
}

@media print {
  .resume-container .profile-container {
    gap: 24px;
  }
}

.resume-container .profile-picture {
  width: 180px;
  height: 180px;
  border-radius: 14px;
  object-fit: cover;
  flex-shrink: 0;
}

@media print {
  .resume-container .profile-picture {
    width: 135px;
    height: 135px;
    border-radius: 14px;
  }
}

.resume-container .contact-info {
  flex: 1;
}

.resume-container h1 {
  font-size: 36px;
  font-weight: 700;
  color: #2563eb;
  margin-bottom: 4px;
  letter-spacing: 0.5px;
}

.resume-container .title-line {
  font-size: 16px;
  font-weight: 500;
  color: #4b5563;
  margin-bottom: 8px;
  display: block;
}

@media print {
  .resume-container h1 {
    font-size: 16pt;
    margin-bottom: -1px;
  }
  .resume-container .title-line {
    font-size: 12pt;
    margin-bottom: 8px;
  }
}

.resume-container .contact {
  font-size: 14px;
  line-height: 1.6;
  color: #374151;
}

@media print {
  .resume-container .contact {
    font-size: 11.5pt;
    line-height: 1.25;
  }
}

.resume-container .contact a {
  color: #2563eb;
  text-decoration: none;
}

.resume-container .contact a:hover {
  text-decoration: underline;
}

.resume-container section {
  margin-bottom: 26px;
}

@media print {
  .resume-container section {
    margin-bottom: 14px;
  }
}

.resume-container h2 {
  font-size: 16px;
  font-weight: 700;
  color: #2563eb;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 10px;
  padding-bottom: 4px;
  border-bottom: 2px solid #2563eb;
}

@media print {
  .resume-container h2 {
    font-size: 11.5pt;
    margin-bottom: 8px;
    padding-bottom: 2px;
    border-bottom: 2px solid #2563eb;
  }
}

.resume-container .summary {
  text-align: justify;
  line-height: 1.6;
  color: #374151;
}

@media print {
  .resume-container .summary {
    line-height: 1.5;
  }
}

.resume-container .skills {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

@media print {
  .resume-container .skills {
    gap: 4px;
  }
}

.resume-container .skill-level {
  display: flex;
  gap: 8px;
  line-height: 1.6;
}

@media print {
  .resume-container .skill-level {
    line-height: 1.4;
  }
}

.resume-container .skill-level-title {
  font-weight: 700;
  color: #1f2937;
  min-width: 110px;
  flex-shrink: 0;
}

.resume-container .skill-items {
  color: #374151;
  flex: 1;
}

.resume-container .project {
  margin-bottom: 18px;
}

@media print {
  .resume-container .project {
    margin-bottom: 16px;
  }
}

.resume-container .project:last-child {
  margin-bottom: 0;
}

.resume-container .project-header {
  margin-bottom: 4px;
}

@media print {
  .resume-container .project-header {
    margin-bottom: 3px;
  }
}

.resume-container .project-title {
  font-weight: 700;
  color: #1f2937;
  font-size: 16px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}

.resume-container .project-time {
  font-weight: 700;
  color: #1f2937;
  font-size: 12px;
}

@media print {
  .resume-container .project-title {
    font-size: 11pt;
  }
  .resume-container .project-time {
    font-size: 10pt;
  }
}

.resume-container .project-link {
  color: #2563eb;
  font-weight: 500;
}

.resume-container a {
  text-decoration: none;
}

.resume-container a:hover {
  text-decoration: underline;
}

.resume-container .project-sub {
  display: flex;
  justify-content: space-between;
}

.resume-container .project-tech {
  font-style: italic;
  color: #2563eb;
  font-size: 14px;
  margin-top: 2px;
}

@media print {
  .resume-container .project-tech {
    font-size: 10pt;
    margin-top: 2px;
    margin-bottom: 4px;
  }
}

.resume-container .project-description {
  text-align: justify;
  line-height: 1.6;
  color: #374151;
  margin-top: 4px;
}

@media print {
  .resume-container .project-description {
    line-height: 1.45;
    margin-top: 0px;
  }
}

.resume-container .education {
  line-height: 1.6;
  color: #374151;
}

@media print {
  .resume-container .education {
    line-height: 1.5;
  }
}

.resume-container .education-date {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 4px;
}

.resume-container .education-details {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 0;
}

@media print {
  .resume-container .education-date {
    margin-bottom: 2px;
  }
}

.resume-container .education-title {
  font-weight: 700;
  color: #1f2937;
}

@media print {
  .resume-container * {
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  .resume-container a {
    color: #2563eb !important;
    text-decoration: none;
  }

  .resume-container section {
    page-break-inside: avoid;
  }

  .resume-container .project {
    page-break-inside: avoid;
  }

  .resume-container h2 {
    page-break-after: avoid;
  }
}

.resume-container .consent {
  display: none;
  font-size: 10.5px;
  color: #6b7280;
  text-align: center;
}

@media print {
  .resume-container .consent {
    display: block;
    position: fixed;
    bottom: 20px;
    left: 0;
    right: 0;
    width: 100%;
    text-align: center;
    z-index: 9999;
  }
}

.resume-container strong {
  font-weight: 700;
  color: #1f2937;
}
`;

type PromptData = {
  jobDescription: string;
  resumeText?: string;
  linkedin?: string;
  github?: string;
};

export const generatePrompt = (data: PromptData): string => {
  const { jobDescription, resumeText, linkedin, github } = data;
  const hasResume = resumeText?.trim();

  const providedFields: string[] = [];
  if (linkedin && String(linkedin).trim())
    providedFields.push(`LinkedIn: ${String(linkedin).trim()}`);
  if (github && String(github).trim())
    providedFields.push(`GitHub: ${String(github).trim()}`);
  const providedInfoBlock = providedFields.length
    ? `\nADDITIONAL USER-PROVIDED FIELDS:\n${providedFields.join("\n")}\n`
    : "";

  if (hasResume) {
    return `You are an expert resume writer and ATS specialist. Analyze the user's resume and job description, then either recommend applying as-is (only if a computed, transparent ATS score ≥ 85) or generate a tailored version.

${providedInfoBlock}
CRITICAL RULES:

1. DATA SOURCES (in priority order):
  - Extract from user's resume first
  - Use provided fields above if not in resume
  - NEVER invent data not present in resume or use placeholders like "Jane Doe"
  - Omit missing fields entirely (blanks for github/linkedin/phone/GPA/dates if unavailable)

2. CONTENT MODIFICATION:
  - REWRITE wording to highlight job-relevant skills
  - PRESERVE actual companies, projects, metrics, achievements
  - Optimize phrasing, not facts

3. SOCIAL LINKS:
  - Must be clickable <a> tags with href
  - NEVER show unlinked text like "GitHub" or "LinkedIn"
  - Omit entirely if no valid URL available

4. EXPERIENCE FORMAT:
  - Work history: "[Role] | [Company Name]"
  - Projects only: "[Predicted Role] | [Project Name] (Project) – [Max 3 words]" - Always include the "(Project)" suffix to be not misleading

5. WORD LIMITS:
  - About: 56 words max
  - Skills: 9 words max per category (3 categories)
  - Experience: 3 items
  - Experience descriptions: MINIMUM 30 words each (150 max total)
  - Coursework: 8 words max IN TOTAL

SCORING RULES (MANDATORY - produce numeric evidence):
  - Compute these four sub-scores (integers 0-100) based ONLY on explicit matches between the JOB DESCRIPTION and the USER'S RESUME. For each sub-score, list matched keywords/phrases and counts.
    * SkillMatch (%): overlap of explicit technical and domain skills (weight 40%).
    * ExperienceMatch (%): relevance of past roles and project experience (weight 30%).
    * TitleMatch (%): similarity of candidate's titles/levels to role (weight 15%).
    * SoftSkillMatch (%): evidence of soft skills and cultural fit items (weight 15%).
  - Compute atsScore = Math.round(0.4*SkillMatch + 0.3*ExperienceMatch + 0.15*TitleMatch + 0.15*SoftSkillMatch) and include the arithmetic and intermediate values in the response.
  - Do NOT use vague language to justify scores; always include explicit matched tokens/phrases and simple counts for each sub-score.
  - Only recommend apply_as_is when the computed atsScore is >= 85. Otherwise tailor_resume.

JOB DESCRIPTION:
${jobDescription}

USER'S RESUME:
${resumeText}

HTML TEMPLATE:
${HTML_TEMPLATE}

RESPONSE FORMAT (JSON) - REQUIRED FIELDS:
{
  "recommendation": "apply_as_is" | "tailor_resume",
  "recommendationReason": "<1-2 sentences>",
  "analysis": {
   "atsScore": <0-100>,
   "SkillMatch": <0-100>,
   "ExperienceMatch": <0-100>,
   "TitleMatch": <0-100>,
   "SoftSkillMatch": <0-100>,
   "evidence": {
    "skillMatches": [{"token":"<token>","count":<n>}],
    "experienceMatches": [{"phrase":"<phrase>","count":<n>}],
    "titleMatches": [{"phrase":"<phrase>","count":<n>}],
    "softSkillMatches": [{"phrase":"<phrase>","count":<n>}]
   },
   "keySkills": [<6-10 skills from job>],
   "matchingStrengths": [<4-6 user's actual strengths that match>],
   "gaps": [<3-5 improvement areas>],
   "improvements": [<4-6 specific changes made>]
  },
  "tailoredResumeHtml": "<HTML with user's actual data>"
}

FINAL CHECK: Verify name in HTML matches resume exactly.`;
  } else {
    return `You are an expert resume writer. The user needs to upload their resume first.

${providedInfoBlock}
JOB DESCRIPTION:
${jobDescription}

HTML TEMPLATE:
${HTML_TEMPLATE}

RESPONSE FORMAT (JSON):
{
  "recommendation": "needs_resume",
  "recommendationReason": "Please upload your resume to get a personalized analysis and an ATS-optimized version.",
  "analysis": {
    "atsScore": 0,
    "keySkills": [<6-10 key skills from job description>],
    "matchingStrengths": [],
    "gaps": ["Resume required for gap analysis"],
    "improvements": ["Upload your resume to see specific suggestions"]
  },
  "tailoredResumeHtml": "<HTML template with placeholders like [YOUR NAME], [YOUR EMAIL], [Your experience here]>"
}`;
  }
};

export const generateChatPrompt = (
  chatHistory: { role: string; parts: { text: string }[] }[],
  resumeHtml: string,
  originalResumeHtml?: string,
): string => {
  const userRequest =
    chatHistory
      .filter((entry) => entry.role === "user")
      .pop()
      ?.parts.map((part) => part.text)
      .join("\n") || "";

  const originalResumeContext = originalResumeHtml
    ? `
  ORIGINAL TAILORED RESUME (for reference when user asks to restore content):
  \`\`\`html
  ${originalResumeHtml}
  \`\`\`
  `
    : "";

  return `You are an expert resume editor. Your task is to update the provided resume HTML based on the user's request, and provide a friendly conversational response.

  CRITICAL RULES:
  1.  **Source of Truth:** The resume to be edited is provided below under "CURRENT RESUME".
  2.  **User's Request:** The user's desired change is provided under "USER'S REQUEST".
  3.  **Apply the change:** Modify the "CURRENT RESUME" based *only* on the "USER'S REQUEST".
  4.  **Maintain format and structure:** The output must be a complete, updated HTML of the resume. Maintain all CSS classes and structure. But you can modify the css stylings if requested by user.
  5.  **No new analysis:** Do not regenerate the analysis (ATS score, etc.). Only provide the updated 'tailoredResumeHtml'.
  6.  **Conversational response:** Provide a brief, friendly response (1-2 sentences) explaining what you changed. Be specific about the changes made.
  7.  **Restoration requests:** If the user asks to restore, add back, or undo a removal, use the ORIGINAL TAILORED RESUME as reference for the exact content and formatting.
  
  CURRENT RESUME:
  \`\`\`html
  ${resumeHtml}
  \`\`\`
  ${originalResumeContext}
  
  RESUME STYLES (for reference - maintain these classes and structure):
  \`\`\`css
  ${RESUME_STYLES}
  \`\`\`

  USER'S REQUEST:
  ${userRequest}
  
  RESPONSE FORMAT (JSON) - REQUIRED FIELDS:
  {
    "tailoredResumeHtml": "<The complete, updated HTML of the resume with proper CSS classes>",
    "chatResponse": "<Brief 1-2 sentence explanation of what was changed, e.g., 'I've removed the last experience entry from your resume. The updated version now shows your two most recent positions.''>"
  }
  `;
};
