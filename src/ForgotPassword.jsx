import { useState } from "react";
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
  const [menuOpen, setMenuOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!email) {
      setStatus("Enter your email address to continue.");
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
        error.response?.data?.message || "Unable to send reset instructions.",
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
      <main className="forgot-main">
        <section className="forgot-layout section">
          <div className="forgot-promo">
            <div className="eyebrow">
              <ShieldCheck size={18} />
              Secure & Private
            </div>
            <h1>Forgot Password?</h1>
            <p>
              No worries! Enter your email address and we'll send you a
              verification code to reset your password.
            </p>
            <div className="forgot-benefits">
              <div>
                <ShieldCheck size={20} />
                <div>
                  <strong>Secure & Private</strong>
                  <p>We’ll never share your email with anyone.</p>
                </div>
              </div>
              <div>
                <ShieldCheck size={20} />
                <div>
                  <strong>Quick & Easy</strong>
                  <p>Reset your password in just a few clicks.</p>
                </div>
              </div>
              <div>
                <ShieldCheck size={20} />
                <div>
                  <strong>24/7 Support</strong>
                  <p>Need help? Our support team is here for you.</p>
                </div>
              </div>
            </div>
          </div>
          <div className="forgot-card">
            <form onSubmit={handleSubmit}>
              <h2>Reset Your Password</h2>
              <p>
                Enter the email address associated with your account and we’ll
                send you a secure verification code to reset your password.
              </p>
              <label>
                Email Address
                <span className="input-wrap">
                  <Mail size={18} />
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="Enter your email address"
                  />
                </span>
              </label>
              <button
                className="button primary forgot-submit"
                type="submit"
                disabled={loading}
              >
                Send Verification Code <ArrowRight size={18} />
              </button>
              {status && (
                <p className="forgot-status">
                  <CheckCircle2 size={16} /> {status}
                </p>
              )}
              <div className="forgot-footer">
                <span>OR</span>
                <a href="/login">Remember your password? Log in</a>
              </div>
            </form>
            <div className="forgot-note">
              If you don’t receive the email within a few minutes, check your
              spam or junk folder.
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
