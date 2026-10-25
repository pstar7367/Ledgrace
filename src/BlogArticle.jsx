import { ArrowLeft, ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Brand } from "./index.jsx";
import { blogArticles } from "./blogArticles.js";
import "./App.css";

export default function BlogArticle({ slug }) {
  const { t, i18n } = useTranslation();
  const article = blogArticles.find((item) => item.slug === slug);
  if (!article)
    return (
      <main className="blog-article-page">
        <h1>{t("blog_article_not_found")}</h1>
        <a href="/blog">
          <ArrowLeft size={16} /> {t("blog_back_to_articles")}
        </a>
      </main>
    );
  return (
    <div className="page blog-page" id="top">
      <header className="site-header feature-header blog-header">
        <a href="/">
          <Brand />
        </a>
        <nav>
          <a href="/">{t("nav_home")}</a>
          <a href="/features">{t("nav_features")}</a>
          <a href="/pricing">{t("nav_pricing")}</a>
          <a href="/contact">{t("nav_contact")}</a>
          <a className="active" href="/blog">
            {t("nav_blog")}
          </a>
        </nav>
        <div className="nav-ctas">
          <a className="login" href="/login">
            {t("nav_login")}
          </a>
          <a href="/signup" className="button primary">
            {t("nav_get_started")} <ArrowRight size={16} />
          </a>
        </div>
      </header>
      <main className="blog-article-page section">
        <a className="blog-back-link" href="/blog">
          <ArrowLeft size={15} /> {t("blog_back_to_articles")}
        </a>
        <span className="eyebrow">
          {t(article.categoryKey)} · {t(article.readKey, { count: article.minutes })}
        </span>
        <h1>{t(article.titleKey)}</h1>
        <p className="blog-article-deck">{t(article.summaryKey)}</p>
        <div
          className={`blog-article-art article-image ${article.image}`}
          aria-hidden="true"
        />
        <div className="blog-article-body">
          {article.sections.map((section) => (
            <section key={section.headingKey}>
              <h2>{t(section.headingKey)}</h2>
              {section.paragraphs.map((paragraphKey) => (
                <p key={paragraphKey}>{t(paragraphKey)}</p>
              ))}
            </section>
          ))}
        </div>
        <p className="blog-article-byline">
          {t("blog_editorial_byline")} ·{" "}
          {t("blog_updated_date", {
            date: new Date(`${article.date}T12:00:00`).toLocaleDateString(i18n.language, {
              year: "numeric",
              month: "long",
              day: "numeric",
            }),
          })}
        </p>
      </main>
      <footer>
        <div className="footer-grid">
          <div>
            <Brand light />
            <p>{t("blog_article_footer_tagline")}</p>
          </div>
          <div>
            <h4>{t("blog_article_footer_explore")}</h4>
            <a href="/blog">{t("blog_article_footer_more")}</a>
            <a href="/contact">{t("nav_contact")}</a>
          </div>
          <div>
            <h4>{t("newsletter")}</h4>
            <p>{t("subscribe_text")}</p>
            <form>
              <input placeholder={t("footer_newsletter_placeholder")} />
              <button type="button">{t("subscribe_btn")}</button>
            </form>
          </div>
        </div>
        <div className="copyright">{t("copyright")}</div>
      </footer>
    </div>
  );
}
