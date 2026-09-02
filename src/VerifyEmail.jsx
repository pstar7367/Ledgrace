import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  CircleX,
  Mail,
  ShieldCheck,
} from "lucide-react";
import { Brand } from "./index.jsx";
import { verifyEmailRequest } from "./authApi.js";
import "./App.css";

export default function VerifyEmail() {
  const [status, setStatus] = useState("Verifying your email...");
  const [verified, setVerified] = useState(false);
  const hasVerified = useRef(false);
  const params = new URLSearchParams(window.location.search);
  const token = params.get("token") || "";

  useEffect(() => {
    if (hasVerified.current) return;
    hasVerified.current = true;
    if (!token) {
      setStatus("Verification link is missing or invalid.");
      return;
    }

    verifyEmailRequest(token)
      .then(({ data }) => {
        setVerified(true);
        if (data.token) localStorage.setItem("ledgrace_token", data.token);
        localStorage.setItem("ledgrace_user", JSON.stringify(data));
        setStatus(data.message);
      })
      .catch((error) => {
        setStatus(error.response?.data?.message || "Verification failed.");
      });
  }, [token]);

  return (
    <div className="page signup-page verify-email-page" id="top">
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
      <main className="verify-email-main">
        <section
          className={`verify-email-card ${verified ? "success" : "error"}`}
        >
          <span className="verify-email-icon">
            {verified ? <CheckCircle2 /> : <Mail />}
          </span>
          <span className="verify-email-badge">
            {verified ? <ShieldCheck size={17} /> : <CircleX size={17} />}
          </span>
          <p className="verify-email-kicker">Ledgrace account security</p>
          <h1>{verified ? "Email verified!" : "Email Verification"}</h1>
          <p className="verify-email-status">{status}</p>
          {verified ? (
            <a className="button primary" href="/dashboard">
              Open Dashboard <ArrowRight size={16} />
            </a>
          ) : (
            <a className="button primary" href="/signup">
              Create an account <ArrowRight size={16} />
            </a>
          )}
          {!verified && (
            <p className="verify-email-note">
              Verification links are one-time use. Create a new account to
              receive a fresh link.
            </p>
          )}
        </section>
      </main>
    </div>
  );
}
