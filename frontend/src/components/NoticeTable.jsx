import React from 'react'
import { Badge, Button, Card, Table } from 'react-bootstrap'

export default function NoticeTable() {

  const notices = [
    { title: "Exam Schedule Update", category: "Exam", date: "1 day ago", status: "Active", professor: "Dr. Johnson" },
    { title: "Emergency Lockdown Drill", category: "Emergency", date: "1 day ago", status: "Active", professor: "Dr. Johnson" },
    { title: "Guest Lecture by Dr. Smith", category: "Academic", date: "1 day ago", status: "Inactive", professor: "Dr. Johnson" },
    { title: "Campus Networking Event", category: "Event", date: "2 days ago", status: "Inactive", professor: "Dr. Johnson" },
    { title: "Holiday Announcement", category: "General", date: "2 days ago", status: "Active", professor: "Dr. Johnson" },
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
          <Card.Title className="fw-bold mb-0">Notices Management</Card.Title>
          <Button variant="primary"><i className="fa-solid fa-plus"></i> Add Notice</Button>
        </div>
        <Table responsive borderless className="align-middle">
          <thead className="text-muted small">
            <tr>
              <th>Title</th>
              <th>Category</th>
              <th>Date</th>
              <th>Professor</th>
              <th>Status</th>
              <th>Actions</th>
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
                <td className="text-muted">{item.date}</td>
                <td className='text-muted'>{item.professor}</td>
                <td className="text-muted"><Badge bg={item.status === "Active" ? 'primary' : 'secondary'}>{item.status}</Badge></td>
                <td className="">
                  <Button variant="outline-primary" className="me-2">view</Button>
                  <Button variant="outline-secondary" className="me-2">Edit</Button>
                  <Button variant="outline-danger" >Delete</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>

        <div className="text-center">
          <Button variant="primary" size="sm" >
            View All Notices →
          </Button>
        </div>
      </Card.Body>
    </Card>

  )
}
