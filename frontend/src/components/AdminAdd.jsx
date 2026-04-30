import React, { useEffect, useState } from "react";
import { Modal, ModalHeader, ModalBody, ModalTitle, Form, Button } from "react-bootstrap";
import Swal from "sweetalert2";

// ✅ Import services
import { addAdmin, updateAdmin } from "../services/adminServices";

const defaultForm = {
    name: "",
    email: "",
    password: "",
    role: "admin",
    status: "active"
};

export default function AdminAdd({ show, onClose, onSubmit, mode = "add", admin }) {

    const [form, setForm] = useState(defaultForm);

    // ✅ Handle input change
    const handleChange = (e) => {
        const { name, value } = e.target;

        setForm({
            ...form,
            [name]: value
        });
    };

    // ✅ Prefill form in edit mode
    useEffect(() => {
        if (mode === "edit" && admin) {
            setForm({
                name: admin.name || "",
                email: admin.email || "",
                password: "",
                role: admin.role || "admin",
                status: admin.status === "Active" ? "active" : "inactive"
            });
        } else {
            setForm(defaultForm);
        }
    }, [mode, admin, show]);



    // ✅ Submit handler (using services)
    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            let payload = { ...form };

            // ❌ Remove password if empty in edit
            if (mode === "edit" && !payload.password) {
                delete payload.password;
            }

            if (mode === "edit") {
                await updateAdmin(admin._id, payload);
            } else {
                await addAdmin(payload);
            }

            Swal.fire({
                icon: "success",
                title: mode === "edit"
                    ? "Admin updated successfully"
                    : "Admin added successfully",
                timer: 1500,
                showConfirmButton: false
            });

            onSubmit?.(); // refresh list
            onClose();

        } catch (err) {
            console.log(err);

            Swal.fire({
                icon: "error",
                title: "Action failed",
                text: err.message || "Unable to save admin"
            });
        }
    };



    return (
        <Modal show={show} onHide={onClose} centered>

            <Form onSubmit={handleSubmit}>

                <ModalHeader closeButton>
                    <ModalTitle>
                        {mode === "edit" ? "Edit Admin" : "Add Admin"}
                    </ModalTitle>
                </ModalHeader>

                <ModalBody>

                    {/* Name */}
                    <Form.Group className="mb-3">
                        <Form.Label>Name</Form.Label>
                        <Form.Control
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            required
                        />
                    </Form.Group>

                    {/* Email */}
                    <Form.Group className="mb-3">
                        <Form.Label>Email</Form.Label>
                        <Form.Control
                            name="email"
                            type="email"
                            value={form.email}
                            onChange={handleChange}
                            required
                        />
                    </Form.Group>

                    {/* Password only for add */}
                    {mode === "add" && (
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
                    )}

                    {/* Role */}
                    <Form.Group className="mb-3">
                        <Form.Label>Role</Form.Label>
                        <Form.Select
                            name="role"
                            value={form.role}
                            onChange={handleChange}
                        >
                            <option value="admin">Admin</option>
                            <option value="professor">Professor</option>
                        </Form.Select>
                    </Form.Group>

                    {/* Status */}
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

                    {/* Submit */}
                    <Button type="submit" variant="primary">
                        {mode === "edit" ? "Update Admin" : "Add Admin"}
                    </Button>

                </ModalBody>

            </Form>

        </Modal>
    );
}
