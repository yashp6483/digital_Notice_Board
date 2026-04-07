import React, { useCallback, useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import TopHeader from "../components/Topheader";
import StateCards from "../components/StateCards";
import { useNavigate } from "react-router-dom";
import {
  calculateNoticeStats,
  getInitialNoticeStats,
} from "../utils/statHelpers";
import { fetchNotice } from "../servieces/noticeServices";
import Swal from "sweetalert2";
import { Table, Button, Badge, Card } from "react-bootstrap";
import { categoryVariant } from "../constants/categoryVariant";

export default function ProfessorDashboard() {
  const navigate = useNavigate();

  const [noticeStats, setNoticeStats] = useState(
    getInitialNoticeStats()
  );
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadPageStats = useCallback(async () => {
    setLoading(true);
    try {
      const noticesFromApi = await fetchNotice();
      const normalizedNotices = noticesFromApi || [];

      // ✅ SORT (latest first) + LIMIT (5)
      const latestFive = normalizedNotices
        .sort(
          (a, b) =>
            new Date(b.createdAt) - new Date(a.createdAt)
        )
        .slice(0, 5);

      // ✅ SET LIMITED DATA FOR TABLE
      setNotices(latestFive);

      // ✅ SET FULL DATA FOR STATS
      setNoticeStats(
        calculateNoticeStats(normalizedNotices)
      );
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
    <div className="container-fluid">
      <div className="row min-vh-100">

        {/* Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <div className="col p-4 bg-body-secondary">

          {/* Header */}
          <TopHeader />

          {/* Stats */}
          <div className="row g-3 mb-4 mt-3">
            <StateCards
              title="Total Notices"
              value={noticeStats.total}
              bg="primary"
            />
            <StateCards
              title="Active Notices"
              value={noticeStats.active}
              bg="info"
            />
            <StateCards
              title="Inactive Notices"
              value={noticeStats.inactive}
              bg="warning"
            />
          </div>

          {/* 🔥 Latest Notices Table */}
          <div className="row">
            <div className="col-12">

              <Card className="shadow-sm">
                <Card.Body>

                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5>Latest Notices</h5>
                  </div>

                  <Table hover responsive>
                    <thead>
                      <tr>
                        <th>No.</th>
                        <th>Title</th>
                        <th>Category</th>
                        <th>Date</th>
                        <th>Author</th>
                        <th>Status</th>
                      </tr>
                    </thead>

                    <tbody>
                      {loading ? (
                        <tr>
                          <td colSpan="6" className="text-center">
                            Loading...
                          </td>
                        </tr>
                      ) : notices.length > 0 ? (
                        notices.map((n, i) => (
                          <tr key={n._id || i}>
                            <td>{i + 1}</td>

                            <td>{n.title}</td>

                            <td>
                              <Badge
                                bg={
                                  categoryVariant[n.category]
                                }
                              >
                                {n.category}
                              </Badge>
                            </td>

                            <td>
                              {new Date(
                                n.createdAt
                              ).toLocaleDateString()}
                            </td>

                            <td>
                              {n.createdBy?.name ||
                                "Admin"}
                            </td>

                            <td>
                              <Badge
                                bg={
                                  n.status === "active"
                                    ? "primary"
                                    : "warning"
                                }
                              >
                                {n.status}
                              </Badge>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="6" className="text-center">
                            No notices found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </Table>

                  {/* View All Button */}
                  <div className="text-center">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() =>
                        navigate("/professor/notices")
                      }
                    >
                      View All Notices →
                    </Button>
                  </div>

                </Card.Body>
              </Card>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
