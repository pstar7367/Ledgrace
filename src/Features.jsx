import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ArrowRight,
  BarChart3,
  BellRing,
  FileText,
  HeartPulse,
  Lightbulb,
  Menu,
  PieChart,
  ReceiptText,
  ShieldCheck,
  Target,
  WalletCards,
  X,
} from "lucide-react";
import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaXTwitter,
} from "react-icons/fa6";
import { Brand, Dashboard, IconBubble } from "./index.jsx";
import "./App.css";

const cards = [
  [
    ReceiptText,
    "track_everything",
    "track_everything_desc",
    "blue",
  ],
  [
    BarChart3,
    "budget_planner",
    "budget_planner_desc",
    "teal",
  ],
  [
    Target,
    "savings_goals",
    "savings_goals_desc",
    "purple",
  ],
  [
    PieChart,
    "analytics_dashboard",
    "analytics_dashboard_desc",
    "orange",
  ],
  [
    FileText,
    "detailed_reports",
    "detailed_reports_desc",
    "orange",
  ],
  [
    BellRing,
    "bills_subscriptions",
    "bills_subscriptions_desc",
    "pink",
  ],
  [
    HeartPulse,
    "financial_health",
    "financial_health_desc",
    "teal",
  ],
  [
    Lightbulb,
    "powerful_insights",
    "powerful_insights_desc",
    "blue",
  ],
];

function FooterColumn({ title, links }) {
  const { t } = useTranslation();
  const labels = { Product: "footer_product", Company: "footer_company", Support: "footer_support", Features: "nav_features", Pricing: "nav_pricing", "About Us": "about_us", Blog: "nav_blog", "Contact Us": "contact_us", "Help Center": "help_center", FAQ: "nav_faq", "Privacy Policy": "privacy_policy", "Terms of Service": "terms_of_service", "Terms Of Service": "terms_of_service", Roadmap: "roadmap", Changelog: "changelog", Careers: "careers" };
  const destinations = {
    Features: "/features",
    Pricing: "/pricing",
    "About Us": "/about",
    Blog: "/blog",
    "Contact Us": "/contact",
    "Help Center": "/contact",
    FAQ: "/faq",
    "Privacy Policy": "/privacy",
    "Terms of Service": "/terms",
    "Terms Of Service": "/terms",
  };
  return (
    <div>
      <h4>{t(labels[title] || title)}</h4>
      {links.map((link) => {
        const href = destinations[link] || "#top";
        return (
          <a
            key={link}
            href={href}
            className={window.location.pathname === href ? "footer-active" : ""}
          >
            {t(labels[link] || link)}
          </a>
        );
      })}
    </div>
  );
}

export default function Features() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { t } = useTranslation();
  return (
    <div className="page features-page" id="top">
      <header className="site-header feature-header">
        <a href="/">
          <Brand />
        </a>
        <div className={`site-nav-area ${menuOpen ? "open" : ""}`}>
        <nav className={menuOpen ? "open" : ""}>
          <a href="/">{t("nav_home")}</a>
          <a className="active" href="/features">
            {t("nav_features")}
          </a>
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
        <button className="mobile-menu" aria-label={t("toggle_navigation")} aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X /> : <Menu />}
        </button>
      </header>
      <main className="features-main">
        <section className="features-hero section">
          <div className="features-copy">
            <span className="eyebrow">✦ {t("feature_title")}</span>
            <h1>
              {t("feature_subtitle")}
              <br />
              <em>{t("take_control")}</em>
            </h1>
            <p>
              {t("home_description")}
            </p>
            <a href="/signup" className="button primary">
              {t("nav_get_started")} <ArrowRight size={17} />
            </a>
          </div>
          <div className="features-dashboard">
            <Dashboard />
          </div>
        </section>
        <section className="features-grid section">
          <div className="section-title">
            <h2>{t("feature_title")}</h2>
            <p>
              {t("feature_subtitle")}
            </p>
          </div>
          <div className="feature-page-cards">
            {cards.map(([Icon, titleKey, textKey, color]) => (
              <article key={titleKey}>
                <IconBubble icon={Icon} color={color} />
                <h3>{t(titleKey)}</h3>
                <p>{t(textKey)}</p>
                <a href="#start">
                  {t("explore_dashboard")} <ArrowRight size={15} />
                </a>
              </article>
            ))}
          </div>
        </section>
        <section className="command-center section">
          <div>
            <span className="eyebrow">{t("home_title")}</span>
            <h2>{t("home_title")}</h2>
            <p>
              {t("overview_desc")}
            </p>
            <a href="/signup" className="button primary">
              {t("nav_get_started")} <ArrowRight size={17} />
            </a>
          </div>
          <div className="phone-wrap">
            <div className="phone">
              <div className="phone-speaker" />
              <small>{t("overview")}</small>
              <div className="phone-balance">
                <span>{t("total_balance")}</span>
                <b>₦1,250,000</b>
                <em>↑ {t("home_last_month_125")}</em>
              </div>
              <b className="quick-title">{t("quick_actions")}</b>
              <div className="quick-actions">
                <i>⊕</i>
                <i>◉</i>
                <i>⇄</i>
                <i>•••</i>
              </div>
              <b className="quick-title">{t("recent_transactions")}</b>
              <div className="phone-transaction">
                🛒 {t("expenses")} <strong>- ₦15,000</strong>
              </div>
              <div className="phone-transaction">
                ♙ {t("income")} <strong className="positive">+ ₦850,000</strong>
              </div>
            </div>
            <IconBubble icon={ShieldCheck} color="teal" />
            <IconBubble icon={Target} color="pink" />
            <IconBubble icon={BarChart3} color="blue" />
          </div>
        </section>
        <section className="cta section" id="start">
          <div>
            <IconBubble icon={WalletCards} color="white" />
          </div>
          <span>
            <h2>{t("ready_title")}</h2>
            <p>{t("ready_desc")}</p>
          </span>
          <a className="button cta-button" href="/signup">
            {t("nav_get_started")} <ArrowRight size={17} />
          </a>
        </section>
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
            <div className="socials">
              <a href="#facebook">
                <FaFacebookF />
              </a>
              <a href="#twitter">
                <FaXTwitter />
              </a>
              <a href="#instagram">
                <FaInstagram />
              </a>
              <a href="#linkedin">
                <FaLinkedinIn />
              </a>
            </div>
          </div>
          <FooterColumn
            title="Product"
            links={["Features", "Pricing", "Roadmap", "Changelog"]}
          />
          <FooterColumn
            title="Company"
            links={["About Us", "Blog", "Careers", "Contact Us"]}
          />
          <FooterColumn
            title="Support"
            links={["Help Center", "FAQ", "Privacy Policy", "Terms of Service"]}
          />
          <div>
            <h4>{t("newsletter")}</h4>
            <p>{t("subscribe_text")}</p>
            <form>
              <input placeholder={t("enter_email")} />
              <button type="button">{t("subscribe_btn")}</button>
            </form>
          </div>
        </div>
        <div className="copyright">© 2026 Ledgrace. All rights reserved.</div>
      </footer>
    </div>
  );
}
