import { useState } from "react";
import {
  ArrowRight,
  BarChart3,
  CalendarDays,
  Check,
  ChevronDown,
  CircleUserRound,
  Cookie,
  FilePenLine,
  LockKeyhole,
  Mail,
  Menu,
  Network,
  ShieldCheck,
  SlidersHorizontal,
  UserRound,
  UsersRound,
  X,
} from "lucide-react";
import { Brand } from "./index.jsx";
import "./App.css";

const sections = [
  [
    "introduction",
    "1. Introduction",
    FilePenLine,
    "This Privacy Policy explains how Ledgrace collects, uses, discloses, and protects your information when you use our website, mobile application, and related services. By using Ledgrace, you agree to the practices described in this policy.",
  ],
  [
    "collect",
    "2. Information We Collect",
    BarChart3,
    "We collect the following types of information to provide and improve our Services.",
  ],
  [
    "use",
    "3. How We Use Your Information",
    SlidersHorizontal,
    "We use your information to provide, operate, and maintain our services; personalize your experience; process transactions; improve features and performance; provide support; and comply with legal obligations.",
  ],
  [
    "sharing",
    "4. How We Share Your Information",
    Network,
    "We do not sell personal information. We may share information with service providers that help us operate Ledgrace, when required by law, or as part of a business transfer.",
  ],
  [
    "security",
    "5. Data Security",
    ShieldCheck,
    "We use organizational, technical, and administrative safeguards to protect your personal information. No internet transmission or storage system is completely secure.",
  ],
  [
    "rights",
    "6. Your Rights and Choices",
    UserRound,
    "You may access, correct, update, or delete your personal information, and manage communication preferences by contacting our support team.",
  ],
  [
    "retention",
    "7. Data Retention",
    CalendarDays,
    "We retain information only for as long as necessary to provide the Services, comply with our legal obligations, resolve disputes, and enforce agreements.",
  ],
  [
    "cookies",
    "8. Cookies and Tracking Technologies",
    Cookie,
    "We use cookies and similar technologies to remember preferences, understand usage, and improve the performance of Ledgrace.",
  ],
  [
    "third-party",
    "9. Third-Party Services",
    UsersRound,
    "Our Services may contain links to third-party sites. Their privacy practices are governed by their own policies, not this policy.",
  ],
  [
    "children",
    "10. Children's Privacy",
    CircleUserRound,
    "Ledgrace is not directed to children under the age required by applicable law, and we do not knowingly collect their personal information.",
  ],
  [
    "changes",
    "11. Changes to This Policy",
    FilePenLine,
    "We may update this Privacy Policy from time to time. We will post the revised policy and update the date above when we do.",
  ],
  [
    "contact",
    "12. Contact Us",
    Mail,
    "If you have questions or requests related to this Privacy Policy, please contact our support team.",
  ],
];
const dataTypes = [
  [
    CircleUserRound,
    "Personal Information",
    "Name, email address, phone number, profile information, and other identifiers you provide.",
  ],
  [
    BarChart3,
    "Financial Information",
    "Account balances, transactions, budgets, and other financial data you connect or input.",
  ],
  [
    FilePenLine,
    "Usage Information",
    "How you interact with our app, features used, pages visited, and performance data.",
  ],
  [
    SlidersHorizontal,
    "Device Information",
    "Device type, operating system, IP address, browser type, and other technical data.",
  ],
];

