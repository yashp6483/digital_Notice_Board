import React, { useState } from "react";
import { Modal, ModalHeader, ModalBody, ModalTitle, Form, Button } from "react-bootstrap";
import { Department } from "../constants/categoryVariant";

export default function ProfessorAdd({ show, onClose, onSubmit }) {

    const [form, setForm] = useState({
        name: "",
        department: "Computer Engineering",
        email: "",
        phone: "",
        birthdate: "",
        password: "",
        status: "active"
    });

    const handleChange = (e) => {
        const { name, value } = e.target;

        setForm({
            ...form,
            [name]: value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const token = localStorage.getItem("token");
        if (!token) return alert("Please login again");

        const body = JSON.stringify(form);

        try {

            const res = await fetch("http://localhost:5000/admin/professor", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(form)
            });


            const data = await res.json();

            if (!res.ok) {
                alert(data.message);
                return;
            }

            alert("Professor Added Successfully");

            onSubmit?.();
            onClose();

        } catch (err) {
            console.log(err);
            alert("Server Error");
        }
    };

    return (
        <Modal show={show} onHide={onClose} centered>

            <Form onSubmit={handleSubmit}>

                <ModalHeader closeButton>
                    <ModalTitle>Add Professor</ModalTitle>
                </ModalHeader>

                <ModalBody>

                    <Form.Group className="mb-3">
                        <Form.Label>Name</Form.Label>
                        <Form.Control
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            required
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Email</Form.Label>
                        <Form.Control
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Password</Form.Label>
                        <Form.Control
                            type="password"
                            name="password"
                            value={form.password}
                            onChange={handleChange}
                            required
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Department</Form.Label>
                        <Form.Select
                            name="department"
                            value={form.department}
                            onChange={handleChange}
                        >
                            {Department.map((value, index) => (
                                <option key={index}>{value}</option>
                            ))}
                        </Form.Select>
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Birthdate</Form.Label>
                        <Form.Control
                            type="date"
                            name="birthdate"
                            value={form.birthdate}
                            onChange={handleChange}
                        />
                    </Form.Group>


                    <Form.Group className="mb-3">
                        <Form.Label>Phone</Form.Label>
                        <Form.Control
                            name="phone"
                            value={form.phone}
                            onChange={handleChange}
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Status</Form.Label>

                        <Form.Check
                            type="radio"
                            label="Active"
                            name="status"
                            value="active"
                            checked={form.status === "active"}
                            onChange={handleChange}
                        />

                        <Form.Check
                            type="radio"
                            label="Inactive"
                            name="status"
                            value="inactive"
                            checked={form.status === "inactive"}
                            onChange={handleChange}
                        />

                    </Form.Group>

                    <Button type="submit" variant="primary">
                        Add Professor
                    </Button>

                </ModalBody>

            </Form>

        </Modal>
    );
}
