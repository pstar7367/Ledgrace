import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ArrowRight, CheckCircle2, Menu, ShieldCheck, X } from "lucide-react";
import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaXTwitter,
} from "react-icons/fa6";
import { Brand } from "./index.jsx";
import { resendResetCodeRequest, verifyResetCodeRequest } from "./authApi.js";
import "./App.css";

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

export default function VerifyCode() {
  const { t } = useTranslation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300);
  const email = new URLSearchParams(window.location.search).get("email") || "";
  const canResend = timeLeft <= 0;

  const handleInputChange = (index, value) => {
    if (value.length > 1) return;
    if (!/^\d*$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    if (value && index < 5) {
      document.getElementById(`code-input-${index + 1}`)?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      document.getElementById(`code-input-${index - 1}`)?.focus();
    }
  };

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = window.setInterval(
      () => setTimeLeft((value) => value - 1),
      1000,
    );
    return () => window.clearInterval(timer);
  }, [timeLeft]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const fullCode = code.join("");

    if (!email) {
      setStatus(t("missing_email"));
      return;
    }

    if (fullCode.length !== 6) {
      setStatus(t("enter_all_digits"));
      return;
    }

    setLoading(true);
    setStatus("");
    try {
      const { data } = await verifyResetCodeRequest({ email, otp: fullCode });
      setStatus(data.message);
      window.setTimeout(() => {
        window.location.assign(
          `/reset-password?email=${encodeURIComponent(email)}&otp=${encodeURIComponent(fullCode)}`,
        );
      }, 700);
    } catch (error) {
      setStatus(error.response?.data?.message || t("invalid_verification_code"));
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) {
      setStatus(t("missing_email"));
      return;
    }

    setResending(true);
    setStatus("");
    try {
      const { data } = await resendResetCodeRequest({ email });
      setStatus(data.message);
      setTimeLeft(300);
      setCode(["", "", "", "", "", ""]);
    } catch (error) {
      setStatus(
        error.response?.data?.message || t("unable_resend_code"),
      );
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="page verify-code-page" id="top">
      <header className="site-header login-header">
        <a href="/">
          <Brand />
        </a>
        <div className={`site-nav-area ${menuOpen ? "open" : ""}`}>
        <nav className={menuOpen ? "open" : ""}>
          <a href="/">{t("nav_home")}</a>
          <a href="/features">{t("nav_features")}</a>
          <a href="/pricing">{t("nav_pricing")}</a>
          <a href="/about">{t("nav_about")}</a>
          <a href="/faq">{t("nav_faq")}</a>
          <a href="/contact">{t("nav_contact")}</a>
          <a href="/blog">{t("nav_blog")}</a>
        </nav>
        <div className={`nav-ctas ${menuOpen ? "open" : ""}`}>
          <a className="login" href="/login">
            {t("nav_login")}
          </a>
          <a className="button primary" href="/signup">
            {t("nav_get_started")} <ArrowRight size={16} />
          </a>
        </div>
        </div>
        <button className="mobile-menu" aria-label={t("toggle_navigation")} aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X /> : <Menu />}
        </button>
      </header>
      <main className="verify-main">
        <section className="verify-layout section">
          <div className="verify-promo">
            <div className="eyebrow">
              <ShieldCheck size={18} />
              {t("secure_verification")}
            </div>
            <h1>{t("verify_identity")}</h1>
            <p>
              {t("verify_identity_intro")}
            </p>
            <div className="verify-security-banner">
              {t("security_banner")}
            </div>
            <div className="verify-benefits">
              <div>
                <ShieldCheck size={20} />
                <div>
                  <strong>{t("extra_security")}</strong>
                  <p>{t("unauthorized_access")}</p>
                </div>
              </div>
              <div>
                <ShieldCheck size={20} />
                <div>
                  <strong>{t("quick_process")}</strong>
                  <p>{t("verify_seconds")}</p>
                </div>
              </div>
              <div>
                <ShieldCheck size={20} />
                <div>
                  <strong>{t("always_safe")}</strong>
                  <p>{t("encrypted_secure")}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="verify-card">
            <form onSubmit={handleSubmit}>
              <h2>{t("enter_verification_code")}</h2>
              <p>{t("check_email_code")}</p>
              <div className="code-input-group">
                {code.map((digit, index) => (
                  <input
                    key={index}
                    id={`code-input-${index}`}
                    type="text"
                    inputMode="numeric"
                    maxLength="1"
                    value={digit}
                    onChange={(e) => handleInputChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    placeholder="0"
                    className="code-input"
                  />
                ))}
              </div>
              <div className="verify-timer">
                <span>{t("verification_note")}</span>
                <strong>
                  {Math.floor(timeLeft / 60)}:
                  {String(timeLeft % 60).padStart(2, "0")}
                </strong>
              </div>
              <button
                className="button primary verify-submit"
                type="submit"
                disabled={loading || code.some((digit) => digit === "")}
              >
                {loading ? t("verifying_email") : t("verify_code")}{" "}
                <ArrowRight size={18} />
              </button>
              {status && (
                <p
                  className={`verify-status ${status.includes("successfully") || status.includes("sent") ? "success" : "error"}`}
                >
                  <CheckCircle2 size={16} /> {status}
                </p>
              )}
              <div className="verify-footer">
                <span>{t("check_email_code")}</span>
                <button
                  type="button"
                  className="verify-resend"
                  onClick={handleResend}
                  disabled={resending || !canResend}
                  aria-disabled={!canResend}
                >
                  {resending
                    ? "Sending..."
                    : canResend
                      ? t("send_verification_code")
                      : `Wait ${String(Math.ceil(timeLeft / 60)).padStart(2, "0")}:${String(timeLeft % 60).padStart(2, "0")}`}
                </button>
              </div>
              <div className="verify-footer">
                <a href="/login">{t("nav_login")}</a>
              </div>
            </form>
            <div className="verify-note">
              {t("verification_note")}
            </div>
          </div>
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
            <h4>{t("newsletter")}</h4>
            <p>{t("subscribe_text")}</p>
            <form>
              <input placeholder={t("enter_email")} />
              <button type="button">{t("subscribe_btn")}</button>
            </form>
          </div>
        </div>
        <div className="copyright">© 2026 Ledgrace. All rights reserved.</div>
      </footer>
    </div>
  );
}
