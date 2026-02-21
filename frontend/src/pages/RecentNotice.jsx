import React from "react";
import { Card, Table, Badge, Button } from "react-bootstrap";

export default function RecentNotices() {
  const notices = [
    { title: "Exam Schedule Update", category: "Exam", date: "1 day ago" },
    { title: "Emergency Lockdown Drill", category: "Emergency", date: "1 day ago" },
    { title: "Guest Lecture by Dr. Smith", category: "Academic", date: "1 day ago" },
    { title: "Campus Networking Event", category: "Event", date: "2 days ago" },
    { title: "Holiday Announcement", category: "General", date: "2 days ago" },
  ];

  const categoryVariant = {
    Exam: "primary",
    Emergency: "danger",
    Academic: "info",
    Event: "success",
    General: "secondary",
  };

  return (
    <Card className="h-100 shadow-sm">
      <Card.Body>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <Card.Title className="fw-bold mb-0">Recent Notices</Card.Title>
          <i className="fa-solid fa-ellipsis"></i>
        </div>

        <Table responsive borderless className="align-middle">
          <thead className="text-muted small">
            <tr>
              <th>Notice</th>
              <th>Category</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {notices.map((item, index) => (
              <tr key={index}>
                <td>{item.title}</td>
                <td>
                  <Badge bg={categoryVariant[item.category]} pill>
                    {item.category}
                  </Badge>
                </td>
                <td className="text-muted small">{item.date}</td>
              </tr>
            ))}
          </tbody>
        </Table>

        <div className="text-center">
          <Button variant="primary" size="sm">
            View All Notices →
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
}
