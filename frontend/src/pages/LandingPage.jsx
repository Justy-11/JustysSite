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
          
          <h1 className="hero-main-title">
            WE EMPOWER CREATORS BEFORE WE BUILD PRODUCTS
          </h1>
          <p className="hero-subtitle">
            Build your brand, launch your dream – no code, no hassle.
          </p>
          <div className="hero-taglines">
            <p>Crafting your digital vision into reality</p>
            <p>Smart ideas deserve smart tools</p>
            <p>Customize every page, your way</p>
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
    </>
  );
};

export default LandingPage;
