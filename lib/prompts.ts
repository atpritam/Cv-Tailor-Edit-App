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
  <!-- FOR PROJECTS ONLY RESUME: [Predicted Role] | [Short Project Name] (Project) – [2 to 3 words on primary descriptive project focus] -->
  <!-- example (FOR PROJECTS ONLY RESUME): Core AI Engineer | Ollama Bridge (Project) – LLM Orchestration System-->
  <!-- TOTAL PROJECT TITLE div SHOULD NOT EXCEED 8 WORDS. -->
  
  <div class="project">
    <div class="project-header">
      <div class="project-title">
        <p>[Role/Position] | [Company/Short Project Name]</p>
        <p class="project-time">[Date Range if available otherwise leave blank] • [Location for this role (City, Country) | For Projects, use primary location from Contact Info]</p>
      </div>
      <div class="project-sub">
        <p class="project-tech">[Technologies]</p>
      </div>
    </div>
    <p class="project-description">
      [~38-54 words. REWRITE description. Use <strong> for achievements. PRESERVE metrics.]
    </p>
  </div>

  <!-- Include maximum 3 experiences total from resume, do not make up experiences -->
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
      <div class="education-gpa">[GPA: X.X/X.X or omit]</div>
    </div>
    [Relevant Coursework - Max 8 words or leave blank]
  </div>
</section>
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
  - About: 50 words min - 56 words max
  - Skills: 9 words max per category (3 categories)
  - Experience: 3 items
  - Experience descriptions: MINIMUM 38 words each (158 max total across all experiences)
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
  resumeStyles: string,
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
  4.  **Maintain format and structure:** The output must be a complete, updated HTML of the resume. Maintain all CSS classes and structure. If the user explicitly asks for styling changes, you may generate CSS in the resumeCss field.
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
  ${resumeStyles}
  \`\`\`

  USER'S REQUEST:
  ${userRequest}
  
  RESPONSE FORMAT (JSON) - REQUIRED FIELDS:
  - "tailoredResumeHtml": "<The complete, updated HTML of the resume with proper CSS classes>"
  - "resumeCss": "<Optional: CSS styles as a string, if requested. E.g., .resume-container h1 { color: green; }> Note: This should be a <style> block containing only the CSS rules that have been added or modified."
  - "chatResponse": "<Brief 1-2 sentence explanation of what was changed, e.g., 'I've removed the last experience entry from your resume. The updated version now shows your two most recent positions.''>"
  }
  `;
};
