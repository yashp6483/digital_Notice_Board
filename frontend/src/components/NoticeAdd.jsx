import React, { useState } from 'react'
import { Button, Form, Modal } from 'react-bootstrap'
import { categoryVariant } from '../constants/categoryVariant'

export default function NoticeAdd({ show, onClose, onSubmit }) {

    const today = new Date().toISOString().split("T")[0]
    const initialForm = {
        title: "",
        category: "General",
        publishedAt: today,
        status: "active",
        description: "",
        document: null,
        documentName: ""
    }

    const [form, setForm] = useState(initialForm)

    const handleChange = (e) => {
        const { name, value, files } = e.target

        if (name === "document") {
            setForm(prev => ({
                ...prev,
                document: files[0],
                documentName: files[0]?.name || ""
            }))
        } else {
            setForm(prev => ({
                ...prev,
                [name]: value
            }))
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        const token = localStorage.getItem("token")
        if (!token) {
            alert("Please login again")
            return
        }

        const formData = new FormData()
        formData.append("title", form.title.trim())
        formData.append("category", form.category)
        formData.append("publishedAt", form.publishedAt)
        formData.append("status", form.status)

        formData.append("description", form.description.trim())

        if (form.document) {
            formData.append("document", form.document)
        }

        try {
            const res = await fetch("http://localhost:5000/admin/notice", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`
                },
                body: formData
            })

            let data = {}
            try {
                data = await res.json()
            } catch {
                data = {}
            }

            if (!res.ok) {
                alert(data.message || data.err || "Failed to add notice")
                return
            }

            alert(data.message || "Notice added successfully")
            onSubmit?.(data.notice)
            setForm(initialForm)
            onClose?.()
        } catch (error) {
            console.error(error)
            alert("Server error")
        }
    }

    return (
        <Modal show={show} onHide={onClose} centered>
            <Modal.Header closeButton>
                <Modal.Title>Add Notice</Modal.Title>
            </Modal.Header>

            <Form onSubmit={handleSubmit}>
                <Modal.Body>

                    <Form.Group className="mb-3">
                        <Form.Label>Title</Form.Label>
                        <Form.Control
                            name="title"
                            value={form.title}
                            onChange={handleChange}
                            required
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Category</Form.Label>
                        <Form.Select
                            name="category"
                            value={form.category}
                            onChange={handleChange}
                        >
                            {Object.keys(categoryVariant).map(item => (
                                <option key={item} value={item}>{item}</option>
                            ))}
                        </Form.Select>
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Publish Date</Form.Label>
                        <Form.Control
                            type="date"
                            name="publishedAt"
                            value={form.publishedAt}
                            onChange={handleChange}
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Status</Form.Label>
                        <Form.Check
                            type="radio"
                            name="status"
                            value="active"
                            checked={form.status === "active"}
                            onChange={handleChange}
                            label="Active"
                        />
                        <Form.Check
                            type="radio"
                            name="status"
                            value="inactive"
                            checked={form.status === "inactive"}
                            onChange={handleChange}
                            label="Inactive"
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Description</Form.Label>
                        <Form.Control
                            as="textarea"
                            name="description"
                            value={form.description}
                            onChange={handleChange}
                            required
                        />
                    </Form.Group>

                    <Form.Group className="mt-3">
                        <Form.Label>Upload Document</Form.Label>
                        <Form.Control
                            type="file"
                            name="document"
                            accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                            onChange={handleChange}
                        />
                        {form.documentName && (
                            <Form.Text className="text-muted">
                                Selected: {form.documentName}
                            </Form.Text>
                        )}
                    </Form.Group>

                </Modal.Body>

                <Modal.Footer>
                    <Button variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button type="submit">Add Notice</Button>
                </Modal.Footer>
            </Form>
        </Modal>
    )
}
