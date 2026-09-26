import fs from "node:fs/promises";
import { translations } from "../src/translation.js";
import { HELP_CENTER_ARTICLES } from "../src/helpCenterArticles.js";

const languages = [
  ["Spanish", "es"], ["French", "fr"], ["Portuguese", "pt"], ["German", "de"],
  ["Italian", "it"], ["Arabic", "ar"], ["Japanese", "ja"], ["Chinese", "zh-CN"],
  ["Korean", "ko"], ["Vietnamese", "vi"], ["Thai", "th"], ["Filipino", "fil"],
];
const separator = "\n<<<LEDGRACE_HELP_TRANSLATION_SEPARATOR>>>\n";
const outputDirectory = new URL("../src/help-center-locales/", import.meta.url);
const uiText = {
  "ui.back": "Back to Help Center",
  "ui.steps": "Steps",
  "ui.keepInMind": "Keep in mind",
  "ui.minuteRead": "{{count}} min read",
  "ui.matchingArticles": "Matching articles: {{count}}",
  "ui.noMatchingArticles": "No matching articles. Try another search.",
  "ui.noSearchResults": "No matching help articles. Try another search or view all topics.",
  "ui.articleNotFound": "Article not found",
  "ui.browseArticles": "Browse all help articles",
};

function collectArticleText(article) {
  const fields = {
    title: article.title,
    summary: article.summary,
    introduction: article.introduction,
    note: article.note,
  };
  article.steps.forEach((step, index) => { fields[`step.${index}`] = step; });
  article.sections.forEach((section, sectionIndex) => {
    fields[`section.${sectionIndex}.heading`] = section.heading;
    section.paragraphs.forEach((paragraph, paragraphIndex) => {
      fields[`section.${sectionIndex}.paragraph.${paragraphIndex}`] = paragraph;
    });
  });
  return Object.fromEntries(Object.entries(fields).map(([field, value]) => [`${article.key}.${field}`, value]));
}

const topicKeys = ["getting_started", "accounts_connections", "transactions", "budgeting", "savings_goals", "bills_subscriptions", "reports_insights", "account_settings"];
const helpCenterUi = Object.fromEntries(Object.entries(translations.English).filter(([key]) =>
  key.startsWith("help_center_") || topicKeys.some((topic) => key === topic || key === `${topic}_description` || key === `${topic}_articles`),
));
const english = Object.assign({}, helpCenterUi, uiText, ...HELP_CENTER_ARTICLES.map(collectArticleText));
const placeholderPattern = /{{\s*([^}\s]+)\s*}}/g;
function protect(value) {
  const placeholders = [];
  const text = String(value).replace(placeholderPattern, (_, name) => {
    const token = `LEDGRACEVAR${placeholders.length}TOKEN`;
    placeholders.push([token, `{{${name}}}`]);
    return token;
  });
  return { text, placeholders };
}

async function translateBatch(values, targetLanguage) {
  const protectedValues = values.map(protect);
  const query = protectedValues.map(({ text }) => text).join(separator);
  const params = new URLSearchParams({ client: "gtx", sl: "en", tl: targetLanguage, dt: "t", q: query });
  const response = await fetch(`https://translate.googleapis.com/translate_a/single?${params}`);
  if (!response.ok) throw new Error(`Translation request failed: ${response.status}`);
  const payload = await response.json();
  const translated = payload[0]?.map((part) => part[0]).join("")?.split(separator);
  if (!translated || translated.length !== values.length) throw new Error("Translation batch was incomplete");
  return translated.map((value, index) => protectedValues[index].placeholders.reduce(
    (result, [token, placeholder]) => result.replaceAll(token, placeholder), value,
  ));
}

let generated = {};
try {
  const existing = await import(`../src/generatedHelpCenterTranslations.js?cacheBust=${Date.now()}`);
  generated = existing.default || {};
} catch {}

for (const [language, targetLanguage] of languages) {
  const translated = { ...(generated[language] || {}) };
  const entries = Object.entries(english).filter(([key]) => !(key in translated));
  const writeLocale = () => fs.writeFile(
    new URL(`${language}.js`, outputDirectory),
    `const helpCenterTranslations = ${JSON.stringify(translated, null, 2)};\n\nexport default helpCenterTranslations;\n`,
  );
  if (!entries.length) {
    await fs.mkdir(outputDirectory, { recursive: true });
    await writeLocale();
    continue;
  }
  for (let index = 0; index < entries.length; index += 8) {
    const batch = entries.slice(index, index + 8);
    let results;
    try {
      results = await translateBatch(batch.map(([, value]) => value), targetLanguage);
    } catch (error) {
      console.warn(`${language}: batch ${index} failed; retrying entries individually (${error.message})`);
      results = [];
      for (const [, value] of batch) results.push((await translateBatch([value], targetLanguage))[0]);
    }
    batch.forEach(([key], batchIndex) => { translated[key] = results[batchIndex]; });
    if ((index + batch.length) % 80 === 0 || index + batch.length === entries.length) {
      generated[language] = translated;
      await fs.mkdir(outputDirectory, { recursive: true });
      await writeLocale();
      console.log(`${language}: ${index + batch.length}/${entries.length}`);
    }
  }
}
