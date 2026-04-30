import React, { useCallback, useEffect, useState } from "react";
import { Card, Table, Badge, Button, Pagination } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import ProfessorAdd from "../components/ProfessorAdd";
import { deleteProfessor, fetchProfessor, mapProfessorForTable } from "../services/professorServices";
import Swal from "sweetalert2";

export default function ProfessorList({ showDetails = false, maxEntries = null }) {
  const navigate = useNavigate();
  const [editProfessor, setEditProfessor] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [professors, setProfessor] = useState([]);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);

  const fetchProfessors = useCallback(async () => {
    setLoading(true);
    try {
      const professorsFromApi = await fetchProfessor();
      const list = professorsFromApi.map(mapProfessorForTable);
      setProfessor(list);
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
        title: "Failed to load professors",
        text: error.message || "Something went wrong"
      });
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Delete this professor?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#858796",
      confirmButtonText: "Yes, delete",
      cancelButtonText: "Cancel"
    });

    if (!result.isConfirmed) return;

    setLoading(true);
    try {
      await deleteProfessor(id);
      setProfessor((prev) => prev.filter((p) => p._id !== id));
      Swal.fire({
        icon: "success",
        title: "Professor deleted",
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
        text: error.message || "Unable to delete professor"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfessors();
  }, [fetchProfessors]);

  // Pagination / Slicing Logic
  let displayedProfessors = professors;
  let totalPages = 0;
  let indexOfFirstItem = 0;
  let indexOfLastItem = 0;

  if (maxEntries) {
    displayedProfessors = professors.slice(-maxEntries).reverse();
  } else if (showDetails) {
    indexOfLastItem = currentPage * itemsPerPage;
    indexOfFirstItem = indexOfLastItem - itemsPerPage;
    displayedProfessors = professors.slice(indexOfFirstItem, indexOfLastItem);
    totalPages = Math.ceil(professors.length / itemsPerPage);
  }

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <Card className={`border-0 shadow-sm rounded-4 overflow-hidden ${!showDetails ? 'h-100' : ''}`}>
      <Card.Body className="p-3">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-2">
          <h5 className="mb-0 fw-bold text-dark">Professor Directory</h5>
          {showDetails ? (
            <Button 
                onClick={() => setShowAddModal(true)}
                className="btn-primary rounded-3 px-3 py-2 fw-bold shadow-sm"
            >
                <i className="fa-solid fa-plus me-2"></i> Add Professor
            </Button>
          ) : (
            <Button 
                variant="link" 
                className="p-0 text-muted"
                onClick={() => navigate("/admin/professors")}
            >
                <i className="fa-solid fa-arrow-up-right-from-square"></i>
            </Button>
          )}
        </div>

        {/* Responsive Table */}
        <div className="table-responsive">
          <Table hover className="align-middle mb-0">
            <thead>
              <tr className="bg-light bg-opacity-50">
                <th className="border-0 py-3 text-muted small text-uppercase fw-bold ps-3">Professor</th>
                <th className="border-0 py-3 text-muted small text-uppercase fw-bold text-center">Department</th>
                {showDetails && <th className="border-0 py-3 text-muted small text-uppercase fw-bold">Email</th>}
                <th className="border-0 py-3 text-muted small text-uppercase fw-bold text-center">Status</th>
                {showDetails && <th className="border-0 py-3 text-muted small text-uppercase fw-bold text-center pe-3">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={showDetails ? 5 : 3} className="text-center py-5">
                    <div className="spinner-border spinner-border-sm text-primary me-2"></div>
                    <span className="text-muted">Fetching list...</span>
                  </td>
                </tr>
              ) : displayedProfessors.length === 0 ? (
                <tr>
                  <td colSpan={showDetails ? 5 : 3} className="text-center py-5 text-muted">
                    No professors registered yet.
                  </td>
                </tr>
              ) : (
                displayedProfessors.map((prof, index) => (
                  <tr key={index} className="border-bottom border-light">
                    <td className="py-3 ps-3">
                      <div className="d-flex align-items-center gap-3">
                        <div className="bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center fw-bold" style={{ width: "36px", height: "36px", minWidth: "36px", fontSize: '0.8rem' }}>
                            {prof.name?.charAt(0).toUpperCase()}
                        </div>
                        <div className="fw-bold text-dark text-truncate" style={{ maxWidth: "180px" }}>
                            {prof.name}
                        </div>
                      </div>
                    </td>
                    <td className="text-center py-3 text-muted small fw-medium">
                        {prof.department}
                    </td>
                    {showDetails && (
                      <td className="py-3 text-muted small text-truncate" style={{ maxWidth: "200px" }}>
                        {prof.email}
                      </td>
                    )}
                    <td className="text-center py-3">
                      <Badge 
                        bg={prof.status === "Active" ? "success" : "warning"}
                        className="rounded-pill px-3 py-2 fw-semibold shadow-sm"
                        style={{ fontSize: '0.7rem' }}
                      >
                        {prof.status}
                      </Badge>
                    </td>
                    {showDetails && (
                      <td className="text-center py-3 pe-3">
                        <div className="d-flex justify-content-center gap-2">
                          <Button
                            size="sm"
                            variant="light"
                            className="text-primary p-2 border-0 rounded-3 shadow-sm"
                            onClick={() => {
                              setEditProfessor(prof);
                              setShowAddModal(true);
                            }}
                          >
                            <i className="fa-solid fa-pen-to-square"></i>
                          </Button>
                          <Button
                            size="sm"
                            variant="light"
                            className="text-danger p-2 border-0 rounded-3 shadow-sm"
                            onClick={() => handleDelete(prof._id)}
                          >
                            <i className="fa-solid fa-trash-can"></i>
                          </Button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </div>

        {/* Pagination for Management Page */}
        {showDetails && !loading && professors.length > itemsPerPage && (
          <div className="d-flex justify-content-between align-items-center mt-3 px-3">
            <div className="text-muted small">
              Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, professors.length)} of {professors.length}
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

        {/* Action Button for Dashboard */}
        {!showDetails && (
          <div className="mt-4">
            <Button
              variant="light"
              className="w-100 py-2 fw-bold text-primary shadow-sm border-0 rounded-3 transition-all"
              onClick={() => navigate("/admin/professors")}
              style={{ backgroundColor: "rgba(78, 115, 223, 0.08)" }}
            >
              Manage Professors <i className="fa-solid fa-chevron-right ms-1 small"></i>
            </Button>
          </div>
        )}

        {/* Add/Edit Modal */}
        {showDetails && (
          <ProfessorAdd
            show={showAddModal}
            onClose={() => {
              setShowAddModal(false);
              setEditProfessor(null);
            }}
            onSubmit={fetchProfessors}
            mode={editProfessor ? "edit" : "add"}
            prof={editProfessor}
          />
        )}
      </Card.Body>
      <style>
          {`
            .transition-all:hover { filter: brightness(0.95); transform: translateY(-1px); }
          `}
      </style>
    </Card>
  );
}

