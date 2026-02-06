import { parseHTML } from "linkedom";

/**
 * Smart HTML Diff Processor
 * Finds and replaces changed HTML blocks automatically
 */

export interface HtmlBlock {
  newHtml: string;
  description?: string;
}

export async function applyHtmlDiff(
  currentHtml: string,
  blocks: HtmlBlock[],
): Promise<string> {
  let html = currentHtml;

  for (const block of blocks) {
    html = await replaceHtmlBlock(html, block.newHtml);
  }

  return html;
}

/**
 * Helpers
 */
async function createDocument(html: string): Promise<Document> {
  if (typeof window !== "undefined" && typeof DOMParser !== "undefined") {
    return new DOMParser().parseFromString(html, "text/html");
  }

  const trimmed = (html || "").trim();
  const needsWrapper =
    !/<!doctype\s+/i.test(trimmed) &&
    !/<html[\s>]/i.test(trimmed) &&
    !/<body[\s>]/i.test(trimmed);
  const input = needsWrapper
    ? `<!doctype html><html><body>${html}</body></html>`
    : html;

  const { document } = parseHTML(input);
  return document as unknown as Document;
}

function hasIdentifier(el: Element): boolean {
  return el.hasAttribute("data-field") || el.hasAttribute("data-block");
}

function buildSelector(el: Element): string | null {
  const field = el.getAttribute("data-field");
  const block = el.getAttribute("data-block");
  const index = el.getAttribute("data-index");

  if (field && index) {
    return `[data-field="${field}"][data-index="${index}"]`;
  }

  if (field) return `[data-field="${field}"]`;

  if (block && index) {
    return `[data-block="${block}"][data-index="${index}"]`;
  }

  if (block) return `[data-block="${block}"]`;

  return null;
}

/**
 * Replace exactly ONE block using data-* identifiers
 */
async function replaceHtmlBlock(
  currentHtml: string,
  newBlock: string,
): Promise<string> {
  const currentDoc = await createDocument(currentHtml);
  const newDoc = await createDocument(newBlock);

  let newEl = newDoc.body.firstElementChild;
  if (!newEl) return currentHtml;

  if (!hasIdentifier(newEl)) {
    const child = newEl.querySelector("[data-field],[data-block]");
    if (child) newEl = child as Element;
  }

  const selector = buildSelector(newEl);

  if (!selector) {
    console.warn("Block missing identifier — skipping", {
      newHtml: newEl.outerHTML?.slice(0, 200),
    });
    return currentHtml;
  }
  const target = currentDoc.querySelector(selector);
  console.debug("Attempting replace", {
    selector,
    newHtmlSnippet: newEl.outerHTML?.slice(0, 200),
  });

  if (!target) {
    console.warn("Target not found:", selector, {
      currentHtmlSnippet: currentHtml.slice(0, 400),
    });
    return currentHtml;
  }

  try {
    const before = target.outerHTML?.slice(0, 200);
    target.outerHTML = newEl.outerHTML;
    const after = newEl.outerHTML?.slice(0, 200);
    console.info("Replaced selector", selector, { before, after });
  } catch (err: any) {
    console.error(
      "Failed to replace target for selector",
      selector,
      err?.message || String(err),
    );
    return currentHtml;
  }

  return currentDoc.body.innerHTML;
}
