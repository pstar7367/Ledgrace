const articleCountUnits = {
  English: "articles",
  Spanish: "artículos",
  French: "articles",
  Portuguese: "artigos",
  German: "Artikel",
  Italian: "articoli",
  Arabic: "مقالات",
  Japanese: "記事",
  Chinese: "篇文章",
  Korean: "문서",
  Vietnamese: "bài viết",
  Thai: "บทความ",
  Filipino: "artikulo",
};

const readingTimeTemplates = {
  English: "{{count}} min read",
  Spanish: "{{count}} min de lectura",
  French: "{{count}} min de lecture",
  Portuguese: "{{count}} min de leitura",
  German: "{{count}} Min. Lesezeit",
  Italian: "{{count}} min di lettura",
  Arabic: "قراءة {{count}} دقيقة",
  Japanese: "読了時間：約{{count}}分",
  Chinese: "阅读约{{count}}分钟",
  Korean: "{{count}}분 읽기",
  Vietnamese: "Đọc trong {{count}} phút",
  Thai: "อ่าน {{count}} นาที",
  Filipino: "{{count}} minutong basa",
};

export function formatArticleCount(language, count) {
  return `${count} ${articleCountUnits[language] || articleCountUnits.English}`;
}

export function formatReadingTime(language, count) {
  return (readingTimeTemplates[language] || readingTimeTemplates.English).replace("{{count}}", String(count));
}
