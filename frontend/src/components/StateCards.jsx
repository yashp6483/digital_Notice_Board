import React from 'react';
import { Card } from 'react-bootstrap';

export default function StateCards({ title, value, icon, color = "primary" }) {
    // Map of colors to their soft background and text classes
    const colorMap = {
        primary: { bg: "rgba(78, 115, 223, 0.1)", text: "#4e73df" },
        success: { bg: "rgba(28, 200, 138, 0.1)", text: "#1cc88a" },
        info: { bg: "rgba(54, 185, 204, 0.1)", text: "#36b9cc" },
        warning: { bg: "rgba(246, 194, 62, 0.1)", text: "#f6c23e" },
        danger: { bg: "rgba(231, 74, 59, 0.1)", text: "#e74a3b" },
        secondary: { bg: "rgba(133, 135, 150, 0.1)", text: "#858796" },
        dark: { bg: "rgba(90, 92, 105, 0.1)", text: "#5a5c69" }
    };

    const selectedColor = colorMap[color] || colorMap.primary;

    return (
        <div className="col-12 col-sm-6 col-md-4 col-xl-3 mb-4">
            <Card className="border-0 shadow-sm h-100 rounded-4 overflow-hidden transition-all hover-lift">
                <Card.Body className="p-4">
                    <div className="d-flex align-items-start justify-content-between">
                        <div>
                            <p className="text-muted small fw-bold text-uppercase mb-2 tracking-wider">
                                {title}
                            </p>
                            <h3 className="fw-bold mb-0 text-dark">
                                {value}
                            </h3>
                        </div>
                        <div 
                            className="d-flex align-items-center justify-content-center rounded-3 shadow-sm"
                            style={{ 
                                width: "48px", 
                                height: "48px", 
                                backgroundColor: selectedColor.bg,
                                color: selectedColor.text
                            }}
                        >
                            <i className={`fa-solid ${icon || 'fa-chart-simple'} fs-4`}></i>
                        </div>
                    </div>
                </Card.Body>
                {/* Subtle accent bar at the bottom */}
                <div style={{ height: "4px", width: "100%", backgroundColor: selectedColor.text, opacity: 0.8 }}></div>
            </Card>

            <style>
                {`
                .hover-lift {
                    transition: transform 0.2s ease, box-shadow 0.2s ease;
                }
                .hover-lift:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 10px 20px rgba(0,0,0,0.08) !important;
                }
                .tracking-wider {
                    letter-spacing: 0.05em;
                }
                `}
            </style>
        </div>
    );
}
