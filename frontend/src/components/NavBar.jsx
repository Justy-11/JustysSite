import React from "react";
import { Link } from "react-router-dom";
import { FaHome, FaInfoCircle, FaHeadset, FaSignOutAlt, FaUserCircle } from "react-icons/fa";
import "../styles/NavBar.css";
import logoCreatimate from '../assets/logo-creatimate.svg';

const Navbar = ({ links }) => {
  const iconMap = {
    "Home": <FaHome />,
    "About Us": <FaInfoCircle />,
    "Contact Us": <FaHeadset />,
    "Logout": <FaSignOutAlt />,
    "Profile": <FaUserCircle />,
  };

  return (
    <header className="header">
      <Link to="/" className="logo" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
        <img src={logoCreatimate} alt="CreatiMate Logo" className="navbar-logo" style={{ height: 36 }} />
      </Link>

      <nav className="navbar">
        {links.map((link, index) => (
          <Link key={index} to={link.href}>
            {iconMap[link.label]} <span>{link.label}</span>
          </Link>
        ))}
      </nav>
    </header>
  );
};

export default Navbar;
