/**
 * Smart HTML Diff Processor
 * Finds and replaces changed HTML blocks automatically
 */

export interface HtmlBlock {
  newHtml: string;
  description?: string;
}

/**
 * Apply HTML block changes by intelligently finding and replacing them
 */
export function applyHtmlDiff(
  currentHtml: string,
  blocks: HtmlBlock[],
): string {
  let updatedHtml = currentHtml;

  for (const block of blocks) {
    try {
      updatedHtml = replaceHtmlBlock(updatedHtml, block.newHtml);
    } catch (error) {
      // Continue with other blocks
    }
  }

  return updatedHtml;
}

/**
 * Smart block replacement - finds the matching element and replaces it
 */
function replaceHtmlBlock(currentHtml: string, newBlock: string): string {
  // Extract the unique identifier
  const identifier = extractIdentifier(newBlock);

  if (!identifier) {
    console.warn(
      "Could not extract identifier from block:",
      newBlock.substring(0, 100),
    );
    return currentHtml;
  }

  // Find and replace the matching block in current HTML
  const pattern = buildMatchPattern(identifier);

  if (!pattern) {
    return currentHtml;
  }

  // If regex matches, replace directly. Otherwise try a similarity-based replacement
  const matches = pattern.regex.test(currentHtml);
  if (matches) {
    const replaced = currentHtml.replace(pattern.regex, newBlock);
    console.log("replaceHtmlBlock: performed regex replacement");
    return replaced;
  }

  // Fallback: use similarity scoring to find the best block to replace
  return smartReplaceBlock(currentHtml, newBlock);
}

/**
 * Extract unique identifier from HTML block (class name or tag+content signature)
 */
function extractIdentifier(htmlBlock: string): {
  type: "class" | "tag" | "unique-text" | "id";
  value: string;
  tag?: string;
  classes?: string[];
  id?: string;
} | null {
  // Parse the root opening tag and its attributes
  const rootTagMatch = htmlBlock.match(/^\s*<(\w+)([^>]*)>/);
  if (rootTagMatch) {
    const tag = rootTagMatch[1];
    const attrString = rootTagMatch[2] || "";

    const classMatch = attrString.match(/\bclass="([^"]+)"/);
    const idMatch = attrString.match(/\bid="([^"]+)"/);

    if (classMatch) {
      const classes = classMatch[1].split(/\s+/).filter(Boolean);
      // Prefer class identifier and include id when present so we can match class+id
      return {
        type: "class",
        value: classes.join(" "),
        tag,
        classes,
        id: idMatch ? idMatch[1] : undefined,
      };
    }

    if (idMatch) {
      return { type: "id", value: idMatch[1], tag };
    }
  }

  // Try to extract tag name
  const tagMatch = htmlBlock.match(/^\s*<(\w+)/);
  if (tagMatch) {
    const tag = tagMatch[1];

    // For specific semantic tags, we can match by tag alone
    if (["h1", "h2", "header", "section"].includes(tag)) {
      // Extract some unique text content for better matching
      const textMatch = htmlBlock.match(/>([^<]{10,50})</);
      if (textMatch) {
        return {
          type: "unique-text",
          value: textMatch[1].trim().substring(0, 30),
          tag,
        };
      }
    }

    return { type: "tag", value: tag };
  }

  return null;
}

/**
 * Build regex pattern to match the existing block
 */
