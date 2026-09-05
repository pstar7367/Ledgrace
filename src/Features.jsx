import { useState } from "react";
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
    "Smart Transactions",
    "Easily add, categorize, and track your income and expenses in seconds.",
    "blue",
  ],
  [
    BarChart3,
    "Budget Planner",
    "Create custom budgets, set limits, and stay on track every month.",
    "teal",
  ],
  [
    Target,
    "Savings Goals",
    "Set goals, track progress, and build the future you desire.",
    "purple",
  ],
  [
    PieChart,
    "Analytics Dashboard",
    "Visualize your financial data with beautiful charts and insights.",
    "orange",
  ],
  [
    FileText,
    "Detailed Reports",
    "Generate detailed reports to understand your spending and income patterns.",
    "orange",
  ],
  [
    BellRing,
    "Bills & Subscriptions",
    "Track recurring bills and subscriptions and never miss a payment.",
    "pink",
  ],
  [
    HeartPulse,
    "Financial Health",
    "Get a financial health score and personalized tips to improve it.",
    "teal",
  ],
  [
    Lightbulb,
    "Smart Insights",
    "Receive intelligent insights and recommendations to make better decisions.",
    "blue",
  ],
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

export default function Features() {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <div className="page features-page" id="top">
      <header className="site-header feature-header">
        <a href="/">
          <Brand />
        </a>
        <div className={`site-nav-area ${menuOpen ? "open" : ""}`}>
        <nav className={menuOpen ? "open" : ""}>
          <a href="/">Home</a>
          <a className="active" href="/features">
            Features
          </a>
          <a href="/pricing">Pricing</a>
          <a href="/about">About</a>
          <a href="/faq">FAQ</a>
          <a href="/contact">Contact</a>
          <a href="/blog">Blog</a>
        </nav>
        <div className={`nav-ctas ${menuOpen ? "open" : ""}`}>
          <a href="/login" className="login">
            Log in
          </a>
          <a href="/signup" className="button primary">
            Get Started Free <ArrowRight size={16} />
          </a>
        </div>
        </div>
        <button className="mobile-menu" aria-label="Toggle navigation menu" aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X /> : <Menu />}
        </button>
      </header>
      <main className="features-main">
        <section className="features-hero section">
          <div className="features-copy">
            <span className="eyebrow">✦ Powerful Features</span>
            <h1>
              Everything You Need
              <br />
              To <em>Master</em> Your Money
            </h1>
            <p>
              Ledgrace brings all the tools you need to track, plan, save, and
              grow your finances — in one beautiful platform.
            </p>
            <a href="/signup" className="button primary">
              Get Started Free <ArrowRight size={17} />
            </a>
          </div>
          <div className="features-dashboard">
            <Dashboard />
          </div>
        </section>
        <section className="features-grid section">
          <div className="section-title">
            <h2>Our Core Features</h2>
            <p>
              Powerful tools designed to help you take control of your financial
              life.
            </p>
          </div>
          <div className="feature-page-cards">
            {cards.map(([Icon, title, text, color]) => (
              <article key={title}>
                <IconBubble icon={Icon} color={color} />
                <h3>{title}</h3>
                <p>{text}</p>
                <a href="#start">
                  Learn more <ArrowRight size={15} />
                </a>
              </article>
            ))}
          </div>
        </section>
        <section className="command-center section">
          <div>
            <span className="eyebrow">All in One Place</span>
            <h2>Your Financial Command Center</h2>
            <p>
              Ledgrace combines powerful features with an intuitive experience
              to help you manage your money with clarity and confidence.
            </p>
            <a href="/signup" className="button primary">
              Get Started Free <ArrowRight size={17} />
            </a>
          </div>
          <div className="phone-wrap">
            <div className="phone">
              <div className="phone-speaker" />
              <small>Overview</small>
              <div className="phone-balance">
                <span>Total Balance</span>
                <b>₦1,250,000</b>
                <em>↑ 12.5% from last month</em>
              </div>
              <b className="quick-title">Quick Actions</b>
              <div className="quick-actions">
                <i>⊕</i>
                <i>◉</i>
                <i>⇄</i>
                <i>•••</i>
              </div>
              <b className="quick-title">Recent Transactions</b>
              <div className="phone-transaction">
                🛒 Groceries <strong>- ₦15,000</strong>
              </div>
              <div className="phone-transaction">
                ♙ Salary <strong className="positive">+ ₦850,000</strong>
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
            <h2>Ready To Take Control Of Your Finances?</h2>
            <p>
              Join thousands of people who are building a better financial
              future with Ledgrace.
            </p>
          </span>
          <a className="button cta-button" href="/signup">
            Get Started Free <ArrowRight size={17} />
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
