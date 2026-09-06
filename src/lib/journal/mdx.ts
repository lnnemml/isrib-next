import fs from "fs";
import path from "path";
import matter from "gray-matter";
import readingTime from "reading-time";

export type JournalCluster = "compare" | "guide" | "science" | "blog" | "tbi";

export type JournalFrontmatter = {
  title: string;
  description: string;
  slug: string;
  cluster: JournalCluster;
  publishedAt: string;
  updatedAt: string;
  readingTime: string;
  keywords: string[];
  relatedSlugs: string[];
};

export type JournalArticle = {
  frontmatter: JournalFrontmatter;
  content: string;
  slug: string;
  cluster: JournalCluster;
};

const CLUSTERS: JournalCluster[] = ["compare", "guide", "science", "blog", "tbi"];

const CONTENT_DIR = path.join(process.cwd(), "content", "journal");

export function getArticle(cluster: JournalCluster, slug: string): JournalArticle {
  const filePath = path.join(CONTENT_DIR, cluster, `${slug}.mdx`);
  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);
  const { text } = readingTime(content);

  return {
    // readingTime is always computed from body text, never read from frontmatter.
    // `data` is `Record<string, unknown>` from gray-matter; we assert the shape here
    // because frontmatter is authored/controlled content, not arbitrary input.
    frontmatter: {
      ...(data as Omit<JournalFrontmatter, "readingTime">),
      readingTime: text,
    } as JournalFrontmatter,
    content,
    slug,
    cluster,
  };
}

export function getAllArticles(): JournalArticle[] {
  const articles: JournalArticle[] = [];

  for (const cluster of CLUSTERS) {
    const clusterDir = path.join(CONTENT_DIR, cluster);
    if (!fs.existsSync(clusterDir)) continue;

    const files = fs.readdirSync(clusterDir).filter((f) => f.endsWith(".mdx"));
    for (const file of files) {
      const slug = file.replace(/\.mdx$/, "");
      articles.push(getArticle(cluster, slug));
    }
  }

  return articles.sort(
    (a, b) =>
      new Date(b.frontmatter.publishedAt).getTime() -
      new Date(a.frontmatter.publishedAt).getTime()
  );
}

export function getArticlesByCluster(cluster: JournalCluster): JournalArticle[] {
  return getAllArticles().filter((a) => a.cluster === cluster);
}

export function getAllSlugs(): { cluster: JournalCluster; slug: string }[] {
  return getAllArticles().map((a) => ({ cluster: a.cluster, slug: a.slug }));
}
