import React, { useEffect, useState } from "react";
import { Card, Table, Badge, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { categoryVariant } from "../constants/categoryVariant";
import { fetchNotice, mapNoticeForTable } from "../servieces/noticeServices";
import Swal from "sweetalert2";

export default function RecentNotices() {

  const navigate = useNavigate();

  const [notices, setNotices] = useState([
    { title: "Exam Schedule Update", category: "Exam", publishedAt: "1 day ago", status: "Active", professor: "Dr. Johnson" },
    { title: "Emergency Lockdown Drill", category: "Emergency", publishedAt: "1 day ago", status: "Active", professor: "Dr. Johnson" },
    { title: "Guest Lecture by Dr. Smith", category: "Academic", publishedAt: "1 day ago", status: "Inactive", professor: "Dr. Johnson" },
    { title: "Campus Networking Event", category: "Event", publishedAt: "2 days ago", status: "Inactive", professor: "Dr. Johnson" },
    { title: "Holiday Announcement", category: "General", publishedAt: "2 days ago", status: "Active", professor: "Dr. Johnson" }
  ])
  const [loading, setLoading] = useState(false)

  const fetchNotices = async () => {
    setLoading(true);
    try {
      const noticesFromApi = await fetchNotice();
      const list = noticesFromApi.map(mapNoticeForTable);
      if (list.length > 0) {
        setNotices(list)
      }
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: "error",
        title: "Failed to load notices",
        text: error.message || "Something went wrong"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices()
  }, [])

  return (
    <Card className="h-100 shadow-sm">
      <Card.Body>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <Card.Title className="fw-bold mb-0">Notices</Card.Title>
          <i className="fa-solid fa-ellipsis"></i>
        </div>

        <Table responsive borderless className="align-middle">
          <thead className="text-muted small">
            <tr>
              <th>No.</th>
              <th>Notice</th>
              <th>Category</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {!loading && notices.length === 0 && (
              <tr>
                <td colSpan={8} className="text-center text-muted">No notices found</td>
              </tr>
            )}
            {notices.map((n, i) => (
              <tr key={i}>
                <td>{i + 1}</td>
                <td>{n.title}</td>
                <td>
                  <Badge bg={categoryVariant[n.category]}>
                    {n.category}
                  </Badge>
                </td>
                <td>{n.publishedAt}</td>
              </tr>
            ))}
          </tbody>
        </Table>

        <div className="text-center">
          <Button variant="primary" size="sm" onClick={() => navigate("/admin/notices")}>
            View All Notices →
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
}
