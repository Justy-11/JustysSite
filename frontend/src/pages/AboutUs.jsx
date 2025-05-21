import React from "react";
import Navbar from "../components/NavBar";
import "../styles/AboutUs.css";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About Us" },
  { href: "/", label: "Support" },
  { href: "/logout", label: "Logout" },
];

const AboutUs = () => {
  return (
    <div className="about-page">
      <Navbar links={navLinks} />
      <section className="who-we-are-section">
        <div className="content">
          <h1>Who We Are</h1>
          <p>
            At Justys' Site, we're on a mission to make launching your online presence effortless.
            Whether you're a small business owner, freelancer, or creator, our platform lets you 
            create and share your own product or service page instantly — no coding required.
          </p>
          <p>
            We also help users bring their unique visions to life with custom-built websites. From 
            landing pages to full-featured domains, we take care of the tech while you focus on growing your brand.
          </p>
          <div className="vision">
            <span className="vision-line"></span>
            <p className="vision-text">
              <strong>Our Vision:</strong> To democratize web presence by giving everyone the power 
              to launch and manage their own digital storefront or service page — simply and affordably.
            </p>
          </div>
        </div>
      </section>

      <section className="founders-section">
        <div className="content">
          <h2>The Founders</h2>
          <div className="founder-container">
            <div className="founder">
              <div className="founder-image founder-placeholder"></div>
              <h3>Jathurshan Pathmarasa</h3>
              <h4>Founder & CEO</h4>
              <p>
                Jathurshan Pathmarasa is the founder and visionary behind Justys' Site. With a background in computer engineering and a focus on data management, machine learning, and web technologies, he is passionate about creating accessible and innovative digital platforms. Through Justys' Site, Jathurshan aims to empower individuals and small businesses to establish their online presence with ease and confidence.
              </p>
              <button className="read-more">Read More</button>
            </div>
            <div className="founder">
              <div className="founder-image founder-placeholder"></div>
              <h3>Jane Smith</h3>
              <h4>Head of Product</h4>
              <p>
                Jane Smith brings a wealth of experience in product development and user experience design. With a PhD in Human-Computer Interaction, she ensures that every feature on Justys' Site is intuitive and user-centric, driving our mission to make technology accessible to all.
              </p>
              <button className="read-more">Read More</button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutUs;