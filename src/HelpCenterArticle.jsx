import { useEffect, useState } from "react";
import { ArrowLeft, BookOpen, Clock3 } from "lucide-react";
import { getLanguageCode, getStoredLanguage, i18n, loadHelpCenterTranslations, SUPPORTED_LANGUAGES, translate } from "./translation.js";
import { getArticleReadingTime, localizeHelpCenterArticle } from "./helpCenterArticles.js";
import { formatReadingTime } from "./helpCenterFormatting.js";

function currentLanguage() {
  const code = String(i18n.language || "").toLowerCase();
  return SUPPORTED_LANGUAGES.find((language) => getLanguageCode(language).toLowerCase() === code) || getStoredLanguage();
}

export default function HelpCenterArticle({ article }) {
  const [language, setLanguage] = useState(currentLanguage);
  const [, setLocaleVersion] = useState(0);
  useEffect(() => {
    const syncLanguage = (event) => setLanguage(event.detail?.language || currentLanguage());
    window.addEventListener("ledgrace:preferences-changed", syncLanguage);
    i18n.on("languageChanged", syncLanguage);
    return () => {
      window.removeEventListener("ledgrace:preferences-changed", syncLanguage);
      i18n.off("languageChanged", syncLanguage);
    };
  }, []);

  useEffect(() => {
    let active = true;
    loadHelpCenterTranslations(language).then(() => {
      if (active) setLocaleVersion((version) => version + 1);
    }).catch(() => {});
    return () => { active = false; };
  }, [language]);

  const t = (key, options = {}) => translate(key, language, options);
  const localizedArticle = localizeHelpCenterArticle(article, t);
  const title = localizedArticle.title;
  const summary = localizedArticle.summary;
  const topic = translate(article.topic, language);
  const minutes = getArticleReadingTime(article, t, language);

  return (
    <main className="help-center-page help-article-reader-page" data-i18n-skip="true">
      <article className="help-article-reader">
          <a className="help-article-back" href="/help-center" aria-label={t("ui.back")}>
            <ArrowLeft size={15} /> {t("ui.back")}
        </a>
        <div className="help-article-reader-meta">
          <span><BookOpen size={14} /> {topic}</span>
          <span><Clock3 size={14} /> {formatReadingTime(language, minutes)}</span>
        </div>
        <h1>{title}</h1>
        <p className="help-article-reader-summary">{summary}</p>
        <div className="help-article-reader-body">
          <p>{localizedArticle.introduction}</p>
          {localizedArticle.sections.map((section) => (
            <section key={section.heading}>
              <h2>{section.heading}</h2>
              {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            </section>
          ))}
          {article.steps.length > 0 && <section>
              <h2>{t("ui.steps")}</h2>
              <ol>{localizedArticle.steps.map((step) => <li key={step}>{step}</li>)}</ol>
          </section>}
          <aside className="help-article-reader-note"><b>{t("ui.keepInMind")}</b><p>{localizedArticle.note}</p></aside>
        </div>
      </article>
    </main>
  );
}
