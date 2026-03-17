import React, { useState } from "react";
import { Card, Button } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

function ForgotPassword() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();

        // ✅ check password match
        if (password !== confirmPassword) {
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "Passwords do not match"
            });
            return;
        }

        try {
            const res = await fetch("http://localhost:5000/forgot-password", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email, password })
            });

            const data = await res.json();

            if (!res.ok) {
                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: data.message
                });
                return;
            }

            Swal.fire({
                icon: "success",
                title: "Success",
                text: "Password updated successfully"
            }).then(() => {
                navigate("/login");
            })

        } catch (err) {
            Swal.fire({
                icon: "error",
                title: "Server Error",
                text: "Try again later"
            });
        }
    };

    return (
        <div className="container-fluid min-vh-100 d-flex justify-content-center align-items-center bg-light">
            <Card className="shadow-lg border-0 rounded-4" style={{ maxWidth: "400px", width: "100%" }}>
                <Card.Body className="p-4">

                    <h3 className="text-center fw-bold mb-2">
                        Reset Password 🔐
                    </h3>

                    <form onSubmit={handleSubmit}>

                        {/* EMAIL */}
                        <div className="mb-3">
                            <label className="form-label fw-semibold">Email</label>
                            <input
                                type="email"
                                className="form-control"
                                placeholder="example@gmail.com"
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        {/* NEW PASSWORD */}
                        <div className="mb-3">
                            <label className="form-label fw-semibold">New Password</label>
                            <input
                                type="password"
                                className="form-control"
                                placeholder="Enter new password"
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        {/* CONFIRM PASSWORD */}
                        <div className="mb-3">
                            <label className="form-label fw-semibold">Confirm Password</label>
                            <input
                                type="password"
                                className="form-control"
                                placeholder="Re-enter password"
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                        </div>

                        <Button type="submit" className="w-100 fw-semibold">
                            Reset Password
                        </Button>

                    </form>

                    <div className="text-center mt-3">
                        <Link to="/login">Back to Login</Link>
                    </div>

                </Card.Body>
            </Card>
        </div>
    );
}

export default ForgotPassword;
