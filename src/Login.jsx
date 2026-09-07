import { useEffect, useState } from "react";
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  Menu,
  PieChart,
  ShieldCheck,
  X,
} from "lucide-react";
import { getStoredLanguage, translate } from "./translation.js";
import {
  FaApple,
  FaFacebookF,
  FaGoogle,
  FaInstagram,
  FaLinkedinIn,
  FaXTwitter,
} from "react-icons/fa6";
import { Brand, IconBubble } from "./index.jsx";
import { loginRequest, verifyTwoFactorRequest } from "./authApi.js";
import "./App.css";

function FooterColumn({ title, links }) {
  return (
    <div>
      <h4>{title}</h4>
      {links.map((link) => {
        const href = link.href;
        return (
          <a
            key={link.label}
            href={href}
            className={window.location.pathname === href ? "footer-active" : ""}
          >
            {link.label}
          </a>
        );
      })}
    </div>
  );
}
export default function Login() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [twoFactorPending, setTwoFactorPending] = useState(false);
  const [language, setLanguage] = useState(getStoredLanguage());
  const t = (key) => translate(key, language);

  useEffect(() => {
    const handleLanguageChange = () => setLanguage(getStoredLanguage());
    window.addEventListener("ledgrace:preferences-changed", handleLanguageChange);
    return () => window.removeEventListener("ledgrace:preferences-changed", handleLanguageChange);
  }, []);
  const [status, setStatus] = useState(() => {
    const error = new URLSearchParams(window.location.search).get("error");
    return error ? decodeURIComponent(error) : "";
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    if (token) {
      localStorage.setItem("ledgrace_token", token);
      window.setTimeout(() => {
        window.location.assign("/dashboard");
      }, 800);
    }
  }, []);

  const submit = async (event) => {
    event.preventDefault();
    if (!form.email || (!twoFactorPending && !form.password) || (twoFactorPending && !twoFactorCode)) {
      setStatus(twoFactorPending ? t("login_status_code") : t("login_status_missing"));
      return;
    }

    setLoading(true);
    setStatus("");
    try {
      const { data } = twoFactorPending
        ? await verifyTwoFactorRequest({ email: form.email, code: twoFactorCode })
        : await loginRequest({ email: form.email, password: form.password });
      if (data.requiresTwoFactor) {
        setTwoFactorPending(true);
        setStatus(data.message);
        return;
      }
      localStorage.setItem("ledgrace_token", data.token);
      localStorage.setItem("ledgrace_user", JSON.stringify(data));
      setStatus(t("login_success"));
      window.setTimeout(() => {
        window.location.assign("/dashboard");
      }, 800);
    } catch (error) {
      setStatus(
        error.response?.data?.message ||
          t("login_unable"),
      );
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="page login-page" id="top">
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
          <a className="login active" href="/login">
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
      <main className="login-main">
        <section className="login-layout section">
          <div className="login-promo">
            <span className="eyebrow">{t("secure_private")}</span>
            <h1>
              {t("welcome_back")}
              <br />
              <em>{t("good_to_see_you")}</em>
            </h1>
            <p>
              {t("login_intro")}
            </p>
            <div className="login-perks">
              <div>
                <IconBubble icon={BarChart3} color="teal" />
                <span>
                  <b>{t("track_everything")}</b>
                  <p>{t("track_everything_desc")}</p>
                </span>
              </div>
              <div>
                <IconBubble icon={PieChart} color="blue" />
                <span>
                  <b>{t("plan_better")}</b>
                  <p>{t("plan_better_desc")}</p>
                </span>
              </div>
              <div>
                <IconBubble icon={ShieldCheck} color="purple" />
                <span>
                  <b>{t("secure_private_title")}</b>
                  <p>{t("secure_private_desc")}</p>
                </span>
              </div>
            </div>
          </div>
          <form className="login-form" id="form" onSubmit={submit}>
            <h1>{t("login_to_account")}</h1>
            <p>{twoFactorPending ? t("verify_code") : t("login_details")}</p>
            <label>
              {t("email_address")}
              <span className="input-wrap">
                <Mail size={19} />
                <input
                  type="email"
                  value={form.email}
                  onChange={(event) =>
                    setForm({ ...form, email: event.target.value })
                  }
                  placeholder={t("enter_email")}
                />
              </span>
            </label>
            {!twoFactorPending && <label>
              {t("password")}
              <span className="input-wrap">
                <LockKeyhole size={19} />
                <input
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(event) =>
                    setForm({ ...form, password: event.target.value })
                  }
                  placeholder={t("enter_password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                </button>
              </span>
            </label>}
            {twoFactorPending && <label>{t("verify_code")}<input type="text" inputMode="numeric" autoComplete="one-time-code" value={twoFactorCode} onChange={(event) => setTwoFactorCode(event.target.value)} placeholder={t("enter_six_digit_code")} /></label>}
            {!twoFactorPending && <div className="login-options">
              <label>
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(event) => setRemember(event.target.checked)}
                />{" "}
                {t("remember_me")}
              </label>
              <a className="forgot-link" href="/forgot-password">
                {t("forgot_password")}
              </a>
            </div>}
            <button className="button primary login-submit" type="submit" disabled={loading}>
              {twoFactorPending ? t("verify_code") : t("login_submit")} <ArrowRight size={20} />
            </button>
            {status && (
              <p className="login-status">
                <CheckCircle2 size={16} />
                {status}
              </p>
            )}
            <div className="or">
              <span />
              {t("or")}
              <span />
            </div>
            <button
              type="button"
              className="social-login"
              onClick={() =>
                (window.location.href = `${import.meta.env.VITE_API_URL}/google`)
              }
            >
              <FaGoogle />
              {t("continue_google")}
            </button>
            <button
              type="button"
              className="social-login"
              onClick={() => window.alert(t("apple_signin_unavailable"))}
            >
              <FaApple />
              {t("continue_apple")}
            </button>
            <p className="signup">
              {t("no_account")} <a href="/signup">{t("signup_free")}</a>
            </p>
          </form>
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
            title={t("footer_product")}
            links={[{ label: t("nav_features"), href: "/features" }, { label: t("nav_pricing"), href: "/pricing" }, { label: t("roadmap"), href: "#top" }, { label: t("changelog"), href: "#top" }]}
          />
          <FooterColumn
            title={t("footer_company")}
            links={[{ label: t("about_us"), href: "/about" }, { label: t("nav_blog"), href: "/blog" }, { label: t("careers"), href: "#top" }, { label: t("contact_us"), href: "/contact" }]}
          />
          <FooterColumn
            title={t("footer_support")}
            links={[{ label: t("help_center"), href: "/contact" }, { label: t("nav_faq"), href: "/faq" }, { label: t("privacy_policy"), href: "/privacy" }, { label: t("terms_of_service"), href: "/terms" }]}
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
