import React, { useEffect, useState } from "react";
import { Card, Table, Badge, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { categoryVariant } from "../constants/categoryVariant";
import { fetchNotice, mapNoticeForTable } from "../services/noticeServices";
import Swal from "sweetalert2";

export default function RecentNotices() {
  const navigate = useNavigate();

  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");

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

  const formatDashboardDate = (value) => {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "-";

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    return `${year}-${month}-${day} ${hours}:${minutes}`;
  };

  // Show latest 5 notices
  const filteredNotices = statusFilter === "all"
    ? notices
    : notices.filter((n) => String(n.approvalStatus || "").toLowerCase() === statusFilter);
  const latestNotices = filteredNotices.slice(-5).reverse();

  return (
    <Card className="border-0 shadow-sm rounded-4 h-100 overflow-hidden">
      <Card.Body className="p-3">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-2">
          <h5 className="mb-0 fw-bold text-dark">Recent Notices</h5>
          <div className="d-flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="form-select form-select-sm"
              style={{ width: "140px" }}
            >
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
            <Button
              variant="link"
              className="p-0 text-muted"
              onClick={() => navigate("/admin/notices")}
            >
              <i className="fa-solid fa-arrow-up-right-from-square"></i>
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="table-responsive">
          <Table hover className="align-middle mb-0">
            <thead>
              <tr className="bg-light bg-opacity-50">
                <th className="border-0 py-3 text-muted small text-uppercase fw-bold ps-3">Notice</th>
                <th className="border-0 py-3 text-muted small text-uppercase fw-bold text-center">Category</th>
                <th className="border-0 py-3 text-muted small text-uppercase fw-bold text-center pe-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={3} className="text-center py-5">
                    <div className="spinner-border spinner-border-sm text-primary me-2"></div>
                    <span className="text-muted">Loading...</span>
                  </td>
                </tr>
              ) : latestNotices.length === 0 ? (
                <tr>
                  <td colSpan={3} className="text-center py-5 text-muted">
                    No recent notices found.
                  </td>
                </tr>
              ) : (
                latestNotices.map((n, i) => (
                  <tr key={i} className="border-bottom border-light">
                    <td className="py-3 ps-3">
                      <div className="fw-bold text-dark text-truncate" style={{ maxWidth: "220px" }}>
                        {n.title}
                      </div>
                    </td>
                    <td className="text-center py-3">
                      <Badge 
                        bg={categoryVariant[n.category]} 
                        className="rounded-pill px-3 py-2 fw-semibold shadow-sm"
                        style={{ fontSize: '0.7rem' }}
                      >
                        {n.category}
                      </Badge>
                    </td>
                    <td className="text-center py-3 text-muted small pe-3 fw-medium">
                      {formatDashboardDate(n.publishedAt || n.createdAt)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </div>

        {/* Action Button */}
        <div className="mt-4">
          <Button
            variant="light"
            className="w-100 py-2 fw-bold text-primary shadow-sm border-0 rounded-3 transition-all"
            onClick={() => navigate("/admin/notices")}
            style={{ backgroundColor: "rgba(78, 115, 223, 0.08)" }}
          >
            View All Notices <i className="fa-solid fa-chevron-right ms-1 small"></i>
          </Button>
        </div>
      </Card.Body>
      <style>
          {`
            .extra-small { font-size: 0.65rem; }
            .transition-all:hover { filter: brightness(0.95); transform: translateY(-1px); }
          `}
      </style>
    </Card>
  );
}
