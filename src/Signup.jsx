import { useState } from "react";
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
export default function Signup() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
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
      setStatus("Please complete all fields to create your account.");
      return;
    }
    if (!validPassword) {
      setStatus("Choose a password that meets all security requirements.");
      return;
    }
    if (form.password !== form.confirm) {
      setStatus("Your passwords do not match.");
      return;
    }
    if (!form.terms) {
      setStatus("Please agree to the Terms of Service and Privacy Policy.");
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
          "Unable to create your account. Please try again.",
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
        <nav className={menuOpen ? "open" : ""}>
          <a href="/">Home</a>
          <a href="/features">Features</a>
          <a href="/pricing">Pricing</a>
          <a href="/about">About</a>
          <a href="/faq">FAQ</a>
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
        <button className="mobile-menu" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X /> : <Menu />}
        </button>
      </header>
      <main className="signup-main">
        <section className="signup-layout section">
          <div className="signup-promo">
            <span className="eyebrow">♢ Join thousands of smart savers</span>
            <h1>
              Create Your Account
              <br />
              and Take Control of
              <br />
              Your <em>Finances</em>
            </h1>
            <p>
              Start your journey to financial clarity and freedom.
              <br />
              It's free to get started.
            </p>
            <div className="signup-perks">
              <div>
                <IconBubble icon={CheckCircle2} color="teal" />
                <span>
                  <b>Easy & Quick Setup</b>
                  <p>Create your account in less than a minute.</p>
                </span>
              </div>
              <div>
                <IconBubble icon={ShieldCheck} color="blue" />
                <span>
                  <b>Bank-Level Security</b>
                  <p>
                    Your data is encrypted and protected with industry-leading
                    security.
                  </p>
                </span>
              </div>
              <div>
                <IconBubble icon={Target} color="purple" />
                <span>
                  <b>Smarter Financial Decisions</b>
                  <p>Get powerful insights to help you plan, save, and grow.</p>
                </span>
              </div>
              <div>
                <IconBubble icon={Target} color="orange" />
                <span>
                  <b>Achieve Your Goals</b>
                  <p>
                    Set goals, track progress, and build the future you want.
                  </p>
                </span>
              </div>
            </div>

          </div>
          <form className="signup-form" onSubmit={submit}>
            <h1>Create Your Account</h1>
            <p>
              Already have an account? <a href="/login">Log in</a>
            </p>
            <div className="field-row">
              <label>
                First Name
                <span className="input-wrap">
                  <User size={18} />
                  <input
                    name="firstName"
                    value={form.firstName}
                    onChange={update}
                    placeholder="Enter your first name"
                  />
                </span>
              </label>
              <label>
                Last Name
                <span className="input-wrap">
                  <User size={18} />
                  <input
                    name="lastName"
                    value={form.lastName}
                    onChange={update}
                    placeholder="Enter your last name"
                  />
                </span>
              </label>
            </div>
            <label>
              Email Address
              <span className="input-wrap">
                <Mail size={18} />
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={update}
                  placeholder="Enter your email address"
                />
              </span>
            </label>
            <label>
              Password
              <span className="input-wrap">
                <LockKeyhole size={18} />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={updateField}
                  onBlur={() => setPasswordTouched(true)}
                  placeholder="Create a strong password"
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
              Confirm Password
              <span className="input-wrap">
                <LockKeyhole size={18} />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirm"
                  value={form.confirm}
                  onChange={update}
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </span>
            </label>
            {showPasswordRules && (
              <div className="password-rules">
                <b>
                  <ShieldCheck size={17} /> Password must contain:
                </b>
                <span className={passwordRules.length ? "valid" : ""}>
                  <Check />
                  At least 8 characters
                </span>
                <span className={passwordRules.number ? "valid" : ""}>
                  <Check />
                  One number
                </span>
                <span className={passwordRules.uppercase ? "valid" : ""}>
                  <Check />
                  One uppercase letter
                </span>
                <span className={passwordRules.special ? "valid" : ""}>
                  <Check />
                  One special character
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
              I agree to the <a href="/terms">Terms of Service</a> and{" "}
              <a href="/privacy">Privacy Policy</a>
            </label>
            <button className="button primary signup-submit" type="submit">
              Create Account <ArrowRight size={18} />
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
              OR
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
              Sign up with Google
            </button>
            <button
              type="button"
              className="social-login"
              onClick={() =>
                window.alert("Apple sign-in has not been integrated yet.")
              }
            >
              <FaApple />
              Sign up with Apple
            </button>
            <small>
              By creating an account, you agree to receive emails from Ledgrace
              about tips, updates, and offers. You can unsubscribe anytime.
            </small>
          </form>
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
