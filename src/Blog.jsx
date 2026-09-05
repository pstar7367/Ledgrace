import { useMemo, useState } from "react";
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
    title: "10 Simple Ways to Save More Money",
    category: "Personal Finance",
    text: "Practical tips you can start today to cut unnecessary expenses and grow your savings effortlessly.",
    date: "May 10, 2024",
    read: "5 min read",
    image: "pig",
  },
  {
    title: "How to Create a Budget That Actually Works",
    category: "Budgeting",
    text: "A step-by-step guide to build a budget that fits your lifestyle and helps you reach your goals.",
    date: "Apr 28, 2024",
    read: "6 min read",
    image: "budget",
  },
  {
    title: "Investing 101: Grow Your Money Wisely",
    category: "Investing",
    text: "Understand the basics of investing and how to make your money work for you.",
    date: "Apr 15, 2024",
    read: "7 min read",
    image: "invest",
  },
  {
    title: "Financial Wellness: Building Healthy Money Habits",
    category: "Financial Wellness",
    text: "Good habits today lead to financial freedom tomorrow. Here's how to build them.",
    date: "Apr 15, 2024",
    read: "4 min read",
    image: "wellness",
  },
];
const categories = [
  "All Articles",
  "Personal Finance",
  "Budgeting",
  "Investing",
  "Saving",
  "Financial Wellness",
];
function FooterColumn({ title, links }) {
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
      <h4>{title}</h4>
      {links.map((link) => {
        const href = destinations[link] || "#top";
        return (
          <a
            key={link}
            href={href}
            className={window.location.pathname === href ? "footer-active" : ""}
          >
            {link}
          </a>
        );
      })}
    </div>
  );
}
function ArticleCard({ article, featured, onOpen }) {
  return (
    <article className={`blog-card ${featured ? "featured" : ""}`}>
      <div className={`article-image ${article.image}`}>
        <span>{article.category}</span>
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
        <h2>{article.title}</h2>
        <p>{article.text}</p>
        <small>
          👤 By Ledgrace Team
          <br />
          {article.date}
        </small>
        <em>{article.read}</em>
        <button type="button" onClick={() => onOpen(article)}>
          Read article <ArrowRight size={14} />
        </button>
      </div>
    </article>
  );
}

export default function Blog() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [category, setCategory] = useState("All Articles");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(null);
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const visible = useMemo(
    () =>
      articles.filter(
        (article) =>
          (category === "All Articles" || article.category === category) &&
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
          <a href="/">Home</a>
          <a href="/features">Features</a>
          <a href="/pricing">Pricing</a>
          <a href="/about">About</a>
          <a href="/faq">FAQ</a>
          <a href="/contact">Contact</a>
          <a className="active" href="/blog">
            Blog
          </a>
        </nav>
        <div className={`nav-ctas ${menuOpen ? "open" : ""}`}>
          <a className="login" href="/login">
            Log in
          </a>
          <a className="button primary" href="/signup">
            Get Started Free <ArrowRight size={16} />
          </a>
        </div>
        </div>
        <button className="mobile-menu" aria-label="Toggle navigation menu" aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X /> : <Menu />}
        </button>
      </header>
      <main className="blog-main">
        <section className="blog-hero section">
          <div>
            <span className="eyebrow">✎ Ledgrace Blog</span>
            <h1>
              Smart Money Moves
              <br />
              Start with Smart <em>Knowledge.</em>
            </h1>
            <p>
              Insights, tips, and guides to help you manage your money,
              <br />
              build wealth, and achieve financial freedom.
            </p>
            <div className="blog-benefits">
              <span>
                <IconBubble icon={Sparkles} color="teal" />
                Expert insights
              </span>
              <span>
                <IconBubble icon={BookOpen} color="blue" />
                Practical tips
              </span>
              <span>
                <IconBubble icon={Heart} color="purple" />
                Financial clarity
              </span>
              <span>
                <IconBubble icon={WalletCards} color="orange" />
                Smarter decisions
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
            <h2>Latest Articles</h2>
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
                    setCategory("All Articles");
                    setQuery("");
                  }}
                >
                  View All Articles <ArrowRight size={16} />
                </button>
              </>
            ) : (
              <p className="no-articles">
                No articles match your search. Try another keyword or category.
              </p>
            )}
          </div>
          <aside className="blog-sidebar">
            <label className="search">
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search articles..."
              />
              <Search size={17} />
            </label>
            <div className="category-list">
              <h3>Categories</h3>
              {categories.map((item) => (
                <button
                  type="button"
                  key={item}
                  className={category === item ? "selected" : ""}
                  onClick={() => setCategory(item)}
                >
                  <span>{item}</span>
                  <b>
                    {item === "All Articles"
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
              <h3>Stay in the Loop</h3>
              <p>
                Subscribe to get the latest tips, guides, and updates straight
                to your inbox.
              </p>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Enter your email"
                required
              />
              <button type="submit">
                {subscribed ? "Subscribed!" : "Subscribe"}
              </button>
            </form>
            <div className="tags">
              <h3>Popular Tags</h3>
              {[
                "#Budgeting",
                "#Saving",
                "#Investing",
                "#MoneyTips",
                "#FinancialFreedom",
                "#WealthBuilding",
              ].map((tag) => (
                <button
                  type="button"
                  key={tag}
                  onClick={() => setQuery(tag.slice(1))}
                >
                  {tag}
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
