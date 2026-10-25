import { EDITORIAL_COPY_EN } from "../src/editorialContent.js";
import generatedEditorialTranslations from "../src/generatedEditorialTranslations.js";

const keys = Object.keys(EDITORIAL_COPY_EN);
let failed = false;
for (const [language, values] of Object.entries(generatedEditorialTranslations)) {
  const missing = keys.filter(
    (key) => typeof values[key] !== "string" || !values[key].trim(),
  );
  const unchanged = keys.filter((key) => values[key] === EDITORIAL_COPY_EN[key]);
  const homepageQuotes = [
    values.home_quote_one,
    values.home_quote_two,
    values.home_quote_three,
  ];
  const duplicateQuotes = new Set(homepageQuotes).size !== homepageQuotes.length;
  console.log(
    `${language}: ${keys.length - missing.length}/${keys.length} translated; ${unchanged.length} unchanged`,
  );
  if (unchanged.length) console.log(`  unchanged keys: ${unchanged.join(", ")}`);
  if (duplicateQuotes) console.log("  homepage testimonial quotes contain duplicates");
  if (missing.length || unchanged.length || duplicateQuotes) failed = true;
}
if (Object.keys(generatedEditorialTranslations).length !== 12) {
  console.error(
    `Expected 12 translated locales; found ${Object.keys(generatedEditorialTranslations).length}.`,
  );
  failed = true;
}
process.exitCode = failed ? 1 : 0;
