import React, { useCallback, useEffect, useState } from "react";
import { Badge, Button, Card, Table, Pagination } from "react-bootstrap";
import NoticeAdd from "./NoticeAdd";
import { categoryVariant } from "../constants/categoryVariant";
import DocumentViewerModal from "./DocumentViewerModal";
import {
  approveNotice,
  deleteNotice,
  fetchNotice,
  mapNoticeForTable,
  rejectNotice,
} from "../services/noticeServices";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

export default function NoticeTable({ notices: externalNotices }) {
  const navigate = useNavigate();

  const [editNotice, setEditNotice] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);

  const role = localStorage.getItem("role");
  const loggedInUser = localStorage.getItem("name");

  const fetchNotices = useCallback(async (resetPage = true, silent = false) => {
    if (!silent) {
      setLoading(true);
    }
    try {
      if (externalNotices) {
        setNotices(externalNotices.map(mapNoticeForTable));
      } else {
        const data = await fetchNotice();
        setNotices(data.map(mapNoticeForTable));
      }
      if (resetPage) {
        setCurrentPage(1);
      }
    } catch (error) {
      console.error(error);
      setNotices([]);
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  }, [externalNotices]);

  useEffect(() => {
    fetchNotices();
  }, [fetchNotices]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      fetchNotices(false, true);
    }, 10000);

    return () => clearInterval(intervalId);
  }, [fetchNotices]);

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Delete this notice?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#858796",
      confirmButtonText: "Yes, delete",
    });

    if (!result.isConfirmed) return;

    try {
      await deleteNotice(id);
      setNotices((prev) => prev.filter((n) => n._id !== id));
      Swal.fire({
        icon: "success",
        title: "Deleted!",
        timer: 1200,
        showConfirmButton: false,
      });
    } catch (error) {
      if (error.status === 401 || error.status === 403) {
        localStorage.clear();
        navigate("/unauthorized");
        return;
      }
      Swal.fire({ icon: "error", title: "Delete failed" });
    }
  };

  const handleApprove = async (id) => {
    try {
      await approveNotice(id);
      await fetchNotices();
      Swal.fire({
        icon: "success",
        title: "Notice approved",
        timer: 1200,
        showConfirmButton: false,
      });
    } catch (error) {
      if (error.status === 401 || error.status === 403) {
        localStorage.clear();
        navigate("/unauthorized");
        return;
      }
      Swal.fire({ icon: "error", title: "Approve failed" });
    }
  };

  const handleReject = async (id) => {
    try {
      await rejectNotice(id);
      await fetchNotices();
      Swal.fire({
        icon: "success",
        title: "Notice rejected",
        timer: 1200,
        showConfirmButton: false,
      });
    } catch (error) {
      if (error.status === 401 || error.status === 403) {
        localStorage.clear();
        navigate("/unauthorized");
        return;
      }
      Swal.fire({ icon: "error", title: "Reject failed" });
    }
  };

  // Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredNotices = notices.filter((notice) => {
    const status = String(notice.status || "").toLowerCase();
    const approvalStatus = String(notice.approvalStatus || "").toLowerCase();

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && status === "active") ||
      (statusFilter === "inactive" && status === "inactive") ||
      (statusFilter === "pending" && approvalStatus === "pending") ||
      ((statusFilter === "approved" || statusFilter === "approve") && approvalStatus === "approved");

    const title = String(notice.title || "").toLowerCase();
    const matchesSearch = !normalizedQuery || title.includes(normalizedQuery);

    return matchesStatus && matchesSearch;
  });
  const currentFilteredItems = filteredNotices.slice(indexOfFirstItem, indexOfLastItem);
  const filteredTotalPages = Math.ceil(filteredNotices.length / itemsPerPage);

  return (
    <Card className="border-0 shadow-sm rounded-4 overflow-hidden">
      <Card.Body className="p-3">

        {/* HEADER */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="fw-bold mb-0 text-dark">Notice Archive</h5>
          <div className="d-flex align-items-center gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="form-control form-control-sm"
              placeholder="Search notice name"
              style={{ width: "220px" }}
            />
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="form-select form-select-sm"
              style={{ width: "140px" }}
            >
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
            </select>
            {(role === "admin" || role === "professor") && (
              <Button 
                  onClick={() => setShowAddModal(true)}
                  className="btn-primary rounded-3 px-3 py-2 fw-bold shadow-sm"
              >
                <i className="fa-solid fa-plus me-2"></i> Add Notice
              </Button>
            )}
          </div>
        </div>

        <div className="table-responsive">
          <Table hover className="align-middle mb-0">
            <thead>
              <tr className="bg-light bg-opacity-50">
                <th className="border-0 py-3 text-muted small text-uppercase fw-bold ps-3">Notice Info</th>
                <th className="border-0 py-3 text-muted small text-uppercase fw-bold text-center">Category</th>
                <th className="border-0 py-3 text-muted small text-uppercase fw-bold text-center">Date</th>
                <th className="border-0 py-3 text-muted small text-uppercase fw-bold text-center">Expire Time</th>
                <th className="border-0 py-3 text-muted small text-uppercase fw-bold text-center">Author</th>
                <th className="border-0 py-3 text-muted small text-uppercase fw-bold text-center">Status</th>
                <th className="border-0 py-3 text-muted small text-uppercase fw-bold text-center">Approval</th>
                <th className="border-0 py-3 text-muted small text-uppercase fw-bold text-center">Doc</th>
                <th className="border-0 py-3 text-muted small text-uppercase fw-bold text-center pe-3">Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} className="text-center py-5">
                    <div className="spinner-border spinner-border-sm text-primary me-2"></div>
                    <span className="text-muted">Fetching notices...</span>
                  </td>
                </tr>
              ) : filteredNotices.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-5 text-muted">
                    No notices available.
                  </td>
                </tr>
              ) : (
                currentFilteredItems.map((n, i) => {
                  const isOwner = n.createdBy?.name === loggedInUser || n.professor === loggedInUser;
                  const canEditDelete = role === "admin" || isOwner;
                  const canReviewApproval =
                    role === "admin" &&
                    n.approvalStatus === "pending" &&
                    n.requiresApproval === true &&
                    n.createdBy?.role === "professor";

                  return (
                    <tr key={i} className="border-bottom border-light">
                      <td className="py-3 ps-3">
                        <div className="fw-bold text-dark text-truncate" style={{ maxWidth: "200px" }}>
                          {n.title}
                        </div>
                      </td>

                      <td className="text-center py-3">
                        <Badge 
                            bg={categoryVariant[n.category]}
                            className="rounded-pill px-3 py-2 fw-semibold shadow-sm"
                            style={{ fontSize: '0.7rem' }}
                        >
                          {n.category}
                        </Badge>
                      </td>

                      <td className="text-center py-3 text-muted small fw-medium">
                        {n.displayPublishedAt}
                      </td>
                      <td className="text-center py-3 text-muted small fw-medium">
                        {n.displayExpiresAt || "-"}
                      </td>

                      <td className="text-center py-3 text-muted small">
                        {n.createdBy?.name || n.professor || "N/A"}
                      </td>

                      <td className="text-center py-3">
                        <Badge
                          bg={n.displayStatus === "Active" ? "success" : (n.displayStatus === "Scheduled" ? "info" : "warning")}
                          className="rounded-pill px-3 py-2 fw-semibold shadow-sm"
                          style={{ fontSize: '0.7rem' }}
                        >
                          {n.displayStatus}
                        </Badge>
                      </td>

                      <td className="text-center py-3">
                        <Badge
                          bg={
                            n.displayApprovalStatus === "Approved"
                              ? "success"
                              : n.displayApprovalStatus === "Rejected"
                                ? "danger"
                                : "warning"
                          }
                          className="rounded-pill px-3 py-2 fw-semibold shadow-sm"
                          style={{ fontSize: "0.7rem" }}
                        >
                          {n.displayApprovalStatus}
                        </Badge>
                      </td>

                      <td className="text-center py-3">
                        <Button
                          variant="light"
                          size="sm"
                          className="text-primary p-2 border-0 rounded-3 shadow-sm"
                          onClick={() => {
                            setSelectedDoc(n.displayDocumentUrl);
                            setShowModal(true);
                          }}
                        >
                          <i className="fa-solid fa-eye"></i>
                        </Button>
                      </td>

                      <td className="text-center py-3 pe-3">
                        {canReviewApproval ? (
                          <div className="d-flex gap-2 justify-content-center">
                            <Button
                              size="sm"
                              variant="light"
                              className="text-success p-2 border-0 rounded-3 shadow-sm"
                              onClick={() => handleApprove(n._id)}
                              title="Approve"
                            >
                              <i className="fa-solid fa-check"></i>
                            </Button>
                            <Button
                              size="sm"
                              variant="light"
                              className="text-danger p-2 border-0 rounded-3 shadow-sm"
                              onClick={() => handleReject(n._id)}
                              title="Reject"
                            >
                              <i className="fa-solid fa-xmark"></i>
                            </Button>
                          </div>
                        ) : canEditDelete ? (
                          <div className="d-flex gap-2 justify-content-center">
                            <Button
                              size="sm"
                              variant="light"
                              className="text-warning p-2 border-0 rounded-3 shadow-sm"
                              onClick={() => {
                                setEditNotice(n);
                                setShowAddModal(true);
                              }}
                            >
                              <i className="fa-solid fa-pen-to-square"></i>
                            </Button>

                            <Button
                              size="sm"
                              variant="light"
                              className="text-danger p-2 border-0 rounded-3 shadow-sm"
                              onClick={() => handleDelete(n._id)}
                            >
                              <i className="fa-solid fa-trash-can"></i>
                            </Button>
                          </div>
                        ) : (
                          <span className="badge bg-light text-muted fw-normal">Read Only</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </Table>
        </div>

        {/* PAGINATION */}
        {!loading && filteredNotices.length > itemsPerPage && (
          <div className="d-flex justify-content-between align-items-center mt-3 px-3">
            <div className="text-muted small">
              Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredNotices.length)} of {filteredNotices.length} notices
            </div>
            <Pagination className="mb-0">
              <Pagination.Prev 
                onClick={() => paginate(currentPage - 1)} 
                disabled={currentPage === 1} 
              />
              {[...Array(filteredTotalPages)].map((_, i) => (
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
                disabled={currentPage === filteredTotalPages} 
              />
            </Pagination>
          </div>
        )}

        {/* MODALS */}
        <NoticeAdd
          show={showAddModal}
          onClose={() => {
            setShowAddModal(false);
            setEditNotice(null);
          }}
          onSubmit={fetchNotices}
          mode={editNotice ? "edit" : "add"}
          notice={editNotice}
        />

        <DocumentViewerModal
          show={showModal}
          onHide={() => setShowModal(false)}
          documentUrl={selectedDoc}
        />
      </Card.Body>
    </Card>
  );
}

