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
import {
  FaApple,
  FaFacebookF,
  FaGoogle,
  FaInstagram,
  FaLinkedinIn,
  FaXTwitter,
} from "react-icons/fa6";
import { Brand, IconBubble } from "./index.jsx";
import { loginRequest } from "./authApi.js";
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
export default function Login() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });
  const [status, setStatus] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const error = params.get("error");

    if (error) {
      setStatus(decodeURIComponent(error));
      return;
    }

    if (token) {
      localStorage.setItem("ledgrace_token", token);
      setStatus("Google login successful. Redirecting...");
      window.setTimeout(() => {
        window.location.assign("/dashboard");
      }, 800);
    }
  }, []);

  const submit = async (event) => {
    event.preventDefault();
    if (!form.email || !form.password) {
      setStatus("Enter your email address and password to continue.");
      return;
    }

    setLoading(true);
    setStatus("");
    try {
      const { data } = await loginRequest({
        email: form.email,
        password: form.password,
      });
      localStorage.setItem("ledgrace_token", data.token);
      localStorage.setItem("ledgrace_user", JSON.stringify(data));
      setStatus("Login successful. Redirecting...");
      window.setTimeout(() => {
        window.location.assign("/dashboard");
      }, 800);
    } catch (error) {
      setStatus(
        error.response?.data?.message ||
          "Unable to sign in. Please try again or reset your password.",
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
          <a className="login active" href="/login">
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
      <main className="login-main">
        <section className="login-layout section">
          <div className="login-promo">
            <span className="eyebrow">♢ Secure. Private. Yours.</span>
            <h1>
              Welcome Back!
              <br />
              Good To See <em>You</em> Again.
            </h1>
            <p>
              Log in to your Ledgrace account and continue your journey to
              better financial health.
            </p>
            <div className="login-perks">
              <div>
                <IconBubble icon={BarChart3} color="teal" />
                <span>
                  <b>Track Everything</b>
                  <p>
                    Monitor your income, expenses, and savings all in one place.
                  </p>
                </span>
              </div>
              <div>
                <IconBubble icon={PieChart} color="blue" />
                <span>
                  <b>Plan Better</b>
                  <p>
                    Create budgets, set goals, and stay on top of your finances.
                  </p>
                </span>
              </div>
              <div>
                <IconBubble icon={ShieldCheck} color="purple" />
                <span>
                  <b>Secure & Private</b>
                  <p>
                    Your data is encrypted and protected with industry-best
                    security.
                  </p>
                </span>
              </div>
            </div>
          </div>
          <form className="login-form" id="form" onSubmit={submit}>
            <h1>Log In To Your Account</h1>
            <p>Enter your details below to access your account</p>
            <label>
              Email Address
              <span className="input-wrap">
                <Mail size={19} />
                <input
                  type="email"
                  value={form.email}
                  onChange={(event) =>
                    setForm({ ...form, email: event.target.value })
                  }
                  placeholder="Enter your email address"
                />
              </span>
            </label>
            <label>
              Password
              <span className="input-wrap">
                <LockKeyhole size={19} />
                <input
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(event) =>
                    setForm({ ...form, password: event.target.value })
                  }
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                </button>
              </span>
            </label>
            <div className="login-options">
              <label>
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(event) => setRemember(event.target.checked)}
                />{" "}
                Remember me
              </label>
              <a className="forgot-link" href="/forgot-password">
                Forgot Password?
              </a>
            </div>
            <button className="button primary login-submit" type="submit">
              Log In <ArrowRight size={20} />
            </button>
            {status && (
              <p className="login-status">
                <CheckCircle2 size={16} />
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
              Continue with Google
            </button>
            <button
              type="button"
              className="social-login"
              onClick={() =>
                window.alert("Apple sign-in has not been integrated yet.")
              }
            >
              <FaApple />
              Continue with Apple
            </button>
            <p className="signup">
              Don't have an account? <a href="/signup">Sign up for free</a>
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
