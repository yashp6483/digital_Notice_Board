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

    // 👉 Handle profile click
    const handleProfileClick = () => {
        const profilePath = role === "professor" ? "/professor/profile" : "/admin/profile";
        navigate(profilePath);
    };

    return (
        <div 
            className="d-flex justify-content-between align-items-center p-3 rounded"
            style={{ background: "#f4f7fb" }}
        >

            {/* LEFT SECTION */}
            <div className="d-flex align-items-center gap-3">

                {/* ICON BOX */}
                <div 
                    className="d-flex justify-content-center align-items-center text-white"
                    style={{
                        width: "55px",
                        height: "55px",
                        borderRadius: "12px",
                        background: "linear-gradient(135deg, #4e73df, #6f42c1)"
                    }}
                >
                    <i className="fa-solid fa-trophy fs-4"></i>
                </div>

                {/* TEXT */}
                <div>
                    <h2 className="fw-bold mb-1">
                        {greeting}, {name}! 👋
                    </h2>

                    <div className="d-flex align-items-center gap-3 text-muted">

                        <span className="text-primary fw-semibold">
                            {role}
                        </span>

                        <span>•</span>

                        <i className="fa-regular fa-calendar"></i>

                        <span>
                            {new Date().toLocaleDateString(undefined, {
                                weekday: "long",
                                year: "numeric",
                                month: "long",
                                day: "numeric"
                            })}
                        </span>
                    </div>
                </div>
            </div>

            {/* RIGHT SECTION (CLICKABLE PROFILE) */}
            <div 
                className="d-flex justify-content-center align-items-center rounded-circle bg-primary text-white"
                style={{ width: "42px", height: "42px", cursor: "pointer" }}
                onClick={handleProfileClick}
            >
                <span className="fw-bold">
                    {name ? name.charAt(0).toUpperCase() : "U"}
                </span>
            </div>

        </div>
    );
}
