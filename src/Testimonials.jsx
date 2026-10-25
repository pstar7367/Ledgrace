import { useState } from "react";
import { ArrowRight, Menu, Star, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Brand } from "./index.jsx";
import { editorialTestimonials } from "./editorialContent.js";
import "./App.css";

export default function Testimonials() {
  const { t } = useTranslation();
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <div className="page testimonials-page" id="top">
      <header className="site-header feature-header">
        <a href="/">
          <Brand />
        </a>
        <div className={`site-nav-area ${menuOpen ? "open" : ""}`}>
          <nav className={menuOpen ? "open" : ""}>
            <a href="/">{t("nav_home")}</a>
            <a href="/features">{t("nav_features")}</a>
            <a href="/pricing">{t("nav_pricing")}</a>
            <a href="/about">{t("nav_about")}</a>
            <a href="/faq">{t("nav_faq")}</a>
            <a href="/contact">{t("nav_contact")}</a>
            <a href="/blog">{t("nav_blog")}</a>
          </nav>
          <div className={`nav-ctas ${menuOpen ? "open" : ""}`}>
            <a href="/login" className="login">
              {t("nav_login")}
            </a>
            <a href="/signup" className="button primary">
              {t("nav_get_started")} <ArrowRight size={16} />
            </a>
          </div>
        </div>
        <button
          className="mobile-menu"
          aria-label={t("toggle_navigation")}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X /> : <Menu />}
        </button>
      </header>
      <main className="testimonials-main section">
        <span className="eyebrow">{t("testimonials_page_eyebrow")}</span>
        <h1>
          {t("testimonials_page_title")} <em>{t("testimonials_page_title_emphasis")}</em>
        </h1>
        <p>{t("testimonials_page_intro")}</p>
        <div className="testimonials-grid">
          {editorialTestimonials.map((item) => (
            <article key={item.name}>
              <div
                className="testimonial-stars"
                aria-label={t("testimonials_rating_aria")}
              >
                <Star />
                <Star />
                <Star />
                <Star />
                <Star />
              </div>
              <blockquote>“{t(item.quoteKey)}”</blockquote>
              <div className="testimonial-person">
                <span>{item.name[0]}</span>
                <div>
                  <b>{item.name}</b>
                  <small>{t(item.roleKey)}</small>
                </div>
              </div>
            </article>
          ))}
        </div>
        <p className="testimonials-placeholder-note">
          {t("testimonials_placeholder_note")}
        </p>
      </main>
      <footer>
        <div className="footer-grid">
          <div>
            <Brand light />
            <p>{t("footer_tagline")}</p>
          </div>
          <div>
            <h4>{t("footer_company")}</h4>
            <a href="/">{t("nav_home")}</a>
            <a href="/contact">{t("testimonials_footer_contact")}</a>
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
        <div className="copyright">
          {t("copyright")} {t("testimonials_placeholder_note")}
        </div>
      </footer>
    </div>
  );
}
