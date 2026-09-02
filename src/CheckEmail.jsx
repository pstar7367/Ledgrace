import { ArrowRight, CheckCircle2, Mail } from "lucide-react";
import { Brand } from "./index.jsx";
import "./App.css";

export default function CheckEmail() {
  const email = new URLSearchParams(window.location.search).get("email");
  return (
    <div className="page signup-page check-email-page">
      <header className="site-header login-header">
        <a href="/">
          <Brand />
        </a>
        <div className="nav-ctas">
          <a className="login" href="/login">
            Log in
          </a>
          <a className="button primary" href="/signup">
            Get Started Free <ArrowRight size={16} />
          </a>
        </div>
      </header>
      <main className="check-email-main">
        <section className="check-email-card">
          <span className="check-email-icon">
            <Mail />
          </span>
          <CheckCircle2 className="check-email-check" />
          <h1>Check your email</h1>
          <p>We’ve sent an email verification link to:</p>
          <strong>{email || "your email address"}</strong>
          <p className="check-email-help">
            Click the link in the email to verify your account, then return here
            to log in. Check your spam folder if you don’t see it within a few
            minutes.
          </p>
          <a className="button primary" href="/login">
            Go to Login <ArrowRight size={17} />
          </a>
          <a className="check-email-change" href="/signup">
            Used the wrong email? Sign up again
          </a>
        </section>
      </main>
    </div>
  );
}
