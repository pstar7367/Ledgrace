import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ArrowRight,
  CheckCircle2,
  CircleX,
  Mail,
  Menu,
  ShieldCheck,
  X,
} from "lucide-react";
import { Brand } from "./index.jsx";
import { verifyEmailRequest } from "./authApi.js";
import "./App.css";

export default function VerifyEmail() {
  const { t } = useTranslation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [status, setStatus] = useState(() => t("verifying_email"));
  const [verified, setVerified] = useState(false);
  const hasVerified = useRef(false);
  const params = new URLSearchParams(window.location.search);
  const token = params.get("token") || "";

  useEffect(() => {
    if (hasVerified.current) return;
    hasVerified.current = true;
    if (!token) {
      setStatus(t("invalid_verification_link"));
      return;
    }

    verifyEmailRequest(token)
      .then(({ data }) => {
        setVerified(true);
        if (data.token) localStorage.setItem("ledgrace_token", data.token);
        localStorage.setItem("ledgrace_user", JSON.stringify(data));
        setStatus(data.message);
      })
      .catch((error) => {
        setStatus(error.response?.data?.message || t("verification_failed"));
      });
  }, [token]);

  return (
    <div className="page signup-page verify-email-page" id="top">
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
      <main className="verify-email-main">
        <section
          className={`verify-email-card ${verified ? "success" : "error"}`}
        >
          <span className="verify-email-icon">
            {verified ? <CheckCircle2 /> : <Mail />}
          </span>
          <span className="verify-email-badge">
            {verified ? <ShieldCheck size={17} /> : <CircleX size={17} />}
          </span>
          <p className="verify-email-kicker">{t("account_security")}</p>
          <h1>{verified ? t("email_verified") : t("email_verification")}</h1>
          <p className="verify-email-status">{status}</p>
          {verified ? (
            <a className="button primary" href="/dashboard">
              {t("open_dashboard")} <ArrowRight size={16} />
            </a>
          ) : (
            <a className="button primary" href="/signup">
              {t("create_account_lower")} <ArrowRight size={16} />
            </a>
          )}
          {!verified && (
            <p className="verify-email-note">
              {t("verification_note")}
            </p>
          )}
        </section>
      </main>
    </div>
  );
}
