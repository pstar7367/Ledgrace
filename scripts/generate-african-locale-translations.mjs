import fs from "node:fs/promises";
import { translations } from "../src/translation.js";

const languages = [["Yoruba", "yo"], ["Hausa", "ha"], ["Igbo", "ig"]];
const separator = "\n<<<LEDGRACE_TRANSLATION_SEPARATOR>>>\n";
const placeholderPattern = /{{\s*([^}\s]+)\s*}}/g;
const outputPath = new URL("../src/generatedAfricanLocaleTranslations.js", import.meta.url);

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
  for (const host of ["translate.googleapis.com", "translate.google.com"]) {
    const params = new URLSearchParams({ client: "gtx", sl: "en", tl: targetLanguage, dt: "t", q: query });
    const response = await fetch(`https://${host}/translate_a/single?${params}`);
    if (!response.ok) continue;
    const payload = await response.json();
    const translated = payload[0]?.map((part) => part[0]).join("")?.split(separator);
    if (translated?.length === values.length) return translated.map((value, index) => restore(value, protectedValues[index].variables));
  }
  throw new Error("Translation request failed or separator was not preserved");
}

async function translateLocale(values, targetLanguage) {
  const entries = Object.entries(values);
  const translated = {};
  for (let index = 0; index < entries.length; index += 40) {
    const batch = entries.slice(index, index + 80);
    let results;
    try {
      results = await translateBatch(batch.map(([, value]) => value), targetLanguage);
    } catch {
      results = [];
      for (const [, value] of batch) results.push((await translateBatch([value], targetLanguage))[0]);
    }
    batch.forEach(([key], batchIndex) => { translated[key] = results[batchIndex]; });
    if ((index + batch.length) % 80 === 0) console.log(`${targetLanguage}: ${index + batch.length}/${entries.length}`);
  }
  return translated;
}

const generated = {};
const english = flatten(translations.English);
try {
  const existing = await import("../src/generatedAfricanLocaleTranslations.js?cacheBust=" + Date.now());
  Object.assign(generated, existing.default || {});
} catch {}
for (const [language, targetLanguage] of languages) {
  if (Object.keys(generated[language] || {}).length === Object.keys(english).length) continue;
  generated[language] = await translateLocale(english, targetLanguage);
  await fs.writeFile(outputPath, `const generatedAfricanLocaleTranslations = ${JSON.stringify(generated, null, 2)};\n\nexport default generatedAfricanLocaleTranslations;\n`);
}

await fs.writeFile(
  outputPath,
  `const generatedAfricanLocaleTranslations = ${JSON.stringify(generated, null, 2)};\n\nexport default generatedAfricanLocaleTranslations;\n`,
);