import { translations, SUPPORTED_LANGUAGES } from "../src/translation.js";
import { HELP_CENTER_ARTICLES } from "../src/helpCenterArticles.js";

const uiKeys = [
  "ui.back", "ui.steps", "ui.keepInMind", "ui.minuteRead", "ui.matchingArticles",
  "ui.noMatchingArticles", "ui.noSearchResults", "ui.articleNotFound", "ui.browseArticles",
];
const articleKeys = HELP_CENTER_ARTICLES.flatMap((article) => {
  const prefix = `${article.key}.`;
  return [
    `${prefix}title`, `${prefix}summary`, `${prefix}introduction`, `${prefix}note`,
    ...article.steps.map((_, index) => `${prefix}step.${index}`),
    ...article.sections.flatMap((section, sectionIndex) => [
      `${prefix}section.${sectionIndex}.heading`,
      ...section.paragraphs.map((_, paragraphIndex) => `${prefix}section.${sectionIndex}.paragraph.${paragraphIndex}`),
    ]),
  ];
});
const requiredKeys = [...uiKeys, ...articleKeys];
for (const language of SUPPORTED_LANGUAGES.filter((value) => value !== "English")) {
  const localeModule = await import(new URL(`../src/help-center-locales/${language}.js`, import.meta.url));
  Object.assign(translations[language], localeModule.default);
}
const missing = SUPPORTED_LANGUAGES.flatMap((language) =>
  requiredKeys.filter((key) => !(language === "English" && articleKeys.includes(key)) && typeof translations[language]?.[key] !== "string")
    .map((key) => `${language}: ${key}`),
);

console.log(`${SUPPORTED_LANGUAGES.length} languages, ${HELP_CENTER_ARTICLES.length} articles, ${requiredKeys.length} localized strings`);
if (missing.length) {
  console.error(`Missing ${missing.length} localized strings:\n${missing.slice(0, 40).join("\n")}`);
  process.exitCode = 1;
} else {
  console.log("All Help Center article and reader strings exist in every supported language.");
}
