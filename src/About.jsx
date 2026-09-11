import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ArrowRight,
  Heart,
  Lightbulb,
  Menu,
  ShieldCheck,
  Target,
  TrendingUp,
  Users,
  X,
} from "lucide-react";
import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaTwitter,
  FaXTwitter,
} from "react-icons/fa6";
import { Brand, Dashboard, IconBubble } from "./index.jsx";
import "./App.css";

const values = [
  [
    ShieldCheck,
    "secure_private_title",
    "secure_private_desc",
    "teal",
  ],
  [
    Lightbulb,
    "feature_title",
    "feature_subtitle",
    "blue",
  ],
  [
    Users,
    "smarter_decisions",
    "smarter_decisions_desc",
    "purple",
  ],
  [
    TrendingUp,
    "achieve_goals",
    "achieve_goals_desc",
    "teal",
  ],
  [
    Heart,
    "secure_private",
    "privacy_desc",
    "pink",
  ],
];
const people = [
  [
    "TA",
    "Tunde Adedayo",
    "account",
    "signup_intro",
  ],
  [
    "CE",
    "Chinoma Eze",
    "secure_private_title",
    "secure_private_desc",
  ],
  [
    "DO",
    "David Okoro",
    "feature_title",
    "feature_subtitle",
  ],
  [
    "BA",
    "Bukola Adebisi",
    "settings",
    "overview_desc",
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

export default function About() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { t } = useTranslation();
  return (
    <div className="page about-page" id="top">
      <header className="site-header feature-header about-header">
        <a href="/">
          <Brand />
        </a>
        <div className={`site-nav-area ${menuOpen ? "open" : ""}`}>
        <nav className={menuOpen ? "open" : ""}>
          <a href="/">{t("nav_home")}</a>
          <a href="/features">{t("nav_features")}</a>
          <a href="/pricing">{t("nav_pricing")}</a>
          <a className="active" href="/about">
            {t("nav_about")}
          </a>
          <a href="/faq">{t("nav_faq")}</a>
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
        <button className="mobile-menu" aria-label={t("toggle_navigation")} aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X /> : <Menu />}
        </button>
      </header>
      <main className="about-main">
        <section className="about-hero section">
          <div>
            <span className="eyebrow">{t("nav_about")} Ledgrace</span>
            <h1>
              {t("ready_title")}
              <br />
              {t("home_headline_3")}
              <br />
              <em>{t("join_message")}</em>
            </h1>
            <p>
              {t("home_description")}
            </p>
            <a className="button primary" href="#mission">
              {t("about_us")} <ArrowRight size={17} />
            </a>
          </div>
          <div className="about-dashboard">
            <Dashboard />
          </div>
        </section>
        <section className="mission section" id="mission">
          <h2>
            <Target /> {t("why_choose")}
          </h2>
          <p>
            {t("ready_desc")}
          </p>
          <h3>{t("feature_title")}</h3>
          <div className="value-grid">
            {values.map(([Icon, title, text, color]) => (
              <article key={title}>
                <IconBubble icon={Icon} color={color} />
                <h4>{t(title)}</h4>
                <p>{t(text)}</p>
              </article>
            ))}
          </div>
        </section>
        <section className="team section">
          <h2>{t("about_us")} Ledgrace</h2>
          <p>
            {t("ready_desc")}
          </p>
          <div className="team-grid">
            {people.map(([initials, name, role, copy], i) => (
              <article key={name}>
                <div className={`person-avatar avatar-${i}`}>{initials}</div>
                <div>
                  <h3>{name}</h3>
                  <b>{t(role)}</b>
                  <p>{t(copy)}</p>
                  <span>
                    <FaLinkedinIn /> <FaTwitter />
                  </span>
                </div>
              </article>
            ))}
          </div>
        </section>
        <section className="stats section">
          <div>
            <IconBubble icon={Users} color="teal" />
            <span>
              <b>10K+</b>
              <strong>{t("profile")}</strong>
              <p>{t("ready_desc")}</p>
            </span>
          </div>
          <div>
            <IconBubble icon={ArrowRight} color="blue" />
            <span>
              <b>250K+</b>
              <strong>{t("transactions")}</strong>
              <p>{t("footer_tagline_2")}</p>
            </span>
          </div>
          <div>
            <IconBubble icon={Target} color="purple" />
            <span>
              <b>98%</b>
              <strong>{t("notifications")}</strong>
              <p>{t("ready_desc")}</p>
            </span>
          </div>
          <div>
            <IconBubble icon={ShieldCheck} color="teal" />
            <span>
              <b>99.9%</b>
              <strong>{t("secure_private_title")}</strong>
              <p>{t("secure_private_desc")}</p>
            </span>
          </div>
        </section>
        <section className="cta section" id="start">
          <div>
            <IconBubble icon={ShieldCheck} color="white" />
          </div>
          <span>
            <h2>{t("ready_title")}</h2>
            <p>{t("signup_intro")}</p>
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