export default function PrivacyPolicy() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [active, setActive] = useState("introduction");
  const [expanded, setExpanded] = useState(false);
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const visible = expanded ? sections : sections.slice(0, 3);
  const notify = (value) => {
    setMessage(value);
    window.setTimeout(() => setMessage(""), 3500);
  };
  const subscribe = (event) => {
    event.preventDefault();
    notify(
      email.includes("@")
        ? "Thanks — you are subscribed!"
        : "Enter a valid email to subscribe.",
    );
  };
  const goTo = (id) => {
    setActive(id);
    if (!expanded && sections.findIndex(([key]) => key === id) > 2)
      setExpanded(true);
    window.setTimeout(
      () =>
        document
          .getElementById(id)
          ?.scrollIntoView({ behavior: "smooth", block: "start" }),
      0,
    );
  };
  return (
    <div className="page terms-page privacy-page" id="top">
      <header className="site-header terms-header">
        <a href="/">
          <Brand />
        </a>
        <div className={`site-nav-area ${menuOpen ? "open" : ""}`}>
        <nav className={menuOpen ? "open" : ""}>
          <a href="/">Home</a>
          <a href="/features">Features</a>
          <a href="/pricing">Pricing</a>
          <a href="/about">About Us</a>
          <a href="/contact">Contact</a>
          <a href="/blog">Blog</a>
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
        <button
          className="mobile-menu"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle navigation menu"
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X /> : <Menu />}
        </button>
      </header>
      <main className="terms-main">
        <section className="terms-hero">
          <div>
            <span className="terms-eyebrow">
              <ShieldCheck size={14} /> Your Privacy Matters
            </span>
            <h1>Privacy Policy</h1>
            <p>
              At Ledgrace, we are committed to protecting your privacy and
              keeping your personal information secure.
            </p>
            <span className="terms-date">
              <CalendarDays size={17} /> Last updated: May 10, 2024
            </span>
          </div>
          <div className="terms-art privacy-art" aria-hidden="true">
            <div className="terms-laptop">
              <div className="terms-screen">
                <b>Privacy</b>
                {["Your Data", "Your Choice", "Your Security"].map((text) => (
                  <span key={text}>
                    <Check size={13} /> <strong>{text}</strong>
                  </span>
                ))}
              </div>
              <div className="terms-keyboard" />
            </div>
            <div className="privacy-shield">
              <LockKeyhole />
            </div>
            <div className="privacy-lock">
              <LockKeyhole />
            </div>
            <div className="terms-plant">
              <i />
              <i />
              <i />
              <i />
            </div>
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
                We are committed to transparency and protecting your privacy at
                every step.
              </p>
            </div>
          </aside>
          <div className="terms-card privacy-card">
            {visible.map(([id, title, Icon, copy]) => (
              <article id={id} key={id}>
                <h2>{title}</h2>
                <p>{copy}</p>
                {id === "collect" && (
                  <div className="privacy-data-grid">
                    {dataTypes.map(([Icon, label, text]) => (
                      <div key={label}>
                        <span>
                          <Icon />
                        </span>
                        <b>{label}</b>
                        <p>{text}</p>
                      </div>
                    ))}
                  </div>
                )}
                {id === "use" && (
                  <div className="privacy-use-list">
                    {[
                      "Provide, operate, and maintain our Services",
                      "Process transactions and send notifications",
                      "Provide customer support",
                      "Personalize your experience",
                      "Improve our features and performance",
                      "Comply with legal obligations",
                    ].map((item) => (
                      <span key={item}>
                        <Check size={14} /> {item}
                      </span>
                    ))}
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
                    ? "Showing the key policy sections."
                    : "The complete Privacy Policy is now visible.",
                );
              }}
            >
              {expanded ? "Show Key Policy" : "Read Full Policy"}
              <ChevronDown size={17} className={expanded ? "up" : ""} />
            </button>
          </div>
        </section>
        <section className="terms-notice">
          <span>
            <ShieldCheck />
          </span>
          <div>
            <h2>Your trust is our priority</h2>
            <p>
              We are committed to keeping your data safe, private, and secure.
            </p>
          </div>
          <a className="button outline" href="/contact">
            Contact Us <ArrowRight size={17} />
          </a>
        </section>
        {message && (
          <div className="terms-toast" role="status">
            {message}
          </div>
        )}
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
          </div>
          <div>
            <h4>Product</h4>
            <a href="/features">Features</a>
            <a href="/pricing">Pricing</a>
            <a href="/terms#notice">Roadmap</a>
            <a href="/terms#notice">Changelog</a>
          </div>
          <div>
            <h4>Company</h4>
            <a href="/about">About Us</a>
            <a href="/blog">Blog</a>
            <a href="/terms#notice">Careers</a>
            <a href="/contact">Contact Us</a>
          </div>
          <div>
            <h4>Support</h4>
            <a href="/contact">Help Center</a>
            <a href="/faq">FAQ</a>
            <a className="terms-footer-link" href="/privacy">
              Privacy Policy
            </a>
            <a href="/terms">Terms of Service</a>
          </div>
          <div>
            <h4>Newsletter</h4>
            <p>Subscribe to get financial tips and product updates.</p>
            <form onSubmit={subscribe}>
              <input
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Enter your email"
                aria-label="Email address"
              />
              <button>Subscribe</button>
            </form>
          </div>
        </div>
        <div className="copyright">© 2026 Ledgrace. All rights reserved.</div>
      </footer>
    </div>
  );
}
