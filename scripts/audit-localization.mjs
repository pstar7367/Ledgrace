import fs from "node:fs";
import path from "node:path";

const sourceDirectory = path.resolve("src");
const ignoredFiles = new Set([
  "translation.js",
  "I18nDomBridge.jsx",
]);
const sourceFiles = fs.readdirSync(sourceDirectory)
  .filter((file) => /\.(jsx|js)$/.test(file) && !ignoredFiles.has(file));

const visibleStringPattern = /(?:>|\{|\[|,)\s*["'`]([^"'`\n]{3,})["'`]/g;
const englishLetters = /[A-Za-z]{3}/;
const findings = [];

for (const file of sourceFiles) {
  const fullPath = path.join(sourceDirectory, file);
  const contents = fs.readFileSync(fullPath, "utf8");
  let match;

  while ((match = visibleStringPattern.exec(contents))) {
    const value = match[1].replace(/\\n/g, " ").trim();
    if (!englishLetters.test(value) || value.includes("http") || value.includes("#")) continue;
    findings.push({ file, value });
  }
}

const grouped = findings.reduce((result, finding) => {
  result[finding.file] ??= new Set();
  result[finding.file].add(finding.value);
  return result;
}, {});

console.log("Ledgrace localization audit");
console.log(`Files checked: ${sourceFiles.length}`);
console.log(`Potential visible English strings: ${findings.length}`);

for (const [file, values] of Object.entries(grouped)) {
  console.log(`\n${file} (${values.size})`);
  [...values].slice(0, 20).forEach((value) => console.log(`  - ${value}`));
}

process.exitCode = findings.length ? 1 : 0;
