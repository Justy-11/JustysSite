import React, { useState } from "react";
import { useLocation, Link } from "react-router-dom";
import {
  FaLayerGroup, FaPlusSquare, FaFileUpload, FaEye,
  FaGlobe, FaChartBar, FaCog, FaQuestionCircle,
  FaBars, FaTimes, FaHome, FaPlus
} from "react-icons/fa";
import "../styles/SideBar.css";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const toggleSidebar = () => setIsOpen(!isOpen);

  const location = useLocation();
  const currentPath = location.pathname;

  const links = [
    { href: "/", icon: <FaHome />, label: "Dashboard" },
    { href: "/create", icon: <FaPlus />, label: "Create/Edit Page" },
    { href: "/add-products", icon: <FaPlusSquare />, label: "Add Products" },
    { href: "/preview", icon: <FaEye />, label: "Preview Page" },
    { href: "/publish", icon: <FaGlobe />, label: "Publish Page" },
    { href: "/settings", icon: <FaCog />, label: "Settings" },
    { href: "/help", icon: <FaQuestionCircle />, label: "Help" },
  ];

  return (
    <>
      <div className="hamburger-icon" onClick={toggleSidebar}>
        {isOpen ? <FaTimes /> : <FaBars />}
      </div>

      <div className={`sidebar ${isOpen ? "sidebar-open" : ""}`}>
        <div className="sidebar-title">Menu</div>
        <ul className="sidebar-list">
          {links.map(link => (
            <li key={link.href} className={currentPath === link.href ? "active" : ""}>
              <Link to={link.href}> {/* ✅ use Link instead of <a> */}
                {link.icon} {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {isOpen && <div className="sidebar-backdrop" onClick={toggleSidebar}></div>}
    </>
  );
};

export default Sidebar;
