import React from "react";
import { FaHome, FaInfoCircle, FaHeadset, FaSignOutAlt } from "react-icons/fa";
import "../styles/NavBar.css"


const Navbar = ({ links }) => {
    const iconMap = {
        "Home": <FaHome />,
        "About Us": <FaInfoCircle />,
        "Support": <FaHeadset />,
        "Logout": <FaSignOutAlt />,
      };
      
    return (
        <header className="header">
          <a href="/" className="logo">CreatiMate</a>
    
          <nav className="navbar">
            {links.map((link, index) => (
              <a key={index} href={link.href}>
                {iconMap[link.label]} <span>{link.label}</span>
              </a>
            ))}
          </nav>
        </header>
      );
}
export default Navbar;
