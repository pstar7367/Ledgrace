import { useMemo, useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  Menu,
  X,
} from "lucide-react";
import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaXTwitter,
} from "react-icons/fa6";
import { Brand } from "./index.jsx";
import { resetPasswordRequest } from "./authApi.js";
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

export default function ResetPassword() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [form, setForm] = useState({ otp: "", password: "", confirm: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [status, setStatus] = useState("");
  const email = new URLSearchParams(window.location.search).get("email") || "";
  const otp = new URLSearchParams(window.location.search).get("otp") || "";

  const passwordStrength = useMemo(() => {
    const value = form.password;
    let score = 0;
    if (value.length >= 8) score += 1;
    if (/[A-Z]/.test(value)) score += 1;
    if (/[0-9]/.test(value)) score += 1;
    if (/[^A-Za-z0-9]/.test(value)) score += 1;
    if (score <= 1) return { label: "Weak", color: "#d93026" };
    if (score <= 2) return { label: "Fair", color: "#f59e0b" };
    if (score <= 3) return { label: "Good", color: "#1458ed" };
    return { label: "Strong", color: "#00b976" };
  }, [form.password]);

  const onSubmit = async (event) => {
    event.preventDefault();
    if (!form.otp || !form.password || !form.confirm) {
      setStatus("Please complete all fields.");
      return;
    }
    if (form.password !== form.confirm) {
      setStatus("Passwords do not match.");
      return;
    }

    try {
      const { data } = await resetPasswordRequest({
        email,
        otp: form.otp || otp,
        password: form.password,
        confirmPassword: form.confirm,
      });
      setStatus(data.message);
      setForm({ otp: "", password: "", confirm: "" });
      window.setTimeout(() => {
        window.location.assign("/login");
      }, 1500);
    } catch (error) {
      setStatus(
        error.response?.data?.message || "Unable to reset your password.",
      );
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
          <a href="/">Home</a>
          <a href="/features">Features</a>
          <a href="/pricing">Pricing</a>
          <a href="/about">About</a>
          <a href="/faq">FAQ</a>
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
        <button className="mobile-menu" aria-label="Toggle navigation menu" aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X /> : <Menu />}
        </button>
      </header>
      <main className="signup-main">
        <section className="signup-layout section">
          <form className="signup-form" onSubmit={onSubmit}>
            <h1>Reset Your Password</h1>
            <p>
              Enter the 6-digit code sent to your email and choose a new
              password.
            </p>
            <label>
              Verification Code
              <span className="input-wrap">
                <Mail size={18} />
                <input
                  value={form.otp || otp}
                  onChange={(event) =>
                    setForm({ ...form, otp: event.target.value })
                  }
                  placeholder="Enter 6-digit code"
                  maxLength="6"
                />
              </span>
            </label>
            <label>
              New Password
              <span className="input-wrap">
                <LockKeyhole size={18} />
                <input
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(event) =>
                    setForm({ ...form, password: event.target.value })
                  }
                  placeholder="Create a new password"
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
                  value={form.confirm}
                  onChange={(event) =>
                    setForm({ ...form, confirm: event.target.value })
                  }
                  placeholder="Confirm new password"
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
            {form.password && (
              <div className="password-strength">
                <span>Password strength</span>
                <strong style={{ color: passwordStrength.color }}>
                  {passwordStrength.label}
                </strong>
              </div>
            )}
            <button className="button primary signup-submit" type="submit">
              Reset Password <ArrowRight size={18} />
            </button>
            {status && (
              <p className="signup-status">
                <CheckCircle2 size={16} /> {status}
              </p>
            )}
            <p className="signup" style={{ marginTop: "20px" }}>
              <a href="/forgot-password">Back to forgot password</a>
            </p>
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
