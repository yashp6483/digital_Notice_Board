import React, { useCallback, useEffect, useState } from "react";
import { Badge, Button, Card, Table, Pagination } from "react-bootstrap";
import NoticeAdd from "./NoticeAdd";
import { categoryVariant } from "../constants/categoryVariant";
import DocumentViewerModal from "./DocumentViewerModal";
import {
  deleteNotice,
  fetchNotice,
  mapNoticeForTable,
} from "../servieces/noticeServices";
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

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);

  const role = localStorage.getItem("role");
  const loggedInUser = localStorage.getItem("name");

  const fetchNotices = useCallback(async () => {
    setLoading(true);
    try {
      if (externalNotices) {
        setNotices(externalNotices.map(mapNoticeForTable));
      } else {
        const data = await fetchNotice();
        setNotices(data.map(mapNoticeForTable));
      }
      setCurrentPage(1); // Reset to first page on new fetch
    } catch (error) {
      console.error(error);
      setNotices([]);
    } finally {
      setLoading(false);
    }
  }, [externalNotices]);

  useEffect(() => {
    fetchNotices();
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

  // Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = notices.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(notices.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <Card className="border-0 shadow-sm rounded-4 overflow-hidden">
      <Card.Body className="p-3">

        {/* HEADER */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="fw-bold mb-0 text-dark">Notice Archive</h5>
          {(role === "admin" || role === "professor") && (
            <Button 
                onClick={() => setShowAddModal(true)}
                className="btn-primary rounded-3 px-3 py-2 fw-bold shadow-sm"
            >
              <i className="fa-solid fa-plus me-2"></i> Add Notice
            </Button>
          )}
        </div>

        <div className="table-responsive">
          <Table hover className="align-middle mb-0">
            <thead>
              <tr className="bg-light bg-opacity-50">
                <th className="border-0 py-3 text-muted small text-uppercase fw-bold ps-3">Notice Info</th>
                <th className="border-0 py-3 text-muted small text-uppercase fw-bold text-center">Category</th>
                <th className="border-0 py-3 text-muted small text-uppercase fw-bold text-center">Date</th>
                <th className="border-0 py-3 text-muted small text-uppercase fw-bold text-center">Author</th>
                <th className="border-0 py-3 text-muted small text-uppercase fw-bold text-center">Status</th>
                <th className="border-0 py-3 text-muted small text-uppercase fw-bold text-center">Doc</th>
                <th className="border-0 py-3 text-muted small text-uppercase fw-bold text-center pe-3">Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-5">
                    <div className="spinner-border spinner-border-sm text-primary me-2"></div>
                    <span className="text-muted">Fetching notices...</span>
                  </td>
                </tr>
              ) : notices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-5 text-muted">
                    No notices available.
                  </td>
                </tr>
              ) : (
                currentItems.map((n, i) => {
                  const isOwner = n.createdBy?.name === loggedInUser || n.professor === loggedInUser;
                  const canEditDelete = role === "admin" || isOwner;

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
                        {n.publishedAt}
                      </td>

                      <td className="text-center py-3 text-muted small">
                        {n.createdBy?.name || n.professor || "N/A"}
                      </td>

                      <td className="text-center py-3">
                        <Badge
                          bg={n.status === "Active" ? "success" : (n.status === "Scheduled" ? "info" : "warning")}
                          className="rounded-pill px-3 py-2 fw-semibold shadow-sm"
                          style={{ fontSize: '0.7rem' }}
                        >
                          {n.status}
                        </Badge>
                      </td>

                      <td className="text-center py-3">
                        <Button
                          variant="light"
                          size="sm"
                          className="text-primary p-2 border-0 rounded-3 shadow-sm"
                          onClick={() => {
                            setSelectedDoc(n.documentUrl);
                            setShowModal(true);
                          }}
                        >
                          <i className="fa-solid fa-eye"></i>
                        </Button>
                      </td>

                      <td className="text-center py-3 pe-3">
                        {canEditDelete ? (
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
        {!loading && notices.length > itemsPerPage && (
          <div className="d-flex justify-content-between align-items-center mt-3 px-3">
            <div className="text-muted small">
              Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, notices.length)} of {notices.length} notices
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

