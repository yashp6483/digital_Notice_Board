import React, { useState } from "react";
import { Card, Button } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { buildApiUrl } from "../config/api";

function ForgotPassword() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            Swal.fire({ icon: "error", title: "Oops!", text: "Passwords do not match" });
            return;
        }

        try {
            const res = await fetch(buildApiUrl("forgot-password"), {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password })
            });

            const data = await res.json();

            if (!res.ok) {
                Swal.fire({ icon: "error", title: "Update Failed", text: data.message });
                return;
            }

            Swal.fire({
                icon: "success",
                title: "Password Reset",
                text: "Your security credentials have been updated.",
                timer: 2000,
                showConfirmButton: false
            }).then(() => { navigate("/login"); })

        } catch (err) {
            Swal.fire({ icon: "error", title: "Server Error", text: "Please try again later" });
        }
    };

    return (
        <div 
            className="container-fluid min-vh-100 d-flex justify-content-center align-items-center p-3"
            style={{ 
                background: "linear-gradient(135deg, #4e73df 0%, #224abe 100%)",
                position: "relative",
                overflow: "hidden"
            }}
        >
            {/* Background Decorations */}
            <div style={{ position: "absolute", top: "-10%", right: "-5%", width: "400px", height: "400px", background: "rgba(255,255,255,0.05)", borderRadius: "50%" }}></div>
            <div style={{ position: "absolute", bottom: "-10%", left: "-5%", width: "300px", height: "300px", background: "rgba(255,255,255,0.05)", borderRadius: "50%" }}></div>

            <Card className="shadow-lg border-0 rounded-4 overflow-hidden" style={{ maxWidth: "450px", width: "100%", zIndex: 1 }}>
                <Card.Body className="p-5">
                    <div className="text-center mb-4">
                        <div className="bg-primary bg-opacity-10 text-primary p-3 rounded-circle d-inline-block mb-3">
                            <i className="fa-solid fa-key fs-3"></i>
                        </div>
                        <h3 className="fw-bold text-dark">Reset Password</h3>
                        <p className="text-muted small">Enter your email and new security credentials</p>
                    </div>

                    <form onSubmit={handleSubmit}>
                        {/* EMAIL */}
                        <div className="mb-3">
                            <label className="form-label fw-semibold small text-uppercase text-muted tracking-wider">Email Address</label>
                            <div className="input-group">
                                <span className="input-group-text bg-light border-0 text-muted">
                                    <i className="fa-solid fa-envelope"></i>
                                </span>
                                <input
                                    type="email"
                                    className="form-control bg-light border-0 py-2 rounded-end-3 shadow-none"
                                    placeholder="name@example.com"
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        {/* NEW PASSWORD */}
                        <div className="mb-3">
                            <label className="form-label fw-semibold small text-uppercase text-muted tracking-wider">New Password</label>
                            <div className="input-group">
                                <span className="input-group-text bg-light border-0 text-muted">
                                    <i className="fa-solid fa-lock"></i>
                                </span>
                                <input
                                    type="password"
                                    className="form-control bg-light border-0 py-2 rounded-end-3 shadow-none"
                                    placeholder="••••••••"
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        {/* CONFIRM PASSWORD */}
                        <div className="mb-4">
                            <label className="form-label fw-semibold small text-uppercase text-muted tracking-wider">Confirm Password</label>
                            <div className="input-group">
                                <span className="input-group-text bg-light border-0 text-muted">
                                    <i className="fa-solid fa-shield-check"></i>
                                </span>
                                <input
                                    type="password"
                                    className="form-control bg-light border-0 py-2 rounded-end-3 shadow-none"
                                    placeholder="••••••••"
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <Button 
                            type="submit" 
                            className="w-100 py-3 fw-bold rounded-3 shadow-sm border-0 transition-all"
                            style={{ background: "linear-gradient(to right, #4e73df, #224abe)" }}
                        >
                            Update Credentials
                        </Button>
                    </form>

                    <div className="text-center mt-4">
                        <Link to="/login" className="text-decoration-none text-primary fw-medium small">
                            <i className="fa-solid fa-arrow-left me-2"></i> Back to login
                        </Link>
                    </div>
                </Card.Body>
            </Card>
        </div>
    );
}

export default ForgotPassword;
