import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ArrowRight,
  BarChart3,
  CalendarDays,
  Check,
  ChevronDown,
  CircleUserRound,
  Cookie,
  FilePenLine,
  LockKeyhole,
  Mail,
  Menu,
  Network,
  ShieldCheck,
  SlidersHorizontal,
  UserRound,
  UsersRound,
  X,
} from "lucide-react";
import { Brand } from "./index.jsx";
import "./App.css";

const sections = [
  [
    "introduction",
    "1. Introduction",
    FilePenLine,
    "This Privacy Policy explains how Ledgrace collects, uses, discloses, and protects your information when you use our website, mobile application, and related services. By using Ledgrace, you agree to the practices described in this policy.",
  ],
  [
    "collect",
    "2. Information We Collect",
    BarChart3,
    "We collect the following types of information to provide and improve our Services.",
  ],
  [
    "use",
    "3. How We Use Your Information",
    SlidersHorizontal,
    "We use your information to provide, operate, and maintain our services; personalize your experience; process transactions; improve features and performance; provide support; and comply with legal obligations.",
  ],
  [
    "sharing",
    "4. How We Share Your Information",
    Network,
    "We do not sell personal information. We may share information with service providers that help us operate Ledgrace, when required by law, or as part of a business transfer.",
  ],
  [
    "security",
    "5. Data Security",
    ShieldCheck,
    "We use organizational, technical, and administrative safeguards to protect your personal information. No internet transmission or storage system is completely secure.",
  ],
  [
    "rights",
    "6. Your Rights and Choices",
    UserRound,
    "You may access, correct, update, or delete your personal information, and manage communication preferences by contacting our support team.",
  ],
  [
    "retention",
    "7. Data Retention",
    CalendarDays,
    "We retain information only for as long as necessary to provide the Services, comply with our legal obligations, resolve disputes, and enforce agreements.",
  ],
  [
    "cookies",
    "8. Cookies and Tracking Technologies",
    Cookie,
    "We use cookies and similar technologies to remember preferences, understand usage, and improve the performance of Ledgrace.",
  ],
  [
    "third-party",
    "9. Third-Party Services",
    UsersRound,
    "Our Services may contain links to third-party sites. Their privacy practices are governed by their own policies, not this policy.",
  ],
  [
    "children",
    "10. Children's Privacy",
    CircleUserRound,
    "Ledgrace is not directed to children under the age required by applicable law, and we do not knowingly collect their personal information.",
  ],
  [
    "changes",
    "11. Changes to This Policy",
    FilePenLine,
    "We may update this Privacy Policy from time to time. We will post the revised policy and update the date above when we do.",
  ],
  [
    "contact",
    "12. Contact Us",
    Mail,
    "If you have questions or requests related to this Privacy Policy, please contact our support team.",
  ],
];
const dataTypes = [
  [
    CircleUserRound,
    "Personal Information",
    "Name, email address, phone number, profile information, and other identifiers you provide.",
  ],
  [
    BarChart3,
    "Financial Information",
    "Account balances, transactions, budgets, and other financial data you connect or input.",
  ],
  [
    FilePenLine,
    "Usage Information",
    "How you interact with our app, features used, pages visited, and performance data.",
  ],
  [
    SlidersHorizontal,
    "Device Information",
    "Device type, operating system, IP address, browser type, and other technical data.",
  ],
];

