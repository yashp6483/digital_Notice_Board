import React, { useState, useEffect } from "react";
import { Modal, Form, Button, Row, Col } from "react-bootstrap";
import { categoryVariant } from "../constants/categoryVariant";
import Swal from "sweetalert2";
import { buildApiUrl } from "../config/api";

const toInputDate = (value) => {
    if (!value) return new Date().toISOString().split("T")[0];
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;

    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) {
        return date.toISOString().split("T")[0];
    }

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
            Swal.fire({ icon: "warning", title: "Session expired", text: "Please login again." });
            return;
        }

        const formData = new FormData();
        Object.keys(form).forEach(key => {
            if (form[key]) formData.append(key, form[key]);
        });

        const url = mode === "edit"
            ? buildApiUrl(`admin/notice/update/${notice._id}`)
            : buildApiUrl("admin/notice");

        const method = mode === "edit" ? "PUT" : "POST";

        try {
            console.log("Submitting notice to:", url);
            console.log("Form Data:", Object.fromEntries(formData.entries()));

            const res = await fetch(url, {
                method,
                headers: { Authorization: `Bearer ${token}` },
                body: formData
            });

            const data = await res.json();
            console.log("Server Response:", data);

            if (!res.ok) {
                console.error("Notice submission failed:", data);
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
            Swal.fire({ icon: "error", title: "Server error", text: "Unable to save notice right now." });
        }
    };

    return (
        <Modal show={show} onHide={onClose} centered size="lg">
            <Form onSubmit={handleSubmit}>
                <Modal.Header closeButton className="border-0 pb-0">
                    <Modal.Title className="fw-bold text-dark">
                        {mode === "edit" ? "📝 Edit Notice" : "📢 Create New Notice"}
                    </Modal.Title>
                </Modal.Header>

                <Modal.Body className="px-4 py-4">
                    <Row className="g-3">
                        <Col md={12}>
                            <Form.Group>
                                <Form.Label className="small fw-bold text-uppercase text-muted">Notice Title</Form.Label>
                                <Form.Control 
                                    name="title" 
                                    className="bg-light border-0 py-2 rounded-3"
                                    value={form.title} 
                                    onChange={handleChange} 
                                    placeholder="e.g., Final Examination Schedule 2026"
                                    required 
                                />
                            </Form.Group>
                        </Col>

                        <Col md={6}>
                            <Form.Group>
                                <Form.Label className="small fw-bold text-uppercase text-muted">Category</Form.Label>
                                <Form.Select 
                                    name="category" 
                                    className="bg-light border-0 py-2 rounded-3"
                                    value={form.category} 
                                    onChange={handleChange}
                                >
                                    {Object.keys(categoryVariant).map(c => (
                                        <option key={c}>{c}</option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                        </Col>

                        <Col md={6}>
                            <Form.Group>
                                <Form.Label className="small fw-bold text-uppercase text-muted">Status</Form.Label>
                                <div className="d-flex gap-3 pt-1">
                                    <Form.Check 
                                        type="radio" 
                                        label="Active" 
                                        name="status" 
                                        id="notice-active"
                                        value="active"
                                        checked={form.status === "active"} 
                                        onChange={handleChange} 
                                    />
                                    <Form.Check 
                                        type="radio" 
                                        label="Inactive" 
                                        name="status" 
                                        id="notice-inactive"
                                        value="inactive"
                                        checked={form.status === "inactive"} 
                                        onChange={handleChange} 
                                    />
                                </div>
                            </Form.Group>
                        </Col>

                        <Col md={12}>
                            <Form.Group>
                                <Form.Label className="small fw-bold text-uppercase text-muted">Publish Date</Form.Label>
                                <Form.Control 
                                    type="date" 
                                    name="publishedAt" 
                                    className="bg-light border-0 py-2 rounded-3"
                                    value={form.publishedAt} 
                                    onChange={handleChange} 
                                />
                            </Form.Group>
                        </Col>

                        <Col md={12}>
                            <Form.Group>
                                <Form.Label className="small fw-bold text-uppercase text-muted">Description</Form.Label>
                                <Form.Control 
                                    as="textarea" 
                                    name="description"
                                    rows={3}
                                    className="bg-light border-0 rounded-3"
                                    value={form.description} 
                                    onChange={handleChange} 
                                    placeholder="Provide brief details about the notice..."
                                    required
                                />
                            </Form.Group>
                        </Col>

                        <Col md={12}>
                            <Form.Group>
                                <Form.Label className="small fw-bold text-uppercase text-muted">Attachment</Form.Label>
                                <Form.Control 
                                    type="file" 
                                    name="document"
                                    className="bg-light border-0 py-2 rounded-3"
                                    accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                                    onChange={handleChange} 
                                />
                            </Form.Group>
                        </Col>
                    </Row>
                </Modal.Body>

                <Modal.Footer className="border-0 pt-0 px-4 pb-4">
                    <Button variant="light" className="px-4 fw-bold text-muted" onClick={onClose}>Discard</Button>
                    <Button type="submit" className="px-4 fw-bold shadow-sm">
                        {mode === "edit" ? "Update Broadcast" : "Post Notice"}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
}
