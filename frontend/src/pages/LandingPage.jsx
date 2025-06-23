import React, { useState, useEffect } from "react";
import Navbar from "../components/NavBar"
import "../styles/LandingPage.css";
import BG from "../assets/BG.png";
import api from "../api";

const LandingPage = () => {
  const [publishedPages, setPublishedPages] = useState([]);
  const [loading, setLoading] = useState(true);

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
    { href: "/", label: "Support" },
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
              <a href="/custom-website" className="btn btn-secondary">Request a Custom Website</a>
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
            <div className="pages-grid">
              {publishedPages.map((page) => (
                <div key={page.id} className="page-card" onClick={() => window.location.href = `/landingpage/${page.id}`}>
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
          ) : (
            <div className="no-pages">
              <p>No published pages yet. Be the first to create one!</p>
              <a href="/login" className="btn btn-primary">Create Your Page</a>
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default LandingPage;
