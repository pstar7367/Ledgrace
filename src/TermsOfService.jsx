import { useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  Ban,
  BookOpen,
  BriefcaseBusiness,
  CalendarDays,
  Check,
  ChevronDown,
  CircleAlert,
  FilePenLine,
  Gavel,
  LockKeyhole,
  Mail,
  Menu,
  Scale,
  ShieldCheck,
  UserRound,
  UsersRound,
  X,
} from "lucide-react";
import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaXTwitter,
} from "react-icons/fa6";
import { Brand } from "./index.jsx";
import "./App.css";

const sections = [
  [
    "acceptance",
    "1. Acceptance of Terms",
    BookOpen,
    'By accessing or using Ledgrace ("we," "our," or "us"), you agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree with any part of these terms, you may not access or use our services.',
  ],
  [
    "description",
    "2. Description of Service",
    BriefcaseBusiness,
    "Ledgrace is a personal finance platform that helps you track income and expenses, set budgets, and achieve your financial goals. We reserve the right to modify, suspend, or discontinue any part of our services at any time without prior notice.",
  ],
  [
    "accounts",
    "3. User Accounts",
    UserRound,
    "You are responsible for creating and maintaining the security of your account. You agree to provide accurate and complete information and to update it as necessary. You are responsible for all activities that occur under your account.",
  ],
  [
    "use",
    "4. Acceptable Use",
    UsersRound,
    "You agree not to use Ledgrace to violate applicable laws, attempt to gain unauthorized access, upload harmful content, or interfere with our services.",
  ],
  [
    "fees",
    "5. Fees and Payments",
    BadgeCheck,
    "Some services may require payment. Any applicable fees and billing terms will be presented to you before you complete a purchase.",
  ],
  [
    "property",
    "6. Intellectual Property",
    ShieldCheck,
    "The Ledgrace platform, brand, and content are protected by applicable intellectual-property laws and remain our property or that of our licensors.",
  ],
  [
    "disclaimers",
    "7. Disclaimers",
    CircleAlert,
    "Ledgrace provides tools and educational information, not financial, legal, or tax advice. Please consult a qualified professional for advice specific to your situation.",
  ],
  [
    "liability",
    "8. Limitation of Liability",
    Gavel,
    "To the fullest extent permitted by law, Ledgrace will not be liable for indirect, incidental, or consequential damages arising from your use of the service.",
  ],
  [
    "termination",
    "9. Termination",
    LockKeyhole,
    "We may suspend or terminate access when these terms are violated or when it is necessary to protect the service, users, or legal rights.",
  ],
  [
    "law",
    "10. Governing Law",
    Scale,
    "These terms are governed by the laws applicable in the jurisdiction in which Ledgrace operates, without regard to conflict-of-law principles.",
  ],
  [
    "changes",
    "11. Changes to Terms",
    FilePenLine,
    "We may update these terms from time to time. Continued use of the service after changes take effect constitutes acceptance of the updated terms.",
  ],
  [
    "contact",
    "12. Contact Us",
    Mail,
    "Questions about these terms can be sent to our support team. We will respond as soon as reasonably possible.",
  ],
];

function Footer() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const subscribe = (e) => {
    e.preventDefault();
    setMessage(
      email.includes("@")
        ? "Thanks — you're subscribed!"
        : "Enter a valid email to subscribe.",
    );
  };
  return (
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
            <a href="https://facebook.com" aria-label="Facebook">
              <FaFacebookF />
            </a>
            <a href="https://x.com" aria-label="X">
              <FaXTwitter />
            </a>
            <a href="https://instagram.com" aria-label="Instagram">
              <FaInstagram />
            </a>
            <a href="https://linkedin.com" aria-label="LinkedIn">
              <FaLinkedinIn />
            </a>
          </div>
        </div>
        <div>
          <h4>Product</h4>
          <a href="/features">Features</a>
          <a href="/pricing">Pricing</a>
          <a href="#notice">Roadmap</a>
          <a href="#notice">Changelog</a>
        </div>
        <div>
          <h4>Company</h4>
          <a href="/about">About Us</a>
          <a href="/blog">Blog</a>
          <a href="#notice">Careers</a>
          <a href="/contact">Contact Us</a>
        </div>
        <div>
          <h4>Support</h4>
          <a href="/contact">Help Center</a>
          <a href="/faq">FAQ</a>
          <a href="/privacy">Privacy Policy</a>
          <a className="terms-footer-link" href="/terms">
            Terms of Service
          </a>
        </div>
        <div>
          <h4>Newsletter</h4>
          <p>Subscribe to get financial tips and product updates.</p>
          <form onSubmit={subscribe}>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              aria-label="Email address"
            />
            <button>Subscribe</button>
          </form>
          {message && <small className="footer-message">{message}</small>}
        </div>
      </div>
      <div className="copyright">© 2026 Ledgrace. All rights reserved.</div>
    </footer>
  );
}

