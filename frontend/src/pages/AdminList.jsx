import React, { useCallback, useEffect, useState } from "react";
import { Card, Table, Badge, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

import AdminAdd from "../components/AdminAdd";
import { fetchAdmins, deleteAdmin, mapAdminForTable } from "../servieces/adminServices";

export default function AdminList() {

    const navigate = useNavigate();

    const [admins, setAdmins] = useState([]);
    const [loading, setLoading] = useState(false);
    const [editAdmin, setEditAdmin] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);

    // ✅ Fetch Admins
    const loadAdmins = useCallback(async () => {
        setLoading(true);
        try {
            const adminsFromApi = await fetchAdmins();
            const list = adminsFromApi.map(mapAdminForTable);
            setAdmins(list);
        } catch (error) {
            console.error(error);

            if (error.status === 401 || error.status === 403) {
                localStorage.clear();
                navigate("/unauthorized");
                return;
            }

            Swal.fire({
                icon: "error",
                title: "Failed to load admins",
                text: error.message || "Something went wrong"
            });

        } finally {
            setLoading(false);
        }
    }, [navigate]);

    // ✅ Delete Admin
    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: "Delete this admin?",
            text: "This action cannot be undone.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes, delete"
        });

        if (!result.isConfirmed) return;

        try {
            await deleteAdmin(id);

            setAdmins((prev) => prev.filter((a) => a._id !== id));

            Swal.fire({
                icon: "success",
                title: "Admin deleted",
                timer: 1200,
                showConfirmButton: false
            });

        } catch (error) {

            if (error.status === 401 || error.status === 403) {
                localStorage.clear();
                navigate("/unauthorized");
                return;
            }

            Swal.fire({
                icon: "error",
                title: "Delete failed",
                text: error.message || "Unable to delete admin"
            });
        }
    };

    useEffect(() => {
        loadAdmins();
    }, [loadAdmins]);

    return (
        <Card className="shadow-sm h-100">
            <Card.Body>

                {/* Header */}
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <Card.Title className="mb-0">Admin List</Card.Title>

                    <Button onClick={() => setShowAddModal(true)}>
                        + Add Admin
                    </Button>
                </div>

                {/* Table */}
                <div className="table-responsive">
                    <Table className="text-center align-middle mb-0">

                        <thead className="table-light">
                            <tr>
                                <th>No.</th>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>

                        <tbody>

                            {loading && (
                                <tr>
                                    <td colSpan={6} className="text-center text-muted">
                                        Loading admins...
                                    </td>
                                </tr>
                            )}

                            {!loading && admins.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="text-center text-muted">
                                        No admins found
                                    </td>
                                </tr>
                            )}

                            {!loading && admins.map((admin, index) => (
                                <tr key={admin._id}>
                                    <td>{index + 1}</td>

                                    <td className="text-start">
                                        <div className="fw-semibold text-truncate" style={{ maxWidth: "180px" }}>
                                            {admin.name}
                                        </div>
                                    </td>

                                    <td className="text-truncate" style={{ maxWidth: "200px" }}>
                                        {admin.email}
                                    </td>

                                    <td>
                                        <Badge bg={admin.role === "superadmin" ? "primary" : "secondary"}>
                                            {admin.role}
                                        </Badge>
                                    </td>

                                    <td>
                                        <Badge bg={admin.status === "Active" ? "success" : "warning"}>
                                            {admin.status}
                                        </Badge>
                                    </td>

                                    <td>
                                        <div className="d-flex justify-content-center gap-2">

                                            <Button
                                                size="sm"
                                                className="rounded-circle d-flex align-items-center justify-content-center"
                                                style={{ width: "35px", height: "35px" }}
                                                variant="outline-primary"
                                                onClick={() => {
                                                    setEditAdmin(admin);
                                                    setShowAddModal(true);
                                                }}
                                            >
                                                <i className="fas fa-edit"></i>
                                            </Button>

                                            <Button
                                                size="sm"
                                                className="rounded-circle d-flex align-items-center justify-content-center"
                                                style={{ width: "35px", height: "35px" }}
                                                variant="outline-danger"
                                                onClick={() => handleDelete(admin._id)}
                                            >
                                                <i className="fas fa-trash"></i>
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </div>

                {/* Modal */}
                <AdminAdd
                    show={showAddModal}
                    onClose={() => {
                        setShowAddModal(false);
                        setEditAdmin(null);
                    }}
                    onSubmit={loadAdmins}
                    mode={editAdmin ? "edit" : "add"}
                    admin={editAdmin}
                />

            </Card.Body>
        </Card>
    );
}
