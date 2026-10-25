import { editorialArticles } from "./editorialContent.js";

export const blogArticles = editorialArticles.map((article) => {
  return {
    ...article,
    readKey: "blog_read_minutes",
    sections: [1, 2, 3].map((number) => ({
      headingKey: `${article.sectionKeys[0]}_h${number}`,
      paragraphs: [`${article.sectionKeys[0]}_p${number}`],
    })),
    category: article.categoryKey,
    title: article.titleKey,
    summary: article.summaryKey,
  };
});
