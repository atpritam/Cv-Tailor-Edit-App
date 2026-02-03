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
      console.error(
        "Error applying HTML diff for block:",
        block.newHtml.substring(0, 100),
        error,
      );
      // Continue with other blocks
    }
  }

  return updatedHtml;
}

/**
 * Smart block replacement - finds the matching element and replaces it
 * by parsing tags to handle nesting.
 */
function replaceHtmlBlock(currentHtml: string, newBlock: string): string {
  const identifier = extractIdentifier(newBlock);

  if (!identifier || !identifier.tag) {
    console.warn(
      "Could not extract identifier or tag, falling back to similarity search",
      newBlock.substring(0, 100),
    );
    return smartReplaceBlock(currentHtml, newBlock);
  }

  // Build a regex that ONLY matches the unique opening tag
  const openTagRegex = buildOpenTagRegex(identifier);
  if (!openTagRegex) {
    return smartReplaceBlock(currentHtml, newBlock);
  }

  const match = openTagRegex.exec(currentHtml);
  if (!match) {
    console.warn(
      "Could not find block to replace using regex, falling back to similarity search:",
      openTagRegex,
    );
    return smartReplaceBlock(currentHtml, newBlock);
  }

  const startIndex = match.index;
  const tag = identifier.tag;

  // Find the corresponding closing tag by counting nested tags
  const endIndex = findMatchingClosingTag(
    currentHtml,
    tag,
    startIndex + match[0].length,
  );

  if (endIndex !== -1) {
    console.log(
      `replaceHtmlBlock: performed tag-based replacement for <${tag}>`,
    );
    return (
      currentHtml.slice(0, startIndex) + newBlock + currentHtml.slice(endIndex)
    );
  }

  console.error(
    `Could not find matching closing tag for <${tag}> starting at index ${startIndex}`,
  );
  // If parsing fails, it's safer to do nothing than to corrupt the HTML.
  return currentHtml;
}

/**
 * Finds the end index of a corresponding closing tag, accounting for nesting.
 * @param html The full HTML string
 * @param tag The tag to match (e.g., 'div')
 * @param searchStartIndex The index from which to start searching (should be after the opening tag)
 * @returns The index right after the matching closing tag, or -1 if not found.
 */
function findMatchingClosingTag(
  html: string,
  tag: string,
  searchStartIndex: number,
): number {
  let level = 1;
  const openTagPattern = new RegExp(`<${tag}(\\s|>)`, "gi");
  const closeTagPattern = new RegExp(`</${tag}>`, "gi");

  const searchArea = html.substring(searchStartIndex);

  const openMatches = [...searchArea.matchAll(openTagPattern)].map((m) => ({
    type: "open",
    index: m.index!,
  }));
  const closeMatches = [...searchArea.matchAll(closeTagPattern)].map((m) => ({
    type: "close",
    index: m.index!,
  }));

  const allMatches = [...openMatches, ...closeMatches].sort(
    (a, b) => a.index - b.index,
  );

  for (const match of allMatches) {
    if (match.type === "open") {
      level++;
    } else {
      level--;
    }

    if (level === 0) {
      // Found the closing tag. Return the index in the original string.
      return searchStartIndex + match.index + `</${tag}>`.length;
    }
  }

  return -1; // Matching tag not found
}

/**
 * Builds a regex to find the unique opening tag of a block.
 */
function buildOpenTagRegex(identifier: {
  type: string;
  value: string;
  classes?: string[];
  id?: string;
  tag?: string;
}): RegExp | null {
  const tag = identifier.tag;
  if (!tag) return null;
  const tagEsc = String(tag).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  let attrsPattern = "";
  if (identifier.type === "class") {
    const classes =
      identifier.classes || identifier.value.split(/\s+/).filter(Boolean);

    // Lookaheads for each class to ensure they are all present in the tag
    attrsPattern += classes
      .map((c) =>
        `(?=[^>]*\\bclass="[^"]*\\b${c.replace(
          /[.*+?^${}()|[\]\\]/g,
          "\\$&",
        )}\\b[^"]*")`,
      )
      .join("");

    if (identifier.id) {
      const idEsc = String(identifier.id).replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&",
      );
      attrsPattern += `(?=[^>]*\\bid="${idEsc}")`;
    }
  } else if (identifier.type === "id") {
    const idEsc = String(identifier.value).replace(
      /[.*+?^${}()|[\]\\]/g,
      "\\$&",
    );
    attrsPattern += `(?=[^>]*\\bid="${idEsc}")`;
  }

  // The regex matches the tag and uses lookaheads to verify attributes exist
  // It then matches all attributes until the closing > of the tag.
  return new RegExp(`<${tagEsc}${attrsPattern}[^>]*>`, "i");
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
 * Alternative: Find blocks by similarity scoring (more robust fallback)
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
    console.log("smartReplaceBlock: performing similarity-based replacement");
    return currentHtml.replace(oldBlock, newBlock);
  }

  console.warn("smartReplaceBlock: No similar block found to replace.");
  return currentHtml;
}

function extractBlocks(html: string): string[] {
  const blocks: string[] = [];
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
  const classes1 = (block1.match(/class="([^"]+)"/) || [])[1]?.split(" ") || [];
  const classes2 = (block2.match(/class="([^"]+)"/) || [])[1]?.split(" ") || [];
  const tag1 = (block1.match(/^<(\w+)/) || [])[1];
  const tag2 = (block2.match(/^<(\w+)/) || [])[1];
  let score = 0;
  if (tag1 === tag2) score += 0.3;
  const commonClasses = classes1.filter((c) => classes2.includes(c)).length;
  const totalClasses = Math.max(classes1.length, classes2.length);
  if (totalClasses > 0) {
    score += (commonClasses / totalClasses) * 0.7;
  }
  return score;
}
