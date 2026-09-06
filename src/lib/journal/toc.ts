import GithubSlugger from "github-slugger";

export type TOCItem = {
  id: string;
  text: string;
  level: 2 | 3;
};

/**
 * Extract an H2/H3 table of contents from raw MDX body text.
 *
 * IDs are produced with `github-slugger` — the exact library `rehype-slug` uses
 * to generate heading `id`s during MDX render — so TOC anchors line up with the
 * rendered headings. A fresh slugger per call replicates rehype-slug's
 * per-document duplicate handling (e.g. a repeated heading becomes `title-1`).
 */
export function extractTOC(content: string): TOCItem[] {
  const slugger = new GithubSlugger();
  const headingRegex = /^(#{2,3})\s+(.+)$/gm;
  const items: TOCItem[] = [];
  let match: RegExpExecArray | null;

  while ((match = headingRegex.exec(content)) !== null) {
    const level = match[1].length as 2 | 3;
    const text = match[2].trim();
    const id = slugger.slug(text);

    items.push({ id, text, level });
  }

  return items;
}
