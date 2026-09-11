import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ArrowRight,
  BadgeCheck,
  Ban,
  BookOpen,
  BriefcaseBusiness,
  CalendarDays,
  Check,
  ChevronDown,
  CircleAlert,
  FilePenLine,
  Gavel,
  LockKeyhole,
  Mail,
  Menu,
  Scale,
  ShieldCheck,
  UserRound,
  UsersRound,
  X,
} from "lucide-react";
import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaXTwitter,
} from "react-icons/fa6";
import { Brand } from "./index.jsx";
import "./App.css";

const sections = [
  [
    "acceptance",
    "1. Acceptance of Terms",
    BookOpen,
    'By accessing or using Ledgrace ("we," "our," or "us"), you agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree with any part of these terms, you may not access or use our services.',
  ],
  [
    "description",
    "2. Description of Service",
    BriefcaseBusiness,
    "Ledgrace is a personal finance platform that helps you track income and expenses, set budgets, and achieve your financial goals. We reserve the right to modify, suspend, or discontinue any part of our services at any time without prior notice.",
  ],
  [
    "accounts",
    "3. User Accounts",
    UserRound,
    "You are responsible for creating and maintaining the security of your account. You agree to provide accurate and complete information and to update it as necessary. You are responsible for all activities that occur under your account.",
  ],
  [
    "use",
    "4. Acceptable Use",
    UsersRound,
    "You agree not to use Ledgrace to violate applicable laws, attempt to gain unauthorized access, upload harmful content, or interfere with our services.",
  ],
  [
    "fees",
    "5. Fees and Payments",
    BadgeCheck,
    "Some services may require payment. Any applicable fees and billing terms will be presented to you before you complete a purchase.",
  ],
  [
    "property",
    "6. Intellectual Property",
    ShieldCheck,
    "The Ledgrace platform, brand, and content are protected by applicable intellectual-property laws and remain our property or that of our licensors.",
  ],
  [
    "disclaimers",
    "7. Disclaimers",
    CircleAlert,
    "Ledgrace provides tools and educational information, not financial, legal, or tax advice. Please consult a qualified professional for advice specific to your situation.",
  ],
  [
    "liability",
    "8. Limitation of Liability",
    Gavel,
    "To the fullest extent permitted by law, Ledgrace will not be liable for indirect, incidental, or consequential damages arising from your use of the service.",
  ],
  [
    "termination",
    "9. Termination",
    LockKeyhole,
    "We may suspend or terminate access when these terms are violated or when it is necessary to protect the service, users, or legal rights.",
  ],
  [
    "law",
    "10. Governing Law",
    Scale,
    "These terms are governed by the laws applicable in the jurisdiction in which Ledgrace operates, without regard to conflict-of-law principles.",
  ],
  [
    "changes",
    "11. Changes to Terms",
    FilePenLine,
    "We may update these terms from time to time. Continued use of the service after changes take effect constitutes acceptance of the updated terms.",
  ],
  [
    "contact",
    "12. Contact Us",
    Mail,
    "Questions about these terms can be sent to our support team. We will respond as soon as reasonably possible.",
  ],
];

function Footer() {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const subscribe = (e) => {
    e.preventDefault();
    setMessage(
      email.includes("@")
        ? t("login_success")
        : t("login_status_missing"),
    );
  };
  return (
    <footer>
      <div className="footer-grid">
        <div>
          <Brand light />
          <p>
            {t("footer_tagline")}
            <br />
            {t("footer_tagline_2")}
          </p>
          <div className="socials">
            <a href="https://facebook.com" aria-label="Facebook">
              <FaFacebookF />
            </a>
            <a href="https://x.com" aria-label="X">
              <FaXTwitter />
            </a>
            <a href="https://instagram.com" aria-label="Instagram">
              <FaInstagram />
            </a>
            <a href="https://linkedin.com" aria-label="LinkedIn">
              <FaLinkedinIn />
            </a>
          </div>
        </div>
        <div>
          <h4>{t("footer_product")}</h4>
          <a href="/features">{t("nav_features")}</a>
          <a href="/pricing">{t("nav_pricing")}</a>
          <a href="#notice">{t("roadmap")}</a>
          <a href="#notice">{t("changelog")}</a>
        </div>
        <div>
          <h4>{t("footer_company")}</h4>
          <a href="/about">{t("about_us")}</a>
          <a href="/blog">{t("nav_blog")}</a>
          <a href="#notice">{t("careers")}</a>
          <a href="/contact">{t("contact_us")}</a>
        </div>
        <div>
          <h4>{t("footer_support")}</h4>
          <a href="/contact">{t("help_center")}</a>
          <a href="/faq">{t("nav_faq")}</a>
          <a href="/privacy">{t("privacy_policy")}</a>
          <a className="terms-footer-link" href="/terms">
            {t("terms_of_service")}
          </a>
        </div>
        <div>
          <h4>{t("newsletter")}</h4>
          <p>{t("subscribe_text")}</p>
          <form onSubmit={subscribe}>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t("enter_email")}
              aria-label={t("email_address")}
            />
            <button>{t("subscribe_btn")}</button>
          </form>
          {message && <small className="footer-message">{message}</small>}
        </div>
      </div>
      <div className="copyright">© 2026 Ledgrace. All rights reserved.</div>
    </footer>
  );
}

