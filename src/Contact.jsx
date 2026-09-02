import { useState } from "react";
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
  return (
    <header className="site-header contact-header">
      <a href="/">
        <Brand />
      </a>
      <nav className={menuOpen ? "open" : ""}>
        {navLinks.map((item) => (
          <a
            key={item.label}
            className={item.active ? "active" : ""}
            href={item.href}
            onClick={() => setMenuOpen(false)}
          >
            {item.label}
          </a>
        ))}
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
  );
}

function ContactHero() {
  return (
    <section className="contact-hero section">
      <div className="contact-hero-copy">
        <span className="eyebrow">✉ We're Here To Help</span>
        <h1>
          Let's Talk! We'd Love
          <br />
          To Hear From <em>You.</em>
        </h1>
        <p>
          Have a question, feedback, or need support?
          <br />
          Our team is ready to help you get the most out of Ledgrace.
        </p>
        <div className="response-note">
          <IconBubble icon={Clock3} color="blue" />
          <span>
            Our support team usually responds within
            <br />
            <b>24 hours</b> on business days.
          </span>
        </div>
      </div>

      <div className="contact-illustration">
        <div className="contact-envelope">
          <div className="letter">
            We're here
            <br />
            <em>for you!</em>
          </div>
          <span>💬</span>
          <i>☎</i>
        </div>
      </div>
    </section>
  );
}

function ContactOptionCard({ option }) {
  const { icon: Icon, title, mainText, detail, href, color } = option;
  return (
    <a
      className="contact-option-card"
      href={href}
      target={href.startsWith("http") ? "_blank" : undefined}
      rel="noreferrer"
    >
      <IconBubble icon={Icon} color={color} />
      <span>
        <b>{title}</b>
        <strong>{mainText}</strong>
        <small>{detail}</small>
      </span>
      <ArrowRight size={17} />
    </a>
  );
}

function ContactForm({ form, status, handleChange, submit }) {
  return (
    <form className="contact-form" id="form" onSubmit={submit}>
      <h2>Send Us A Message</h2>
      <p>Fill out the form below and we'll get back to you.</p>

      <div className="field-row">
        <label>
          Full Name
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Enter your full name"
          />
        </label>
        <label>
          Email Address
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Enter your email address"
          />
        </label>
      </div>

      <label>
        Subject
        <input
          name="subject"
          value={form.subject}
          onChange={handleChange}
          placeholder="What is this about?"
        />
      </label>

      <label>
        Message
        <textarea
          name="message"
          value={form.message}
          onChange={handleChange}
          placeholder="Type your message here..."
        />
      </label>

      <div className="form-bottom">
        <button className="button primary" type="submit">
          Send Message <Send size={15} />
        </button>
        <span>
          <ShieldCheck size={15} /> Your information is safe with us.
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
  return (
    <section className="contact-cta section">
      <div className="contact-cta-copy">
        <IconBubble icon={Mail} color="blue" />
        <span>
          <h2>Ready To Take Control Of Your Finances?</h2>
          <p>
            Join thousands of people who are building a better financial future
            with Ledgrace.
          </p>
        </span>
      </div>
      <a className="button outline" href="/signup">
        Get Started Free <ArrowRight size={17} />
      </a>
    </section>
  );
}

export default function Contact() {
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
      setStatus("Please complete all fields before sending your message.");
      return;
    }

    setStatus(
      `Thanks, ${form.name}! Your message has been sent to our support team.`,
    );
    setForm({ name: "", email: "", subject: "", message: "" });
  };

  return (
    <div className="page contact-page" id="top">
      <ContactHeader menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
      <main className="contact-main">
        <ContactHero />

        <section className="contact-content section">
          <aside className="contact-options">
            <h2>Get In Touch</h2>
            <p>Choose the best way to reach us.</p>
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
