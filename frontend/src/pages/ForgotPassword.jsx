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
    const [otp, setOtp] = useState("");
    const [otpStep, setOtpStep] = useState(false);

    const handleRequestOtp = async (e) => {
        e.preventDefault();

        try {
            const res = await fetch(buildApiUrl("auth/request-forgot-otp"), {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email })
            });

            const data = await res.json();

            if (!res.ok) {
                Swal.fire({ icon: "error", title: "Request Failed", text: data.message || "Unable to send OTP" });
                return;
            }

            setOtpStep(true);

            Swal.fire({
                icon: "success",
                title: "OTP Sent",
                text: data.devOtp
                    ? `Use OTP: ${data.devOtp}${data.mailSent ? " (Email also sent)" : ""}${data.mailError ? ` | Mail issue: ${data.mailError}` : ""}`
                    : "Check your registered channel for OTP"
            });
        } catch (err) {
            Swal.fire({ icon: "error", title: "Server Error", text: "Please try again later" });
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            Swal.fire({ icon: "error", title: "Oops!", text: "Passwords do not match" });
            return;
        }

        try {
            const res = await fetch(buildApiUrl("forgot-password"), {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password, otp })
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
                        <p className="text-muted small">Request OTP and then set a new password</p>
                    </div>

                    <form onSubmit={otpStep ? handleResetPassword : handleRequestOtp}>
                        <div className="mb-3">
                            <label className="form-label fw-semibold small text-uppercase text-muted">Email Address</label>
                            <input
                                type="email"
                                className="form-control bg-light border-0 py-2 rounded-3 shadow-none"
                                placeholder="name@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                disabled={otpStep}
                            />
                        </div>

                        {otpStep && (
                            <>
                                <div className="mb-3">
                                    <label className="form-label fw-semibold small text-uppercase text-muted">OTP</label>
                                    <input
                                        type="text"
                                        className="form-control bg-light border-0 py-2 rounded-3 shadow-none"
                                        placeholder="Enter 6-digit OTP"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
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
                            </>
                        )}

                        <Button
                            type="submit"
                            className="w-100 py-3 fw-bold rounded-3 shadow-sm border-0"
                            style={{ background: "linear-gradient(to right, #4e73df, #224abe)" }}
                        >
                            {otpStep ? "Update Credentials" : "Send OTP"}
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
