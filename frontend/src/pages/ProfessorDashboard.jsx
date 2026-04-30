import React, { useCallback, useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import TopHeader from "../components/Topheader";
import StateCards from "../components/StateCards";
import { useNavigate } from "react-router-dom";
import { calculateNoticeStats, getInitialNoticeStats } from "../utils/statHelpers";
import { fetchMyNotice, fetchNotice } from "../services/noticeServices";
import Swal from "sweetalert2";
import { Table, Button, Badge, Card } from "react-bootstrap";
import { categoryVariant } from "../constants/categoryVariant";

export default function ProfessorDashboard() {
  const navigate = useNavigate();

  const [noticeStats, setNoticeStats] = useState(getInitialNoticeStats());
  const [myNoticeStats, setMyNoticeStats] = useState(getInitialNoticeStats());
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadPageStats = useCallback(async () => {
    setLoading(true);
    try {
      const [noticesFromApi, myNoticesFromApi] = await Promise.all([fetchNotice(), fetchMyNotice()]);
      const normalizedNotices = noticesFromApi || [];
      const normalizedMyNotices = myNoticesFromApi || [];

      const latestFive = normalizedNotices
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);

      setNotices(latestFive);
      setNoticeStats(calculateNoticeStats(normalizedNotices));
      setMyNoticeStats(calculateNoticeStats(normalizedMyNotices));
    } catch (error) {
      console.error(error);

      if (error.status === 401 || error.status === 403) {
        localStorage.clear();
        navigate("/unauthorized");
        return;
      }

      Swal.fire({
        icon: "error",
        title: "Failed to load notice stats",
        text: error.message || "Something went wrong",
      });
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    loadPageStats();
  }, [loadPageStats]);

  return (
    <div className="container-fluid p-0">
      <div className="d-flex min-vh-100 overflow-hidden">
        <Sidebar />

        <div className="flex-grow-1 p-3 p-md-4 overflow-auto custom-scrollbar" style={{ backgroundColor: "#f8fafc", height: "100vh" }}>
          <TopHeader />

          <div className="d-flex flex-wrap gap-2 mb-4">
            <Button variant="primary" size="sm" onClick={() => navigate("/professor/notices")}>
              <i className="fa-solid fa-plus me-2"></i>Create Notice
            </Button>
            <Button variant="outline-secondary" size="sm" onClick={() => navigate("/professor/my-notices")}>
              <i className="fa-solid fa-bookmark me-2"></i>View My Notices
            </Button>
          </div>

          <div className="row g-4 mb-3">
            <StateCards title="Total Notices" value={noticeStats.total} icon="fa-bullhorn" color="primary" />
            <StateCards title="Active Notices" value={noticeStats.active} icon="fa-circle-check" color="info" />
            <StateCards title="Inactive Notices" value={noticeStats.inactive} icon="fa-clock" color="warning" />
            <StateCards title="My Total Notices" value={myNoticeStats.total} icon="fa-bookmark" color="secondary" />
            <StateCards title="My Pending Approvals" value={myNoticeStats.pending} icon="fa-hourglass-half" color="danger" />
          </div>

          <div className="row">
            <div className="col-12">
              <Card className="border-0 shadow-sm rounded-4 overflow-hidden">
                <Card.Body className="p-4">
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <h5 className="fw-bold mb-0">Latest Notices</h5>
                    <Button variant="light" size="sm" className="text-primary fw-bold" onClick={() => navigate("/professor/notices")}>
                      View All <i className="fa-solid fa-arrow-right-long ms-1"></i>
                    </Button>
                  </div>

                  <Table hover responsive className="align-middle border-light">
                    <thead className="bg-light">
                      <tr>
                        <th className="border-0 py-3 text-muted small text-uppercase fw-bold">No.</th>
                        <th className="border-0 py-3 text-muted small text-uppercase fw-bold">Title</th>
                        <th className="border-0 py-3 text-muted small text-uppercase fw-bold">Category</th>
                        <th className="border-0 py-3 text-muted small text-uppercase fw-bold">Date</th>
                        <th className="border-0 py-3 text-muted small text-uppercase fw-bold">Status</th>
                      </tr>
                    </thead>

                    <tbody>
                      {loading ? (
                        <tr>
                          <td colSpan="5" className="text-center py-5">
                            <div className="spinner-border text-primary spinner-border-sm me-2"></div>
                            Loading...
                          </td>
                        </tr>
                      ) : notices.length > 0 ? (
                        notices.map((n, i) => (
                          <tr key={n._id || i}>
                            <td className="fw-medium text-muted">{i + 1}</td>
                            <td className="fw-bold text-dark">{n.title}</td>
                            <td>
                              <Badge bg={categoryVariant[n.category]} className="px-2 py-1 rounded-pill" style={{ fontSize: "0.75rem" }}>
                                {n.category}
                              </Badge>
                            </td>
                            <td className="text-muted small">
                              {new Date(n.createdAt).toLocaleDateString(undefined, {
                                month: "short",
                                day: "numeric",
                                year: "numeric"
                              })}
                            </td>
                            <td>
                              <Badge bg={n.status === "active" ? "success" : "warning"} className="px-2 py-1 rounded-pill" style={{ fontSize: "0.75rem" }}>
                                {n.status}
                              </Badge>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="5" className="text-center py-5 text-muted">
                            No notices found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </Table>
                </Card.Body>
              </Card>
            </div>
          </div>
        </div>
      </div>
      <style>
        {`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        `}
      </style>
    </div>
  );
}
