import React, { useState, useEffect } from "react";
import { Modal, Form, Button, Row, Col } from "react-bootstrap";
import { categoryVariant } from "../constants/categoryVariant";
import Swal from "sweetalert2";
import { buildApiUrl } from "../config/api";

export default function NoticeAdd({ show, onClose, onSubmit, mode = "add", notice }) {

    const createDefaultForm = () => {
        const now = new Date();
        let publishDate = "";
        try {
            publishDate = now.toISOString().split("T")[0];
        } catch (e) {
            publishDate = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD
        }
        
        return {
            title: "",
            category: "General",
            isScheduled: false,
            publishDate,
            publishTime: now.toTimeString().slice(0, 5),
            status: "active",
            description: "",
            document: null
        };
    };

    const [form, setForm] = useState(() => createDefaultForm());

    useEffect(() => {
        if (!show) return;

        if (mode === "edit" && notice) {
            let pubDateObj = notice.publishedAt ? new Date(notice.publishedAt) : new Date();
            if (isNaN(pubDateObj.getTime())) pubDateObj = new Date();

            let publishDateStr = "";
            try {
                publishDateStr = pubDateObj.toISOString().split("T")[0];
            } catch (e) {
                publishDateStr = pubDateObj.toLocaleDateString('en-CA');
            }

            setForm({
                title: notice.title || "",
                category: notice.category || "General",
                isScheduled: notice.status === "scheduled",
                publishDate: publishDateStr,
                publishTime: pubDateObj.toTimeString().slice(0, 5),
                status: notice.status?.toLowerCase() === "scheduled" ? "active" : (notice.status?.toLowerCase() || "active"),
                description: notice.description || "",
                document: null
            });
        } else {
            setForm(createDefaultForm());
        }
    }, [mode, notice, show]);

    const handleChange = (e) => {
        const { name, value, files, type, checked } = e.target;
        setForm(prev => ({
            ...prev,
            [name]: type === "checkbox" ? checked : (files ? files[0] : value)
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
        
        // Append basic fields
        formData.append("title", form.title);
        formData.append("category", form.category);
        formData.append("description", form.description);
        formData.append("status", form.status);
        if (form.document) formData.append("document", form.document);

        // Handle publishedAt
        if (form.isScheduled) {
            formData.append("publishedAt", `${form.publishDate}T${form.publishTime}:00`);
        } else {
            formData.append("publishedAt", new Date().toISOString());
        }

        const url = mode === "edit"
            ? buildApiUrl(`admin/notice/update/${notice._id}`)
            : buildApiUrl("admin/notice");

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
                            <Form.Group className="mb-2">
                                <Form.Check 
                                    type="switch"
                                    id="schedule-switch"
                                    label="Schedule for later"
                                    name="isScheduled"
                                    checked={form.isScheduled}
                                    onChange={handleChange}
                                    className="fw-bold text-muted"
                                />
                            </Form.Group>
                        </Col>

                        {form.isScheduled && (
                            <>
                                <Col md={6}>
                                    <Form.Group>
                                        <Form.Label className="small fw-bold text-uppercase text-muted">Publish Date</Form.Label>
                                        <Form.Control 
                                            type="date" 
                                            name="publishDate" 
                                            className="bg-light border-0 py-2 rounded-3"
                                            value={form.publishDate} 
                                            onChange={handleChange} 
                                            required={form.isScheduled}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group>
                                        <Form.Label className="small fw-bold text-uppercase text-muted">Publish Time</Form.Label>
                                        <Form.Control 
                                            type="time" 
                                            name="publishTime" 
                                            className="bg-light border-0 py-2 rounded-3"
                                            value={form.publishTime} 
                                            onChange={handleChange} 
                                            required={form.isScheduled}
                                        />
                                    </Form.Group>
                                </Col>
                            </>
                        )}

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
