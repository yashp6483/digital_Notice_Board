import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function TopHeader() {
    const navigate = useNavigate();

    const hours = new Date().getHours();
    let greeting = "Good Morning";
    const name = localStorage.getItem("name");
    const role = localStorage.getItem("role");

    if (hours >= 12 && hours < 17) greeting = "Good Afternoon";
    else if (hours >= 17) greeting = "Good Evening";

    const handleProfileClick = () => {
        const profilePath = role === "professor" ? "/professor/profile" : "/admin/profile";
        navigate(profilePath);
    };

    return (
        <div 
            className="d-flex justify-content-between align-items-center mb-4 p-3 bg-white shadow-sm rounded-4"
        >
            {/* LEFT SECTION */}
            <div className="d-flex align-items-center gap-3">
                <div>
                    <h2 className="fw-bold mb-0 text-dark tracking-tight">
                        {greeting}, {name}! 👋
                    </h2>
                    <div className="d-flex align-items-center gap-2 text-muted small mt-1">
                        <span className="badge bg-primary bg-opacity-10 text-primary fw-bold text-uppercase px-2 py-1" style={{ fontSize: '0.65rem' }}>
                            {role}
                        </span>
                        <span className="opacity-50">•</span>
                        <i className="fa-regular fa-calendar-check opacity-75"></i>
                        <span className="fw-medium">
                            {new Date().toLocaleDateString(undefined, {
                                weekday: "long",
                                month: "short",
                                day: "numeric"
                            })}
                        </span>
                    </div>
                </div>
            </div>

            {/* RIGHT SECTION */}
            <div className="d-flex align-items-center gap-3">
                {/* Search or Notifications could go here */}
                <div 
                    className="d-flex align-items-center justify-content-center rounded-circle bg-white shadow-sm border border-light"
                    style={{ width: "48px", height: "48px", cursor: "pointer", transition: "all 0.2s ease" }}
                    onClick={handleProfileClick}
                >
                    <div className="bg-primary rounded-circle d-flex align-items-center justify-content-center text-white fw-bold shadow-sm" style={{ width: "38px", height: "38px" }}>
                        {name ? name.charAt(0).toUpperCase() : "U"}
                    </div>
                </div>
            </div>

            <style>
                {`
                .tracking-tight { letter-spacing: -0.025em; }
                `}
            </style>
        </div>
    );
}
