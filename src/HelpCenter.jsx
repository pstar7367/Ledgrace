import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  CalendarDays,
  ChevronRight,
  CircleHelp,
  Cloud,
  Mail,
  MessageCircle,
  Phone,
  PlayCircle,
  Rocket,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Target,
  WalletCards,
} from "lucide-react";
import { getLanguageCode, getStoredLanguage, i18n, loadHelpCenterTranslations, SUPPORTED_LANGUAGES, translate } from "./translation.js";
import HelpCenterArticle from "./HelpCenterArticle.jsx";
import { getArticleReadingTime, HELP_CENTER_ARTICLES, HELP_CENTER_ARTICLE_COUNTS, localizeHelpCenterArticle } from "./helpCenterArticles.js";
import { formatArticleCount, formatReadingTime } from "./helpCenterFormatting.js";

const topics = [
  ["getting_started", Rocket, "getting_started_articles"],
  ["accounts_connections", Cloud, "accounts_connections_articles"],
  ["transactions", WalletCards, "transactions_articles"],
  ["budgeting", BarChart3, "budgeting_articles"],
  ["savings_goals", Target, "savings_goals_articles"],
  ["bills_subscriptions", CalendarDays, "bills_subscriptions_articles"],
  ["reports_insights", Sparkles, "reports_insights_articles"],
  ["account_settings", Settings, "account_settings_articles"],
];

function languageFromI18n() {
  const code = String(i18n.language || "").toLowerCase();
  return SUPPORTED_LANGUAGES.find((language) => getLanguageCode(language).toLowerCase() === code) || getStoredLanguage();
}

