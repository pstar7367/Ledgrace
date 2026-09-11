import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ArrowRight,
  BadgeDollarSign,
  BookOpen,
  ChevronDown,
  Grid2X2,
  Headphones,
  LockKeyhole,
  Menu,
  ReceiptText,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";
import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaXTwitter,
} from "react-icons/fa6";
import { Brand, IconBubble } from "./index.jsx";
import "./App.css";

const categories = [
  ["all", Grid2X2],
  ["create_account", BookOpen],
  ["secure_private", LockKeyhole],
  ["transactions", ReceiptText],
  ["pricing_title", BadgeDollarSign],
  ["feature_title", Sparkles],
  ["privacy", ShieldCheck],
];

const questions = [
  [
    "create_account",
    "home_title",
    "home_description",
  ],
  [
    "create_account",
    "free_plan",
    "home_price_free_note",
  ],
  [
    "pricing_title",
    "manage_profile",
    "ready_desc",
  ],
  [
    "secure_private",
    "secure_private_title",
    "secure_private_desc",
  ],
  [
    "transactions",
    "add_transaction",
    "track_everything_desc",
  ],
  [
    "feature_title",
    "currency",
    "currency",
  ],
  [
    "create_account",
    "nav_watch_demo",
    "overview_desc",
  ],
  [
    "pricing_title",
    "cancel",
    "manage_preferences",
  ],
  [
    "pricing_title",
    "payment",
    "secure_private_desc",
  ],
  [
    "pricing_title",
    "support_here",
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

export default function FAQ() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { t } = useTranslation();
  const [category, setCategory] = useState("all");
  const [openQuestion, setOpenQuestion] = useState(0);
  const visibleQuestions = useMemo(
    () =>
      category === "all"
        ? questions
        : questions.filter(([group]) => group === category),
    [category],
  );

  const selectCategory = (name) => {
    setCategory(name);
    setOpenQuestion(0);
  };

  return (
    <div className="page faq-page" id="top">
      <header className="site-header feature-header faq-header">
        <a href="/">
          <Brand />
        </a>
        <div className={`site-nav-area ${menuOpen ? "open" : ""}`}>
        <nav className={menuOpen ? "open" : ""}>
          <a href="/">{t("nav_home")}</a>
          <a href="/features">{t("nav_features")}</a>
          <a href="/pricing">{t("nav_pricing")}</a>
          <a href="/about">{t("nav_about")}</a>
          <a className="active" href="/faq">
            {t("nav_faq")}
          </a>
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
      <main className="faq-main">
        <section className="faq-hero section">
          <div className="faq-copy">
            <span className="eyebrow">◉ {t("nav_faq")}</span>
            <h1>
              {t("feature_subtitle")}
              <br />
              <em>Ledgrace</em>
            </h1>
            <p>
              {t("overview_desc")}
              <br />
              <a href="#support">{t("support_here")}</a>
            </p>
          </div>
          <div className="faq-illustration">
            <div className="faq-window">
              <div className="window-bar">
                <i />
                <i />
                <i />
              </div>
              <b>FAQ</b>
              <span>💬</span>
              <small>?</small>
            </div>
          </div>
        </section>
        <section className="faq-content section">
          <aside className="faq-sidebar">
            <div>
              {categories.map(([name, Icon]) => (
                <button
                  key={name}
                  type="button"
                  className={category === name ? "selected" : ""}
                  onClick={() => selectCategory(name)}
                >
                  <Icon size={17} />
                  <span>{t(name)}</span>
                  <b>
                    {name === "all"
                      ? questions.length
                      : questions.filter(([group]) => group === name).length}
                  </b>
                </button>
              ))}
            </div>
            <div className="help-card">
              <IconBubble icon={Headphones} color="teal" />
              <span>
                <b>{t("support_here")}</b>
                <p>{t("support_247")}</p>
                <a href="/contact">
                  {t("nav_contact")} <ArrowRight size={15} />
                </a>
              </span>
            </div>
          </aside>
          <div className="accordion">
            {visibleQuestions.map(([group, question, answer], index) => (
              <article
                className={openQuestion === index ? "open" : ""}
                key={question}
              >
                <button
                  type="button"
                  onClick={() =>
                    setOpenQuestion(openQuestion === index ? -1 : index)
                  }
                >
                  <b>{t(question)}</b>
                  <ChevronDown size={18} />
                </button>
                {openQuestion === index && <p>{t(answer)}</p>}
              </article>
            ))}
          </div>
        </section>
        <section className="faq-support section" id="support">
          <IconBubble icon={Headphones} color="blue" />
          <span>
            <h2>{t("support_here")}</h2>
            <p>{t("support_247")}</p>
          </span>
          <a className="button primary" href="/contact">
            {t("nav_contact")} <ArrowRight size={17} />
          </a>
        </section>
      </main>
      <footer>
        <div className="footer-grid">
          <div>
            <Brand light />
            <p>
              Your financial command center.
              <br />
              Track, plan, save and grow with confidence.
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
            <h4>Newsletter</h4>
            <p>Subscribe to get financial tips and product updates.</p>
            <form>
              <input placeholder="Enter your email" />
              <button type="button">Subscribe</button>
            </form>
          </div>
        </div>
        <div className="copyright">© 2026 Ledgrace. All rights reserved.</div>
      </footer>
    </div>
  );
}
