import { useState } from "react";
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
    name: "Free",
    monthly: "₦0",
    note: "Perfect for getting started",
    features: [
      "Manual transaction tracking",
      "Basic reports",
      "1 Savings goal",
      "Email support",
    ],
    button: "Get Started Free",
  },
  {
    name: "Pro",
    monthly: "₦2,500",
    note: "For individuals who want more",
    popular: true,
    features: [
      "Unlimited transactions",
      "Advanced insights",
      "Unlimited savings goals",
      "Priority support",
      "Export reports (PDF, CSV)",
      "Budget planning",
      "Bills & subscriptions tracking",
    ],
    button: "Start Free Trial",
  },
  {
    name: "Premium",
    monthly: "₦5,000",
    note: "For power users and families",
    features: [
      "Everything in Pro",
      "Shared budgeting",
      "Advanced analytics",
      "Custom categories",
      "Financial health score",
      "Multi-currency support",
      "Early access to new features",
    ],
    button: "Start Free Trial",
  },
  {
    name: "Family",
    monthly: "₦7,500",
    note: "Manage finances together",
    features: [
      "Everything in Premium",
      "Up to 6 family members",
      "Family financial goals",
      "Activity & usage logs",
      "Custom user roles",
      "Priority support",
    ],
    button: "Start Free Trial",
  },
];
const comparison = [
  ["Manual Transaction Tracking", "✓", "✓", "✓", "✓"],
  ["Unlimited Transactions", "—", "✓", "✓", "✓"],
  ["Budget Planner", "✓", "✓", "✓", "✓"],
  ["Savings Goals", "1 Goal", "Unlimited", "Unlimited", "Unlimited"],
  ["Bills & Subscriptions", "—", "✓", "✓", "✓"],
  ["Advanced Analytics", "—", "✓", "✓", "✓"],
  ["Export Reports", "—", "PDF, CSV", "PDF, CSV, Excel", "PDF, CSV, Excel"],
  ["Financial Health Score", "—", "✓", "✓", "✓"],
  ["Family Members", "—", "—", "—", "Up to 6"],
  [
    "Priority Support",
    "Email",
    "Email & Chat",
    "Email & Chat",
    "Priority Chat",
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

export default function Pricing() {
  const [menuOpen, setMenuOpen] = useState(false);
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
        <nav className={menuOpen ? "open" : ""}>
          <a href="/">Home</a>
          <a href="/features">Features</a>
          <a className="active" href="/pricing">
            Pricing
          </a>
          <a href="/about">About</a>
          <a href="/faq">FAQ</a>
          <a href="/contact">Contact</a>
          <a href="/blog">Blog</a>
        </nav>
        <div className="nav-ctas">
          <a href="/login" className="login">
            Log in
          </a>
          <a href="/signup" className="button primary">
            Get Started Free <ArrowRight size={16} />
          </a>
        </div>
        <button className="mobile-menu" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X /> : <Menu />}
        </button>
      </header>
      <main className="pricing-main">
        <section className="pricing-hero section">
          <span className="eyebrow">✦ Simple, Transparent Pricing</span>
          <h1>
            Choose The Plan That
            <br />
            Fits Your <em>Financial Journey</em>
          </h1>
          <p>
            Start for free and upgrade anytime. Cancel anytime. No hidden fees.
          </p>
          <div className="billing-toggle">
            <button
              className={billing === "Monthly" ? "chosen" : ""}
              onClick={() => setBilling("Monthly")}
            >
              Monthly
            </button>
            <button
              className={billing === "Yearly" ? "chosen" : ""}
              onClick={() => setBilling("Yearly")}
            >
              Yearly <small>Save up to 20%</small>
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
                <span className="popular-label">MOST POPULAR</span>
              )}
              <h2>{plan.name}</h2>
              <p>{plan.note}</p>
              <h3>
                {amount(plan.monthly)}
                <small> /month</small>
              </h3>
              <ul>
                {plan.features.map((feature) => (
                  <li key={feature}>
                    <Check size={14} />
                    {feature}
                  </li>
                ))}
              </ul>
              <button
                type="button"
                className={`button ${selected === plan.name ? "primary" : "outline"}`}
              >
                {plan.button}
              </button>
            </article>
          ))}
        </section>
        <p className="trial-note">
          <ShieldCheck size={14} /> 14-day free trial on Pro, Premium & Family
          plans. No credit card required.
        </p>
        <section className="compare section">
          <div className="compare-table">
            <div className="compare-row compare-head">
              <b>Compare All Features</b>
              <b>Free</b>
              <b>Pro</b>
              <b>Premium</b>
              <b>Family</b>
            </div>
            {comparison.map((row) => (
              <div className="compare-row" key={row[0]}>
                {row.map((cell, index) => (
                  <span
                    key={index}
                    className={cell === "✓" ? "yes" : cell === "—" ? "no" : ""}
                  >
                    {cell}
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
            <h2>Go Annual & Save More!</h2>
            <p>Get up to 20% off when you choose annual billing.</p>
          </span>
          <button
            type="button"
            className="button"
            onClick={() => setBilling("Yearly")}
          >
            See Annual Plans <ArrowRight size={17} />
          </button>
        </section>
        <section className="faq section" id="faq">
          <h2>Frequently Asked Questions</h2>
          <div className="faq-grid">
            {[
              "Can I change my plan later?",
              "Is my financial data secure?",
              "Can I cancel anytime?",
              "Is there a free trial?",
              "What payment methods do you accept?",
              "Do you offer refunds?",
            ].map((question, index) => (
              <button
                type="button"
                key={question}
                className={openFaq === index ? "open" : ""}
                onClick={() => setOpenFaq(openFaq === index ? null : index)}
              >
                <b>{question}</b>
                <span>{openFaq === index ? "−" : "+"}</span>
                {openFaq === index && (
                  <p>
                    Yes. You can manage your Ledgrace plan anytime from your
                    account settings.
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
