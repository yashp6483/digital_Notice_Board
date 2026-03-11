import React, { useState } from "react";
import { Card, Table, Badge, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import ProfessorAdd from "../components/ProfessorAdd";

export default function ProfessorList({ showDetails = false }) {

  const [showAddModal, setShowAddModal] = useState(false);

  const professors = [
    { name: "Dr. John Doe", dept: "CS Department", email: "john.doe@gmail.com", Phone: "8646654663", status: "Active" },
    { name: "Prof. Jane Smith", dept: "Math Department", email: "jane.smith@gmail.com", Phone: "9876543210", status: "Active" },
    { name: "Dr. Rahul Verma", dept: "Physics Department", email: "rahul.verma@gmail.com", Phone: "9123456780", status: "Inactive" },
    { name: "Dr. Priya Sharma", dept: "History Department", email: "priya.sharma@gmail.com", Phone: "9988776655", status: "Active" },
    { name: "Prof. Anil Patil", dept: "Electrical Department", email: "anil.patil@gmail.com", Phone: "9090909090", status: "Active" }
  ];

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
              {showDetails && <th>Phone</th>}

              <th>Status</th>
              <th></th>
            </tr>
          </thead>

          <tbody>
            {professors.map((prof, index) => (
              <tr key={index}>
                <td>{prof.name}</td>
                <td>{prof.dept}</td>

                {showDetails && <td>{prof.email}</td>}
                {showDetails && <td>{prof.Phone}</td>}

                <td>
                  <Badge bg={prof.status === "Active" ? "success" : "warning"}>
                    {prof.status}
                  </Badge>
                </td>

                <td className="text-end">
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
          onSubmit={() => {}}
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
