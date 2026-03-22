import React, { useCallback, useEffect, useState } from "react";
import { Card, Table, Badge, Button } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import ProfessorAdd from "../components/ProfessorAdd";
import { deleteProfessor, fetchProfessor, mapProfessorForTable } from "../servieces/professorServices";
import Swal from "sweetalert2";

export default function ProfessorList({ showDetails = false, maxEntries = null }) {
  const navigate = useNavigate();
  const [editProfessor, setEditProfessor] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [professors, setProfessor] = useState([]);

  const fetchProfessors = useCallback(async () => {
    setLoading(true);
    try {
      const professorsFromApi = await fetchProfessor();
      const list = professorsFromApi.map(mapProfessorForTable);
      setProfessor(list);
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
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
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

  // Slice professors if maxEntries is provided
  const displayedProfessors = maxEntries ? professors.slice(-maxEntries) : professors;

  return (
    <Card className="shadow-sm h-100">
      <Card.Body>
        {/* Header */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2 mb-3">
          <Card.Title className="mb-0">Professor List</Card.Title>
          {showDetails ? (
            <Button onClick={() => setShowAddModal(true)}>+ Add Professor</Button>
          ) : (
            <i className="fa-solid fa-ellipsis"></i>
          )}
        </div>

        {/* Responsive Table */}
        <div className="table-responsive">
          <Table className="text-center align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>No.</th>
                <th>Name</th>
                <th>Department</th>
                {showDetails && <th>Email</th>}
                {showDetails && <th>Birth Date</th>}
                <th>Status</th>
                {showDetails && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={showDetails ? 7 : 4} className="text-center text-muted">
                    Loading professors...
                  </td>
                </tr>
              )}

              {!loading && displayedProfessors.length === 0 && (
                <tr>
                  <td colSpan={showDetails ? 7 : 4} className="text-center text-muted">
                    No professors found
                  </td>
                </tr>
              )}

              {!loading && displayedProfessors.map((prof, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td className="text-start">
                    <div className="fw-semibold text-truncate" style={{ maxWidth: "180px" }}>
                      {prof.name}
                    </div>
                  </td>
                  <td>{prof.department}</td>
                  {showDetails && (
                    <>
                      <td className="text-truncate" style={{ maxWidth: "200px" }}>{prof.email}</td>
                      <td>{prof.birthdate}</td>
                    </>
                  )}
                  <td>
                    <Badge bg={prof.status === "Active" ? "success" : "warning"}>
                      {prof.status}
                    </Badge>
                  </td>
                  {showDetails && (
                    <td>
                      <div className="d-flex justify-content-center gap-1 flex-wrap">
                        <Button
                          size="sm"
                          variant="outline-primary"
                          onClick={() => {
                            setEditProfessor(prof);
                            setShowAddModal(true);
                          }}
                        >
                          ✏️
                        </Button>
                        <Button
                          size="sm"
                          variant="outline-danger"
                          onClick={() => handleDelete(prof._id)}
                        >
                          🗑️
                        </Button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </Table>
        </div>

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

        {/* Dashboard Preview Link */}
        {!showDetails && (
          <div className="text-center mt-3">
            <Link to="/admin/professors">
              <Button variant="primary" size="sm">
                Manage Professors →
              </Button>
            </Link>
          </div>
        )}
      </Card.Body>
    </Card>
  );
}
