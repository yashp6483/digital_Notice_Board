import React, { useCallback, useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import TopHeader from "../components/Topheader";
import { Card, Form, Button, Row, Col } from "react-bootstrap";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { getAdminProfile, updateAdminProfile } from "../services/adminServices";

export default function AdminProfile() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    department: "",
    birthdate: "",
    status: "active",
  });

  const [loading, setLoading] = useState(false);

  const fetchProfile = useCallback(async () => {
    try {
      const data = await getAdminProfile();

      localStorage.setItem("name", data.name || "");
      localStorage.setItem("email", data.email || "");

      setFormData({
        name: data.name || "",
        email: data.email || "",
        phone: data.phone || "",
        department: data.department || "",
        birthdate: data.birthdate ? String(data.birthdate).split("T")[0] : "",
        status: data.status || "active",
      });
    } catch (error) {
      if (error.status === 401 || error.status === 403) {
        localStorage.clear();
        navigate("/unauthorized");
        return;
      }
      Swal.fire("Error", error.message || "Failed to load profile", "error");
    }
  }, [navigate]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateAdminProfile(formData);
      localStorage.setItem("name", formData.name || "");
      localStorage.setItem("email", formData.email || "");
      Swal.fire({
        icon: "success",
        title: "Profile Updated",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      Swal.fire("Error", error.message || "Update failed", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid p-0">
      <div className="d-flex min-vh-100 overflow-hidden">
        <Sidebar />

        <div className="flex-grow-1 p-3 p-md-4 overflow-auto custom-scrollbar" style={{ backgroundColor: "#f8fafc", height: "100vh" }}>
          <TopHeader />

          <div className="mb-4">
            <h4 className="fw-bold text-dark">Account Settings</h4>
            <p className="text-muted small">Update your personal information and account preferences.</p>
          </div>

          <Card className="border-0 shadow-sm rounded-4 overflow-hidden">
            <Card.Header className="bg-white border-light py-3">
                <h5 className="mb-0 fw-bold text-primary">Personal Information</h5>
            </Card.Header>
            <Card.Body className="p-4">
              <Form onSubmit={handleSubmit}>
                <Row className="g-4">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="small fw-bold text-uppercase text-muted">Full Name</Form.Label>
                      <Form.Control
                        type="text"
                        name="name"
                        className="bg-light border-0 py-2 rounded-3"
                        value={formData.name}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="small fw-bold text-uppercase text-muted">Email Address</Form.Label>
                      <Form.Control type="email" className="bg-light border-0 py-2 rounded-3" value={formData.email} disabled />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="small fw-bold text-uppercase text-muted">Phone Number</Form.Label>
                      <Form.Control
                        type="text"
                        name="phone"
                        className="bg-light border-0 py-2 rounded-3"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="+91 1234567890"
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="small fw-bold text-uppercase text-muted">Department</Form.Label>
                      <Form.Select
                        name="department"
                        className="bg-light border-0 py-2 rounded-3"
                        value={formData.department}
                        onChange={handleChange}
                      >
                        <option value="">Select department</option>
                        <option>Computer Engineering</option>
                        <option>Mechanical Engineering</option>
                        <option>Civil Engineering</option>
                        <option>Electrical Engineering</option>
                        <option>Electronics and Communication</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="small fw-bold text-uppercase text-muted">Date of Birth</Form.Label>
                      <Form.Control
                        type="date"
                        name="birthdate"
                        className="bg-light border-0 py-2 rounded-3"
                        value={formData.birthdate}
                        onChange={handleChange}
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Label className="small fw-bold text-uppercase text-muted d-block mb-3">Profile Status</Form.Label>
                    <div className="d-flex gap-4">
                        <Form.Check
                            type="radio"
                            label="Active"
                            name="status"
                            id="status-active"
                            value="active"
                            checked={formData.status === "active"}
                            onChange={handleChange}
                            className="fw-medium"
                        />
                        <Form.Check
                            type="radio"
                            label="Inactive"
                            name="status"
                            id="status-inactive"
                            value="inactive"
                            checked={formData.status === "inactive"}
                            onChange={handleChange}
                            className="fw-medium"
                        />
                    </div>
                  </Col>
                </Row>

                <div className="mt-5 text-center text-md-start">
                  <Button 
                    type="submit" 
                    className="px-5 py-2 fw-bold rounded-3 shadow-sm"
                    disabled={loading}
                  >
                    {loading ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </div>
      </div>
      <style>
        {`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        `}
      </style>
    </div>
  );
}
