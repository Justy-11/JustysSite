import React, { useState } from "react";
import "../styles/NavBar.css"

const Navbar = ({ links }) => {
    const [isOpen, setIsOpen] = useState(false);

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };

    return (
        <header className="header">
            <a href="/" className="logo">Justys' Site</a>

            <div className="menu-icon" onClick={toggleMenu}>
                <div></div>
                <div></div>
                <div></div>
            </div>

            <nav className={`navbar ${isOpen ? "open" : ""}`}>
                {links.map((link, index) => (
                    <a key={index} href={link.href}>{link.label}</a>
                ))}
            </nav>
        </header>
    )
}
export default Navbar;
