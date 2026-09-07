import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ArrowRight, CheckCircle2, Mail, Menu, X } from "lucide-react";
import { Brand } from "./index.jsx";
import "./App.css";

export default function CheckEmail() {
  const { t } = useTranslation();
  const [menuOpen, setMenuOpen] = useState(false);
  const email = new URLSearchParams(window.location.search).get("email");
  return (
    <div className="page signup-page check-email-page">
      <header className="site-header login-header">
        <a href="/">
          <Brand />
        </a>
        <div className={`site-nav-area ${menuOpen ? "open" : ""}`}>
        <nav className={menuOpen ? "open" : ""}>
          <a href="/">{t("nav_home")}</a><a href="/features">{t("nav_features")}</a><a href="/pricing">{t("nav_pricing")}</a><a href="/about">{t("nav_about")}</a><a href="/faq">{t("nav_faq")}</a><a href="/contact">{t("nav_contact")}</a><a href="/blog">{t("nav_blog")}</a>
        </nav>
        <div className={`nav-ctas ${menuOpen ? "open" : ""}`}>
          <a className="login" href="/login">
            {t("nav_login")}
          </a>
          <a className="button primary" href="/signup">
            {t("nav_get_started")} <ArrowRight size={16} />
          </a>
        </div>
        </div>
        <button className="mobile-menu" aria-label={t("toggle_navigation")} aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X /> : <Menu />}
        </button>
      </header>
      <main className="check-email-main">
        <section className="check-email-card">
          <span className="check-email-icon">
            <Mail />
          </span>
          <CheckCircle2 className="check-email-check" />
          <h1>{t("check_email_title")}</h1>
          <p>{t("check_email_sent")}</p>
          <strong>{email || t("your_email_address")}</strong>
          <p className="check-email-help">
            {t("check_email_help")}
          </p>
          <a className="button primary" href="/login">
            {t("go_to_login")} <ArrowRight size={17} />
          </a>
          <a className="check-email-change" href="/signup">
            {t("wrong_email_signup")}
          </a>
        </section>
      </main>
    </div>
  );
}
