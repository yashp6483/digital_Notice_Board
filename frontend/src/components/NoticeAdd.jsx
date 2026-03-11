import React, { useState, useEffect } from "react";
import { Modal, Form, Button } from "react-bootstrap";
import { categoryVariant } from "../constants/categoryVariant";

export default function NoticeAdd({ show, onClose, onSubmit, mode = "add", notice }) {

    const today = new Date().toISOString().split("T")[0];

    const [form, setForm] = useState({
        title: "",
        category: "General",
        publishedAt: today,
        status: "active",
        description: "",
        document: null
    });

    useEffect(() => {
        if (mode === "edit" && notice) {
            setForm({
                title: notice.title || "",
                category: notice.category || "General",
                publishedAt: notice.publishedAt || today,
                status: notice.status?.toLowerCase() || "active",
                description: notice.description || "",
                document: null
            });
        }
    }, [notice, mode, today ]);

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
        if (!token) return alert("Please login again");

        const formData = new FormData();
        Object.keys(form).forEach(key => {
            if (form[key]) formData.append(key, form[key]);
        });

        const url = mode === "edit"
            ? `http://localhost:5000/admin/notice/update/${notice._id}`
            : "http://localhost:5000/admin/notice";

        const method = mode === "edit" ? "PUT" : "POST";

        try {
            const res = await fetch(url, {
                method,
                headers: { Authorization: `Bearer ${token}` },
                body: formData
            });

            const data = await res.json();

            if (!res.ok) return alert(data.message || "Failed");

            alert(data.message || "Success");
            onSubmit?.();
            onClose();

        } catch (err) {
            console.error(err);
            alert("Server error");
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
