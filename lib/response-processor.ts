// Use dynamic import for jsdom to avoid require() of ESM modules during bundling
const fixDataIndexes = async (html: string): Promise<string> => {
  const jsdom = await import("jsdom");
  const dom = new jsdom.JSDOM(html);
  const { document } = dom.window;
  const listItemsCorrectIndex = new Map<Element, string>();
  const lists = new Map<Element, Map<string, Element[]>>();
  document.querySelectorAll("[data-block][data-index]").forEach((el) => {
    const parent = el.parentElement;
    const blockType = el.getAttribute("data-block");
    if (!parent || !blockType) return;
    if (!lists.has(parent)) lists.set(parent, new Map());
    const parentMap = lists.get(parent)!;
    if (!parentMap.has(blockType)) parentMap.set(blockType, []);
    parentMap.get(blockType)!.push(el);
  });

  for (const parentMap of lists.values()) {
    for (const list of parentMap.values()) {
      list.forEach((item, index) => {
        listItemsCorrectIndex.set(item, (index + 1).toString());
      });
    }
  }
  const stack: { node: Element; inheritedIndex: string | null }[] = [
    { node: document.body, inheritedIndex: null },
  ];

  while (stack.length > 0) {
    const { node, inheritedIndex } = stack.pop()!;

    let currentIndex = inheritedIndex;
    if (inheritedIndex === null && listItemsCorrectIndex.has(node)) {
      currentIndex = listItemsCorrectIndex.get(node)!;
    }

    if (node.hasAttribute("data-index") && currentIndex !== null) {
      node.setAttribute("data-index", currentIndex);
    }
    for (let i = node.children.length - 1; i >= 0; i--) {
      stack.push({ node: node.children[i], inheritedIndex: currentIndex });
    }
  }

  return document.body.innerHTML;
};

export const processHtmlResponse = async (html: string): Promise<string> => {
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
  // Fix data-index attributes
  processedHtml = await fixDataIndexes(processedHtml);

  return processedHtml;
};
