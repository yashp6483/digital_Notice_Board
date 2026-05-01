import React, { useCallback, useEffect, useState } from "react";
import { Card, Table, Badge, Button, Pagination } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import AdminAdd from "../components/AdminAdd";
import { fetchAdmins, deleteAdmin, mapAdminForTable } from "../services/adminServices";

export default function AdminList() {
    const navigate = useNavigate();

    const [admins, setAdmins] = useState([]);
    const [loading, setLoading] = useState(false);
    const [editAdmin, setEditAdmin] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [roleFilter, setRoleFilter] = useState("all");

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(5);

    const loadAdmins = useCallback(async () => {
        setLoading(true);
        try {
            const adminsFromApi = await fetchAdmins();
            const list = adminsFromApi.map(mapAdminForTable);
            setAdmins(list);
            setCurrentPage(1);
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

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: "Delete this admin?",
            text: "This action cannot be undone.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#ef4444",
            cancelButtonColor: "#858796",
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

    const normalizedQuery = searchQuery.trim().toLowerCase();
    const filteredAdmins = admins.filter((admin) => {
        const name = String(admin.name || "").toLowerCase();
        const email = String(admin.email || "").toLowerCase();
        const status = String(admin.status || "").toLowerCase();
        const role = String(admin.role || "").toLowerCase();

        const matchesSearch =
            !normalizedQuery ||
            name.includes(normalizedQuery) ||
            email.includes(normalizedQuery);
        const matchesStatus = statusFilter === "all" || status === statusFilter;
        const matchesRole = roleFilter === "all" || role === roleFilter;

        return matchesSearch && matchesStatus && matchesRole;
    });

    // Pagination Logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentAdmins = filteredAdmins.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredAdmins.length / itemsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    return (
        <Card className="border-0 shadow-sm rounded-4 overflow-hidden">
            <Card.Body className="p-4">
                {/* Header */}
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h5 className="mb-0 fw-bold text-dark">Administrative Accounts</h5>
                    <div className="d-flex align-items-center gap-2">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="form-control form-control-sm"
                            placeholder="Search admin"
                            style={{ width: "190px" }}
                        />
                        <select
                            value={statusFilter}
                            onChange={(e) => {
                                setStatusFilter(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="form-select form-select-sm"
                            style={{ width: "120px" }}
                        >
                            <option value="all">All Status</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
                        <select
                            value={roleFilter}
                            onChange={(e) => {
                                setRoleFilter(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="form-select form-select-sm"
                            style={{ width: "140px" }}
                        >
                            <option value="all">All Roles</option>
                            <option value="admin">Admin</option>
                        </select>
                        <Button 
                            onClick={() => setShowAddModal(true)}
                            className="btn-primary rounded-3 px-3 py-2 fw-bold shadow-sm"
                        >
                            <i className="fa-solid fa-user-plus me-2"></i> Add Admin
                        </Button>
                    </div>
                </div>

                {/* Table */}
                <div className="table-responsive">
                    <Table hover className="align-middle mb-0">
                        <thead>
                          <tr className="bg-light bg-opacity-50">
                            <th className="border-0 py-3 text-muted small text-uppercase fw-bold ps-3">Administrator</th>
                            <th className="border-0 py-3 text-muted small text-uppercase fw-bold text-center">Role</th>
                            <th className="border-0 py-3 text-muted small text-uppercase fw-bold text-center">Status</th>
                            <th className="border-0 py-3 text-muted small text-uppercase fw-bold text-center pe-3">Actions</th>
                          </tr>
                        </thead>

                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={4} className="text-center py-5">
                                        <div className="spinner-border spinner-border-sm text-primary me-2"></div>
                                        <span className="text-muted">Loading admins...</span>
                                    </td>
                                </tr>
                            ) : filteredAdmins.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="text-center py-5 text-muted">
                                        No administrative accounts found.
                                    </td>
                                </tr>
                            ) : (
                                currentAdmins.map((admin, index) => (
                                    <tr key={admin._id} className="border-bottom border-light">
                                        <td className="py-3 ps-3">
                                            <div className="d-flex align-items-center gap-3">
                                                <div className="bg-dark bg-opacity-10 text-dark rounded-circle d-flex align-items-center justify-content-center fw-bold" style={{ width: "36px", height: "36px", minWidth: "36px", fontSize: '0.8rem' }}>
                                                    {admin.name?.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="fw-bold text-dark">{admin.name}</div>
                                                    <div className="text-muted small">{admin.email}</div>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="text-center py-3">
                                            <Badge 
                                                bg={admin.role === "superadmin" ? "dark" : "secondary"}
                                                className="rounded-pill px-3 py-2 fw-semibold shadow-sm text-uppercase"
                                                style={{ fontSize: '0.65rem' }}
                                            >
                                                {admin.role}
                                            </Badge>
                                        </td>

                                        <td className="text-center py-3">
                                            <Badge 
                                                bg={admin.status === "Active" ? "success" : "warning"}
                                                className="rounded-pill px-3 py-2 fw-semibold shadow-sm"
                                                style={{ fontSize: '0.7rem' }}
                                            >
                                                {admin.status}
                                            </Badge>
                                        </td>

                                        <td className="text-center py-3 pe-3">
                                            <div className="d-flex justify-content-center gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="light"
                                                    className="text-primary p-2 border-0 rounded-3 shadow-sm"
                                                    onClick={() => {
                                                        setEditAdmin(admin);
                                                        setShowAddModal(true);
                                                    }}
                                                >
                                                    <i className="fa-solid fa-user-pen"></i>
                                                </Button>

                                                <Button
                                                    size="sm"
                                                    variant="light"
                                                    className="text-danger p-2 border-0 rounded-3 shadow-sm"
                                                    onClick={() => handleDelete(admin._id)}
                                                >
                                                    <i className="fa-solid fa-trash-can"></i>
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </Table>
                </div>

                {/* Pagination */}
                {!loading && filteredAdmins.length > itemsPerPage && (
                    <div className="d-flex justify-content-between align-items-center mt-4 px-3">
                        <div className="text-muted small">
                            Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredAdmins.length)} of {filteredAdmins.length} accounts
                        </div>
                        <Pagination className="mb-0">
                            <Pagination.Prev 
                                onClick={() => paginate(currentPage - 1)} 
                                disabled={currentPage === 1} 
                            />
                            {[...Array(totalPages)].map((_, i) => (
                                <Pagination.Item 
                                    key={i + 1} 
                                    active={i + 1 === currentPage} 
                                    onClick={() => paginate(i + 1)}
                                >
                                    {i + 1}
                                </Pagination.Item>
                            ))}
                            <Pagination.Next 
                                onClick={() => paginate(currentPage + 1)} 
                                disabled={currentPage === totalPages} 
                            />
                        </Pagination>
                    </div>
                )}

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

