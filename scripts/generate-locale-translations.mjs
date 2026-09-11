import fs from "node:fs/promises";
import { translations } from "../src/translation.js";

const languages = [
  ["Vietnamese", "vi"],
  ["Thai", "th"],
  ["Filipino", "tl"],
];
const separator = "\n<<<LEDGRACE_TRANSLATION_SEPARATOR>>>\n";
const placeholderPattern = /{{\s*([^}\s]+)\s*}}/g;

function flatten(value, prefix = "", result = {}) {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    Object.entries(value).forEach(([key, child]) => flatten(child, prefix ? `${prefix}.${key}` : key, result));
  } else {
    result[prefix] = value;
  }
  return result;
}

function protect(value) {
  const variables = [];
  const text = String(value).replace(placeholderPattern, (_, name) => {
    const token = `LEDGRACEVAR${variables.length}TOKEN`;
    variables.push([token, `{{${name}}}`]);
    return token;
  });
  return { text, variables };
}

function restore(value, variables) {
  return variables.reduce((result, [token, placeholder]) => result.replaceAll(token, placeholder), value);
}

async function translateBatch(values, targetLanguage) {
  const protectedValues = values.map(protect);
  const query = protectedValues.map(({ text }) => text).join(separator);
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${targetLanguage}&dt=t&q=${encodeURIComponent(query)}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Translation request failed: ${response.status}`);
  const payload = await response.json();
  const translated = payload[0]?.map((part) => part[0]).join("")?.split(separator);
  if (!translated || translated.length !== values.length) {
    throw new Error("Translation batch separator was not preserved");
  }
  return translated.map((value, index) => restore(value, protectedValues[index].variables));
}

async function translateOne(value, targetLanguage) {
  const result = await translateBatch([value], targetLanguage);
  return result[0];
}

async function translateLocale(values, targetLanguage) {
  const entries = Object.entries(values);
  const translated = {};
  for (let index = 0; index < entries.length; index += 8) {
    const batch = entries.slice(index, index + 8);
    let results;
    try {
      results = await translateBatch(batch.map(([, value]) => value), targetLanguage);
    } catch {
      results = [];
      for (const [, value] of batch) results.push(await translateOne(value, targetLanguage));
    }
    batch.forEach(([key], batchIndex) => { translated[key] = results[batchIndex]; });
    if ((index + batch.length) % 80 === 0) console.log(`${targetLanguage}: ${index + batch.length}/${entries.length}`);
  }
  return translated;
}

const english = flatten(translations.English);
const generated = {};
for (const [language, targetLanguage] of languages) {
  generated[language] = await translateLocale(english, targetLanguage);
}

await fs.writeFile(
  new URL("../src/generatedLocaleTranslations.js", import.meta.url),
  `const generatedLocaleTranslations = ${JSON.stringify(generated, null, 2)};\n\nexport default generatedLocaleTranslations;\n`,
);