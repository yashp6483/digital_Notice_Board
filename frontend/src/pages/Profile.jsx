import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { Card, Form, Button, Row, Col } from "react-bootstrap";
import Swal from "sweetalert2";
import { getProfile, updateProfile } from "../servieces/userServices";
import { useNavigate } from "react-router-dom";

export default function Profile() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    department: "",
    birthdate: "",
  });

  const [loading, setLoading] = useState(false);

  // 🔥 FETCH PROFILE DATA
  const fetchProfile = async () => {
    try {
      const data = await getProfile();

      setFormData({
        name: data.name || "",
        email: data.email || "",
        phone: data.phone || "",
        department: data.department || "",
        birthdate: data.birthdate
          ? data.birthdate.split("T")[0]
          : "",
      });
    } catch (error) {
      if (error.status === 401 || error.status === 403) {
        localStorage.clear();
        navigate("/unauthorized");
        return;
      }

      Swal.fire("Error", "Failed to load profile", "error");
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // 🔥 HANDLE CHANGE
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // 🔥 SUBMIT
  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    try {
      await updateProfile(formData);

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
    <div className="container-fluid">
      <div className="row min-vh-100">

        <Sidebar />

        <div className="col bg-body-secondary p-4">

          <h4 className="mb-4">My Profile</h4>

          <Card className="shadow-sm">
            <Card.Body>

              <Form onSubmit={handleSubmit}>
                <Row className="g-3">

                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Name</Form.Label>
                      <Form.Control
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Email</Form.Label>
                      <Form.Control
                        type="email"
                        value={formData.email}
                        disabled
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Phone</Form.Label>
                      <Form.Control
                        type="text"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Department</Form.Label>
                      <Form.Select
                        name="department"
                        value={formData.department}
                        onChange={handleChange}
                      >
                        <option>Computer Engineering</option>
                        <option>Mechenical Engineering</option>
                        <option>Civil Engineering</option>
                        <option>Electical Engineering</option>
                        <option>Electronics and comunication</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Birthdate</Form.Label>
                      <Form.Control
                        type="date"
                        name="birthdate"
                        value={formData.birthdate}
                        onChange={handleChange}
                      />
                    </Form.Group>
                  </Col>

                </Row>

                <div className="mt-4">
                  <Button type="submit" disabled={loading}>
                    {loading ? "Updating..." : "Update Profile"}
                  </Button>
                </div>
              </Form>

            </Card.Body>
          </Card>

        </div>
      </div>
    </div>
  );
}
