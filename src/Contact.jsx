import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  Mail,
  MapPin,
  Menu,
  MessageCircle,
  Phone,
  Send,
  ShieldCheck,
  X,
} from "lucide-react";
import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaXTwitter,
} from "react-icons/fa6";
import logo from "./assets/logo/ledgrace-logo.png";
import "./App.css";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Features", href: "/features" },
  { label: "Pricing", href: "/pricing" },
  { label: "About", href: "/about" },
  { label: "FAQ", href: "/faq" },
  { label: "Contact", href: "/contact", active: true },
  { label: "Blog", href: "/blog" },
];

const contactOptions = [
  {
    icon: Mail,
    title: "Email Us",
    mainText: "support@ledgrace.com",
    detail: "We'll get back to you via email.",
    href: "mailto:support@ledgrace.com",
    color: "teal",
  },
  {
    icon: Phone,
    title: "Call Us",
    mainText: "+234 123 456 7890",
    detail: "Mon – Fri, 9:00 AM – 5:00 PM (WAT)",
    href: "tel:+2341234567890",
    color: "blue",
  },
  {
    icon: MessageCircle,
    title: "Live Chat",
    mainText: "Available in-app and on our website.",
    detail: "Mon – Fri, 9:00 AM – 5:00 PM (WAT)",
    href: "#message",
    color: "purple",
  },
  {
    icon: MapPin,
    title: "Our Office",
    mainText: "Lagos, Nigeria",
    detail: "Visit us by appointment.",
    href: "https://maps.google.com/?q=Lagos,Nigeria",
    color: "orange",
  },
];

const footerLinks = {
  Product: ["Features", "Pricing", "Roadmap", "Changelog"],
  Company: ["About Us", "Blog", "Careers", "Contact Us"],
  Support: ["Help Center", "FAQ", "Privacy Policy", "Terms of Service"],
};

function Brand({ light = false }) {
  return (
    <span className={`brand ${light ? "brand-light" : ""}`}>
      <img src={logo} alt="Ledgrace logo" />
      <strong>Ledgrace</strong>
    </span>
  );
}

function IconBubble({ icon: Icon, color = "blue" }) {
  return (
    <span className={`icon-bubble ${color}`}>
      <Icon size={22} strokeWidth={2.2} />
    </span>
  );
}

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

function ContactHeader({ menuOpen, setMenuOpen }) {
  const { t } = useTranslation();
  return (
    <header className="site-header contact-header">
      <a href="/">
        <Brand />
      </a>
      <div className={`site-nav-area ${menuOpen ? "open" : ""}`}>
      <nav className={menuOpen ? "open" : ""}>
        {navLinks.map((item) => (
          <a
            key={item.label}
            className={item.active ? "active" : ""}
            href={item.href}
            onClick={() => setMenuOpen(false)}
          >
            {t({ Home: "nav_home", Features: "nav_features", Pricing: "nav_pricing", About: "nav_about", FAQ: "nav_faq", Contact: "nav_contact", Blog: "nav_blog" }[item.label] || item.label)}
          </a>
        ))}
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
  );
}

function ContactHero() {
  const { t } = useTranslation();
  return (
    <section className="contact-hero section">
      <div className="contact-hero-copy">
        <span className="eyebrow">✉ {t("support_here")}</span>
        <h1>
          {t("nav_contact")}!
          <br />
          <em>{t("contact_us")}.</em>
        </h1>
        <p>
          {t("support_here")}
          <br />
          {t("support_247")}
        </p>
        <div className="response-note">
          <IconBubble icon={Clock3} color="blue" />
          <span>
            {t("support_here")}
            <br />
            <b>{t("support_247")}</b>
          </span>
        </div>
      </div>

      <div className="contact-illustration">
        <div className="contact-envelope">
          <div className="letter">
            {t("contact_here")}
            <br />
            <em>{t("contact_for_you")}</em>
          </div>
          <span>💬</span>
          <i>☎</i>
        </div>
      </div>
    </section>
  );
}

