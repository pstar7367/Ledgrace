import { useState } from "react";
import { ArrowRight, CheckCircle2, Mail, Menu, X } from "lucide-react";
import { Brand } from "./index.jsx";
import "./App.css";

export default function CheckEmail() {
  const [menuOpen, setMenuOpen] = useState(false);
  const email = new URLSearchParams(window.location.search).get("email");
  return (
    <div className="page signup-page check-email-page">
      <header className="site-header login-header">
        <a href="/">
          <Brand />
        </a>
        <div className={`site-nav-area ${menuOpen ? "open" : ""}`}>
        <nav className={menuOpen ? "open" : ""}>
          <a href="/">Home</a><a href="/features">Features</a><a href="/pricing">Pricing</a><a href="/about">About</a><a href="/faq">FAQ</a><a href="/contact">Contact</a><a href="/blog">Blog</a>
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
      <main className="check-email-main">
        <section className="check-email-card">
          <span className="check-email-icon">
            <Mail />
          </span>
          <CheckCircle2 className="check-email-check" />
          <h1>Check your email</h1>
          <p>We’ve sent an email verification link to:</p>
          <strong>{email || "your email address"}</strong>
          <p className="check-email-help">
            Click the link in the email to verify your account, then return here
            to log in. Check your spam folder if you don’t see it within a few
            minutes.
          </p>
          <a className="button primary" href="/login">
            Go to Login <ArrowRight size={17} />
          </a>
          <a className="check-email-change" href="/signup">
            Used the wrong email? Sign up again
          </a>
        </section>
      </main>
    </div>
  );
}
