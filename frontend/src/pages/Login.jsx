import React, { useState } from "react";
import { Button } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import "bootstrap/dist/css/bootstrap.min.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import { buildApiUrl } from "../config/api";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("admin");

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(buildApiUrl("login"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
        navigate("/admin")
      } else if (data.role === "professor") {
        navigate("/professor")
      } else {
        Swal.fire({
          icon: "error",
          title: "Unauthorized role",
          text: "Your account does not have dashboard access."
        });
        localStorage.clear();
        navigate("/login");
      }
    } catch (err) {
      console.log(err);
      Swal.fire({
        icon: "error",
        title: "Server error",
        text: "Unable to login right now."
      });
    }
  };

  return (
    <div className="container-fluid min-vh-100 p-0 overflow-hidden">
      <div className="row g-0 min-vh-100">

        {/* LEFT SIDE: ATTRACTIVE CONTENT (NO IMAGE) */}
        <div 
          className="col-lg-7 col-md-6 d-none d-md-flex flex-column align-items-center justify-content-center text-white text-center p-5"
          style={{
            background: "linear-gradient(135deg, #4e73df 0%, #224abe 100%)",
            position: "relative",
          }}
        >
          {/* Animated Background Shapes */}
          <div style={{ 
            position: "absolute", 
            top: "-10%", 
            right: "-10%", 
            width: "500px", 
            height: "500px", 
            background: "radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%)", 
            borderRadius: "50%" 
          }}></div>
          <div style={{ 
            position: "absolute", 
            bottom: "-15%", 
            left: "-5%", 
            width: "400px", 
            height: "400px", 
            background: "radial-gradient(circle, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0) 70%)", 
            borderRadius: "50%" 
          }}></div>
          
          <div className="position-relative" style={{ zIndex: 1 }}>
            <div className="bg-white bg-opacity-10 p-4 rounded-circle d-inline-block mb-4 border border-white border-opacity-25 shadow-lg">
                <i className="fa-solid fa-bullhorn" style={{ fontSize: "4rem" }}></i>
            </div>
            <h1 className="display-4 fw-bold mb-3 tracking-tight">Digital Notice Board</h1>
            <p className="lead px-lg-5 mb-5" style={{ opacity: 0.85, maxWidth: "600px" }}>
              The modern way to manage and broadcast information across your institution. Efficient, fast, and always accessible.
            </p>
            
            <div className="row g-4 w-100 px-lg-5">
               <div className="col-4">
                  <div className="p-3 rounded-4 bg-white bg-opacity-10 border border-white border-opacity-20 shadow-sm backdrop-blur">
                    <i className="fa-solid fa-bolt mb-2 d-block opacity-75"></i>
                    <h6 className="fw-bold mb-0">Fast</h6>
                  </div>
               </div>
               <div className="col-4">
                  <div className="p-3 rounded-4 bg-white bg-opacity-10 border border-white border-opacity-20 shadow-sm backdrop-blur">
                    <i className="fa-solid fa-shield-halved mb-2 d-block opacity-75"></i>
                    <h6 className="fw-bold mb-0">Secure</h6>
                  </div>
               </div>
               <div className="col-4">
                  <div className="p-3 rounded-4 bg-white bg-opacity-10 border border-white border-opacity-20 shadow-sm backdrop-blur">
                    <i className="fa-solid fa-cloud mb-2 d-block opacity-75"></i>
                    <h6 className="fw-bold mb-0">Cloud</h6>
                  </div>
               </div>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE: LOGIN FORM */}
        <div className="col-lg-5 col-md-6 d-flex align-items-center justify-content-center bg-white">
          <div className="w-100 px-4 py-5" style={{ maxWidth: "450px" }}>
            <div className="mb-5 text-center">
              <h2 className="fw-bold text-dark mb-2">Welcome Back</h2>
              <p className="text-muted">Please enter your details to sign in.</p>
            </div>

            <form onSubmit={handleLogin}>
              {/* ROLE */}
              <div className="mb-3">
                <label className="form-label fw-semibold text-secondary small text-uppercase">Login As</label>
                <select
                  className="form-select border-2 py-2 px-3 shadow-sm rounded-3 bg-light"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  required
                >
                  <option value="admin">Administrator</option>
                  <option value="professor">Professor</option>
                </select>
              </div>

              {/* EMAIL */}
              <div className="mb-3">
                <label className="form-label fw-semibold text-secondary small text-uppercase">Email Address</label>
                <div className="input-group">
                  <span className="input-group-text bg-light border-2 border-end-0 text-muted">
                    <i className="fa-solid fa-envelope"></i>
                  </span>
                  <input
                    type="email"
                    className="form-control border-2 border-start-0 py-2 shadow-sm rounded-end-3 bg-light"
                    placeholder="name@example.com"
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* PASSWORD */}
              <div className="mb-4">
                <label className="form-label fw-semibold text-secondary small text-uppercase">Password</label>
                <div className="input-group">
                  <span className="input-group-text bg-light border-2 border-end-0 text-muted">
                    <i className="fa-solid fa-lock"></i>
                  </span>
                  <input
                    type="password"
                    className="form-control border-2 border-start-0 py-2 shadow-sm rounded-end-3 bg-light"
                    placeholder="••••••••"
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* REMEMBER + FORGOT */}
              <div className="d-flex justify-content-between align-items-center mb-4">
                <div className="form-check">
                  <input type="checkbox" className="form-check-input" id="remember" />
                  <label className="form-check-label text-muted small" htmlFor="remember">Remember me</label>
                </div>
                <Link to="/forgot-password" id="forgot-password-link" className="text-primary text-decoration-none fw-medium small">
                  Forgot password?
                </Link>
              </div>

              {/* BUTTON */}
              <Button
                type="submit"
                className="w-100 py-3 fw-bold rounded-3 shadow-sm border-0 transition-all"
                style={{ 
                  background: "linear-gradient(to right, #4e73df, #224abe)",
                  boxShadow: "0 4px 15px rgba(78, 115, 223, 0.3)"
                }}
              >
                Sign In
              </Button>
            </form>

            <div className="mt-5 text-center">
              <p className="text-muted extra-small">
                © 2026 Digital Notice Board. Secure Portal.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Login;
