import { useEffect, useState } from "react";
import {
  ArrowRight,
  Check,
  CheckCircle2,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  Menu,
  ShieldCheck,
  Target,
  User,
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
import { signupRequest } from "./authApi.js";
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
export default function Signup() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState(getStoredLanguage());
  const t = (key) => translate(key, language);

  useEffect(() => {
    const handleLanguageChange = () => setLanguage(getStoredLanguage());
    window.addEventListener("ledgrace:preferences-changed", handleLanguageChange);
    return () => window.removeEventListener("ledgrace:preferences-changed", handleLanguageChange);
  }, []);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirm: "",
    terms: false,
  });
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [status, setStatus] = useState("");
  const passwordRules = {
    length: form.password.length >= 8,
    uppercase: /[A-Z]/.test(form.password),
    number: /\d/.test(form.password),
    special: /[^A-Za-z0-9]/.test(form.password),
  };
  const validPassword =
    passwordRules.length &&
    passwordRules.uppercase &&
    passwordRules.number &&
    passwordRules.special;
  const showPasswordRules = passwordTouched || form.password.length > 0;
  const update = (event) =>
    setForm({
      ...form,
      [event.target.name]:
        event.target.type === "checkbox"
          ? event.target.checked
          : event.target.value,
    });
  const updateField = (event) => {
    if (event.target.name === "password") {
      setPasswordTouched(true);
    }
    update(event);
  };
  const submit = async (event) => {
    event.preventDefault();
    if (
      !form.firstName ||
      !form.lastName ||
      !form.email ||
      !form.password ||
      !form.confirm
    ) {
      setStatus(t("signup_complete_fields"));
      return;
    }
    if (!validPassword) {
      setStatus(t("signup_password_requirements"));
      return;
    }
    if (form.password !== form.confirm) {
      setStatus(t("passwords_no_match"));
      return;
    }
    if (!form.terms) {
      setStatus(t("signup_terms_required"));
      return;
    }

    setLoading(true);
    setStatus("");
    try {
      const { data } = await signupRequest({
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        password: form.password,
      });
      setStatus(data.message);
      window.location.assign(
        `/check-email?email=${encodeURIComponent(data.user?.email || form.email)}`,
      );
    } catch (error) {
      setStatus(
        error.response?.data?.message ||
          t("signup_unable"),
      );
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="page signup-page" id="top">
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
      <main className="signup-main">
        <section className="signup-layout section">
          <div className="signup-promo">
            <span className="eyebrow">{t("join_message")}</span>
            <h1>
              {t("create_account")}
              <br />
              {t("take_control")}
              <br />
              {t("finances")}
            </h1>
            <p>
              {t("signup_intro")}
            </p>
            <div className="signup-perks">
              <div>
                <IconBubble icon={CheckCircle2} color="teal" />
                <span>
                  <b>{t("account_setup")}</b>
                  <p>{t("account_setup_desc")}</p>
                </span>
              </div>
              <div>
                <IconBubble icon={ShieldCheck} color="blue" />
                <span>
                  <b>{t("secure")}</b>
                  <p>{t("secure_desc")}</p>
                </span>
              </div>
              <div>
                <IconBubble icon={Target} color="purple" />
                <span>
                  <b>{t("smarter_decisions")}</b>
                  <p>{t("smarter_decisions_desc")}</p>
                </span>
              </div>
              <div>
                <IconBubble icon={Target} color="orange" />
                <span>
                  <b>{t("achieve_goals")}</b>
                  <p>{t("achieve_goals_desc")}</p>
                </span>
              </div>
            </div>
          </div>
          <form className="signup-form" onSubmit={submit}>
            <h1>{t("signup_to_account")}</h1>
            <p>
              {t("already_account")} <a href="/login">{t("nav_login")}</a>
            </p>
            <div className="field-row">
              <label>
                {t("first_name")}
                <span className="input-wrap">
                  <User size={18} />
                  <input
                    name="firstName"
                    value={form.firstName}
                    onChange={update}
                    placeholder={t("enter_first_name")}
                  />
                </span>
              </label>
              <label>
                {t("last_name")}
                <span className="input-wrap">
                  <User size={18} />
                  <input
                    name="lastName"
                    value={form.lastName}
                    onChange={update}
                    placeholder={t("enter_last_name")}
                  />
                </span>
              </label>
            </div>
            <label>
              {t("email_address")}
              <span className="input-wrap">
                <Mail size={18} />
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={update}
                  placeholder={t("enter_email")}
                />
              </span>
            </label>
            <label>
              {t("password")}
              <span className="input-wrap">
                <LockKeyhole size={18} />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={updateField}
                  onBlur={() => setPasswordTouched(true)}
                  placeholder={t("create_strong_password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </span>
            </label>
            <label>
              {t("confirm_password")}
              <span className="input-wrap">
                <LockKeyhole size={18} />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirm"
                  value={form.confirm}
                  onChange={update}
                  placeholder={t("confirm_your_password")}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </span>
            </label>
            {showPasswordRules && (
              <div className="password-rules">
                <b>
                  <ShieldCheck size={17} /> {t("password_must_contain")}
                </b>
                <span className={passwordRules.length ? "valid" : ""}>
                  <Check />
                  {t("min_password_length")}
                </span>
                <span className={passwordRules.number ? "valid" : ""}>
                  <Check />
                  {t("one_number")}
                </span>
                <span className={passwordRules.uppercase ? "valid" : ""}>
                  <Check />
                  {t("one_uppercase")}
                </span>
                <span className={passwordRules.special ? "valid" : ""}>
                  <Check />
                  {t("one_special")}
                </span>
              </div>
            )}
            <label className="terms">
              <input
                type="checkbox"
                name="terms"
                checked={form.terms}
                onChange={update}
              />{" "}
              {t("terms_agree_prefix")} <a href="/terms">{t("terms_of_service")}</a> {t("terms_agree_and")} {" "}
              <a href="/privacy">{t("privacy_policy")}</a>
            </label>
            <button className="button primary signup-submit" type="submit" disabled={loading}>
              {t("create_account_btn")} <ArrowRight size={18} />
            </button>
            {status && (
              <p
                className={`signup-status ${status.startsWith("Welcome") ? "success" : ""}`}
              >
                {status.startsWith("Welcome") && <CheckCircle2 size={16} />}{" "}
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
              {t("signup_google")}
            </button>
            <button
              type="button"
              className="social-login"
              onClick={() =>
                window.alert(t("apple_signin_unavailable"))
              }
            >
              <FaApple />
              {t("signup_apple")}
            </button>
            <small>
              {t("signup_email_notice")}
            </small>
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
