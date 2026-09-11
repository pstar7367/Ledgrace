import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ArrowRight,
  BookOpen,
  BriefcaseBusiness,
  Heart,
  Menu,
  Search,
  Sparkles,
  WalletCards,
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

const articles = [
  {
    title: "savings_goals",
    category: "financial_health",
    text: "savings_opportunities",
    date: "May 10, 2024",
    read: "5 min read",
    image: "pig",
  },
  {
    title: "budget_planner",
    category: "budget",
    text: "budget_description",
    date: "Apr 28, 2024",
    read: "6 min read",
    image: "budget",
  },
  {
    title: "powerful_insights",
    category: "analytics",
    text: "powerful_insights_desc",
    date: "Apr 15, 2024",
    read: "7 min read",
    image: "invest",
  },
  {
    title: "financial_health",
    category: "health_score",
    text: "health_score_message",
    date: "Apr 15, 2024",
    read: "4 min read",
    image: "wellness",
  },
];
const categories = [
  "all",
  "financial_health",
  "budget",
  "analytics",
  "savings",
  "health_score",
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
function ArticleCard({ article, featured, onOpen }) {
  const { t } = useTranslation();
  return (
    <article className={`blog-card ${featured ? "featured" : ""}`}>
      <div className={`article-image ${article.image}`}>
        <span>{t(article.category)}</span>
        <b>
          {article.image === "pig"
            ? "🐷"
            : article.image === "budget"
              ? "◔"
              : article.image === "invest"
                ? "🌱"
                : "☀"}
        </b>
      </div>
      <div className="article-copy">
        <h2>{t(article.title)}</h2>
        <p>{t(article.text)}</p>
        <small>
          👤 {t("about_us")} Ledgrace
          <br />
          {article.date}
        </small>
        <em>{article.read} {t("read_more")}</em>
        <button type="button" onClick={() => onOpen(article)}>
          {t("read_more")} <ArrowRight size={14} />
        </button>
      </div>
    </article>
  );
}

export default function Blog() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { t } = useTranslation();
  const [category, setCategory] = useState("all");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(null);
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const visible = useMemo(
    () =>
      articles.filter(
        (article) =>
          (category === "all" || article.category === category) &&
          `${article.title} ${article.text}`
            .toLowerCase()
            .includes(query.toLowerCase()),
      ),
    [category, query],
  );
  return (
    <div className="page blog-page" id="top">
      <header className="site-header feature-header blog-header">
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
          <a className="active" href="/blog">
            {t("nav_blog")}
          </a>
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
      <main className="blog-main">
        <section className="blog-hero section">
          <div>
            <span className="eyebrow">✎ {t("nav_blog")} Ledgrace</span>
            <h1>
              {t("powerful_insights")}
              <br />
              {t("home_title")} <em>{t("insights")}</em>
            </h1>
            <p>
              {t("overview_desc")}
            </p>
            <div className="blog-benefits">
              <span>
                <IconBubble icon={Sparkles} color="teal" />
                {t("powerful_insights")}
              </span>
              <span>
                <IconBubble icon={BookOpen} color="blue" />
                {t("insights")}
              </span>
              <span>
                <IconBubble icon={Heart} color="purple" />
                {t("financial_health")}
              </span>
              <span>
                <IconBubble icon={WalletCards} color="orange" />
                {t("smarter_decisions")}
              </span>
            </div>
          </div>
          <div className="blog-visual">
            <div className="blog-tablet">
              <b>Blog</b>
              <div>
                <i>Budget</i>
                <i>Investing</i>
                <i>Save More</i>
              </div>
            </div>
            <span>🌿</span>
            <em>📚</em>
          </div>
        </section>
        <section className="blog-content section" id="articles">
          <div className="articles-panel">
            <h2>{t("recent_transactions")}</h2>
            {visible.length ? (
              <>
                <ArticleCard
                  article={visible[0]}
                  featured
                  onOpen={setSelected}
                />
                <div className="article-grid">
                  {visible.slice(1).map((article) => (
                    <ArticleCard
                      article={article}
                      key={article.title}
                      onOpen={setSelected}
                    />
                  ))}
                </div>
                <button
                  type="button"
                  className="button outline view-all"
                  onClick={() => {
                    setCategory("all");
                    setQuery("");
                  }}
                >
                  {t("read_more")} <ArrowRight size={16} />
                </button>
              </>
            ) : (
              <p className="no-articles">
                {t("no_search_results")}
              </p>
            )}
          </div>
          <aside className="blog-sidebar">
            <label className="search">
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={t("search")}
              />
              <Search size={17} />
            </label>
            <div className="category-list">
              <h3>{t("category")}</h3>
              {categories.map((item) => (
                <button
                  type="button"
                  key={item}
                  className={category === item ? "selected" : ""}
                  onClick={() => setCategory(item)}
                >
                  <span>{t(item)}</span>
                  <b>
                      {item === "all"
                      ? articles.length
                      : articles.filter((article) => article.category === item)
                          .length}
                  </b>
                </button>
              ))}
            </div>
            <form
              className="blog-subscribe"
              onSubmit={(event) => {
                event.preventDefault();
                if (email) setSubscribed(true);
              }}
            >
              <IconBubble icon={BriefcaseBusiness} color="teal" />
              <h3>{t("notifications")}</h3>
              <p>
                {t("subscribe_text")}
              </p>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder={t("enter_email")}
                required
              />
              <button type="submit">
                {subscribed ? t("active") : t("subscribe_btn")}
              </button>
            </form>
            <div className="tags">
              <h3>{t("quick_filters")}</h3>
              {[
                "tag_budgeting",
                "tag_saving",
                "tag_investing",
                "tag_money_tips",
                "tag_financial_freedom",
                "tag_wealth_building",
              ].map((tagKey) => (
                <button
                  type="button"
                  key={tagKey}
                  onClick={() => setQuery(t(tagKey))}
                >
                  #{t(tagKey)}
                </button>
              ))}
            </div>
          </aside>
        </section>
      </main>
      {selected && (
        <div className="article-modal" role="dialog" aria-modal="true">
          <div>
            <button
              type="button"
              className="close-modal"
              onClick={() => setSelected(null)}
            >
              ×
            </button>
            <span className="eyebrow">{selected.category}</span>
            <h2>{selected.title}</h2>
            <p>{selected.text}</p>
            <p>
              Ledgrace helps you turn practical money habits into confident
              decisions. Start small, keep track of your progress, and revisit
              your financial goals regularly.
            </p>
            <small>
              By Ledgrace Team · {selected.date} · {selected.read}
            </small>
          </div>
        </div>
      )}
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
