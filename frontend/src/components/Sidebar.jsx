import React, { useState } from "react";
import Swal from "sweetalert2";
import { Link, useLocation } from "react-router-dom";

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();

  const role = localStorage.getItem("role");
  const basePath = role === "admin" ? "/admin" : "/professor";

  // ✅ ACTIVE ROUTE CHECK (FIXED)
  const isActive = (path, exact = false) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  const logout = () => {
    Swal.fire({
      title: "Are you sure?",
      text: "You will be logged out of your account",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, Logout",
      cancelButtonText: "Cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.clear();

        Swal.fire({
          icon: "success",
          title: "Logged Out",
          text: "You have been successfully logged out",
          timer: 1200,
          showConfirmButton: false,
        });

        setTimeout(() => {
          window.location.href = "/login";
        }, 1200);
      }
    });
  };

  const toggleSidebar = () => {
    setIsCollapsed((prev) => !prev);
  };

  return (
    <div
      className="d-flex flex-column min-vh-100 bg-primary text-white p-2 p-md-3 flex-shrink-0"
      style={{
        width: isCollapsed ? "84px" : "260px",
        transition: "width 0.2s ease",
      }}
    >
      {/* 🔽 TOGGLE */}
      <div
        className={`d-flex mb-3 ${isCollapsed ? "justify-content-center" : "justify-content-end"
          }`}
      >
        <button
          onClick={toggleSidebar}
          className="btn btn-sm btn-outline-light"
        >
          <i
            className={`fa-solid ${isCollapsed ? "fa-bars" : "fa-angle-left"
              }`}
          ></i>
        </button>
      </div>

      {/* 🔷 LOGO */}
      <div
        className={`d-flex align-items-center mb-4 ${isCollapsed ? "justify-content-center" : ""
          }`}
      >
        <i
          className={`fa-solid fa-trophy fs-4 ${isCollapsed ? "" : "me-2"
            }`}
        ></i>
        {!isCollapsed && (
          <span className="fw-bold fs-5">
            Digital Notice Board
          </span>
        )}
      </div>

      {/* 🔗 MENU */}
      <ul className="nav nav-pills flex-column gap-2">

        {/* ✅ Dashboard (EXACT MATCH FIX) */}
        <li className="nav-item">
          <Link
            to={basePath}
            className={`nav-link d-flex align-items-center px-3 ${isCollapsed ? "justify-content-center" : ""
              } ${isActive(basePath, true)
                ? "bg-dark text-white"
                : "text-white"
              }`}
          >
            <i className={`fa-solid fa-house ${isCollapsed ? "" : "me-2"}`}></i>
            {!isCollapsed && <span>Dashboard</span>}
          </Link>
        </li>

        {/* Notices */}
        <li className="nav-item">
          <Link
            to={`${basePath}/notices`}
            className={`nav-link d-flex align-items-center px-3 ${isCollapsed ? "justify-content-center" : ""
              } ${isActive(`${basePath}/notices`)
                ? "bg-dark text-white"
                : "text-white"
              }`}
          >
            <i className={`fa-solid fa-bullhorn ${isCollapsed ? "" : "me-2"}`}></i>
            {!isCollapsed && <span>Notices</span>}
          </Link>
        </li>

        {/* My Notices */}
        <li className="nav-item">
          <Link
            to={`${basePath}/my-notices`}
            className={`nav-link d-flex align-items-center px-3 ${isCollapsed ? "justify-content-center" : ""
              } ${isActive(`${basePath}/my-notices`)
                ? "bg-dark text-white"
                : "text-white"
              }`}
          >
            <i className={`fa-solid fa-bell ${isCollapsed ? "" : "me-2"}`}></i>
            {!isCollapsed && <span>My Notices</span>}
          </Link>
        </li>

        {/* Professors (Admin only) */}
        {role === "admin" && (
          <li className="nav-item">
            <Link
              to="/admin/professors"
              className={`nav-link d-flex align-items-center px-3 ${isCollapsed ? "justify-content-center" : ""
                } ${isActive("/admin/professors")
                  ? "bg-dark text-white"
                  : "text-white"
                }`}
            >
              <i className={`fa-solid fa-user-tie ${isCollapsed ? "" : "me-2"}`}></i>
              {!isCollapsed && <span>Professors</span>}
            </Link>
          </li>
        )}
        <li className="nav-item">
          <Link
            to={`${basePath}/admins`}
            className={`nav-link d-flex align-items-center px-3 ${isCollapsed ? "justify-content-center" : ""
              } ${isActive(`${basePath}/admins`)
                ? "bg-dark text-white"
                : "text-white"
              }`}
          >
            <i className={`fa-solid fa-user-plus ${isCollapsed ? "" : "me-2"}`}></i>
            {!isCollapsed && <span>Admin Controls</span>}
          </Link>
        </li>
        {/* Display Controls */}
        <li className="nav-item">
          <Link
            to={`${basePath}/display`}
            className={`nav-link d-flex align-items-center px-3 ${isCollapsed ? "justify-content-center" : ""
              } ${isActive(`${basePath}/display`)
                ? "bg-dark text-white"
                : "text-white"
              }`}
          >
            <i className={`fa-solid fa-display ${isCollapsed ? "" : "me-2"}`}></i>
            {!isCollapsed && <span>Display Controls</span>}
          </Link>
        </li>

      </ul>

      {/* 👤 PROFILE */}
      <div className="mt-auto">
        <hr className="border-light" />

        <div
          className={`d-flex align-items-center gap-2 ${isCollapsed ? "justify-content-center" : ""
            }`}
        >
          <i className="fa-solid fa-circle-user fs-3"></i>

          {!isCollapsed && (
            <div>
              <div className="fw-semibold">
                {localStorage.getItem("name")}
              </div>

              <button
                onClick={logout}
                className="btn btn-sm btn-light mt-1"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 🎨 STYLE */}
      <style>
        {`
        .nav-link {
          transition: all 0.2s ease;
          border-radius: 8px;
        }

        .nav-link:hover {
          background-color: rgba(0,0,0,0.2);
        }
        `}
      </style>
    </div>
  );
}
