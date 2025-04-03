import React from "react";
import "../styles/NavBar.css"

const Navbar = ({ links }) => {
    return (
        <header className="header">
            <a href="/" className="logo">Justys' Site</a>

            <nav className="navbar">
                {links.map((link, index) => (
                    <a key={index} href={link.href}>{link.label}</a>
                ))}
            </nav>
        </header>
    )
}
export default Navbar;
