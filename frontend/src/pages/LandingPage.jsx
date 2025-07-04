import React, { useState, useEffect } from "react";
import Navbar from "../components/NavBar"
import "../styles/LandingPage.css";
import BG from "../assets/BG.png";
import api from "../api";
import { useNavigate } from "react-router-dom";
import { FaInstagram, FaGithub, FaXTwitter } from "react-icons/fa6";

const LandingPage = () => {
  const [publishedPages, setPublishedPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  
  const PAGE_SIZE = 20;
  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(publishedPages.length / PAGE_SIZE);
  const paginatedPages = publishedPages.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => {
    const fetchPublishedPages = async () => {
      try {
        const response = await api.get("/api/pages/public/");
        setPublishedPages(response.data || []);
      } catch (error) {
        console.error("Error fetching published pages:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPublishedPages();
  }, []);

  const navLinks = [
    { href: "/landingpage", label: "Home" },
    { href: "/about", label: "About Us" },
    { href: "/contact", label: "Contact Us" },
  ];

  const getShortDescription = (description) => {
    if (!description) return "";
    const textOnly = description.replace(/<[^>]+>/g, '');
    return textOnly.length > 100 ? textOnly.slice(0, 100) + '...' : textOnly;
  };

  return (
    <>
      <Navbar links={navLinks} />
      
      <section className="hero-section">
        <div className="hero-wrapper">
          <div className="hero-content">
            <h1 className="hero-main-title">
              WE EMPOWER CREATORS BEFORE WE BUILD PRODUCTS
            </h1>
            <p className="hero-subtitle">
              Build your brand, launch your dream – no code, no hassle.
            </p>
            <div className="hero-taglines">
              <p>Crafting your digital vision into reality</p>
              <p>Smart ideas deserve smart tools</p>
              <p>Build your own websites – without a single line of code</p>
              <p>Create your business, your store, your world – powered by us</p>
            </div>

            <div className="hero-buttons">
              <a href="/login" className="btn btn-primary">Create a Product Page</a>
              <a href="https://forms.gle/sPmXJzZwM8phYzCS7" className="btn btn-secondary">Request a Custom Website</a>
            </div>
          </div>

          <div className="hero-image">
            <img src={BG} alt="Product preview" />
          </div>
        </div>
      </section>

      {/* Published Pages Section */}
      <section className="published-pages-section">
        <div className="container">
          <h2 className="section-title">Discover Amazing Products</h2>
          <p className="section-subtitle">Explore pages created by our community of creators</p>
          
          {loading ? (
            <div className="loading-pages">Loading published pages...</div>
          ) : publishedPages.length > 0 ? (
            <>
              <div className="pages-grid">
                {paginatedPages.map((page) => (
                  <div key={page.id} className="page-card" onClick={() => navigate(`/landingpage/${page.id}`)}>
                    <div className="page-card-image">
                      {page.banner_image ? (
                        <img src={page.banner_image} alt={page.product_name} />
                      ) : (
                        <div className="page-card-placeholder">No Banner Image</div>
                      )}
                    </div>
                    <div className="page-card-content">
                      <div className="page-card-profile">
                        {page.profile_image ? (
                          <img src={page.profile_image} alt="Profile" className="page-profile-image" />
                        ) : (
                          <div className="page-profile-placeholder"></div>
                        )}
                      </div>
                      <div className="page-card-details">
                        <h3 className="page-title">{page.product_name || "Product Name"}</h3>
                        <p className="page-tagline">{page.tagline || "Product Tagline"}</p>
                        <p className="page-description">
                          {getShortDescription(page.about || "No description available")}
                        </p>
                        <div className="page-contact-info">
                          {page.email && <span className="contact-item">📧 {page.email}</span>}
                          {page.phone && <span className="contact-item">📞 {page.phone}</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {totalPages > 1 && (
                <div className="pagination-controls">
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Prev</button>
                  <span>Page {page} of {totalPages}</span>
                  <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Next</button>
                </div>
              )}
            </>
          ) : (
            <div className="no-pages">
              <p>No published pages yet. Be the first to create one!</p>
              <a href="/login" className="btn btn-primary">Create Your Page</a>
            </div>
          )}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer-section">
        <div className="footer-container">
          <div className="footer-column">
            <h4>Quick Links</h4>
            <ul>
              <li><a href="/about">About</a></li>
              <li><a href="/privacy">Privacy Policy</a></li>
              <li><a href="/terms">Terms of Service</a></li>
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
              <a href="https://twitter.com/justy0011" target="_blank" rel="noopener noreferrer" aria-label="X">
                <FaXTwitter size={24} color="#1da1f2" />
              </a>
          </div>
          </div>
          <div className="footer-column">
            <h4>About This Site</h4>
            <p>Made with <span style={{ color: '#ff4d6d', fontSize: '1.2em', verticalAlign: 'middle' }}>♥</span> to empower creators and small businesses everywhere.</p>
            <p style={{ marginTop: '16px', color: '#a0a0a0', fontSize: '0.95em' }}>© 2025 CreatiMate. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </>
  );
};

export default LandingPage;
