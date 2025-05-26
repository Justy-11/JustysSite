import React from "react";
import { Link } from "react-router-dom";
import { FaHome, FaInfoCircle, FaHeadset, FaSignOutAlt } from "react-icons/fa";
import "../styles/NavBar.css";

const Navbar = ({ links }) => {
  const iconMap = {
    "Home": <FaHome />,
    "About Us": <FaInfoCircle />,
    "Support": <FaHeadset />,
    "Logout": <FaSignOutAlt />,
  };

  return (
    <header className="header">
      <Link to="/" className="logo">CreatiMate</Link>

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
