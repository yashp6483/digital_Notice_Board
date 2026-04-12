import React, { useState, useEffect } from "react";
import { Modal, Form, Button } from "react-bootstrap";
import { categoryVariant } from "../constants/categoryVariant";
import Swal from "sweetalert2";

const toInputDate = (value) => {
    if (!value) return new Date().toISOString().split("T")[0];

    // Already ISO
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;

    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) {
        return date.toISOString().split("T")[0];
    }

    // Handle DD-MM-YYYY
    const parts = value.split("-");
    if (parts.length === 3) {
        const [day, month, year] = parts;
        if (day.length === 2 && month.length === 2 && year.length === 4) {
            return `${year}-${month}-${day}`;
        }
    }

    return new Date().toISOString().split("T")[0];
};

export default function NoticeAdd({ show, onClose, onSubmit, mode = "add", notice }) {

    const createDefaultForm = () => ({
        title: "",
        category: "General",
        publishedAt: new Date().toISOString().split("T")[0],
        status: "active",
        description: "",
        document: null
    });

    const [form, setForm] = useState(() => createDefaultForm());

    useEffect(() => {
        if (!show) return;

        if (mode === "edit" && notice) {
            setForm({
                title: notice.title || "",
                category: notice.category || "General",
                publishedAt: toInputDate(notice.publishedAt),
                status: notice.status?.toLowerCase() || "active",
                description: notice.description || "",
                document: null
            });
        } else {
            setForm(createDefaultForm());
        }
    }, [mode, notice, show]);

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        setForm(prev => ({
            ...prev,
            [name]: files ? files[0] : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const token = localStorage.getItem("token");
        if (!token) {
            Swal.fire({
                icon: "warning",
                title: "Session expired",
                text: "Please login again."
            });
            return;
        }

        const formData = new FormData();
        Object.keys(form).forEach(key => {
            if (form[key]) formData.append(key, form[key]);
        });

        const url = mode === "edit"
            ? `/admin/notice/update/${notice._id}`
            : "/admin/notice";

        const method = mode === "edit" ? "PUT" : "POST";

        try {
            const res = await fetch(url, {
                method,
                headers: { Authorization: `Bearer ${token}` },
                body: formData
            });

            const data = await res.json();

            if (!res.ok) {
                Swal.fire({
                    icon: "error",
                    title: mode === "edit" ? "Update failed" : "Creation failed",
                    text: data.message || "Unable to save notice"
                });
                return;
            }

            Swal.fire({
                icon: "success",
                title: data.message || (mode === "edit" ? "Notice updated" : "Notice created"),
                timer: 1500,
                showConfirmButton: false
            });
            onSubmit?.();
            onClose();

        } catch (err) {
            console.error(err);
            Swal.fire({
                icon: "error",
                title: "Server error",
                text: "Unable to save notice right now."
            });
        }
    };

    return (
        <Modal show={show} onHide={onClose} centered>
            <Form onSubmit={handleSubmit}>
                <Modal.Header closeButton>
                    <Modal.Title>{mode === "edit" ? "Edit Notice" : "Add Notice"}</Modal.Title>
                </Modal.Header>

                <Modal.Body>

                    <Form.Group className="mb-3">
                        <Form.Label>Title</Form.Label>
                        <Form.Control name="title" value={form.title} onChange={handleChange} required />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Category</Form.Label>
                        <Form.Select name="category" value={form.category} onChange={handleChange}>
                            {Object.keys(categoryVariant).map(c => (
                                <option key={c}>{c}</option>
                            ))}
                        </Form.Select>
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Publish Date</Form.Label>
                        <Form.Control type="date" name="publishedAt" value={form.publishedAt} onChange={handleChange} />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Status</Form.Label>
                        <Form.Check type="radio" label="Active" name="status" value="active"
                            checked={form.status === "active"} onChange={handleChange} />
                        <Form.Check type="radio" label="Inactive" name="status" value="inactive"
                            checked={form.status === "inactive"} onChange={handleChange} />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Description</Form.Label>
                        <Form.Control as="textarea" name="description"
                            value={form.description} onChange={handleChange} />
                    </Form.Group>

                    <Form.Group>
                        <Form.Label>Document</Form.Label>
                        <Form.Control type="file" name="document"
                            accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                            onChange={handleChange} />
                    </Form.Group>

                </Modal.Body>

                <Modal.Footer>
                    <Button variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button type="submit">
                        {mode === "edit" ? "Update Notice" : "Add Notice"}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
}
