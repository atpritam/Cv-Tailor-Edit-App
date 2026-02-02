export const processHtmlResponse = (html: string): string => {
  let processedHtml = html;

  // Fix relative URLs
  processedHtml = processedHtml.replace(
    /href=("|')(?!https?:|mailto:|tel:|\/|#)([^"']+)["']/gi,
    (m: string, q1: string, url: string) => {
      const trimmed = url.trim();
      return `href=${q1}https://${trimmed}${q1}`;
    },
  );

  // Remove stray social media keywords
  const anchorRanges: Array<[number, number]> = [];
  for (const m of processedHtml.matchAll(/<a\b[^>]*>[\s\S]*?<\/a>/gi)) {
    if (typeof m.index === "number") {
      anchorRanges.push([m.index, m.index + m[0].length]);
    }
  }

  const socialTokenRegex = /\b(GitHub|LinkedIn|Gitlab|Twitter|Website)\b/gi;
  const removals: Array<[number, number]> = [];
  for (const m of processedHtml.matchAll(socialTokenRegex)) {
    if (typeof m.index !== "number") continue;
    const idx = m.index;
    const insideAnchor = anchorRanges.some((r) => idx >= r[0] && idx < r[1]);
    if (!insideAnchor) {
      removals.push([idx, idx + m[0].length]);
    }
  }

  if (removals.length) {
    removals
      .sort((a, b) => b[0] - a[0])
      .forEach(([s, e]) => {
        processedHtml = processedHtml.slice(0, s) + processedHtml.slice(e);
      });
    processedHtml = processedHtml
      .replace(/\s+•\s+|\s+·\s+|\s+\|\s+/g, " • ")
      .replace(/(\s{2,}|\n{2,})/g, " ")
      .replace(/>\s*<\s*/g, "><");
  }

  return processedHtml;
};
