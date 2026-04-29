import React, { useState } from "react";
import { Card, Button } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { buildApiUrl } from "../config/api";

function ForgotPassword() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [currentPassword, setCurrentPassword] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (isSubmitting) return;
        setIsSubmitting(true);

        if (String(password).length < 8) {
            Swal.fire({ icon: "error", title: "Invalid Password", text: "Password must be at least 8 characters long" });
            setIsSubmitting(false);
            return;
        }

        if (currentPassword === password) {
            Swal.fire({ icon: "error", title: "Invalid Password", text: "New password cannot be same as current password" });
            setIsSubmitting(false);
            return;
        }

        if (password !== confirmPassword) {
            Swal.fire({ icon: "error", title: "Oops!", text: "Passwords do not match" });
            setIsSubmitting(false);
            return;
        }

        try {
            const res = await fetch(buildApiUrl("forgot-password"), {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, currentPassword, password })
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
            }).then(() => { navigate("/login"); });

        } catch (err) {
            Swal.fire({ icon: "error", title: "Server Error", text: "Please try again later" });
        } finally {
            setIsSubmitting(false);
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
            <Card className="shadow-lg border-0 rounded-4 overflow-hidden" style={{ maxWidth: "450px", width: "100%", zIndex: 1 }}>
                <Card.Body className="p-5">
                    <div className="text-center mb-4">
                        <h3 className="fw-bold text-dark">Reset Password</h3>
                        <p className="text-muted small">Use your current password to set a new one</p>
                    </div>

                    <form onSubmit={handleResetPassword}>
                        <div className="mb-3">
                            <label className="form-label fw-semibold small text-uppercase text-muted">Email Address</label>
                            <input
                                type="email"
                                className="form-control bg-light border-0 py-2 rounded-3 shadow-none"
                                placeholder="name@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div className="mb-3">
                            <label className="form-label fw-semibold small text-uppercase text-muted">Current Password</label>
                            <input
                                type="password"
                                className="form-control bg-light border-0 py-2 rounded-3 shadow-none"
                                placeholder="Current password"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                required
                            />
                        </div>

                        <div className="mb-3">
                            <label className="form-label fw-semibold small text-uppercase text-muted">New Password</label>
                            <input
                                type="password"
                                className="form-control bg-light border-0 py-2 rounded-3 shadow-none"
                                placeholder="********"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        <div className="mb-4">
                            <label className="form-label fw-semibold small text-uppercase text-muted">Confirm Password</label>
                            <input
                                type="password"
                                className="form-control bg-light border-0 py-2 rounded-3 shadow-none"
                                placeholder="********"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                        </div>

                        <Button
                            type="submit"
                            className="w-100 py-3 fw-bold rounded-3 shadow-sm border-0"
                            style={{ background: "linear-gradient(to right, #4e73df, #224abe)" }}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? "Please wait..." : "Update Credentials"}
                        </Button>
                    </form>

                    <div className="text-center mt-4">
                        <Link to="/login" className="text-decoration-none text-primary fw-medium small">
                            Back to login
                        </Link>
                    </div>
                </Card.Body>
            </Card>
        </div>
    );
}

export default ForgotPassword;