export default function PrivacyPolicy() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { t } = useTranslation();
  const legalTitles = {
    introduction: "privacy_policy",
    collect: "data_access",
    use: "manage_preferences",
    sharing: "connected_accounts",
    security: "secure_private",
    rights: "account_summary",
    retention: "data_export_short",
    cookies: "settings",
    "third-party": "connected_accounts",
    children: "profile",
    changes: "settings_updated",
    contact: "nav_contact",
  };
  const legalCopy = {
    introduction: "privacy_desc",
    collect: "data_protected",
    use: "manage_preferences",
    sharing: "connected_accounts_desc",
    security: "secure_private_desc",
    rights: "manage_account",
    retention: "data_export",
    cookies: "settings_tagline",
    "third-party": "connected_accounts_desc",
    children: "privacy_desc",
    changes: "settings_updated",
    contact: "support_here",
  };
  const [active, setActive] = useState("introduction");
  const [expanded, setExpanded] = useState(false);
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const localizedSections = sections.map(([id, , Icon]) => [id, t(legalTitles[id]), Icon, t(legalCopy[id])]);
  const visible = expanded ? localizedSections : localizedSections.slice(0, 3);
  const notify = (value) => {
    setMessage(value);
    window.setTimeout(() => setMessage(""), 3500);
  };
  const subscribe = (event) => {
    event.preventDefault();
    notify(
      email.includes("@") ? t("login_success") : t("login_status_missing"),
    );
  };
  const goTo = (id) => {
    setActive(id);
    if (!expanded && sections.findIndex(([key]) => key === id) > 2)
      setExpanded(true);
    window.setTimeout(
      () =>
        document
          .getElementById(id)
          ?.scrollIntoView({ behavior: "smooth", block: "start" }),
      0,
    );
  };
  return (
    <div className="page terms-page privacy-page" id="top">
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
              <ShieldCheck size={14} /> {t("privacy")}
            </span>
            <h1>{t("privacy_policy")}</h1>
            <p>{t("privacy_desc")}</p>
            <span className="terms-date">
              <CalendarDays size={17} /> {t("last_sync")}: May 10, 2024
            </span>
          </div>
          <div className="terms-art privacy-art" aria-hidden="true">
            <div className="terms-laptop">
              <div className="terms-screen">
                <b>{t("privacy")}</b>
                {["data_access", "settings", "secure_private"].map((text) => (
                  <span key={text}>
                    <Check size={13} /> <strong>{t(text)}</strong>
                  </span>
                ))}
              </div>
              <div className="terms-keyboard" />
            </div>
            <div className="privacy-shield">
              <LockKeyhole />
            </div>
            <div className="privacy-lock">
              <LockKeyhole />
            </div>
            <div className="terms-plant">
              <i />
              <i />
              <i />
              <i />
            </div>
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
                {t("privacy_desc")}
              </p>
            </div>
          </aside>
          <div className="terms-card privacy-card">
            {visible.map(([id, title, Icon, copy]) => (
              <article id={id} key={id}>
                <h2>{title}</h2>
                <p>{copy}</p>
                {id === "collect" && (
                  <div className="privacy-data-grid">
                    {dataTypes.map(([Icon, label], index) => (
                      <div key={label}>
                        <span>
                          <Icon />
                        </span>
                        <b>{t(["profile", "financial_summary", "usage", "settings"][index] || "profile")}</b>
                        <p>{t("privacy_desc")}</p>
                      </div>
                    ))}
                  </div>
                )}
                {id === "use" && (
                  <div className="privacy-use-list">
                    {["manage_account", "transactions", "support_here", "manage_preferences", "feature_title", "privacy"].map((item) => (
                      <span key={item}>
                        <Check size={14} /> {t(item)}
                      </span>
                    ))}
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
              {expanded ? t("key_stats_journey") : t("privacy_policy")}
              <ChevronDown size={17} className={expanded ? "up" : ""} />
            </button>
          </div>
        </section>
        <section className="terms-notice">
          <span>
            <ShieldCheck />
          </span>
          <div>
            <h2>{t("secure_private")}</h2>
            <p>{t("privacy_desc")}</p>
          </div>
          <a className="button outline" href="/contact">
            {t("nav_contact")} <ArrowRight size={17} />
          </a>
        </section>
        {message && (
          <div className="terms-toast" role="status">
            {message}
          </div>
        )}
      </main>
      <footer>
        <div className="footer-grid">
          <div>
            <Brand light />
            <p>
              {t("footer_tagline")}
              <br />
              {t("footer_tagline_2")}
            </p>
          </div>
          <div>
            <h4>{t("footer_product")}</h4>
            <a href="/features">{t("nav_features")}</a>
            <a href="/pricing">{t("nav_pricing")}</a>
            <a href="/terms#notice">{t("roadmap")}</a>
            <a href="/terms#notice">{t("changelog")}</a>
          </div>
          <div>
            <h4>{t("footer_company")}</h4>
            <a href="/about">{t("about_us")}</a>
            <a href="/blog">{t("nav_blog")}</a>
            <a href="/terms#notice">{t("careers")}</a>
            <a href="/contact">{t("contact_us")}</a>
          </div>
          <div>
            <h4>{t("footer_support")}</h4>
            <a href="/contact">{t("help_center")}</a>
            <a href="/faq">{t("nav_faq")}</a>
            <a className="terms-footer-link" href="/privacy">
              {t("privacy_policy")}
            </a>
            <a href="/terms">{t("terms_of_service")}</a>
          </div>
          <div>
            <h4>{t("newsletter")}</h4>
            <p>{t("subscribe_text")}</p>
            <form onSubmit={subscribe}>
              <input
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder={t("enter_email")}
                aria-label={t("email_address")}
              />
              <button>{t("subscribe_btn")}</button>
            </form>
          </div>
        </div>
        <div className="copyright">© 2026 Ledgrace. All rights reserved.</div>
      </footer>
    </div>
  );
}
