import fs from "node:fs/promises";
import { EDITORIAL_COPY_EN } from "../src/editorialContent.js";

const languageTargets = {
  Spanish: "es",
  French: "fr",
  Portuguese: "pt",
  German: "de",
  Italian: "it",
  Arabic: "ar",
  Japanese: "ja",
  Chinese: "zh-CN",
  Korean: "ko",
  Vietnamese: "vi",
  Thai: "th",
  Filipino: "tl",
};
const separator = "\n<<<LEDGRACE_EDITORIAL_TRANSLATION_SEPARATOR>>>\n";
const placeholderPattern = /{{\s*([^}\s]+)\s*}}/g;

function protect(value) {
  const variables = [];
  const text = String(value).replace(placeholderPattern, (_, name) => {
    const token = `LEDGRACEVAR${variables.length}TOKEN`;
    variables.push([token, `{{${name}}}`]);
    return token;
  });
  return { text, variables };
}

async function translateBatch(values, language) {
  const protectedValues = values.map(protect);
  const query = protectedValues.map(({ text }) => text).join(separator);
  const params = new URLSearchParams({
    client: "gtx",
    sl: "en",
    tl: language,
    dt: "t",
    q: query,
  });
  const response = await fetch(
    `https://translate.googleapis.com/translate_a/single?${params}`,
  );
  if (!response.ok) throw new Error(`Translation request failed: ${response.status}`);
  const payload = await response.json();
  const translated = payload[0]
    ?.map((part) => part[0])
    .join("")
    ?.split(separator);
  if (!translated || translated.length !== values.length)
    throw new Error("Translation batch boundary was not preserved");
  return translated.map((value, index) =>
    protectedValues[index].variables.reduce(
      (result, [token, placeholder]) => result.replaceAll(token, placeholder),
      value,
    ),
  );
}

const outputUrl = new URL("../src/generatedEditorialTranslations.js", import.meta.url);
let generated = {};
try {
  generated =
    (await import(`../src/generatedEditorialTranslations.js?${Date.now()}`)).default ||
    {};
} catch {}

const entries = Object.entries(EDITORIAL_COPY_EN);
const reviewedOverrides = {
  French: { testimonial_role_parent: "Père ou mère" },
  Italian: { blog_category_budget: "Pianificazione del budget" },
  Filipino: {
    testimonial_role_student: "Estudyante sa gradwasyon",
    testimonial_role_consultant: "Tagapayo",
    testimonial_role_designer: "Disenyador ng grapiko",
    testimonial_role_accountant: "Tagabilang ng kuwenta",
  },
};
for (const [languageName, languageCode] of Object.entries(languageTargets)) {
  const locale = {};
  for (let index = 0; index < entries.length; index += 6) {
    const batch = entries.slice(index, index + 6);
    let values;
    try {
      values = await translateBatch(
        batch.map(([, value]) => value),
        languageCode,
      );
    } catch {
      values = [];
      for (const [, value] of batch)
        values.push((await translateBatch([value], languageCode))[0]);
    }
    batch.forEach(([key], offset) => {
      locale[key] = values[offset];
    });
  }
  Object.assign(locale, reviewedOverrides[languageName] || {});
  generated[languageName] = { ...(generated[languageName] || {}), ...locale };
  await fs.writeFile(
    outputUrl,
    `const generatedEditorialTranslations = ${JSON.stringify(generated, null, 2)};\n\nexport default generatedEditorialTranslations;\n`,
  );
  console.log(
    `${languageName}: ${Object.keys(locale).length} editorial strings translated`,
  );
}
