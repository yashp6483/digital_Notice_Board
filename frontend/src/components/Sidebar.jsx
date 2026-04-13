import React, { useState } from "react";
import Swal from "sweetalert2";
import { Link, useLocation } from "react-router-dom";

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();

  const role = localStorage.getItem("role");
  const basePath = role === "admin" ? "/admin" : "/professor";

  const isActive = (path, exact = false) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  const logout = () => {
    Swal.fire({
      title: "Logout?",
      text: "Are you sure you want to sign out?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#4e73df",
      cancelButtonColor: "#858796",
      confirmButtonText: "Yes, Logout",
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.clear();
        Swal.fire({
          icon: "success",
          title: "Logged Out",
          timer: 1000,
          showConfirmButton: false,
        });
        setTimeout(() => {
          window.location.href = "/login";
        }, 1000);
      }
    });
  };

  return (
    <div
      className="d-flex flex-column min-vh-100 text-white flex-shrink-0"
      style={{
        width: isCollapsed ? "84px" : "280px",
        transition: "width 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        background: "linear-gradient(180deg, #1e293b 0%, #0f172a 100%)",
        boxShadow: "4px 0 15px rgba(0,0,0,0.1)",
        zIndex: 1000,
        position: "sticky",
        top: 0,
        height: "100vh"
      }}
    >
      {/* HEADER / TOGGLE */}
      <div className="p-4 d-flex align-items-center justify-content-between">
        {!isCollapsed && (
          <div className="d-flex align-items-center gap-2">
            <div className="bg-primary p-2 rounded-3 shadow-sm">
                <i className="fa-solid fa-bullhorn fs-5 text-white"></i>
            </div>
            <span className="fw-bold fs-5 tracking-tight">DNB Portal</span>
          </div>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="btn btn-sm text-white-50 border-0 hover-text-white"
        >
          <i className={`fa-solid ${isCollapsed ? "fa-bars fs-4" : "fa-indent fs-5"}`}></i>
        </button>
      </div>

      {/* MENU */}
      <div className="px-3 py-2 flex-grow-1 overflow-auto custom-scrollbar">
        {!isCollapsed && <small className="text-white-50 text-uppercase fw-bold x-small mb-3 d-block px-2">Main Menu</small>}
        <ul className="nav nav-pills flex-column gap-1">
          <MenuLink to={basePath} icon="fa-house" label="Dashboard" isCollapsed={isCollapsed} active={isActive(basePath, true)} />
          <MenuLink to={`${basePath}/notices`} icon="fa-bullhorn" label="Notices" isCollapsed={isCollapsed} active={isActive(`${basePath}/notices`)} />
          <MenuLink to={`${basePath}/my-notices`} icon="fa-bookmark" label="My Notices" isCollapsed={isCollapsed} active={isActive(`${basePath}/my-notices`)} />
          
          {role === "admin" && (
            <>
              {!isCollapsed && <small className="text-white-50 text-uppercase fw-bold x-small mt-4 mb-3 d-block px-2">Management</small>}
              <MenuLink to="/admin/professors" icon="fa-user-tie" label="Professors" isCollapsed={isCollapsed} active={isActive("/admin/professors")} />
              <MenuLink to={`${basePath}/admins`} icon="fa-user-shield" label="Admins" isCollapsed={isCollapsed} active={isActive(`${basePath}/admins`)} />
            </>
          )}

          {!isCollapsed && <small className="text-white-50 text-uppercase fw-bold x-small mt-4 mb-3 d-block px-2">Settings</small>}
          <MenuLink to={`${basePath}/profile`} icon="fa-id-card" label="My Profile" isCollapsed={isCollapsed} active={isActive(`${basePath}/profile`)} />
          <MenuLink to={`${basePath}/display`} icon="fa-display" label="Display" isCollapsed={isCollapsed} active={isActive(`${basePath}/display`)} />
        </ul>
      </div>

      {/* FOOTER PROFILE */}
      <div className="p-3 mt-auto bg-black bg-opacity-25">
        <div className={`d-flex align-items-center ${isCollapsed ? "justify-content-center" : "gap-3"}`}>
          <div className="bg-primary rounded-circle d-flex align-items-center justify-content-center shadow-sm" style={{ width: "40px", height: "40px", minWidth: "40px" }}>
            <span className="fw-bold">{localStorage.getItem("name")?.charAt(0).toUpperCase()}</span>
          </div>
          {!isCollapsed && (
            <div className="flex-grow-1 overflow-hidden">
              <div className="fw-semibold text-truncate small">{localStorage.getItem("name")}</div>
              <div className="text-white-50 x-small text-uppercase tracking-wider">{role}</div>
            </div>
          )}
          {!isCollapsed && (
            <button onClick={logout} className="btn btn-sm text-white-50 hover-text-danger p-0">
              <i className="fa-solid fa-right-from-bracket"></i>
            </button>
          )}
        </div>
        {isCollapsed && (
            <button onClick={logout} className="btn btn-sm text-white-50 hover-text-danger w-100 mt-2">
                <i className="fa-solid fa-right-from-bracket"></i>
            </button>
        )}
      </div>

      <style>
        {`
        .hover-text-white:hover { color: white !important; }
        .hover-text-danger:hover { color: #ef4444 !important; }
        .x-small { font-size: 0.7rem; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
        .tracking-tight { letter-spacing: -0.02em; }
        `}
      </style>
    </div>
  );
}

function MenuLink({ to, icon, label, isCollapsed, active }) {
  return (
    <li className="nav-item">
      <Link
        to={to}
        className={`nav-link d-flex align-items-center py-2 px-3 rounded-3 transition-all ${
          active ? "bg-primary text-white shadow-sm" : "text-white-50 hover-bg-white-10 hover-text-white"
        } ${isCollapsed ? "justify-content-center" : ""}`}
      >
        <i className={`fa-solid ${icon} ${isCollapsed ? "fs-5" : "me-3"}`}></i>
        {!isCollapsed && <span className="fw-medium">{label}</span>}
      </Link>
      <style>{`
        .hover-bg-white-10:hover { background-color: rgba(255,255,255,0.08); }
        .transition-all { transition: all 0.2s ease; }
      `}</style>
    </li>
  );
}
