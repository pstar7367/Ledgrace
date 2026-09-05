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
import { useState } from "react";
import logo from "./assets/logo/ledgrace-logo.png";
import footerLogo from "./assets/logo/ledgrace-logo-transparent.png";
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
              {text}
            </div>
          ))}
        </div>
      </aside>
      <div className="dash-main">
        <div className="dash-top">
          <div>
            <b>
              Good morning, Peace <span>👋</span>
            </b>
            <small>Here's what's happening with your finances today.</small>
          </div>
          <div className="dash-actions">
            <Bell size={15} />
            <Bell size={15} />
            <span className="avatar">P</span>
          </div>
        </div>
        <div className="metric-grid">
          <Metric
            label="Total Balance"
            value="₦1,250,000"
            note="12.5% from last month"
            tone="balance"
          />
          <Metric
            label="Monthly Income"
            value="₦850,000"
            note="8.2% from last month"
          />
          <Metric
            label="Monthly Expenses"
            value="₦300,000"
            note="3.4% from last month"
            bad
          />
          <Metric
            label="Savings Goal"
            value="₦200,000"
            note="/ ₦500,000     40%"
          />
          <Metric
            label="Budget Status"
            value="On Track"
            note="You're doing great!"
            good
          />
          <Metric
            label="Financial Health"
            value="Good"
            note="72 / 100"
            health
          />
        </div>
        <div className="dash-bottom">
          <div className="spending">
            <div className="panel-title">
              Spending Overview <small>This Month</small>
            </div>
            <div className="chart-wrap">
              <div className="donut" />
              <ul>
                <li>
                  <i className="needs" />
                  Needs <b>50%</b>
                  <em>₦265,000</em>
                </li>
                <li>
                  <i className="wants" />
                  Wants <b>30%</b>
                  <em>₦110,000</em>
                </li>
                <li>
                  <i className="savings" />
                  Savings <b>15%</b>
                  <em>₦70,500</em>
                </li>
                <li>
                  <i className="invest" />
                  Investments <b>5%</b>
                  <em>₦26,500</em>
                </li>
              </ul>
            </div>
          </div>
          <div className="transactions">
            <div className="panel-title">
              Recent Transactions <a>View all</a>
            </div>
            <Transaction
              icon="🛒"
              title="Groceries"
              date="01 May, 2024"
              value="- ₦15,600"
            />
            <Transaction
              icon="N"
              title="Netflix Subscription"
              date="01 May, 2024"
              value="- ₦4,000"
            />
            <Transaction
              icon="⌂"
              title="Salary"
              date="01 May, 2024"
              value="+ ₦850,000"
              positive
            />
            <Transaction
              icon="⛽"
              title="Fuel"
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
    "Set savings goals and achieve them faster with smart planning.",
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
              Log in
            </a>
            <a href="/signup" className="button primary">
              Get Started Free <ArrowRight size={16} />
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
            <span className="eyebrow">Your Financial Command Center</span>
            <h1>
              Understand Your
              <br />
              Money. Build Your
              <br />
              <em>Future.</em>
            </h1>
            <p>
              Ledgrace helps you track expenses, plan budgets, achieve your
              goals and make smarter financial decisions - all in one beautiful
              and powerful platform.
            </p>
            <div className="hero-buttons">
              <a href="/signup" className="button primary">
                Get Started Free <ArrowRight size={17} />
              </a>
              <a className="button outline">
                Watch Demo <span className="play">▶</span>
              </a>
            </div>
            <div className="trial">
              <Check size={15} /> Free 14-day trial <i /> No credit card
              required
            </div>
          </div>
          <div className="hero-app">
            <Dashboard />
          </div>
        </section>
        <section className="why section" id="features">
          <SectionTitle
            title="Why Choose Ledgrace?"
            subtitle="Everything you need to manage your finances with clarity and confidence."
          />
          <div className="feature-cards">
            {featureCards.map(([Icon, title, text, color]) => (
              <article key={title}>
                <IconBubble icon={Icon} color={color} />
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </section>
        <section className="how section">
          <SectionTitle
            title="How Ledgrace Works"
            subtitle="Get started in 3 simple steps"
          />
          <div className="steps">
            <Step
              icon={WalletCards}
              number="1"
              title="Create Your Account"
              text="Sign up for free and set up your profile in minutes."
            />
            <span className="connector" />
            <Step
              icon={HeartPulse}
              number="2"
              title="Add Your Transactions"
              text="Record your income and expenses easily."
            />
            <span className="connector" />
            <Step
              icon={ChartNoAxesCombined}
              number="3"
              title="Get Insights & Achieve Goals"
              text="Understand your money and achieve your financial goals."
            />
          </div>
        </section>
        <section className="overview section">
          <div className="overview-copy">
            <span className="eyebrow">See It In Action</span>
            <h2>
              Your Financial Overview
              <br />
              At A Glance
            </h2>
            <p>
              Get a clear picture of your financial health with beautiful
              charts, smart insights and real-time updates.
            </p>
            <a className="button primary">
              Explore Dashboard <ArrowRight size={17} />
            </a>
          </div>
          <Dashboard dark />
        </section>
        <section className="power section">
          <SectionTitle
            title="Powerful Features For Your Financial Success"
            subtitle="Everything you need to take control of your financial life"
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
                  <h3>{title}</h3>
                  <p>{text}</p>
                </span>
              </div>
            ))}
          </div>
        </section>
        <section className="testimonials section">
          <div className="testimonial-intro">
            <h2>
              Loved By People
              <br />
              Like You
            </h2>
            <p>
              See what our users have to say about their Ledgrace experience.
            </p>
            <a>
              Read more testimonials <ArrowRight size={14} />
            </a>
          </div>
          <button className="round-button">
            <ChevronLeft size={18} />
          </button>
          <div className="testimonial-grid">
            {[
              [
                "“Ledgrace has completely changed the way I manage my money. I finally understand where my money goes every month.”",
                "Tunde Alabi",
                "Software Developer",
              ],
              [
                "“The budget planner and insights features are amazing. I’ve been able to save more and stress less about finances.”",
                "Chioma Eze",
                "Marketing Manager",
              ],
              [
                "“A clean, beautiful and powerful app. Ledgrace is a must-have for anyone who wants to take control of their finances.”",
                "David Okoro",
                "Entrepreneur",
              ],
            ].map(([quote, name, job]) => (
              <article key={name}>
                <strong>★★★★★</strong>
                <p>{quote}</p>
                <div className="person">
                  <span>{name[0]}</span>
                  <b>
                    {name}
                    <small>{job}</small>
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
            title="Simple, Transparent Pricing"
            subtitle="Choose the plan that works best for you."
          />
          <div className="price-grid">
            <Price
              name="Free"
              price="₦0"
              note="Perfect for getting started"
              features={[
                "Manual transaction tracking",
                "Basic reports",
                "1 Savings goal",
                "Email support",
              ]}
              button="Get Started"
              active={selectedPlan === "Free"}
              onSelect={() => setSelectedPlan("Free")}
            />
            <Price
              name="Pro"
              price="₦2,500"
              note="For individuals who want more"
              features={[
                "Unlimited transactions",
                "Advanced reports",
                "Unlimited savings goals",
                "Priority support",
              ]}
              button="Start Free Trial"
              popular
              active={selectedPlan === "Pro"}
              onSelect={() => setSelectedPlan("Pro")}
            />
            <Price
              name="Premium"
              price="₦5,000"
              note="For power users and families"
              features={[
                "Everything in Pro",
                "Shared budgeting",
                "Advanced analytics",
                "Custom reports",
              ]}
              button="Start Free Trial"
              active={selectedPlan === "Premium"}
              onSelect={() => setSelectedPlan("Premium")}
            />
          </div>
          <p className="pricing-note">
            All plans come with a 14-day free trial. Cancel anytime.
          </p>
        </section>
        <section className="cta section">
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
            title="Product"
            links={["Features", "Pricing", "Roadmap", "Changelog"]}
          />
          <FooterColumn
            title="Company"
            links={["About Us", "Blog", "Careers", "Contact Us"]}
          />
          <FooterColumn
            title="Support"
            links={["Help Center", "FAQ", "Privacy Policy", "Terms Of Service"]}
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
      {popular && <span className="popular-pill">Most Popular</span>}
      <h3>{name}</h3>
      <h2>
        {price}
        <small>/ month</small>
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

export default Index;
