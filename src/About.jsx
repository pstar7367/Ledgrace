import { useState } from "react";
import {
  ArrowRight,
  Heart,
  Lightbulb,
  Menu,
  ShieldCheck,
  Target,
  TrendingUp,
  Users,
  X,
} from "lucide-react";
import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaTwitter,
  FaXTwitter,
} from "react-icons/fa6";
import { Brand, Dashboard, IconBubble } from "./index.jsx";
import "./App.css";

const values = [
  [
    ShieldCheck,
    "Trust & Security",
    "We prioritize the security and privacy of your data above everything else.",
    "teal",
  ],
  [
    Lightbulb,
    "Simplicity",
    "We believe powerful financial management should be simple and easy to use.",
    "blue",
  ],
  [
    Users,
    "Empowerment",
    "We empower you with insights and tools to make confident financial decisions.",
    "purple",
  ],
  [
    TrendingUp,
    "Growth",
    "We are committed to helping you grow your money and achieve your goals.",
    "teal",
  ],
  [
    Heart,
    "Integrity",
    "We operate with honesty, transparency, and a customer-first mindset.",
    "pink",
  ],
];
const people = [
  [
    "TA",
    "Tunde Adedayo",
    "Founder & CEO",
    "Passionate about fintech and helping people achieve financial freedom.",
  ],
  [
    "CE",
    "Chinoma Eze",
    "CTO",
    "Tech enthusiast focused on building secure and scalable financial solutions.",
  ],
  [
    "DO",
    "David Okoro",
    "Head of Product",
    "Product strategist dedicated to creating simple and meaningful user experiences.",
  ],
  [
    "BA",
    "Bukola Adebisi",
    "Head of Design",
    "Designing beautiful, intuitive experiences that make finance approachable for all.",
  ],
];
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

export default function About() {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <div className="page about-page" id="top">
      <header className="site-header feature-header about-header">
        <a href="/">
          <Brand />
        </a>
        <div className={`site-nav-area ${menuOpen ? "open" : ""}`}>
        <nav className={menuOpen ? "open" : ""}>
          <a href="/">Home</a>
          <a href="/features">Features</a>
          <a href="/pricing">Pricing</a>
          <a className="active" href="/about">
            About
          </a>
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
      <main className="about-main">
        <section className="about-hero section">
          <div>
            <span className="eyebrow">About Ledgrace</span>
            <h1>
              Building A Better
              <br />
              Financial Future,
              <br />
              <em>Together.</em>
            </h1>
            <p>
              Ledgrace was created to help people take control of their finances
              with confidence, and ease. We believe everyone deserves the tools
              and insights to make smarter financial decisions and live a better
              life.
            </p>
            <a className="button primary" href="#mission">
              Our Story <ArrowRight size={17} />
            </a>
          </div>
          <div className="about-dashboard">
            <Dashboard />
          </div>
        </section>
        <section className="mission section" id="mission">
          <h2>
            <Target /> Our Mission
          </h2>
          <p>
            To empower individuals and families to take control of their
            financial lives
            <br />
            by providing simple, intelligent, and secure tools that make money
            <br />
            management effortless and meaningful.
          </p>
          <h3>Our Values</h3>
          <div className="value-grid">
            {values.map(([Icon, title, text, color]) => (
              <article key={title}>
                <IconBubble icon={Icon} color={color} />
                <h4>{title}</h4>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </section>
        <section className="team section">
          <h2>The People Behind Ledgrace</h2>
          <p>
            A passionate team dedicated to building a better financial future
            for everyone.
          </p>
          <div className="team-grid">
            {people.map(([initials, name, role, copy], i) => (
              <article key={name}>
                <div className={`person-avatar avatar-${i}`}>{initials}</div>
                <div>
                  <h3>{name}</h3>
                  <b>{role}</b>
                  <p>{copy}</p>
                  <span>
                    <FaLinkedinIn /> <FaTwitter />
                  </span>
                </div>
              </article>
            ))}
          </div>
        </section>
        <section className="stats section">
          <div>
            <IconBubble icon={Users} color="teal" />
            <span>
              <b>10K+</b>
              <strong>Happy Users</strong>
              <p>And growing every day</p>
            </span>
          </div>
          <div>
            <IconBubble icon={ArrowRight} color="blue" />
            <span>
              <b>250K+</b>
              <strong>Transactions Tracked</strong>
              <p>Across our platform</p>
            </span>
          </div>
          <div>
            <IconBubble icon={Target} color="purple" />
            <span>
              <b>98%</b>
              <strong>User Satisfaction</strong>
              <p>Based on customer feedback</p>
            </span>
          </div>
          <div>
            <IconBubble icon={ShieldCheck} color="teal" />
            <span>
              <b>99.9%</b>
              <strong>Data Security</strong>
              <p>Your data is always safe</p>
            </span>
          </div>
        </section>
        <section className="cta section" id="start">
          <div>
            <IconBubble icon={ShieldCheck} color="white" />
          </div>
          <span>
            <h2>Join Thousands Of People Taking Control Of Their Finances</h2>
            <p>
              Start your journey to better financial health with Ledgrace today.
            </p>
          </span>
          <a className="button cta-button" href="/signup">
            Get Started Free <ArrowRight size={17} />
          </a>
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
