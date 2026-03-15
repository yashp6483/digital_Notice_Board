import React from 'react'

export default function TopHeader() {
    const hours = new Date().getHours();
    let greeting = "Good Morning";
    const name = localStorage.getItem("name");
    const role = localStorage.getItem("role");

    if (hours >= 12 && hours < 17) greeting = "Good Afternoon";
    else if (hours >= 17) greeting = "Good Evening";

    return (
        
        <div className="rounded d-flex justify-content-between align-items-center">
            <div>
                <h4 className="fw-bold">{greeting}, {name}! 👋</h4>
                <span className="text-primary">
                    {role}
                </span>
                 <i className="fa-regular fa-calendar"> </i>Today <i className="fa-solid fa-circle fa-2xs"> </i> {new Date().toDateString()}
            </div>

            <button className="btn btn-light">⚙ Settings</button>
        </div>
    );
}

