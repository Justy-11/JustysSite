import React, { useState } from "react";
import Navbar from "../components/NavBar";
import "../styles/ContactUs.css";
import { FaEnvelope, FaPhone, FaQuestionCircle, FaClock, FaCheckCircle, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { MdSubject } from 'react-icons/md';
import { FaInstagram, FaGithub } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';
import api from "../api";
import { showSuccessToast, showErrorToast } from "../utils/toastUtils";

const navLinks = [
  { href: "/landingpage", label: "Home" },
  { href: "/about", label: "About Us" },
  { href: "/contact", label: "Contact Us" },
];

const inquiryTypes = [
  { value: '', label: 'Select inquiry type' },
  { value: 'general', label: 'General Question' },
  { value: 'technical', label: 'Technical Support' },
  { value: 'feature', label: 'Feature Request' },
  { value: 'business', label: 'Business Inquiry' },
  { value: 'bug', label: 'Bug Report' },
  { value: 'feedback', label: 'Feedback' },
];

const faqs = [
  {
    q: "How quickly will I get a response?",
    a: "General inquiries are answered within 24-48 hours. Technical support is usually faster (12-24 hours). Business inquiries may take 2-3 business days."
  },
  {
    q: "Can I request a custom website?",
    a: "Absolutely! Use the inquiry type 'Business Inquiry' or 'Feature Request' and describe your needs. We'll get back to you with a quote or next steps."
  },
  {
    q: "How do I report a bug or technical issue?",
    a: "Select 'Bug Report' as your inquiry type and provide as much detail as possible. Screenshots and steps to reproduce are very helpful!"
  },
  {
    q: "Is my data safe when I contact you?",
    a: "Yes. We use secure protocols and never share your contact details. See our Privacy Policy for more info."
  },
  {
    q: "Can I get help with my product page?",
    a: "Yes! Select 'Technical Support' or 'General Question' and describe your issue. Our team is happy to help."
  },
];

const ContactUs = () => {
  const [form, setForm] = useState({ name: "", email: "", subject: "", inquiryType: "", message: "" });
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [faqOpen, setFaqOpen] = useState(Array(faqs.length).fill(false));

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFaqToggle = idx => {
    setFaqOpen(faqOpen => faqOpen.map((open, i) => i === idx ? !open : open));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    
    // Validate inquiry type
    if (!form.inquiryType || form.inquiryType === '') {
      showErrorToast("Please select an inquiry type");
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await api.post("/api/contact/", {
        name: form.name,
        email: form.email,
        subject: form.subject,
        inquiryType: form.inquiryType,
        message: form.message
      });
      
      showSuccessToast(response.data.message || "Message sent successfully!");
      setSuccess(true);
      setForm({ name: "", email: "", subject: "", inquiryType: "", message: "" });
    } catch (error) {
      console.error("Contact form error:", error.response?.data || error.message);
      showErrorToast(error.response?.data?.error || "Failed to send message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="contact-gradient-bg">
      <Navbar links={navLinks} />
      <div className="contact-container">
        <h1 className="contact-title"><FaEnvelope className="contact-title-icon" /> Contact Us</h1>
        <div className="contact-content">
          {/* Contact Form Card */}
          <div className="contact-card glass-card">
            <h2><FaEnvelope className="contact-section-icon" /> Send us a message</h2>
            {success && <div className="contact-success"><FaCheckCircle style={{marginRight: 6}} /> Thank you! Your message has been sent. We'll get back to you soon.</div>}
            <form className="contact-form" onSubmit={handleSubmit}>
              <input type="text" name="name" placeholder="Your Name" value={form.name} onChange={handleChange} required />
              <input type="email" name="email" placeholder="Your Email" value={form.email} onChange={handleChange} required />
              <div className="contact-form-row">
                <select name="inquiryType" value={form.inquiryType} onChange={handleChange} required>
                  {inquiryTypes.map((t, i) => <option key={i} value={t.value}>{t.label}</option>)}
                </select>
                <input type="text" name="subject" placeholder="Subject" value={form.subject} onChange={handleChange} required />
              </div>
              <textarea name="message" placeholder="Message" value={form.message} onChange={handleChange} required rows={5} />
              <button type="submit" disabled={loading}>{loading ? "Sending..." : "Send Message"}</button>
            </form>
          </div>
          {/* Contact Info & Response Times Card */}
          <div className="contact-card glass-card contact-alt">
            <h2><FaPhone className="contact-section-icon" /> Other ways to reach us</h2>
            <ul className="contact-methods">
              <li><FaEnvelope style={{marginRight: 6}} /> Email: <a href="mailto:support@creatimate.com">support@creatimate.com</a></li>
              <li><MdSubject style={{marginRight: 6}} /> Business: <a href="mailto:business@creatimate.com">business@creatimate.com</a></li>
              <li><FaEnvelope style={{marginRight: 6}} /> Technical: <a href="mailto:tech@creatimate.com">tech@creatimate.com</a></li>
            </ul>
            <div className="contact-response-times">
              <h3><FaClock style={{marginRight: 6}} /> Response Times</h3>
              <ul>
                <li><span className="response-type general">General Inquiries:</span> 24-48 hours</li>
                <li><span className="response-type tech">Technical Support:</span> 12-24 hours</li>
                <li><span className="response-type business">Business Inquiries:</span> 2-3 business days</li>
                <li><span className="response-type bug">Bug Reports:</span> 6-12 hours</li>
              </ul>
            </div>
            <div className="contact-socials">
              <a href="https://instagram.com/" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <FaInstagram size={22} color="#E1306C" />
              </a>
              <a href="https://github.com/" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
                <FaGithub size={22} color="#fff" />
              </a>
              <a href="https://x.com/" target="_blank" rel="noopener noreferrer" aria-label="X">
                <FaXTwitter size={22} color="#1da1f2" />
              </a>
            </div>
          </div>
          {/* FAQ Card */}
          <div className="contact-card glass-card contact-faq">
            <h2><FaQuestionCircle className="contact-section-icon" /> Frequently Asked Questions</h2>
            <div className="faq-list">
              {faqs.map((faq, i) => (
                <div className="faq-item" key={i}>
                  <button className="faq-question" onClick={() => handleFaqToggle(i)} type="button">
                    {faq.q}
                    {faqOpen[i] ? <FaChevronUp className="faq-chevron" /> : <FaChevronDown className="faq-chevron" />}
                  </button>
                  {faqOpen[i] && <div className="faq-answer">{faq.a}</div>}
                </div>
              ))}
            </div>
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
            <p>Made with <span className="contact-heart">♥</span> to empower creators and small businesses everywhere.</p>
            <p className="contact-footer-copy">© 2025 CreatiMate. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ContactUs;
