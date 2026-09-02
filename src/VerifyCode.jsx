import { useEffect, useState } from "react";
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
      setStatus("Missing email information.");
      return;
    }

    if (fullCode.length !== 6) {
      setStatus("Please enter all 6 digits.");
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
      setStatus(error.response?.data?.message || "Invalid verification code.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) {
      setStatus("Missing email information.");
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
        error.response?.data?.message || "Unable to resend verification code.",
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
      <main className="verify-main">
        <section className="verify-layout section">
          <div className="verify-promo">
            <div className="eyebrow">
              <ShieldCheck size={18} />
              Secure Verification
            </div>
            <h1>Verify Your Identity</h1>
            <p>
              We've sent a 6-digit verification code to your email address.
              Enter it below to continue resetting your password.
            </p>
            <div className="verify-security-banner">
              For your protection, the code expires in 5 minutes and locks after
              3 failed attempts.
            </div>
            <div className="verify-benefits">
              <div>
                <ShieldCheck size={20} />
                <div>
                  <strong>Extra Security</strong>
                  <p>Protects your account from unauthorized access.</p>
                </div>
              </div>
              <div>
                <ShieldCheck size={20} />
                <div>
                  <strong>Quick Process</strong>
                  <p>Takes just a few seconds to verify.</p>
                </div>
              </div>
              <div>
                <ShieldCheck size={20} />
                <div>
                  <strong>Always Safe</strong>
                  <p>Your information is encrypted and secure.</p>
                </div>
              </div>
            </div>
          </div>
          <div className="verify-card">
            <form onSubmit={handleSubmit}>
              <h2>Enter Verification Code</h2>
              <p>Check your email for a 6-digit code and enter it below.</p>
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
                <span>Code expires in</span>
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
                {loading ? "Verifying..." : "Verify Code"}{" "}
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
                <span>Didn't receive the code?</span>
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
                      ? "Resend Code"
                      : `Wait ${String(Math.ceil(timeLeft / 60)).padStart(2, "0")}:${String(timeLeft % 60).padStart(2, "0")}`}
                </button>
              </div>
              <div className="verify-footer">
                <a href="/login">Back to Login</a>
              </div>
            </form>
            <div className="verify-note">
              The code will expire in 5 minutes. Check your spam folder if you
              don't see the email.
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
