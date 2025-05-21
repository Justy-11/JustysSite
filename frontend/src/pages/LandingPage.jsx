import React from "react";
import Navbar from "../components/NavBar"
import "../styles/LandingPage.css";
import BG from "../assets/BG.png";

const LandingPage = () => {
  const navLinks = [
    { href: "/landingpage", label: "Home" },
    { href: "/about", label: "About Us" },
    { href: "/", label: "Support" },
    
  ];

  return (
    <>
      <Navbar links={navLinks} />
      
      <section className="hero-section">
        <div class="hero-wrapper">
          <div className="hero-content">
            <h1>Launch your own product or service page</h1>
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
    </>
  );
};

export default LandingPage;
