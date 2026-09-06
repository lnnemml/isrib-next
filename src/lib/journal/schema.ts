const BASE_URL = "https://isrib.shop";

interface ArticleSchemaInput {
  title: string;
  description: string;
  slug: string;
  cluster: string;
  publishedAt: string;
  updatedAt?: string;
  keywords?: string[];
}

export function buildArticleSchema({
  title,
  description,
  slug,
  cluster,
  publishedAt,
  updatedAt,
  keywords,
}: ArticleSchemaInput) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description,
    datePublished: publishedAt,
    dateModified: updatedAt ?? publishedAt,
    keywords: keywords ?? [],
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${BASE_URL}/journal/${cluster}/${slug}`,
    },
    author: {
      "@type": "Person",
      name: "The Synthesis Lab",
      jobTitle: "Pharmaceutical Chemist",
      url: `${BASE_URL}/journal/author`,
    },
    publisher: {
      "@type": "Organization",
      name: "ISRIB.shop",
    },
    about: {
      "@type": "Drug",
      name: "ISRIB A15",
    },
  };
}

export function buildFAQSchema(
  items: { question: string; answer: string }[]
): object | null {
  if (items.length === 0) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map(({ question, answer }) => ({
      "@type": "Question",
      name: question,
      acceptedAnswer: {
        "@type": "Answer",
        text: answer,
      },
    })),
  };
}

export function extractFAQsFromContent(
  rawContent: string
): { question: string; answer: string }[] {
  const faqs: { question: string; answer: string }[] = [];
  const lines = rawContent.split("\n");

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    const h3Match = line.match(/^###\s+(.+\?)$/);
    if (!h3Match) continue;

    const question = h3Match[1].trim();
    let answer = "";

    for (let j = i + 1; j < lines.length; j++) {
      const nextLine = lines[j].trim();
      if (nextLine === "") continue;
      // Stop at headings or MDX component tags
      if (nextLine.startsWith("#") || nextLine.startsWith("<")) break;
      answer = nextLine;
      break;
    }

    if (!answer) continue;

    // Strip MDX/HTML tags
    answer = answer.replace(/<[^>]+>/g, "");
    // Strip markdown bold: **text** -> text
    answer = answer.replace(/\*\*([^*]+)\*\*/g, "$1");
    // Strip markdown links: [text](url) -> text
    answer = answer.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
    // Strip inline code: `code` -> code
    answer = answer.replace(/`([^`]+)`/g, "$1");
    answer = answer.trim();

    if (answer) faqs.push({ question, answer });
  }

  return faqs;
}