export default function TermsOfService() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { t } = useTranslation();
  const legalTitles = {
    acceptance: "terms_of_service",
    description: "home_title",
    accounts: "account_summary",
    use: "manage_preferences",
    fees: "pricing_title",
    property: "privacy",
    disclaimers: "secure_private",
    liability: "privacy_desc",
    termination: "delete_account",
    law: "terms_of_service",
    changes: "settings_updated",
    contact: "nav_contact",
  };
  const legalCopy = {
    acceptance: "terms_agree",
    description: "home_description",
    accounts: "manage_account",
    use: "secure_private_desc",
    fees: "pricing_subtitle",
    property: "privacy_desc",
    disclaimers: "secure_private_desc",
    liability: "login_unable",
    termination: "delete_account_warning",
    law: "privacy_desc",
    changes: "settings_updated",
    contact: "support_here",
  };
  const [active, setActive] = useState("acceptance");
  const [expanded, setExpanded] = useState(false);
  const [notice, setNotice] = useState("");
  const goTo = (id) => {
    setActive(id);
    document
      .getElementById(id)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  const notify = (text) => {
    setNotice(text);
    window.setTimeout(() => setNotice(""), 3500);
  };
  const localizedSections = sections.map(([id, , Icon]) => [id, t(legalTitles[id]), Icon, t(legalCopy[id])]);
  const visible = expanded ? localizedSections : localizedSections.slice(0, 4);
  return (
    <div className="page terms-page" id="top">
      <header className="site-header terms-header">
        <a href="/">
          <Brand />
        </a>
        <div className={`site-nav-area ${menuOpen ? "open" : ""}`}>
        <nav className={menuOpen ? "open" : ""}>
          <a href="/">{t("nav_home")}</a>
          <a href="/features">{t("nav_features")}</a>
          <a href="/pricing">{t("nav_pricing")}</a>
          <a href="/about">{t("about_us")}</a>
          <a href="/contact">{t("nav_contact")}</a>
          <a href="/blog">{t("nav_blog")}</a>
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
        <button
          className="mobile-menu"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={t("toggle_navigation")}
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X /> : <Menu />}
        </button>
      </header>
      <main className="terms-main">
        <section className="terms-hero">
          <div>
              <span className="terms-eyebrow">
              <ShieldCheck size={14} /> {t("secure_private")}
            </span>
            <h1>{t("terms_of_service")}</h1>
            <p>{t("terms_agree")}</p>
            <span className="terms-date">
              <CalendarDays size={17} /> {t("last_sync")}: May 10, 2024
            </span>
          </div>
          <div className="terms-art" aria-hidden="true">
            <div className="terms-laptop">
              <div className="terms-screen">
                <b>{t("terms_of_service")}</b>
                {[1, 2, 3, 4].map((i) => (
                  <span key={i}>
                    <Check size={13} /> <i />
                  </span>
                ))}
              </div>
              <div className="terms-keyboard" />
            </div>
            <div className="terms-shield">
              <ShieldCheck />
            </div>
            <div className="terms-plant">
              <i />
              <i />
              <i />
              <i />
            </div>
            <div className="terms-pen" />
          </div>
        </section>
        <section className="terms-content">
          <aside className="terms-sidebar">
            <h2>{t("overview")}</h2>
            <div>
              {localizedSections.map(([id, title, Icon]) => (
                <button
                  key={id}
                  className={active === id ? "active" : ""}
                  onClick={() => goTo(id)}
                >
                  <Icon size={16} />
                  <span>{title}</span>
                </button>
              ))}
            </div>
            <div className="terms-agreement">
              <ShieldCheck size={26} />
              <p>
                {t("terms_agree")}
              </p>
            </div>
          </aside>
          <div className="terms-card">
            {visible.map(([id, title, Icon, copy]) => (
              <article id={id} key={id}>
                <h2>{title}</h2>
                <p>{copy}</p>
                {id === "use" && (
                  <div className="terms-use-grid">
                    <span>
                      <Ban /> {t("manage_preferences")}
                    </span>
                    <span>
                      <LockKeyhole /> {t("secure_private_desc")}
                    </span>
                    <span>
                      <FilePenLine /> {t("privacy_desc")}
                    </span>
                    <span>
                      <UsersRound /> {t("support_here")}
                    </span>
                  </div>
                )}
              </article>
            ))}
            <button
              className="terms-expand"
              onClick={() => {
                setExpanded(!expanded);
                notify(
                  expanded
                    ? t("key_stats_journey")
                    : t("overview"),
                );
              }}
            >
              {expanded ? t("key_stats_journey") : t("terms_of_service")}
              <ChevronDown size={17} className={expanded ? "up" : ""} />
            </button>
          </div>
        </section>
        <section className="terms-notice" id="notice">
          <span>
            <Scale />
          </span>
          <div>
            <h2>{t("notifications")}</h2>
            <p>{t("settings_updated")}</p>
          </div>
          <button
            className="button outline"
            onClick={() =>
              notify(t("not_available"))
            }
          >
            {t("settings_updated")} <ArrowRight size={17} />
          </button>
        </section>
        {notice && (
          <div className="terms-toast" role="status">
            {notice}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
