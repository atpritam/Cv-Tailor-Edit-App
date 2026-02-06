import { parseHTML } from "linkedom";

export const processHtmlResponse = async (
  html: string,
  fixDataIndex: boolean = true,
): Promise<string> => {
  try {
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

    // Parse HTML once and perform all DOM manipulations
    const trimmed = (processedHtml || "").trim();
    const needsWrapper =
      !/<!doctype\s+/i.test(trimmed) &&
      !/<html[\s>]/i.test(trimmed) &&
      !/<body[\s>]/i.test(trimmed);
    const input = needsWrapper
      ? `<!doctype html><html><body>${processedHtml}</body></html>`
      : processedHtml;

    try {
      const { document } = parseHTML(input);
      const skipTags = new Set(["CODE", "PRE", "SCRIPT", "STYLE"]);

      // Step 1: Convert inline markdown-like syntax in text nodes to HTML
      const convertTextNodes = (root: Element) => {
        const walk = (node: Node) => {
          for (let child = node.firstChild; child; ) {
            const next = child.nextSibling;

            if (child.nodeType === Node.TEXT_NODE) {
              let text = child.nodeValue || "";
              if (!/\n|\*/.test(text)) {
                child = next;
                continue;
              }

              text = text
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;");
              const html = text
                .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
                .replace(/\*(.+?)\*/g, "<em>$1</em>")
                .replace(/\n/g, "<br>");

              const temp = document.createElement("div");
              temp.innerHTML = html;
              node.insertBefore(temp, child);
              while (temp.firstChild) node.insertBefore(temp.firstChild, child);

              node.removeChild(child);
            } else if (child.nodeType === Node.ELEMENT_NODE) {
              const el = child as Element;
              if (!skipTags.has(el.tagName)) walk(child);
            }
            child = next;
          }
        };
        walk(root);
      };

      convertTextNodes(document.body);

      // Step 2: Remove trailing separators
      const allElements = Array.from(document.body.getElementsByTagName("*"));
      allElements.push(document.body);

      for (const el of allElements) {
        let last = el.lastChild;
        while (last) {
          if (last.nodeType === Node.TEXT_NODE) {
            const value = last.nodeValue || "";
            // Is it just whitespace?
            if (/^\s*$/.test(value)) {
              const prev = last.previousSibling;
              el.removeChild(last);
              last = prev;
              continue;
            }

            // Does it end with a separator?
            const trimmedValue = value.trim();
            if (/[•|·]\s*$/.test(trimmedValue)) {
              const newValue = trimmedValue.replace(/[•|·]\s*$/, "").trim();
              last.nodeValue = newValue; // update node value
              if (/^\s*$/.test(newValue)) {
                // if it becomes empty
                const prev = last.previousSibling;
                el.removeChild(last);
                last = prev;
                continue;
              }
            }
          } else if (last.nodeType === Node.ELEMENT_NODE) {
            const text = (last as Element).textContent?.trim();
            if (text === "•" || text === "|" || text === "·") {
              const prev = last.previousSibling;
              el.removeChild(last);
              last = prev;
              continue;
            }
          }
          break;
        }
      }

      // Step 3: Fix data-index attributes
      if (fixDataIndex) {
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
            stack.push({
              node: node.children[i],
              inheritedIndex: currentIndex,
            });
          }
        }
      }

      processedHtml = document.body.innerHTML;
    } catch (e: any) {
      console.error("HTML processing error:", e?.message || e);
    }

    return processedHtml;
  } catch (err: any) {
    console.error("processHtmlResponse error:", err?.message || String(err));
    return html;
  }
};

export const sanitizeImprovements = (improvements: any): string[] => {
  if (!Array.isArray(improvements)) return [];
  const bannedPhrase =
    /\b(as per|per the template|per template|as per the template|as per instructions|follow(ed)? (the )?(instructions|guidelines|template)|template guidelines|word count requirements|word count limit|word limit|word count)\b/i;

  const cleaned = improvements
    .filter(Boolean)
    .map((imp) => String(imp).trim())
    .filter((imp) => !bannedPhrase.test(imp))
    .map((imp) =>
      imp
        .replace(/['"`]+/g, "")
        .replace(/\s{2,}/g, " ")
        .trim(),
    )
    .filter((v, i, a) => v && a.indexOf(v) === i)
    .slice(0, 6);

  return cleaned;
};
