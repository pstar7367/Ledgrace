import fs from "node:fs";
import path from "node:path";

const { SUPPORTED_LANGUAGES, translations } = await import("../src/translation.js");

const sourceDirectory = path.resolve("src");

function flatten(value, prefix = "", result = {}) {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    Object.entries(value).forEach(([key, child]) => flatten(child, prefix ? `${prefix}.${key}` : key, result));
  } else {
    result[prefix] = value;
  }
  return result;
}

function interpolationVariables(value) {
  return [...String(value ?? "").matchAll(/{{\s*([^}\s]+)\s*}}/g)].map((match) => match[1]).sort();
}

const english = flatten(translations.English);
const englishKeys = Object.keys(english);
const localeReports = {};
let hasErrors = false;
const requiredTranslatedLanguages = new Set([
  "Spanish",
  "French",
  "Portuguese",
  "German",
  "Italian",
  "Arabic",
  "Japanese",
  "Chinese",
  "Korean",
  "Vietnamese",
  "Thai",
  "Filipino",
]);

for (const language of SUPPORTED_LANGUAGES) {
  const locale = flatten(translations[language]);
  const missing = englishKeys.filter((key) => !(key in locale));
  const extra = Object.keys(locale).filter((key) => !(key in english));
  const empty = Object.keys(locale).filter((key) => locale[key] === "" || locale[key] == null);
  const sameAsEnglish = language === "English" ? [] : englishKeys.filter((key) => key in locale && locale[key] === english[key] && english[key] !== "");
  const interpolationMismatch = englishKeys.filter((key) => key in locale && JSON.stringify(interpolationVariables(english[key])) !== JSON.stringify(interpolationVariables(locale[key])));
  localeReports[language] = { keys: Object.keys(locale).length, missing, extra, empty, sameAsEnglish, interpolationMismatch };
  const untranslated = requiredTranslatedLanguages.has(language) ? sameAsEnglish : [];
  hasErrors ||= missing.length > 0 || extra.length > 0 || empty.length > 0 || interpolationMismatch.length > 0 || untranslated.length > 0;
}

const sourceFiles = [];
function collectSourceFiles(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) collectSourceFiles(fullPath);
    else if (/\.(jsx|js)$/.test(entry.name) && entry.name !== "translation.js" && entry.name !== "I18nDomBridge.jsx") sourceFiles.push(fullPath);
  }
}
collectSourceFiles(sourceDirectory);

const appKeys = new Map();
for (const file of sourceFiles) {
  const contents = fs.readFileSync(file, "utf8");
  for (const match of contents.matchAll(/\b(?:t|translate)\(\s*["'`]([^"'`]+)["'`]/g)) {
    const key = match[1];
    if (key.includes(":") || key.includes("${") || key.includes("?") || key === "a") continue;
    if (!appKeys.has(key)) appKeys.set(key, []);
    appKeys.get(key).push(path.relative(process.cwd(), file));
  }
}
const missingAppKeys = [...appKeys.keys()].filter((key) => !(key in english));
hasErrors ||= missingAppKeys.length > 0;

console.log("Ledgrace localization audit");
console.log(`English: ${englishKeys.length} keys`);
for (const language of SUPPORTED_LANGUAGES) {
  const report = localeReports[language];
  const completeness = englishKeys.length ? ((englishKeys.length - report.missing.length) / englishKeys.length * 100).toFixed(1) : "100.0";
  console.log(`${language}: ${completeness}% (${report.keys} keys)`);
  for (const category of ["missing", "extra", "empty", "sameAsEnglish", "interpolationMismatch"]) {
    if (report[category].length) {
      const preview = report[category].slice(0, 20).join(", ");
      const remainder = report[category].length > 20 ? ` ... (+${report[category].length - 20} more)` : "";
      console.log(`  ${category} (${report[category].length}): ${preview}${remainder}`);
    }
  }
  if (requiredTranslatedLanguages.has(language) && report.sameAsEnglish.length) {
    console.log(`  untranslatedRequired (${report.sameAsEnglish.length}): English fallback values are not allowed for this locale`);
  }
}
console.log(`\nApplication translation keys checked: ${appKeys.size}`);
console.log(`Application keys missing from English: ${missingAppKeys.length ? missingAppKeys.join(", ") : "none"}`);
process.exitCode = hasErrors ? 1 : 0;
