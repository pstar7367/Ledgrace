import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ArrowRight, Check, Gift, Menu, ShieldCheck, X } from "lucide-react";
import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaXTwitter,
} from "react-icons/fa6";
import { Brand, IconBubble } from "./index.jsx";
import "./App.css";

const plans = [
  {
    name: "free",
    monthly: "₦0",
    note: "home_price_free_note",
    features: [
      "home_price_manual_tracking",
      "home_price_basic_reports",
      "home_price_one_goal",
      "home_price_email_support",
    ],
    button: "nav_get_started",
  },
  {
    name: "home_price_pro",
    monthly: "₦2,500",
    note: "home_price_pro_note",
    popular: true,
    features: [
      "home_price_unlimited_transactions",
      "powerful_insights",
      "home_price_unlimited_goals",
      "home_price_priority_support",
      "export_reports",
      "budget_planner",
      "bills_subscriptions",
    ],
    button: "trial",
  },
  {
    name: "premium",
    monthly: "₦5,000",
    note: "home_price_premium_note",
    features: [
      "home_price_everything_pro",
      "home_price_shared_budgeting",
      "home_price_advanced_analytics",
      "home_price_custom_reports",
      "financial_health",
      "currency",
      "feature_title",
    ],
    button: "trial",
  },
  {
    name: "account",
    monthly: "₦7,500",
    note: "manage_account",
    features: [
      "home_price_everything_pro",
      "home_price_shared_budgeting",
      "home_price_unlimited_goals",
      "profile",
      "settings",
      "home_price_priority_support",
    ],
    button: "trial",
  },
];
const comparison = [
  ["home_price_manual_tracking", "✓", "✓", "✓", "✓"],
  ["home_price_unlimited_transactions", "—", "✓", "✓", "✓"],
  ["budget_planner", "✓", "✓", "✓", "✓"],
  ["savings_goals", "1", "∞", "∞", "∞"],
  ["bills_subscriptions", "—", "✓", "✓", "✓"],
  ["analytics", "—", "✓", "✓", "✓"],
  ["export_reports", "—", "PDF, CSV", "PDF, CSV, Excel", "PDF, CSV, Excel"],
  ["financial_health", "—", "✓", "✓", "✓"],
  ["account", "—", "—", "—", "6"],
  [
    "home_price_priority_support",
    "email_address",
    "email_address",
    "email_address",
    "support_here",
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

export default function Pricing() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { t } = useTranslation();
  const [billing, setBilling] = useState("Monthly");
  const [selected, setSelected] = useState("Pro");
  const [openFaq, setOpenFaq] = useState(null);
  const amount = (value) =>
    billing === "Monthly" || value === "₦0"
      ? value
      : `₦${Math.round(Number(value.replace(/[^0-9]/g, "")) * 0.8).toLocaleString()}`;
  return (
    <div className="page pricing-page" id="top">
      <header className="site-header feature-header pricing-header">
        <a href="/">
          <Brand />
        </a>
        <div className={`site-nav-area ${menuOpen ? "open" : ""}`}>
        <nav className={menuOpen ? "open" : ""}>
          <a href="/">{t("nav_home")}</a>
          <a href="/features">{t("nav_features")}</a>
          <a className="active" href="/pricing">
            {t("nav_pricing")}
          </a>
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
      <main className="pricing-main">
        <section className="pricing-hero section">
          <span className="eyebrow">✦ {t("pricing_title")}</span>
          <h1>
            {t("pricing_title")}
            <br />
            <em>{t("financial_journey")}</em>
          </h1>
          <p>
            {t("pricing_subtitle")}
          </p>
          <div className="billing-toggle">
            <button
              className={billing === "Monthly" ? "chosen" : ""}
              onClick={() => setBilling("Monthly")}
            >
              {t("monthly")}
            </button>
            <button
              className={billing === "Yearly" ? "chosen" : ""}
              onClick={() => setBilling("Yearly")}
            >
              {t("yearly")} <small>{t("save_more")}</small>
            </button>
          </div>
        </section>
        <section className="plans-wrap section">
          {plans.map((plan) => (
            <article
              role="button"
              tabIndex="0"
              onClick={() => setSelected(plan.name)}
              onKeyDown={(e) =>
                (e.key === "Enter" || e.key === " ") && setSelected(plan.name)
              }
              className={`plan-card ${selected === plan.name ? "selected" : ""}`}
              key={plan.name}
            >
              {plan.popular && (
                <span className="popular-label">{t("home_price_most_popular")}</span>
              )}
              <h2>{t(plan.name)}</h2>
              <p>{t(plan.note)}</p>
              <h3>
                {amount(plan.monthly)}
                <small>{t("home_price_per_month")}</small>
              </h3>
              <ul>
                {plan.features.map((feature) => (
                  <li key={feature}>
                    <Check size={14} />
                    {t(feature)}
                  </li>
                ))}
              </ul>
              <button
                type="button"
                className={`button ${selected === plan.name ? "primary" : "outline"}`}
              >
                {t(plan.button)}
              </button>
            </article>
          ))}
        </section>
        <p className="trial-note">
          <ShieldCheck size={14} /> {t("free_trial_note")}
        </p>
        <section className="compare section">
          <div className="compare-table">
            <div className="compare-row compare-head">
              <b>{t("feature_title")}</b>
              <b>{t("free")}</b>
              <b>{t("home_price_pro")}</b>
              <b>{t("premium")}</b>
              <b>{t("account")}</b>
            </div>
            {comparison.map((row) => (
              <div className="compare-row" key={row[0]}>
                {row.map((cell, index) => (
                  <span
                    key={index}
                    className={cell === "✓" ? "yes" : cell === "—" ? "no" : ""}
                  >
                    {index === 0 || ["email_address", "support_here"].includes(cell)
                      ? t(cell)
                      : cell}
                  </span>
                ))}
              </div>
            ))}
          </div>
        </section>
        <section className="annual section">
          <div className="gift">
            <Gift size={49} />
            <b>
              20%
              <br />
              OFF
            </b>
          </div>
          <span>
            <h2>{t("pricing_title")}</h2>
            <p>{t("pricing_subtitle")}</p>
          </span>
          <button
            type="button"
            className="button"
            onClick={() => setBilling("Yearly")}
          >
            {t("yearly")} <ArrowRight size={17} />
          </button>
        </section>
        <section className="faq section" id="faq">
          <h2>{t("nav_faq")}</h2>
          <div className="faq-grid">
            {[
              "manage_profile",
              "secure_private_title",
              "cancel",
              "trial",
              "payment",
              "support_here",
            ].map((question, index) => (
              <button
                type="button"
                key={question}
                className={openFaq === index ? "open" : ""}
                onClick={() => setOpenFaq(openFaq === index ? null : index)}
              >
                <b>{t(question)}</b>
                <span>{openFaq === index ? "−" : "+"}</span>
                {openFaq === index && (
                  <p>
                    {t("manage_preferences")}
                  </p>
                )}
              </button>
            ))}
          </div>
        </section>
        <section className="cta section" id="start">
          <div>
            <IconBubble icon={ShieldCheck} color="white" />
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
