import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import Index from "./index.jsx";
import Features from "./Features.jsx";
import Pricing from "./Pricing.jsx";
import About from "./About.jsx";
import FAQ from "./FAQ.jsx";
import Contact from "./Contact.jsx";
import Blog from "./Blog.jsx";
import Login from "./Login.jsx";
import Signup from "./Signup.jsx";
import ForgotPassword from "./ForgotPassword.jsx";
import ResetPassword from "./ResetPassword.jsx";
import VerifyEmail from "./VerifyEmail.jsx";
import VerifyCode from "./VerifyCode.jsx";
import TermsOfService from "./TermsOfService.jsx";
import PrivacyPolicy from "./PrivacyPolicy.jsx";
import CheckEmail from "./CheckEmail.jsx";
import DashboardPage from "./DashboardPage.jsx";
import { refreshExchangeRates } from "./preferences.js";

function applyStoredTheme() {
  try {
    const preferences = JSON.parse(localStorage.getItem("ledgrace_profile_preferences")) || {};
    const theme = preferences.theme || "Light";
    const isDark = theme === "Dark" || (theme === "System" && window.matchMedia?.("(prefers-color-scheme: dark)").matches);
    document.documentElement.dataset.appTheme = isDark ? "dark" : "light";
    document.documentElement.dataset.profileTheme = isDark ? "dim" : "light";
  } catch {
    document.documentElement.dataset.appTheme = "light";
  }
}

applyStoredTheme();
refreshExchangeRates();
window.setInterval(refreshExchangeRates, 6 * 60 * 60 * 1000);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    {window.location.pathname === "/features" ? (
      <Features />
    ) : window.location.pathname === "/pricing" ? (
      <Pricing />
    ) : window.location.pathname === "/about" ? (
      <About />
    ) : window.location.pathname === "/faq" ? (
      <FAQ />
    ) : window.location.pathname === "/contact" ? (
      <Contact />
    ) : window.location.pathname === "/blog" ? (
      <Blog />
    ) : window.location.pathname === "/login" ? (
      <Login />
    ) : window.location.pathname === "/signup" ? (
      <Signup />
    ) : window.location.pathname === "/forgot-password" ? (
      <ForgotPassword />
    ) : window.location.pathname === "/reset-password" ? (
      <ResetPassword />
    ) : window.location.pathname === "/verify-email" ? (
      <VerifyEmail />
    ) : window.location.pathname === "/verify-code" ? (
      <VerifyCode />
    ) : window.location.pathname === "/terms" ? (
      <TermsOfService />
    ) : window.location.pathname === "/privacy" ? (
      <PrivacyPolicy />
    ) : window.location.pathname === "/check-email" ? (
      <CheckEmail />
    ) : window.location.pathname === "/dashboard" ? (
      <DashboardPage />
    ) : window.location.pathname === "/accounts" ? (
      <DashboardPage />
    ) : window.location.pathname === "/income" ? (
      <DashboardPage />
    ) : window.location.pathname === "/expenses" ? (
      <DashboardPage />
    ) : window.location.pathname === "/budget-planner" ? (
      <DashboardPage />
    ) : window.location.pathname === "/savings-goals" ? (
      <DashboardPage />
    ) : window.location.pathname === "/bills-subscriptions" ? (
      <DashboardPage />
    ) : window.location.pathname === "/financial-calendar" ? (
      <DashboardPage />
    ) : window.location.pathname === "/analytics" ? (
      <DashboardPage />
    ) : window.location.pathname === "/reports" ? (
      <DashboardPage />
    ) : window.location.pathname === "/financial-health" ? (
      <DashboardPage />
    ) : window.location.pathname === "/financial-journey" ? (
      <DashboardPage />
    ) : window.location.pathname === "/insights" ? (
      <DashboardPage />
    ) : window.location.pathname === "/goals-achievements" ? (
      <DashboardPage />
    ) : window.location.pathname === "/notifications" ? (
      <DashboardPage />
    ) : window.location.pathname === "/profile" ? (
      <DashboardPage />
    ) : window.location.pathname === "/settings" ? (
      <DashboardPage />
    ) : (
      <Index />
    )}
  </StrictMode>,
);
