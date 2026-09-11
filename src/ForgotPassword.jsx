import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ArrowRight,
  CheckCircle2,
  Mail,
  Menu,
  ShieldCheck,
  X,
} from "lucide-react";
import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaXTwitter,
} from "react-icons/fa6";
import { Brand } from "./index.jsx";
import { forgotPasswordRequest } from "./authApi.js";
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

export default function ForgotPassword() {
  const { t } = useTranslation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!email) {
      setStatus(t("login_status_missing"));
      return;
    }

    setLoading(true);
    setStatus("");
    try {
      const { data } = await forgotPasswordRequest({ email });
      setStatus(data.message);
      window.setTimeout(() => {
        window.location.assign(
          `/verify-code?email=${encodeURIComponent(email)}`,
        );
      }, 700);
    } catch (error) {
      setStatus(
        error.response?.data?.message || t("unable_reset_password"),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page forgot-password-page" id="top">
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
      <main className="forgot-main">
        <section className="forgot-layout section">
          <div className="forgot-promo">
            <div className="eyebrow">
              <ShieldCheck size={18} />
              {t("secure_private_copy")}
            </div>
            <h1>{t("forgot_password")}</h1>
            <p>{t("forgot_intro")}</p>
            <div className="forgot-benefits">
              <div>
                <ShieldCheck size={20} />
                <div>
                    <strong>{t("secure_private_copy")}</strong>
                    <p>{t("never_share_email")}</p>
                </div>
              </div>
              <div>
                <ShieldCheck size={20} />
                <div>
                    <strong>{t("quick_easy")}</strong>
                    <p>{t("reset_few_clicks")}</p>
                </div>
              </div>
              <div>
                <ShieldCheck size={20} />
                <div>
                    <strong>{t("support_247")}</strong>
                    <p>{t("support_here")}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="forgot-card">
            <form onSubmit={handleSubmit}>
              <h2>{t("reset_password_title")}</h2>
              <p>{t("reset_password_intro")}</p>
              <label>
                {t("email_address")}
                <span className="input-wrap">
                  <Mail size={18} />
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder={t("enter_email")}
                  />
                </span>
              </label>
              <button
                className="button primary forgot-submit"
                type="submit"
                disabled={loading}
              >
                {t("send_verification_code")} <ArrowRight size={18} />
              </button>
              {status && (
                <p className="forgot-status">
                  <CheckCircle2 size={16} /> {status}
                </p>
              )}
              <div className="forgot-footer">
                <span>OR</span>
                <a href="/login">{t("remember_password")}</a>
              </div>
            </form>
            <div className="forgot-note">
              {t("spam_note")}
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
