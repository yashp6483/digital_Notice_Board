import React, { useState } from "react";
import { Card, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import loginImg from "../online-learning-class-illustration.png";
import Swal from "sweetalert2";
import "bootstrap/dist/css/bootstrap.min.css";
import "@fortawesome/fontawesome-free/css/all.min.css";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("admin");

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        body: JSON.stringify({ email, password, role }),
      });

      const data = await res.json();

      if (!res.ok) {
        Swal.fire({
          icon: "error",
          title: "Login Failed",
          text: data.message || "Invalid credentials",
          confirmButtonColor: "#d33",
        });
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        return;
      }

      localStorage.setItem("name", data.name);
      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.role);


      Swal.fire({
        icon: "success",
        title: "Login Successful",
        text: "Welcome back!",
        timer: 1500,
        showConfirmButton: false,
      });

      if (data.role === "admin") {
        navigate("/admin-dashboard")
      } else if (data.role === "professor") {
        navigate("/professor-dashboard")
      } else {
        alert("Unauthorized role");
        localStorage.clear();
        navigate("/login");
      }
    } catch (err) {
      console.log(err);
      alert("Server error");
    }
  };

  return (
    <div className="container-fluid min-vh-100 bg-light">
      <div className="row min-vh-100 align-items-center">

        {/* LEFT IMAGE */}
        <div className="col-md-6 d-none d-md-flex justify-content-center align-items-center">
          <img
            src={loginImg}
            alt="login"
            className="img-fluid w-75"
          />
        </div>

        {/* RIGHT LOGIN */}
        <div className="col-md-6 col-12 d-flex justify-content-center">
          <Card className="w-100 shadow-lg border-0 rounded-4 mx-3" style={{ maxWidth: "420px" }}>
            <Card.Body className="p-4">

              <h3 className="text-center fw-bold mb-1">
                Welcome Back 👋
              </h3>
              <p className="text-center text-muted mb-4">
                Login to your account
              </p>

              <form onSubmit={handleLogin}>

                {/* ROLE */}
                <div className="mb-3">
                  <label className="form-label fw-semibold">
                    Login As
                  </label>
                  <select
                    className="form-select"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    required
                  >
                    <option value="admin">Admin</option>
                    <option value="professor">Professor</option>
                  </select>
                </div>

                {/* EMAIL */}
                <div className="mb-3">
                  <label className="form-label fw-semibold">
                    Email
                  </label>
                  <div className="input-group">
                    <span className="input-group-text bg-white">
                      <i className="fa-solid fa-envelope text-muted"></i>
                    </span>
                    <input
                      type="email"
                      className="form-control"
                      placeholder="example@gmail.com"
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* PASSWORD */}
                <div className="mb-3">
                  <label className="form-label fw-semibold">
                    Password
                  </label>
                  <div className="input-group">
                    <span className="input-group-text bg-white">
                      <i className="fa-solid fa-lock text-muted"></i>
                    </span>
                    <input
                      type="password"
                      className="form-control"
                      placeholder="********"
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* REMEMBER + FORGOT */}
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div className="form-check">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="remember"
                    />
                    <label className="form-check-label" htmlFor="remember">
                      Remember me
                    </label>
                  </div>
                  <a href=" " className="text-decoration-none">
                    Forgot password?
                  </a>
                </div>

                {/* BUTTON */}
                <Button
                  type="submit"
                  className="w-100 fw-semibold"
                >
                  Login
                </Button>

              </form>
            </Card.Body>
          </Card>
        </div>

      </div>
    </div>
  );
}

export default Login;