export default function HelpCenter() {
  const [language, setLanguage] = useState(languageFromI18n);
  const [, setLocaleVersion] = useState(0);
  const [query, setQuery] = useState("");
  const [topic, setTopic] = useState(() => {
    const requestedTopic = new URLSearchParams(window.location.search).get("topic");
    return topics.some(([key]) => key === requestedTopic) ? requestedTopic : "all";
  });

  useEffect(() => {
    const syncLanguage = (event) => {
      const nextLanguage = event.detail?.language || languageFromI18n();
      setLanguage(nextLanguage);
    };
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

  const t = useCallback((key, options = {}) => translate(key, language, options), [language]);

  const filteredTopics = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return topics.filter(([key]) => topic === "all" || key === topic).filter(([key]) => {
      if (!normalizedQuery) return true;
      return `${t(key)} ${t(`${key}_description`)}`.toLowerCase().includes(normalizedQuery);
    });
  }, [query, t, topic]);

  const visibleArticles = HELP_CENTER_ARTICLES.filter((article) => topic === "all" || article.topic === topic).filter((article) => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return true;
    const localized = localizeHelpCenterArticle(article, t);
    const topicLabel = t(article.topic);
    const searchable = [topicLabel, localized.title, localized.summary, localized.introduction, ...localized.steps, localized.note, ...localized.sections.flatMap((section) => [section.heading, ...section.paragraphs])];
    return searchable.join(" ").toLowerCase().includes(normalizedQuery);
  });

  const articleTitle = (article) => localizeHelpCenterArticle(article, t).title;
  const articleSummary = (article) => localizeHelpCenterArticle(article, t).summary;

  const selectTopic = (nextTopic) => {
    setTopic(nextTopic);
    setQuery("");
  };

  const articlePath = window.location.pathname.match(/^\/help-center\/articles\/([^/]+)\/?$/);
  if (articlePath) {
    const selectedArticle = HELP_CENTER_ARTICLES.find((article) => article.key === decodeURIComponent(articlePath[1]));
    return selectedArticle ? <HelpCenterArticle article={selectedArticle} /> : <main className="help-center-page help-article-reader-page"><section className="help-article-not-found"><h1>{t("ui.articleNotFound")}</h1><a href="/help-center"><ArrowRight size={14} /> {t("ui.browseArticles")}</a></section></main>;
  }

  return (
    <main className="help-center-page" data-i18n-skip="true">
      <header className="help-center-heading">
        <div>
          <h1>{t("help_center")} <CircleHelp size={22} /></h1>
          <p>{t("help_center_subtitle")}</p>
        </div>
      </header>

      <section className="help-center-hero">
        <div className="help-center-hero-copy">
          <span>{t("help_center_greeting")}</span>
          <h2>{t("help_center_question")}</h2>
          <form className="help-center-search" onSubmit={(event) => { event.preventDefault(); setTopic("all"); document.querySelector(".help-center-articles")?.scrollIntoView({ behavior: "smooth" }); }}>
            <Search size={17} />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t("help_center_search_placeholder")} aria-label={t("help_center_search_placeholder")} />
            <button type="submit" aria-label={t("help_center_search_button")}><Search size={16} /></button>
          </form>
          <div className="help-center-popular"><small>{t("help_center_popular")}</small>{topics.slice(1, 5).map(([key]) => <button type="button" key={key} onClick={() => { selectTopic(key); document.querySelector(".help-center-articles")?.scrollIntoView({ behavior: "smooth" }); }}>{t(key)}</button>)}</div>
        </div>
        <div className="help-center-hero-art" aria-hidden="true"><div className="help-center-art-window"><span /><span /><span /><BarChart3 size={48} /><CircleHelp size={34} /></div><MessageCircle size={34} /></div>
      </section>

      <div className="help-center-layout">
        <div className="help-center-main">
          <section className="help-center-topics">
            <div className="help-center-section-heading"><h2>{t("help_center_browse_topics")}</h2><button type="button" className="help-center-link" onClick={() => selectTopic("all")}>{t("help_center_view_all")} <ArrowRight size={13} /></button></div>
            <div className="help-center-topic-grid">
              {filteredTopics.map(([key, Icon]) => {
                const articleCount = HELP_CENTER_ARTICLE_COUNTS[key] || 0;
                const countLabel = formatArticleCount(language, articleCount);
                return <button type="button" className={`help-topic-card ${topic === key ? "selected" : ""}`} key={key} onClick={() => { setQuery(""); selectTopic(key); document.querySelector(".help-center-articles")?.scrollIntoView({ behavior: "smooth" }); }}><span className="help-topic-icon"><Icon size={18} /></span><b>{t(key)}</b><p>{t(`${key}_description`)}</p><small>{countLabel} <ArrowRight size={12} /></small></button>;
              })}
            </div>
          </section>

          <section className="help-center-articles">
            <div className="help-center-section-heading"><h2>{t("help_center_popular_articles")}</h2><button type="button" className="help-center-link" onClick={() => { setQuery(""); selectTopic("all"); }}>{t("help_center_view_all")} <ArrowRight size={13} /></button></div>
            {query.trim() && <p className="help-center-search-status" role="status">{visibleArticles.length ? t("ui.matchingArticles", { count: visibleArticles.length }) : t("ui.noMatchingArticles")}</p>}
            <div className="help-article-list">{visibleArticles.length ? visibleArticles.map((article) => <article className="help-article" key={article.key}><a href={`/help-center/articles/${encodeURIComponent(article.key)}`}><span className="help-article-icon"><BookOpen size={14} /></span><span><b>{articleTitle(article)}</b><small>{articleSummary(article)}</small></span><em>{formatReadingTime(language, getArticleReadingTime(article, t, language))}</em><ChevronRight size={15} /></a></article>) : <p className="help-article-empty" role="status">{t("ui.noSearchResults")}</p>}</div>
          </section>
        </div>

        <aside className="help-center-side">
          <section className="help-center-side-card"><h2>{t("help_center_contact_support")}</h2><p>{t("help_center_support_intro")}</p><a href="/contact"><span><MessageCircle size={16} /></span><b>{t("help_center_live_chat")}</b><small>{t("help_center_live_chat_detail")}</small><ChevronRight size={14} /></a><a href="mailto:support@ledgrace.com"><span><Mail size={16} /></span><b>{t("help_center_email_support")}</b><small>support@ledgrace.com</small><ChevronRight size={14} /></a><a href="tel:+2348000000000"><span><Phone size={16} /></span><b>{t("help_center_request_call")}</b><small>{t("help_center_request_call_detail")}</small><ChevronRight size={14} /></a></section>
          <section className="help-center-side-card"><h2>{t("help_center_resources")}</h2><a href="/blog"><span><PlayCircle size={16} /></span><b>{t("help_center_video_tutorials")}</b><small>{t("help_center_video_detail")}</small><ChevronRight size={14} /></a><a href="/contact"><span><MessageCircle size={16} /></span><b>{t("help_center_community")}</b><small>{t("help_center_community_detail")}</small><ChevronRight size={14} /></a><a href="/blog"><span><Sparkles size={16} /></span><b>{t("help_center_whats_new")}</b><small>{t("help_center_whats_new_detail")}</small><ChevronRight size={14} /></a><a href="/contact"><span><ShieldCheck size={16} /></span><b>{t("help_center_system_status")}</b><small>{t("help_center_system_status_detail")}</small><ChevronRight size={14} /></a></section>
          <section className="help-center-need-help"><div><h2>{t("help_center_need_help")}</h2><p>{t("help_center_need_help_detail")}</p><a href="/contact">{t("help_center_contact_support_button")} <ArrowRight size={14} /></a></div><HeadphonesIllustration /></section>
        </aside>
      </div>
    </main>
  );
}

function HeadphonesIllustration() {
  return <div className="help-headphones" aria-hidden="true"><Phone size={38} /><span /></div>;
}