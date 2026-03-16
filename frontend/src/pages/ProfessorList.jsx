import React, { useCallback, useEffect, useState } from "react";
import { Card, Table, Badge, Button } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import ProfessorAdd from "../components/ProfessorAdd";
import { deleteProfessor, fetchProfessor, mapProfessorForTable } from "../servieces/professorServices";
import Swal from "sweetalert2";

export default function ProfessorList({ showDetails = false }) {
  const navigate = useNavigate();
  const [editProfessor, setEditProfessor] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(false)
  const [professors, setProfessor] = useState([]);

  const fetchProfessors = useCallback(async () => {
    setLoading(true);
    try {
      const professorsFromApi = await fetchProfessor();
      const list = professorsFromApi.map(mapProfessorForTable);
      setProfessor(list)
    } catch (error) {
      console.error(error);
      if (error.status === 401 || error.status === 403) {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        localStorage.removeItem("name");
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

    try {
      await deleteProfessor(id);
      setProfessor((prevProfessor) =>
        prevProfessor.filter((professor) => professor._id !== id)
      ); // ✅ auto refresh
      await fetchProfessors();
      Swal.fire({
        icon: "success",
        title: "Professor deleted",
        timer: 1200,
        showConfirmButton: false
      });
    } catch (error) {
      if (error.status === 401 || error.status === 403) {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        localStorage.removeItem("name");
        navigate("/unauthorized");
        return;
      }
      Swal.fire({
        icon: "error",
        title: "Delete failed",
        text: error.message || "Unable to delete professor"
      });
    }
  };

  useEffect(() => {
    fetchProfessors()
  }, [fetchProfessors])

  return (
    <Card className="h-100 shadow-sm">
      <Card.Body>

        <div className="d-flex justify-content-between align-items-center mb-3">
          <Card.Title className="fw-bold mb-0">Professor List</Card.Title>

          <Button onClick={() => setShowAddModal(true)}>
            + Add Professor
          </Button>
        </div>

        <Table responsive borderless className="align-middle">

          <thead className="text-muted small">
            <tr>
              <th>Name</th>
              <th>Department</th>
              <th>Email</th>
              {showDetails && <th>Birth Date</th>}

              <th>Status</th>
              {showDetails && <th>Actions</th>}
            </tr>
          </thead>

          <tbody>
            {!loading && professors.length === 0 && (
              <tr>
                <td colSpan={8} className="text-center text-muted">No notices found</td>
              </tr>
            )}
            {professors.map((prof, index) => (
              <tr key={index}>
                <td>{prof.name}</td>
                <td>{prof.department}</td>

                <td>{prof.email}</td>
                {showDetails && <td>{prof.birthdate}</td>}

                <td>
                  <Badge bg={prof.status === "Active" ? "success" : "warning"}>
                    {prof.status}
                  </Badge>
                </td>

                {showDetails && <td>
                  <Button
                    size="sm"
                    variant="outline-primary"
                    className="me-2"
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

                </td>}

              </tr>
            ))}
          </tbody>

        </Table>

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

        {!showDetails && (
          <div className="text-center">

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
