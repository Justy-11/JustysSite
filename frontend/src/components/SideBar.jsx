import React, { useState } from "react";
import {FaLayerGroup, FaPlusSquare, FaFileUpload, FaEye, FaGlobe, FaChartBar, FaCog, FaQuestionCircle,FaBars, FaTimes, FaHome, FaPlus } from "react-icons/fa";
import "../styles/SideBar.css";

const Sidebar = () => {

    const [isOpen, setIsOpen] = useState(false);
    const toggleSidebar = () => setIsOpen(!isOpen);

    return (
        <>
        <div className="hamburger-icon" onClick={toggleSidebar}>
            {isOpen ? <FaTimes /> : <FaBars />}
        </div>

        <div className={`sidebar ${isOpen ? "sidebar-open" : ""}`}>
            <div className="sidebar-title">Menu</div>
            <ul className="sidebar-list">
                <li><a href="/"><FaHome /> Dashboard</a></li>
                <li><a href="/edit"><FaPlus /> Create/Edit Page</a></li>
                <li><a href="/collections"><FaLayerGroup /> Manage Collections</a></li>
                <li><a href="/add-products"><FaPlusSquare /> Add Products</a></li>
                <li><a href="/bulk-upload"><FaFileUpload /> Bulk Upload</a></li>
                <li><a href="/preview"><FaEye /> Preview Page</a></li>
                <li><a href="/publish"><FaGlobe /> Publish Page</a></li>
                <li><a href="/analytics"><FaChartBar /> Analytics</a></li>
                <li><a href="/settings"><FaCog /> Settings</a></li>
                <li><a href="/help"><FaQuestionCircle /> Help</a></li>
            </ul>
        </div>

      {/* Dimmed background when sidebar is open on mobile */}
      {isOpen && <div className="sidebar-backdrop" onClick={toggleSidebar}></div>}
    </>
        
    );
};

export default Sidebar;
