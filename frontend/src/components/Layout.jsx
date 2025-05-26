import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./SideBar";
import Navbar from "./NavBar";
import "../styles/Layout.css";

const Layout = () => {
  const navbarLinks = [
    { label: "Home", href: "/" },
    { label: "About Us", href: "/about" },
    { label: "Support", href: "/help" },
    { label: "Logout", href: "/logout" },
  ];

  return (
    <div>
      <Navbar links={navbarLinks} />
      <Sidebar />
      
      <div className="content-wrapper">
        <Outlet />
      </div>
    </div>
  );
};

export default Layout;
