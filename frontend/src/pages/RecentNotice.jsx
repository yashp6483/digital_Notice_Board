import React, { useEffect, useState } from "react";
import { Card, Table, Badge, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { categoryVariant } from "../constants/categoryVariant";
import { fetchNotice, mapNoticeForTable } from "../servieces/noticeServices";
import Swal from "sweetalert2";

export default function RecentNotices() {
  const navigate = useNavigate();

  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchNotices = async () => {
    setLoading(true);
    try {
      const noticesFromApi = await fetchNotice();
      const list = noticesFromApi.map(mapNoticeForTable);
      setNotices(list);
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
    fetchNotices();
  }, []);

  // Show latest 5 notices
  const latestNotices = notices.slice(-5);

  return (
    <Card className="h-100 shadow-sm">
      <Card.Body>
        {/* Header */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2 mb-3">
          <Card.Title className="mb-0 fw-bold">Recent Notices</Card.Title>
          <i className="fa-solid fa-ellipsis"></i>
        </div>

        {/* Table */}
        <div className="table-responsive">
          <Table className="text-center align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>No.</th>
                <th className="text-start">Notice</th>
                <th>Category</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={4} className="text-center text-muted">
                    Loading notices...
                  </td>
                </tr>
              )}

              {!loading && latestNotices.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center text-muted">
                    No notices found
                  </td>
                </tr>
              )}

              {!loading &&
                latestNotices.map((n, i) => (
                  <tr key={i}>
                    <td>{i + 1}</td>
                    <td className="text-start">
                      <div className="text-truncate fw-semibold" style={{ maxWidth: "200px" }}>
                        {n.title}
                      </div>
                    </td>
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
        </div>

        {/* View All Button */}
        <div className="text-center mt-3">
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate("/admin/notices")}
          >
            View All Notices →
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
}
