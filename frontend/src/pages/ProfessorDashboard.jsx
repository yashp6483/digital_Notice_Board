import React, { useCallback, useEffect, useState } from 'react'
import Sidebar from '../components/Sidebar'
import TopHeader from '../components/Topheader'
import StateCards from '../components/StateCards'
import { useNavigate } from 'react-router-dom'
import { calculateNoticeStats, getInitialNoticeStats } from '../utils/statHelpers'
import { fetchNotice } from '../servieces/noticeServices'
import Swal from 'sweetalert2'
import { Table, Button, Badge, Card} from 'react-bootstrap'
import { categoryVariant } from '../constants/categoryVariant'

export default function ProfessorDashboard() {
  const navigate = useNavigate();

  const [noticeStats, setNoticeStats] = useState(getInitialNoticeStats());
  const [notices, setNotices] = useState([]);

  const loadPageStats = useCallback(async () => {
    try {
      const noticesFromApi = await fetchNotice();

      const normalizedNotices = noticesFromApi || [];

      setNotices(normalizedNotices);
      setNoticeStats(calculateNoticeStats(normalizedNotices));

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
        text: error.message || "Something went wrong"
      });
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
            <StateCards title="Total Notices" value={noticeStats.total} bg="primary" />
            <StateCards title="Active Notices" value={noticeStats.active} bg="info" />
            <StateCards title="Inactive Notices" value={noticeStats.inactive} bg="warning" />
          </div>

          {/* 🔥 Notice Management Table */}
          <div className="row">
            <div className="col-12">

              <Card className="shadow-sm">
                <Card.Body>

                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5>Notices</h5>
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
                      {notices.length > 0 ? (
                        notices.map((n, i) => (
                          <tr key={n._id || i}>
                            <td>{i + 1}</td>

                            <td>{n.title}</td>
                            <td>
                              <Badge bg={categoryVariant[n.category]}>
                                {n.category}
                              </Badge>
                            </td>
                            <td>
                              {new Date(n.createdAt).toLocaleDateString()}
                            </td>

                            <td>
                              {n.createdBy?.name || "admin"}
                            </td>

                            <td>
                              <Badge bg={n.status === "active" ? "primary" : "warning"}>
                                {n.status}
                              </Badge>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="8" className="text-center">
                            No notices found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </Table>
                  <div className="text-center">
                    <Button variant="primary" size="sm" onClick={() => navigate("/admin/notices")}>
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
