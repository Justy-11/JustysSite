import React from "react";
import Navbar from "../components/NavBar";
import "../styles/About.css";
import { FaBullseye, FaLightbulb, FaUsers, FaStar, FaRocket, FaCogs, FaMobileAlt, FaLock, FaChartBar } from 'react-icons/fa';
import { GiTeamIdea } from 'react-icons/gi';
import { FaInstagram, FaGithub } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';

const navLinks = [
  { href: "/landingpage", label: "Home" },
  { href: "/about", label: "About Us" },
  { href: "/contact", label: "Contact Us" },
];

const features = [
  { icon: <FaRocket />, title: "No-code Builder", desc: "Create product and service pages instantly, no coding required." },
  { icon: <FaCogs />, title: "Custom Websites", desc: "Request fully custom websites tailored to your needs." },
  { icon: <FaMobileAlt />, title: "Mobile Friendly", desc: "Modern, responsive design for all devices." },
  { icon: <FaLock />, title: "Secure Auth", desc: "Safe login with Google and email, using secure cookies." },
  { icon: <FaChartBar />, title: "Analytics", desc: "Decision counters and insights to help you grow." },
  { icon: <FaStar />, title: "Beautiful UI", desc: "Dark theme, gold/purple accents, and a delightful experience." },
  { icon: <FaUsers />, title: "Community Support", desc: "Get help and share ideas with other creators." },
];

const stats = [
  { icon: <FaStar color="#ffcc00" />, value: "10K+", label: "Pages Created" },
  { icon: <FaUsers color="#7c54bb" />, value: "5K+", label: "Active Creators" },
  { icon: <FaChartBar color="#ff4d6d" />, value: "1M+", label: "Decisions Made" },
];

const team = [
  { name: "Justy", role: "Founder & Developer", desc: "Passionate about solving everyday problems through technology" }
];

const About = () => (
  <div className="about-gradient-bg">
    <Navbar links={navLinks} />
    <div className="about-container">
      <h1 className="about-title"><FaBullseye className="about-title-icon" /> About CreatiMate</h1>
      <div className="about-card glass-card">
        <h2><FaBullseye className="about-section-icon" /> Our Purpose</h2>
        <p>CreatiMate exists to empower creators, entrepreneurs, and small businesses to launch their online presence with ease—no coding required.</p>
      </div>
      <div className="about-card glass-card">
        <h2><FaLightbulb className="about-section-icon" /> Mission Statement</h2>
        <p>Our mission is to democratize web creation, making it accessible, affordable, and enjoyable for everyone.</p>
      </div>
      <div className="about-card glass-card">
        <h2><FaRocket className="about-section-icon" /> Features</h2>
        <div className="about-features-grid">
          {features.map((f, i) => (
            <div className="feature-card" key={i}>
              <div className="feature-icon">{f.icon}</div>
              <div>
                <h4>{f.title}</h4>
                <p>{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="about-card glass-card">
        <h2><FaChartBar className="about-section-icon" /> Our Impact</h2>
        <div className="about-stats-grid">
          {stats.map((s, i) => (
            <div className="stat-card" key={i}>
              <div className="stat-icon">{s.icon}</div>
              <div className="stat-value">{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="about-card glass-card">
        <h2><FaLightbulb className="about-section-icon" /> Why We Built This</h2>
        <p>We saw how difficult and expensive it can be to get online. CreatiMate was built to break down those barriers, giving everyone the tools to share their ideas, products, and passions with the world.</p>
      </div>
      <div className="about-card glass-card">
        <h2><GiTeamIdea className="about-section-icon" /> Meet the Founder</h2>
        <div className="about-team">
          {team.map((member, i) => (
            <div className="team-member glass-card" key={i}>
              <div className="team-avatar" />
              <div>
                <h4>{member.name}</h4>
                <p>{member.role}</p>
                <p className="about-founder-desc">{member.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
    <footer className="footer-section">
      <div className="footer-container">
        <div className="footer-column">
          <h4>Quick Links</h4>
          <ul>
            <li><a href="/about">About</a></li>
            <li><a href="/privacy-policy">Privacy Policy</a></li>
            <li><a href="/terms-of-service">Terms of Service</a></li>
            <li><a href="/contact">Contact Us</a></li>
          </ul>
        </div>
        <div className="footer-column">
          <h4>Follow Us</h4>
          <div className="footer-social-links">
            <a href="https://instagram.com/justy__11" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <FaInstagram size={24} color="#E1306C" />
            </a>
            <a href="https://github.com/Justy-11" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
              <FaGithub size={24} color="#fff" />
            </a>
            <a href="https://x.com/justy0011" target="_blank" rel="noopener noreferrer" aria-label="X">
              <FaXTwitter size={24} color="#1da1f2" />
            </a>
          </div>
        </div>
        <div className="footer-column">
          <h4>About This Site</h4>
          <p>Made with <span className="about-heart">♥</span> to empower creators and small businesses everywhere.</p>
          <p className="about-footer-copy">© 2025 CreatiMate. All rights reserved.</p>
        </div>
      </div>
    </footer>
  </div>
);

export default About;
