import { useMemo, useState } from "react";
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
  ["All Questions", Grid2X2],
  ["Getting Started", BookOpen],
  ["Account & Security", LockKeyhole],
  ["Transactions", ReceiptText],
  ["Billing & Plans", BadgeDollarSign],
  ["Features", Sparkles],
  ["Privacy & Security", ShieldCheck],
];

const questions = [
  [
    "Getting Started",
    "What is Ledgrace?",
    "Ledgrace is a personal finance management platform that helps you track income and expenses, plan budgets, achieve savings goals, and make smarter financial decisions with insights and reports.",
  ],
  [
    "Getting Started",
    "Is Ledgrace free to use?",
    "Yes. Ledgrace has a free plan for essential money tracking. You can upgrade at any time if you need advanced reports, unlimited goals, or additional features.",
  ],
  [
    "Billing & Plans",
    "Can I upgrade or downgrade my plan later?",
    "Yes. You can change your plan whenever you need from your account settings. Any new plan benefits are applied right away, while downgrades take effect at the end of your current billing period.",
  ],
  [
    "Account & Security",
    "Is my financial data secure?",
    "Yes. We protect your data with encryption, secure access controls, and industry-standard security practices. Your financial information is never sold to third parties.",
  ],
  [
    "Transactions",
    "Can I import my bank transactions?",
    "Yes. You can import supported transaction files to bring your spending history into Ledgrace. Review imported entries before saving to keep your records accurate.",
  ],
  [
    "Features",
    "What currencies does Ledgrace support?",
    "Ledgrace supports Nigerian Naira (₦) by default, with multi-currency support available on selected plans for users who manage money in more than one currency.",
  ],
  [
    "Getting Started",
    "Can I use Ledgrace on my mobile phone?",
    "Yes. Ledgrace is designed to work smoothly on mobile browsers, so you can check your finances, add transactions, and follow your goals wherever you are.",
  ],
  [
    "Billing & Plans",
    "How do I cancel my subscription?",
    "You can cancel from the Billing section of your account settings. Your paid features will remain available until the end of the current billing period.",
  ],
  [
    "Billing & Plans",
    "What payment methods do you accept?",
    "We accept secure card payments through our payment partners. Available payment options are shown clearly when you choose a paid plan.",
  ],
  [
    "Billing & Plans",
    "Do you offer refunds?",
    "If you are charged in error or experience a billing issue, contact our support team with your payment details. We review refund requests fairly and in line with our billing policy.",
  ],
];

function FooterColumn({ title, links }) {
  const destinations = {
    Features: "/features", Pricing: "/pricing", "About Us": "/about",
    Blog: "/blog", "Contact Us": "/contact", "Help Center": "/contact",
    FAQ: "/faq", "Privacy Policy": "/privacy", "Terms of Service": "/terms", "Terms Of Service": "/terms",
  };
  return (
    <div>
      <h4>{title}</h4>
      {links.map((link) => {
        const href = destinations[link] || "#top";
        return <a key={link} href={href} className={window.location.pathname === href ? "footer-active" : ""}>{link}</a>;
      })}
    </div>
  );
}

export default function FAQ() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [category, setCategory] = useState("All Questions");
  const [openQuestion, setOpenQuestion] = useState(0);
  const visibleQuestions = useMemo(
    () =>
      category === "All Questions"
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
        <nav className={menuOpen ? "open" : ""}>
          <a href="/">Home</a>
          <a href="/features">Features</a>
          <a href="/pricing">Pricing</a>
          <a href="/about">About</a>
          <a className="active" href="/faq">
            FAQ
          </a>
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
      <main className="faq-main">
        <section className="faq-hero section">
          <div className="faq-copy">
            <span className="eyebrow">◉ Frequently Asked Questions</span>
            <h1>
              Everything You Need
              <br />
              To Know About <em>Ledgrace</em>
            </h1>
            <p>
              Find answers to the most common questions about Ledgrace.
              <br />
              Can't find what you're looking for?{" "}
              <a href="#support">Contact our support team.</a>
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
                  <span>{name}</span>
                  <b>
                    {name === "All Questions"
                      ? questions.length
                      : questions.filter(([group]) => group === name).length}
                  </b>
                </button>
              ))}
            </div>
            <div className="help-card">
              <IconBubble icon={Headphones} color="teal" />
              <span>
                <b>Still need help?</b>
                <p>Our support team is here for you.</p>
                <a href="/contact">
                  Contact Support <ArrowRight size={15} />
                </a>
              </span>
            </div>
          </aside>
          <div className="accordion">
            {visibleQuestions.map(([, question, answer], index) => (
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
                  <b>{question}</b>
                  <ChevronDown size={18} />
                </button>
                {openQuestion === index && <p>{answer}</p>}
              </article>
            ))}
          </div>
        </section>
        <section className="faq-support section" id="support">
          <IconBubble icon={Headphones} color="blue" />
          <span>
            <h2>Still have questions?</h2>
            <p>We're here to help you get the most out of Ledgrace.</p>
          </span>
          <a className="button primary" href="/contact">
            Contact Support <ArrowRight size={17} />
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