export default function TermsOfService() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [active, setActive] = useState("acceptance");
  const [expanded, setExpanded] = useState(false);
  const [notice, setNotice] = useState("");
  const goTo = (id) => {
    setActive(id);
    document
      .getElementById(id)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  const notify = (text) => {
    setNotice(text);
    window.setTimeout(() => setNotice(""), 3500);
  };
  const visible = expanded ? sections : sections.slice(0, 4);
  return (
    <div className="page terms-page" id="top">
      <header className="site-header terms-header">
        <a href="/">
          <Brand />
        </a>
        <nav className={menuOpen ? "open" : ""}>
          <a href="/">Home</a>
          <a href="/features">Features</a>
          <a href="/pricing">Pricing</a>
          <a href="/about">About Us</a>
          <a href="/contact">Contact</a>
          <a href="/blog">Blog</a>
        </nav>
        <div className="nav-ctas">
          <a className="login" href="/login">
            Log in
          </a>
          <a className="button primary" href="/signup">
            Get Started Free <ArrowRight size={16} />
          </a>
        </div>
        <button
          className="mobile-menu"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X /> : <Menu />}
        </button>
      </header>
      <main className="terms-main">
        <section className="terms-hero">
          <div>
            <span className="terms-eyebrow">
              <ShieldCheck size={14} /> Our Commitment
            </span>
            <h1>Terms of Service</h1>
            <p>
              These Terms of Service govern your access to and use of Ledgrace
              and our services. By using our platform, you agree to these terms.
            </p>
            <span className="terms-date">
              <CalendarDays size={17} /> Last updated: May 10, 2024
            </span>
          </div>
          <div className="terms-art" aria-hidden="true">
            <div className="terms-laptop">
              <div className="terms-screen">
                <b>Terms of Service</b>
                {[1, 2, 3, 4].map((i) => (
                  <span key={i}>
                    <Check size={13} /> <i />
                  </span>
                ))}
              </div>
              <div className="terms-keyboard" />
            </div>
            <div className="terms-shield">
              <ShieldCheck />
            </div>
            <div className="terms-plant">
              <i />
              <i />
              <i />
              <i />
            </div>
            <div className="terms-pen" />
          </div>
        </section>
        <section className="terms-content">
          <aside className="terms-sidebar">
            <h2>On this page</h2>
            <div>
              {sections.map(([id, title, Icon]) => (
                <button
                  key={id}
                  className={active === id ? "active" : ""}
                  onClick={() => goTo(id)}
                >
                  <Icon size={16} />
                  <span>{title}</span>
                </button>
              ))}
            </div>
            <div className="terms-agreement">
              <ShieldCheck size={26} />
              <p>
                By using Ledgrace, you acknowledge that you have read,
                understood, and agree to these Terms of Service.
              </p>
            </div>
          </aside>
          <div className="terms-card">
            {visible.map(([id, title, Icon, copy]) => (
              <article id={id} key={id}>
                <h2>{title}</h2>
                <p>{copy}</p>
                {id === "use" && (
                  <div className="terms-use-grid">
                    <span>
                      <Ban /> Violate any applicable laws or regulations
                    </span>
                    <span>
                      <LockKeyhole /> Attempt to gain unauthorized access to our
                      systems
                    </span>
                    <span>
                      <FilePenLine /> Upload or transmit malicious code or
                      harmful content
                    </span>
                    <span>
                      <UsersRound /> Interfere with or disrupt our services
                    </span>
                  </div>
                )}
              </article>
            ))}
            <button
              className="terms-expand"
              onClick={() => {
                setExpanded(!expanded);
                notify(
                  expanded
                    ? "Showing the key terms."
                    : "All terms are now visible.",
                );
              }}
            >
              {expanded ? "Show Key Terms" : "Read Full Terms"}
              <ChevronDown size={17} className={expanded ? "up" : ""} />
            </button>
          </div>
        </section>
        <section className="terms-notice" id="notice">
          <span>
            <Scale />
          </span>
          <div>
            <h2>Important Notice</h2>
            <p>
              These terms may be updated from time to time. Continued use of our
              services after changes constitutes acceptance of the new terms.
            </p>
          </div>
          <button
            className="button outline"
            onClick={() =>
              notify("No revisions have been published since May 10, 2024.")
            }
          >
            View Changes <ArrowRight size={17} />
          </button>
        </section>
        {notice && (
          <div className="terms-toast" role="status">
            {notice}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