function ContactOptionCard({ option }) {
  const { t } = useTranslation();
  const { icon: Icon, title, mainText, detail, href, color } = option;
  const localizedTitle = title === "Email Us" ? t("email_address") : t("support_here");
  const localizedMainText = mainText === "Available in-app and on our website." ? t("support_here") : mainText;
  return (
    <a
      className="contact-option-card"
      href={href}
      target={href.startsWith("http") ? "_blank" : undefined}
      rel="noreferrer"
    >
      <IconBubble icon={Icon} color={color} />
      <span>
        <b>{localizedTitle}</b>
        <strong>{localizedMainText}</strong>
        <small>{t("support_247")}</small>
      </span>
      <ArrowRight size={17} />
    </a>
  );
}

function ContactForm({ form, status, handleChange, submit }) {
  const { t } = useTranslation();
  return (
    <form className="contact-form" id="form" onSubmit={submit}>
      <h2>{t("nav_contact")}</h2>
      <p>{t("support_here")}</p>

      <div className="field-row">
        <label>
          {t("first_name")} {t("last_name")}
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder={`${t("enter_first_name")} ${t("enter_last_name")}`}
          />
        </label>
        <label>
            {t("email_address")}
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
                          placeholder={t("enter_email")}
          />
        </label>
      </div>

      <label>
          {t("description")}
        <input
          name="subject"
          value={form.subject}
          onChange={handleChange}
          placeholder={t("description")}
        />
      </label>

      <label>
          {t("description")}
        <textarea
          name="message"
          value={form.message}
          onChange={handleChange}
          placeholder={t("description")}
        />
      </label>

      <div className="form-bottom">
        <button className="button primary" type="submit">
          {t("send_verification_code")} <Send size={15} />
        </button>
        <span>
          <ShieldCheck size={15} /> {t("secure_private_copy")}
        </span>
      </div>

      {status && (
        <p
          className={`form-status ${status.startsWith("Thanks") ? "success" : "error"}`}
        >
          {status.startsWith("Thanks") && <CheckCircle2 size={16} />}
          {status}
        </p>
      )}
    </form>
  );
}

function ContactCta() {
  const { t } = useTranslation();
  return (
    <section className="contact-cta section">
      <div className="contact-cta-copy">
        <IconBubble icon={Mail} color="blue" />
        <span>
          <h2>{t("ready_title")}</h2>
          <p>{t("ready_desc")}</p>
        </span>
      </div>
      <a className="button outline" href="/signup">
        {t("nav_get_started")} <ArrowRight size={17} />
      </a>
    </section>
  );
}

export default function Contact() {
  const { t } = useTranslation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [status, setStatus] = useState("");

  const handleChange = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
  };

  const submit = (event) => {
    event.preventDefault();

    if (!form.name || !form.email || !form.subject || !form.message) {
       setStatus("missing");
      return;
    }

     setStatus("sent");
    setForm({ name: "", email: "", subject: "", message: "" });
  };

  return (
    <div className="page contact-page" id="top">
      <ContactHeader menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
      <main className="contact-main">
        <ContactHero />

        <section className="contact-content section">
          <aside className="contact-options">
            <h2>{t("contact_get_in_touch")}</h2>
            <p>{t("contact_choose_reach")}</p>
            {contactOptions.map((option) => (
              <ContactOptionCard option={option} key={option.title} />
            ))}
          </aside>

          <ContactForm
            form={form}
            status={status}
            handleChange={handleChange}
            submit={submit}
          />
        </section>

        <ContactCta />
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
            <div className="socials" aria-label="Social media links">
              <a href="#facebook" aria-label="Facebook">
                <FaFacebookF size={13} />
              </a>
              <a href="#twitter" aria-label="Twitter">
                <FaXTwitter size={13} />
              </a>
              <a href="#instagram" aria-label="Instagram">
                <FaInstagram size={14} />
              </a>
              <a href="#linkedin" aria-label="LinkedIn">
                <FaLinkedinIn size={13} />
              </a>
            </div>
          </div>

          {Object.entries(footerLinks).map(([title, links]) => (
            <FooterColumn title={title} links={links} key={title} />
          ))}

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
