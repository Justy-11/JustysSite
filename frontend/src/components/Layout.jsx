import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./SideBar";
import Navbar from "./NavBar";
import "../styles/Layout.css";

const Layout = () => {
  const navbarLinks = [
    { label: "Profile", href: "/" },
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
