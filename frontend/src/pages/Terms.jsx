import React from "react";
import Navbar from "../components/NavBar";
import "../styles/Terms.css";
import {
  FaBalanceScale,
  FaFileAlt,
  FaUserSecret,
  FaExclamationTriangle,
  FaGavel,
  FaEnvelope,
  FaUsers,
  FaStar
} from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';
import { FaInstagram, FaGithub } from 'react-icons/fa';

const navLinks = [
  { href: "/landingpage", label: "Home" },
  { href: "/about", label: "About Us" },
  { href: "/contact", label: "Contact Us" },
];

const Terms = () => (
  <div className="terms-gradient-bg">
    <Navbar links={navLinks} />
    <div className="terms-container">
      <h1 className="terms-title"><FaFileAlt className="terms-title-icon" /> Terms of Service</h1>
      <p className="terms-updated">Last updated: June 7, 2025</p>
      <div className="terms-card glass-card">
        <h2><FaBalanceScale className="terms-section-icon" /> Acceptance of Terms</h2>
        <p>By accessing or using CreatiMate, you agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree, please do not use our platform.</p>
      </div>
      <div className="terms-card glass-card">
        <h2><FaStar className="terms-section-icon" /> Purpose of the Website</h2>
        <p>CreatiMate is provided to empower creators and small businesses to build, share, and manage their own product or service pages. The platform is intended for informational and business purposes only.</p>
      </div>
      <div className="terms-card glass-card">
        <h2><FaExclamationTriangle className="terms-section-icon" /> Use Restrictions</h2>
        <p>You may not use the site for unlawful purposes, to infringe on intellectual property, or to harass, abuse, or harm others. Automated data collection, reverse engineering, or unauthorized access is strictly prohibited.</p>
      </div>
      <div className="terms-card glass-card">
        <h2><FaUserSecret className="terms-section-icon" /> Intellectual Property</h2>
        <p>All content, trademarks, and intellectual property on CreatiMate are owned by us or our licensors. You may not copy, reproduce, or distribute any content without permission.</p>
      </div>
      <div className="terms-card glass-card">
        <h2><FaExclamationTriangle className="terms-section-icon" /> Disclaimers</h2>
        <p>CreatiMate is provided "as is" without warranties of any kind. We do not guarantee the accuracy, reliability, or availability of the platform or its content.</p>
      </div>
      <div className="terms-card glass-card">
        <h2><FaGavel className="terms-section-icon" /> Limitation of Liability</h2>
        <p>To the fullest extent permitted by law, CreatiMate and its affiliates shall not be liable for any indirect, incidental, or consequential damages arising from your use of the platform.</p>
      </div>
      <div className="terms-card glass-card">
        <h2><FaUsers className="terms-section-icon" /> Age Restrictions</h2>
        <p>You must be at least 16 years old or the age of majority in your jurisdiction to use this platform. By using CreatiMate, you represent and warrant that you meet these requirements.</p>
      </div>
      <div className="terms-card glass-card">
        <h2><FaGavel className="terms-section-icon" /> Governing Law</h2>
        <p>These Terms are governed by the laws of your country of residence, without regard to conflict of law principles. Any disputes shall be resolved in the courts of that jurisdiction.</p>
      </div>
      <div className="terms-card glass-card terms-legal">
        <p>We may update these Terms from time to time. Continued use of the platform constitutes acceptance of the revised Terms.</p>
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
          <p>Made with <span className="terms-heart">♥</span> to empower creators and small businesses everywhere.</p>
          <p className="terms-footer-copy">© 2025 CreatiMate. All rights reserved.</p>
        </div>
      </div>
    </footer>
  </div>
);

export default Terms;
