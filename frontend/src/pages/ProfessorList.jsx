import React, { useCallback, useEffect, useState } from "react";
import { Card, Table, Badge, Button } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import ProfessorAdd from "../components/ProfessorAdd";
import { fetchProfessor, mapProfessorForTable } from "../servieces/professorServices";

export default function ProfessorList({ showDetails = false }) {
  const navigate = useNavigate();
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(false)
  const [professors, setProfessor] = useState([
    { name: "Dr. John Doe", dept: "CS Department", email: "john.doe@gmail.com", Phone: "8646654663", status: "Active" },
    { name: "Prof. Jane Smith", dept: "Math Department", email: "jane.smith@gmail.com", Phone: "9876543210", status: "Active" },
    { name: "Dr. Rahul Verma", dept: "Physics Department", email: "rahul.verma@gmail.com", Phone: "9123456780", status: "Inactive" },
    { name: "Dr. Priya Sharma", dept: "History Department", email: "priya.sharma@gmail.com", Phone: "9988776655", status: "Active" },
    { name: "Prof. Anil Patil", dept: "Electrical Department", email: "anil.patil@gmail.com", Phone: "9090909090", status: "Active" }
  ]);

  const fetchProfessors = useCallback(async () => {
    setLoading(true);
    try {
      const professorsFromApi = await fetchProfessor();
      const list = professorsFromApi.map(mapProfessorForTable);
      if (list.length > 0) {
        setProfessor(list)
      }
    } catch (error) {
      console.error(error);
      if (error.status === 401 || error.status === 403) {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        localStorage.removeItem("name");
        navigate("/unauthorized");
        return;
      }
      alert(error.message);
    } finally {
      setLoading(false);
    }
  }, [navigate]);

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

              {showDetails && <th>Email</th>}
              {showDetails && <th>Birth Date</th>}

              <th>Status</th>
              <th>Actions</th>
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

                {showDetails && <td>{prof.email}</td>}
                {showDetails && <td>{prof.birthdate}</td>}

                <td>
                  <Badge bg={prof.status === "Active" ? "success" : "warning"}>
                    {prof.status}
                  </Badge>
                </td>

                <td className="">
                  <i className="fa-solid fa-pen-to-square me-3 text-primary"></i>
                  <i className="fa-solid fa-ellipsis-vertical"></i>
                </td>

              </tr>
            ))}
          </tbody>

        </Table>

        <ProfessorAdd
          show={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSubmit={fetchProfessors}
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
