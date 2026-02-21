import React, { useState } from "react";
import { Link } from "react-router-dom";

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const logout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  const toggleSidebar = () => {
    setIsCollapsed((prev) => !prev);
  };

  return (
    <div
      className="d-flex flex-column min-vh-100 bg-primary text-white p-2 p-md-3 flex-shrink-0"
      style={{ width: isCollapsed ? "84px" : "260px", transition: "width 0.2s ease" }}
    >
      <div className={`d-flex mb-3 ${isCollapsed ? "justify-content-center" : "justify-content-end"}`}>
        <button
          type="button"
          onClick={toggleSidebar}
          className="btn btn-sm btn-outline-light"
          aria-label="Toggle menu"
        >
          <i className={`fa-solid ${isCollapsed ? "fa-bars" : "fa-angle-left"}`}></i>
        </button>
      </div>

      {/* Logo */}
      <div className={`d-flex align-items-center mb-3 mb-md-4 ${isCollapsed ? "justify-content-center" : "justify-content-start"}`}>
        <i className={`fa-solid fa-trophy fs-4 ${isCollapsed ? "" : "me-2"}`}></i>
        {!isCollapsed && <span className="fw-bold fs-5">Digital Notice Board</span>}
      </div>

      {/* Menu */}
      <ul className="nav nav-pills flex-column gap-2">
        <li className="nav-item">
          <Link
            className={`nav-link text-white d-flex align-items-center px-2 px-md-3 ${isCollapsed ? "justify-content-center" : "justify-content-start"}`}
            to="/admin-dashboard"
          >
            <i className={`fa-solid fa-house ${isCollapsed ? "" : "me-2"}`}></i>
            {!isCollapsed && <span>Dashboard</span>}
          </Link>
        </li>

        <li className="nav-item">
          <Link
            className={`nav-link text-white d-flex align-items-center px-2 px-md-3 ${isCollapsed ? "justify-content-center" : "justify-content-start"}`}
            to="/notices"
          >
            <i className={`fa-solid fa-bullhorn ${isCollapsed ? "" : "me-2"}`}></i>
            {!isCollapsed && <span>Notices</span>}
          </Link>
        </li>

        <li className="nav-item">
          <Link
            className={`nav-link text-white d-flex align-items-center px-2 px-md-3 ${isCollapsed ? "justify-content-center" : "justify-content-start"}`}
            to="/professors"
          >
            <i className={`fa-solid fa-user-tie ${isCollapsed ? "" : "me-2"}`}></i>
            {!isCollapsed && <span>Professors</span>}
          </Link>
        </li>

        <li className="nav-item">
          <Link
            className={`nav-link text-white d-flex align-items-center px-2 px-md-3 ${isCollapsed ? "justify-content-center" : "justify-content-start"}`}
            to="/categories"
          >
            <i className={`fa-solid fa-layer-group ${isCollapsed ? "" : "me-2"}`}></i>
            {!isCollapsed && <span>Categories</span>}
          </Link>
        </li>

        <li className="nav-item">
          <Link
            className={`nav-link text-white d-flex align-items-center px-2 px-md-3 ${isCollapsed ? "justify-content-center" : "justify-content-start"}`}
            to="/display"
          >
            <i className={`fa-solid fa-display ${isCollapsed ? "" : "me-2"}`}></i>
            {!isCollapsed && <span>Display Controls</span>}
          </Link>
        </li>

        <li className="nav-item">
          <Link
            className={`nav-link text-white d-flex align-items-center px-2 px-md-3 ${isCollapsed ? "justify-content-center" : "justify-content-start"}`}
            to="/reports"
          >
            <i className={`fa-solid fa-file-lines ${isCollapsed ? "" : "me-2"}`}></i>
            {!isCollapsed && <span>Reports</span>}
          </Link>
        </li>

        <li className="nav-item">
          <Link
            className={`nav-link text-white d-flex align-items-center px-2 px-md-3 ${isCollapsed ? "justify-content-center" : "justify-content-start"}`}
            to="/settings"
          >
            <i className={`fa-solid fa-gear ${isCollapsed ? "" : "me-2"}`}></i>
            {!isCollapsed && <span>Settings</span>}
          </Link>
        </li>
      </ul>

      {/* Profile at bottom */}
      <div className="mt-4 mt-md-auto">
        <hr className="border-light" />

        <div className={`d-flex align-items-center gap-2 ${isCollapsed ? "justify-content-center" : "justify-content-start"}`}>
          <i className="fa-solid fa-circle-user fs-3"></i>
          {!isCollapsed && <div>
            <div className="fw-semibold">Admin Name</div>
            <button
              onClick={logout}
              className="btn btn-sm btn-light mt-1"
            >
              Logout
            </button>
          </div>}
        </div>
      </div>
    </div>
  );
}
