import React from "react";
import { Card, Table, Badge, Button } from "react-bootstrap";

export default function ProfessorList() {
  const professors = [
    { name: "Dr. John Doe", dept: "CS Department", status: "Active" },
    { name: "Prof. Jane Smith", dept: "Math Department", status: "Active" },
    { name: "Dr. Rahul Verma", dept: "Physics Department", status: "Active" },
    { name: "Dr. Priya Sharma", dept: "History Department", status: "Inactive" },
    { name: "Prof. Anil Patil", dept: "EE Department", status: "Active" },
  ];

  return (
    <Card className="h-100 shadow-sm">
      <Card.Body>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <Card.Title className="fw-bold mb-0">Professor List</Card.Title>
          <i className="fa-solid fa-ellipsis"></i>
        </div>

        <Table responsive borderless className="align-middle">
          <thead className="text-muted small">
            <tr>
              <th>Professor</th>
              <th>Department</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {professors.map((prof, index) => (
              <tr key={index}>
                <td>{prof.name}</td>
                <td>{prof.dept}</td>
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

        <div className="text-center">
          <Button variant="primary" size="sm">
            Manage Professors →
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
}
