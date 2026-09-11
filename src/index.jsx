import {
  ArrowRight,
  Bell,
  BarChart3,
  ChartNoAxesCombined,
  Check,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  CreditCard,
  FileText,
  Goal,
  HeartPulse,
  LayoutDashboard,
  Lightbulb,
  Menu,
  PieChart,
  ReceiptText,
  Settings,
  ShieldCheck,
  Sparkles,
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
import { useEffect, useState } from "react";
import logo from "./assets/logo/ledgrace-logo.png";
import footerLogo from "./assets/logo/ledgrace-logo-transparent.png";
import { getStoredLanguage, translate } from "./translation.js";
import "./App.css";

const navItems = [
  { label: "Home", href: "/" },
  { label: "Features", href: "/features" },
  { label: "Pricing", href: "/pricing" },
  { label: "About", href: "/about" },
  { label: "FAQ", href: "/faq" },
  { label: "Contact", href: "/contact" },
  { label: "Blog", href: "/blog" },
];
const sideItems = [
  [LayoutDashboard, "Dashboard"],
  [ReceiptText, "Transactions"],
  [WalletCards, "Budget"],
  [Goal, "Goals"],
  [ChartNoAxesCombined, "Analytics"],
  [FileText, "Reports"],
  [CreditCard, "Bills & Subs"],
  [Lightbulb, "Insights"],
  [Settings, "Settings"],
];

export function Brand({ light = false }) {
  return (
    <span className={`brand ${light ? "brand-light" : ""}`}>
      <img src={light ? footerLogo : logo} alt="" />
      <strong>Ledgrace</strong>
    </span>
  );
}

export function IconBubble({ icon: Icon, color = "blue" }) {
  return (
    <span className={`icon-bubble ${color}`}>
      <Icon size={22} strokeWidth={2.2} />
    </span>
  );
}

export function Dashboard({ dark = false }) {
  const [language, setLanguage] = useState(getStoredLanguage());
  const t = (key, options = {}) => translate(key, language, options);

  useEffect(() => {
    const handleLanguageChange = () => setLanguage(getStoredLanguage());
    window.addEventListener("ledgrace:preferences-changed", handleLanguageChange);
    return () => window.removeEventListener("ledgrace:preferences-changed", handleLanguageChange);
  }, []);

  return (
    <div className={`dashboard ${dark ? "dashboard-dark" : ""}`}>
      <aside className="dash-side">
        <Brand light={dark} />
        <div className="dash-nav">
          {sideItems.map(([Icon, text], i) => (
            <div
              key={text}
              className={`dash-nav-item ${i === 0 ? "selected" : ""}`}
            >
              <Icon size={14} />
              {t({ Dashboard: "dashboard", Transactions: "transactions", Budget: "budget_planner", Goals: "savings_goals", Analytics: "analytics", Reports: "reports", "Bills & Subs": "bills_subscriptions", Insights: "insights", Settings: "settings" }[text] || text)}
            </div>
          ))}
        </div>
      </aside>
      <div className="dash-main">
        <div className="dash-top">
          <div>
            <b>
              {t("home_good_morning", { name: "Peace" })} <span>👋</span>
            </b>
            <small>{t("home_today_summary")}</small>
          </div>
          <div className="dash-actions">
            <Bell size={15} />
            <Bell size={15} />
            <span className="avatar">P</span>
          </div>
        </div>
        <div className="metric-grid">
          <Metric
            label={t("total_balance")}
            value="₦1,250,000"
            note={t("home_last_month_125")}
            tone="balance"
          />
          <Metric
            label={t("home_monthly_income")}
            value="₦850,000"
            note={t("home_last_month_82")}
          />
          <Metric
            label={t("home_monthly_expenses")}
            value="₦300,000"
            note={t("home_last_month_34")}
            bad
          />
          <Metric
            label={t("home_savings_goal")}
            value="₦200,000"
            note="/ ₦500,000     40%"
          />
          <Metric
            label={t("home_budget_status")}
            value={t("on_track")}
            note={t("home_doing_great")}
            good
          />
          <Metric
            label={t("financial_health")}
            value={t("good")}
            note="72 / 100"
            health
          />
        </div>
        <div className="dash-bottom">
          <div className="spending">
            <div className="panel-title">
              {t("home_spending_overview")} <small>{t("this_month")}</small>
            </div>
            <div className="chart-wrap">
              <div className="donut" />
              <ul>
                <li>
                  <i className="needs" />
                  {t("home_needs")} <b>50%</b>
                  <em>₦265,000</em>
                </li>
                <li>
                  <i className="wants" />
                  {t("home_wants")} <b>30%</b>
                  <em>₦110,000</em>
                </li>
                <li>
                  <i className="savings" />
                  {t("savings")} <b>15%</b>
                  <em>₦70,500</em>
                </li>
                <li>
                  <i className="invest" />
                  {t("home_investments")} <b>5%</b>
                  <em>₦26,500</em>
                </li>
              </ul>
            </div>
          </div>
          <div className="transactions">
            <div className="panel-title">
              {t("recent_transactions")} <a>{t("view_all")}</a>
            </div>
            <Transaction
              icon="🛒"
              title={t("home_groceries")}
              date="01 May, 2024"
              value="- ₦15,600"
            />
            <Transaction
              icon="N"
              title={t("home_netflix")}
              date="01 May, 2024"
              value="- ₦4,000"
            />
            <Transaction
              icon="⌂"
              title={t("salary")}
              date="01 May, 2024"
              value="+ ₦850,000"
              positive
            />
            <Transaction
              icon="⛽"
              title={t("home_fuel")}
              date="30 Apr, 2024"
              value="- ₦7,000"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function Metric({ label, value, note, tone, bad, good, health }) {
  return (
    <div className={`metric ${tone || ""}`}>
      <small>{label}</small>
      <strong>{value}</strong>
      {health && <span className="health-ring">72</span>}
      <span className={bad ? "bad" : good ? "good" : ""}>↑ {note}</span>
    </div>
  );
}
function Transaction({ icon, title, date, value, positive }) {
  return (
    <div className="transaction">
      <i>{icon}</i>
      <span>
        <b>{title}</b>
        <small>{date}</small>
      </span>
      <em className={positive ? "positive" : ""}>{value}</em>
    </div>
  );
}

const featureCards = [
  [
    BarChart3,
    "Track Everything",
    "Easily track income, expenses and transfers in real time.",
    "blue",
  ],
  [
    PieChart,
    "Plan Your Budget",
    "Create budgets that actually work and stay on track effortlessly.",
    "teal",
  ],
  [
    Target,
    "Achieve Goals",
    "achieve_goals_desc",
    "purple",
  ],
  [
    Lightbulb,
    "Powerful Insights",
    "Get insights that help you make better financial decisions.",
    "orange",
  ],
  [
    ClipboardList,
    "Detailed Reports",
    "Beautiful reports to understand your financial journey.",
    "cyan",
  ],
  [
    ShieldCheck,
    "Secure & Private",
    "Your data is encrypted and your privacy is our priority.",
    "green",
  ],
];
const miniFeatures = [
  [Sparkles, "Budget Planner", "Create and manage your expenses."],
  [ClipboardList, "Expense Tracking", "Categorize and track your spending."],
  [Target, "Savings Goals", "Set goals and watch your progress grow."],
  [Bell, "Bill Reminders", "Never miss a payment with smart reminders."],
  [
    ChartNoAxesCombined,
    "Analytics Dashboard",
    "Visualize your data with beautiful charts.",
  ],
  [FileText, "Export Reports", "Export data in PDF or CSV format."],
];

function Index() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState("Free");
  const [language, setLanguage] = useState(getStoredLanguage());
  const t = (key) => translate(key, language);

  useEffect(() => {
    const handleLanguageChange = () => setLanguage(getStoredLanguage());
    window.addEventListener("ledgrace:preferences-changed", handleLanguageChange);
    return () => window.removeEventListener("ledgrace:preferences-changed", handleLanguageChange);
  }, []);

  const navItems = [
    { label: t("nav_home"), href: "/" },
    { label: t("nav_features"), href: "/features" },
    { label: t("nav_pricing"), href: "/pricing" },
    { label: t("nav_about"), href: "/about" },
    { label: t("nav_faq"), href: "/faq" },
    { label: t("nav_contact"), href: "/contact" },
    { label: t("nav_blog"), href: "/blog" },
  ];

  return (
    <div className="page">
      <header className="site-header">
        <a href="#top">
          <Brand />
        </a>
        <div className={`site-nav-area ${menuOpen ? "open" : ""}`}>
          <nav className={menuOpen ? "open" : ""}>
            {navItems.map((item, i) => (
              <a
                key={item.label}
                className={i === 0 ? "active" : ""}
                href={item.href}
                onClick={() => setMenuOpen(false)}
              >
                {item.label}
              </a>
            ))}
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
        <button
          className="mobile-menu"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle navigation menu"
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X /> : <Menu />}
        </button>
      </header>
      <main id="top">
        <section className="hero-section">
          <div className="hero-copy">
            <span className="eyebrow">{t("home_title")}</span>
            <h1>
              {t("home_headline")}
              <br />
              {t("home_headline_2")}
              <br />
              <em>{t("home_headline_3")}</em>
            </h1>
            <p>
              {t("home_description")}
            </p>
            <div className="hero-buttons">
              <a href="/signup" className="button primary">
                {t("nav_get_started")} <ArrowRight size={17} />
              </a>
              <a className="button outline">
                {t("nav_watch_demo")} <span className="play">▶</span>
              </a>
            </div>
            <div className="trial">
              <Check size={15} /> {t("trial")} <i /> {t("no_card")}
            </div>
          </div>
          <div className="hero-app">
            <Dashboard />
          </div>
        </section>
        <section className="why section" id="features">
          <SectionTitle
            title={t("why_choose")}
            subtitle={t("why_subtitle")}
          />
          <div className="feature-cards">
            {featureCards.map(([Icon, title, text, color]) => (
              <article key={title}>
                <IconBubble icon={Icon} color={color} />
                <h3>{t({ "Track Everything": "track_everything", "Plan Your Budget": "plan_better", "Achieve Goals": "achieve_goals", "Powerful Insights": "powerful_insights", "Detailed Reports": "detailed_reports", "Secure & Private": "secure_private_title" }[title] || title)}</h3>
                <p>{t({ "Track Everything": "track_everything_desc", "Plan Your Budget": "plan_better_desc", "Achieve Goals": "achieve_goals_desc", "Powerful Insights": "powerful_insights_desc", "Detailed Reports": "detailed_reports_desc", "Secure & Private": "secure_private_desc" }[title] || text)}</p>
              </article>
            ))}
          </div>
        </section>
        <section className="how section">
          <SectionTitle
            title={t("how_it_works")}
            subtitle={t("how_subtitle")}
          />
          <div className="steps">
            <Step
              icon={WalletCards}
              number="1"
              title={t("step_1_title")}
              text={t("step_1_text")}
            />
            <span className="connector" />
            <Step
              icon={HeartPulse}
              number="2"
              title={t("step_2_title")}
              text={t("step_2_text")}
            />
            <span className="connector" />
            <Step
              icon={ChartNoAxesCombined}
              number="3"
              title={t("step_3_title")}
              text={t("step_3_text")}
            />
          </div>
        </section>
        <section className="overview section">
          <div className="overview-copy">
            <span className="eyebrow">See It In Action</span>
            <h2>
              {t("overview_title")}
              <br />
              {t("overview_title_2")}
            </h2>
            <p>
              {t("overview_desc")}
            </p>
            <a className="button primary">
              {t("explore_dashboard")} <ArrowRight size={17} />
            </a>
          </div>
          <Dashboard dark />
        </section>
        <section className="power section">
          <SectionTitle
            title={t("feature_title")}
            subtitle={t("feature_subtitle")}
          />
          <div className="mini-features">
            {miniFeatures.map(([Icon, title, text], i) => (
              <div key={title}>
                <IconBubble
                  icon={Icon}
                  color={
                    ["blue", "teal", "purple", "orange", "cyan", "green"][i]
                  }
                />
                <span>
                    <h3>{t({ "Budget Planner": "budget_planner", "Expense Tracking": "expense_tracking", "Savings Goals": "savings_goals", "Bill Reminders": "bill_reminders", "Analytics Dashboard": "analytics_dashboard", "Export Reports": "export_reports" }[title] || title)}</h3>
                    <p>{t({ "Budget Planner": "budget_planner_desc", "Expense Tracking": "expense_tracking_desc", "Savings Goals": "savings_goals_description", "Bill Reminders": "bill_reminders_desc", "Analytics Dashboard": "analytics_dashboard_desc", "Export Reports": "export_reports_desc" }[title] || text)}</p>
                </span>
              </div>
            ))}
          </div>
        </section>
        <section className="testimonials section">
          <div className="testimonial-intro">
            <h2>
              {t("loved_by")}
              <br />
              {t("loved_by_2")}
            </h2>
            <p>
              {t("testimonials_desc")}
            </p>
            <a>
              {t("read_more")} <ArrowRight size={14} />
            </a>
          </div>
          <button className="round-button">
            <ChevronLeft size={18} />
          </button>
          <div className="testimonial-grid">
            {[["home_quote_one", "Tunde Alabi", "testimonial_software_developer"], ["home_quote_two", "Chioma Eze", "testimonial_marketing_manager"], ["home_quote_three", "David Okoro", "testimonial_entrepreneur"]].map(([quoteKey, name, jobKey]) => (
                    <article key={name}>
                    <strong>★★★★★</strong>
                    <p>{t(quoteKey)}</p>
                    <div className="person">
                      <span>{name[0]}</span>
                      <b>
                        {name}
                          <small>{t(jobKey)}</small>
                      </b>
                    </div>
                  </article>
            ))}
          </div>
          <button className="round-button">
            <ChevronRight size={18} />
          </button>
        </section>
        <section className="pricing section" id="pricing">
          <SectionTitle
            title={t("pricing_title")}
            subtitle={t("pricing_subtitle")}
          />
          <div className="price-grid">
            <Price
              name="Free"
              price="₦0"
              note={t("home_price_free_note")}
              features={[
                t("home_price_manual_tracking"), t("home_price_basic_reports"), t("home_price_one_goal"), t("home_price_email_support"),
              ]}
              button={t("home_price_get_started")}
              t={t}
              active={selectedPlan === "Free"}
              onSelect={() => setSelectedPlan("Free")}
            />
            <Price
              name="Pro"
              price="₦2,500"
              note={t("home_price_pro_note")}
              features={[
                t("home_price_unlimited_transactions"), t("home_price_advanced_reports"), t("home_price_unlimited_goals"), t("home_price_priority_support"),
              ]}
              button={t("home_price_trial")}
              t={t}
              popular
              active={selectedPlan === "Pro"}
              onSelect={() => setSelectedPlan("Pro")}
            />
            <Price
              name="Premium"
              price="₦5,000"
              note={t("home_price_premium_note")}
              features={[
                t("home_price_everything_pro"), t("home_price_shared_budgeting"), t("home_price_advanced_analytics"), t("home_price_custom_reports"),
              ]}
              button={t("home_price_trial")}
              t={t}
              active={selectedPlan === "Premium"}
              onSelect={() => setSelectedPlan("Premium")}
            />
          </div>
          <p className="pricing-note">
            {t("free_trial_note")}
          </p>
        </section>
        <section className="cta section">
          <div>
            <IconBubble icon={WalletCards} color="white" />
          </div>
          <span>
            <h2>{t("ready_title")}</h2>
            <p>
              {t("ready_desc")}
            </p>
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
            <div className="socials" aria-label="Social media links">
              <a href="#facebook" aria-label="Facebook">
                <FaFacebookF size={13} />
              </a>
              <a href="#twitter" aria-label="Twitter">
                <FaXTwitter size={13} />
              </a>
              <a href="#instagram" aria-label="Instagram">
                <FaInstagram size={14} />
              </a>
              <a href="#linkedin" aria-label="LinkedIn">
                <FaLinkedinIn size={13} />
              </a>
            </div>
          </div>
          <FooterColumn
            t={t}
            title="Product"
            links={["Features", "Pricing", "Roadmap", "Changelog"]}
          />
          <FooterColumn
            t={t}
            title="Company"
            links={["About Us", "Blog", "Careers", "Contact Us"]}
          />
          <FooterColumn
            t={t}
            title="Support"
            links={["Help Center", "FAQ", "Privacy Policy", "Terms Of Service"]}
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
        <div className="copyright">{t("copyright")}</div>
      </footer>
    </div>
  );
}

function SectionTitle({ title, subtitle }) {
  return (
    <div className="section-title">
      <h2>{title}</h2>
      <p>{subtitle}</p>
    </div>
  );
}
function Step({ icon, number, title, text }) {
  return (
    <div className="step">
      <IconBubble icon={icon} color={number === "2" ? "teal" : "blue"} />
      <b>{number}</b>
      <span>
        <h3>{title}</h3>
        <p>{text}</p>
      </span>
    </div>
  );
}
function Price({
  name,
  price,
  note,
  features,
  button,
  popular,
  active,
  onSelect,
  t,
}) {
  const handleKeyDown = (event) => {
    if (onSelect && (event.key === "Enter" || event.key === " ")) {
      event.preventDefault();
      onSelect();
    }
  };

  return (
    <article
      className={`price-card ${popular ? "popular" : ""} ${active ? "active" : ""}`}
      onClick={onSelect}
      onKeyDown={handleKeyDown}
      role={onSelect ? "button" : undefined}
      tabIndex={onSelect ? 0 : undefined}
    >
      {popular && <span className="popular-pill">{t("home_price_most_popular")}</span>}
      <h3>{t({ Free: "free", Pro: "home_price_pro", Premium: "premium" }[name] || name)}</h3>
      <h2>
        {price}
        <small>{t("home_price_per_month")}</small>
      </h2>
      <p>{note}</p>
      <ul>
        {features.map((x) => (
          <li key={x}>
            <Check size={14} />
            {x}
          </li>
        ))}
      </ul>
      <button
        type="button"
        className={`button ${active ? "primary" : "outline"}`}
        onClick={(event) => {
          event.stopPropagation();
          onSelect?.();
        }}
      >
        {button}
      </button>
    </article>
  );
}
function FooterColumn({ title, links, t }) {
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
      <h4>{t({ Product: "footer_product", Company: "footer_company", Support: "footer_support" }[title] || title)}</h4>
      {links.map((link) => {
        const href = destinations[link] || "#top";
        return (
          <a
            key={link}
            href={href}
            className={window.location.pathname === href ? "footer-active" : ""}
          >
            {t({ Features: "nav_features", Pricing: "nav_pricing", "About Us": "about_us", Blog: "nav_blog", Careers: "careers", "Contact Us": "contact_us", "Help Center": "help_center", FAQ: "nav_faq", "Privacy Policy": "privacy_policy", "Terms Of Service": "terms_of_service", Roadmap: "roadmap", Changelog: "changelog" }[link] || link)}
          </a>
        );
      })}
    </div>
  );
}

export default Index;