function buildMatchPattern(identifier: {
  type: "class" | "tag" | "unique-text" | "id";
  value: string;
  classes?: string[];
  id?: string;
}): { regex: RegExp } | null {
  if (identifier.type === "class") {
    const classes =
      identifier.classes || identifier.value.split(/\s+/).filter(Boolean);
    const alternation = classes
      .map((c) => c.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
      .join("|");
    const classPattern = `(?:${alternation})`;

    const tag = (identifier as any).tag;
    const idVal = (identifier as any).id;
    if (tag) {
      const tagEsc = String(tag).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      if (idVal) {
        const idEsc = String(idVal).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        // Allow id and class attributes in any order using lookaheads
        const regex = new RegExp(
          `<${tagEsc}(?=[^>]*\\bid="${idEsc}")(?=[^>]*class="[^\"]*\\b${classPattern}\\b")[^>]*>[\\s\\S]*?</${tagEsc}>`,
        );
        return { regex };
      }

      const regex = new RegExp(
        `<${tagEsc}[^>]*class="[^\"]*\\b${classPattern}\\b[^\"]*"[^>]*>[\\s\\S]*?</${tagEsc}>`,
      );
      return { regex };
    }

    if (idVal) {
      const idEsc = String(idVal).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const anyTagRegex = `<[^>]+(?=[^>]*\\bid="${idEsc}")(?=[^>]*class="[^\"]*\\b${classPattern}\\b")[^>]*>[\\s\\S]*?</[^>]+>`;
      return { regex: new RegExp(anyTagRegex) };
    }

    const anyTagRegex = `<[^>]+class="[^\"]*\\b${classPattern}\\b[^\"]*"[^>]*>[\\s\\S]*?</[^>]+>`;
    const regex = new RegExp(anyTagRegex);
    return { regex };
  }

  if (identifier.type === "unique-text") {
    // Match by unique text content
    const escapedText = identifier.value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`<[^>]+>[^<]*${escapedText}[^<]*</[^>]+>`, "");
    return { regex };
  }

  if (identifier.type === "id") {
    const idVal = String(identifier.value).replace(
      /[.*+?^${}()|[\]\\]/g,
      "\\$&",
    );
    const tag = (identifier as any).tag;
    if (tag) {
      const tagEsc = String(tag).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(
        `<${tagEsc}[^>]*\\sid="${idVal}"[^>]*>[\\s\\S]*?</${tagEsc}>`,
      );
      return { regex };
    }

    const anyTagRegex = `<[^>]+\\sid="${idVal}"[^>]*>[\\s\\S]*?</[^>]+>`;
    return { regex: new RegExp(anyTagRegex) };
  }

  if (identifier.type === "tag") {
    // Match by tag - less reliable but works for unique tags
    const tag = identifier.value;
    const regex = new RegExp(`<${tag}[^>]*>[\\s\\S]*?</${tag}>`, "");
    return { regex };
  }

  return null;
}

/**
 * Alternative: Find blocks by similarity scoring (more robust)
 */
export function smartReplaceBlock(
  currentHtml: string,
  newBlock: string,
): string {
  // Extract all blocks from current HTML
  const currentBlocks = extractBlocks(currentHtml);

  // Find the most similar block
  let bestMatch = { index: -1, score: 0 };

  for (let i = 0; i < currentBlocks.length; i++) {
    const score = calculateSimilarity(currentBlocks[i], newBlock);
    if (score > bestMatch.score) {
      bestMatch = { index: i, score };
    }
  }

  // Replace if we found a good match (>70% similarity)
  if (bestMatch.index >= 0 && bestMatch.score > 0.7) {
    const oldBlock = currentBlocks[bestMatch.index];
    return currentHtml.replace(oldBlock, newBlock);
  }

  return currentHtml;
}

function extractBlocks(html: string): string[] {
  const blocks: string[] = [];

  // Match major semantic blocks
  const patterns = [
    /<p class="summary"[^>]*>[\s\S]*?<\/p>/g,
    /<div class="project"[^>]*>[\s\S]*?<\/div>/g,
    /<div class="skill-level"[^>]*>[\s\S]*?<\/div>/g,
    /<h1[^>]*>[\s\S]*?<\/h1>/g,
    /<section[^>]*>[\s\S]*?<\/section>/g,
  ];

  for (const pattern of patterns) {
    const matches = html.matchAll(pattern);
    for (const match of matches) {
      blocks.push(match[0]);
    }
  }

  return blocks;
}

function calculateSimilarity(block1: string, block2: string): number {
  // Extract class names
  const classes1 = (block1.match(/class="([^"]+)"/) || [])[1]?.split(" ") || [];
  const classes2 = (block2.match(/class="([^"]+)"/) || [])[1]?.split(" ") || [];

  // Extract tag
  const tag1 = (block1.match(/^<(\w+)/) || [])[1];
  const tag2 = (block2.match(/^<(\w+)/) || [])[1];

  let score = 0;

  // Tag match is important
  if (tag1 === tag2) score += 0.3;

  // Class overlap
  const commonClasses = classes1.filter((c) => classes2.includes(c)).length;
  const totalClasses = Math.max(classes1.length, classes2.length);
  if (totalClasses > 0) {
    score += (commonClasses / totalClasses) * 0.7;
  }

  return score;
}
