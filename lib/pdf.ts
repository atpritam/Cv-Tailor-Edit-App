export type ColorTheme = {
  name: string;
  primary: string;
  h2: string;
  border: string;
  link: string;
  tech: string;
};

export const downloadPDF = async (
  element: HTMLElement,
  profilePhotoDataUrl: string | null,
  theme: ColorTheme,
) => {
  const htmlContent = element.innerHTML;

  try {
    const response = await fetch("/api/generate-pdf", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        html: htmlContent,
        profilePhotoDataUrl,
        theme,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to generate PDF");
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "resume.pdf";
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  } catch (error) {
    console.error("Error downloading PDF:", error);
    alert("Failed to generate PDF. Please try the print option instead.");
  }
};

export const printPDF = (
  element: HTMLElement,
  profilePhotoDataUrl: string | null,
  theme: ColorTheme,
) => {
  const htmlContent = element.innerHTML;

  let modifiedHtml = htmlContent.replace(
    /<img[^>]*class="profile-picture"[^>]*>/gi,
    "",
  );

  modifiedHtml = modifiedHtml.replace(
    /<p[^>]*class="consent"[^>]*>[\s\S]*?<\/p>/gi,
    "",
  );

  if (profilePhotoDataUrl) {
    const profileContainerMatch = modifiedHtml.match(
      /<div class="profile-container"[^>]*>/,
    );
    if (profileContainerMatch) {
      const insertPosition =
        profileContainerMatch.index! + profileContainerMatch[0].length;
      const imgTag = `<img src="${profilePhotoDataUrl}" alt="Profile" class="profile-picture" style="object-fit: cover; border-radius: 14px; flex-shrink: 0;" />`;
      modifiedHtml =
        modifiedHtml.slice(0, insertPosition) +
        imgTag +
        modifiedHtml.slice(insertPosition);
    }
  }

  const consentHtml =
    '<p class="consent">I consent to the processing of my personal data for the purpose of recruitment.</p>';

  const printContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <title>Tailored Resume</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            line-height: 1.5;
            color: #1f2937;
            background-color: #ffffff;
            max-width: 850px;
            margin: 0 auto;
            padding: 40px 60px;
            position: relative;
            min-height: 100vh;
            padding-bottom: 60px;
          }
          @media print {
            body {
              padding: 12px 12px;
              padding-bottom: 40px;
              margin-bottom: 0;
              max-width: 100%;
              font-size: 10.5pt;
              line-height: 1.25;
              min-height: auto;
            }
            @page {
              margin: 0.3in 0.4in;
              size: letter;
            }
          }
          .resume-header { margin-bottom: 18px; }
          @media print { .resume-header { margin-bottom: 16px; } }
          .profile-container { display: flex; align-items: flex-start; gap: 30px; }
          @media print { .profile-container { gap: 24px; } }
          .profile-picture { width: 180px; height: 180px; border-radius: 14px; object-fit: cover; flex-shrink: 0; }
          @media print { .profile-picture { width: 135px; height: 135px; border-radius: 14px; } }
          .contact-info { flex: 1; }
          h1 { font-size: 36px; font-weight: 700; color: ${theme.primary}; margin-bottom: 4px; letter-spacing: 0.5px; }
          .title-line { font-size: 16px; font-weight: 500; color: #4b5563; margin-bottom: 8px; display: block; }
          @media print { h1 { font-size: 16pt; margin-bottom: -1px; } .title-line { font-size: 12pt; margin-bottom: 8px; } }
          .contact { font-size: 14px; line-height: 1.6; color: #374151; }
          @media print { .contact { font-size: 11.5pt; line-height: 1.25; } }
          .contact a { color: ${theme.link}; text-decoration: none; }
          .contact a:hover { text-decoration: underline; }
          section { margin-bottom: 26px; }
          @media print { section { margin-bottom: 14px; } }
          h2 { font-size: 16px; font-weight: 700; color: ${theme.h2}; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 10px; padding-bottom: 4px; border-bottom: 2px solid ${theme.border}; }
          @media print { h2 { font-size: 11.5pt; margin-bottom: 8px; padding-bottom: 2px; border-bottom: 2px solid ${theme.border}; } }
          .summary { text-align: justify; line-height: 1.6; color: #374151; }
          @media print { .summary { line-height: 1.5; } }
          .skills { display: flex; flex-direction: column; gap: 10px; }
          @media print { .skills { gap: 4px; } }
          .skill-level { display: flex; gap: 8px; line-height: 1.6; }
          @media print { .skill-level { line-height: 1.4; } }
          .skill-level-title { font-weight: 700; color: #1f2937; min-width: 110px; flex-shrink: 0; }
          .skill-items { color: #374151; flex: 1; }
          .project { margin-bottom: 18px; }
          @media print { .project { margin-bottom: 16px; } }
          .project:last-child { margin-bottom: 0; }
          .project-header { margin-bottom: 4px; }
          @media print { .project-header { margin-bottom: 3px; } }
          .project-title { font-weight: 700; color: #1f2937; font-size: 16px; display: flex; flex-direction: row; justify-content: space-between; }
          .project-time { font-weight: 700; color: #1f2937; font-size: 12px; }
          @media print { .project-title { font-size: 11pt; } .project-time { font-size: 10pt; } }
          .project-link { color: ${theme.link}; font-weight: 500; }
          a { text-decoration: none; }
          a:hover { text-decoration: underline; }
          .project-sub { display: flex; justify-content: space-between; }
          .project-tech { font-style: italic; color: ${theme.tech}; font-size: 14px; margin-top: 2px; }
          @media print { .project-tech { font-size: 10pt; margin-top: 2px; margin-bottom: 4px; } }
          .project-description { text-align: justify; line-height: 1.6; color: #374151; margin-top: 4px; }
          @media print { .project-description { line-height: 1.45; margin-top: 0px; } }
          .education { line-height: 1.6; color: #374151; }
          @media print { .education { line-height: 1.5; } }
          .education-date { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 4px; }
          .education-details { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 0; }
          @media print { .education-date { margin-bottom: 2px; } }
          .education-title { font-weight: 700; color: #1f2937; }
          @media print {
            * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            a { color: ${theme.link} !important; text-decoration: none; }
            section { page-break-inside: avoid; }
            .project { page-break-inside: avoid; }
            h2 { page-break-after: avoid; }
          }
          .consent {
            font-size: 10.5px;
            color: #6b7280;
            text-align: center;
            margin-top: 40px;
          }
          @media print {
            .consent {
              position: fixed;
              bottom: 20px;
              left: 0;
              right: 0;
              width: 100%;
              margin-top: 0;
            }
          }
          strong { font-weight: 700; color: #1f2937; }
        </style>
      </head>
      <body>
        ${modifiedHtml}
        ${consentHtml}
      </body>
    </html>
  `;

  const printContentWithScript = printContent.replace(
    "</body>",
    `<script>
      window.onload = function() {
        window.print();
      };
    </script></body>`,
  );

  const blob = new Blob([printContentWithScript], {
    type: "text/html; charset=utf-8",
  });
  const url = URL.createObjectURL(blob);

  const printTab = window.open(url, "_blank");

  if (!printTab) {
    alert("Please allow popups to print the PDF");
    URL.revokeObjectURL(url);
    return;
  }

  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 1000);
};
