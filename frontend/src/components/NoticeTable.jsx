import React from 'react'
import { Badge, Button, Card, Table } from 'react-bootstrap'
import NoticeAdd from './NoticeAdd'
import { categoryVariant } from '../constants/categoryVariant'
import { useCallback, useEffect, useState } from 'react'
import DocumentViewerModal from "./DocumentViewerModal";
import { deleteNotice, fetchNotice, mapNoticeForTable } from '../servieces/noticeServices'
import { useNavigate } from 'react-router-dom'
import Swal from "sweetalert2";

export default function NoticeTable({ notices: externalNotices }) {
  const navigate = useNavigate();
  const [editNotice, setEditNotice] = useState(null);

  const [showAddModal, setShowAddModal] = useState(false)
  const [notices, setNotices] = useState([
    { title: "Exam Schedule Update", category: "Exam", publishedAt: "1 day ago", status: "Active", professor: "Dr. Johnson" },
    { title: "Emergency Lockdown Drill", category: "Emergency", publishedAt: "1 day ago", status: "Active", professor: "Dr. Johnson" },
    { title: "Guest Lecture by Dr. Smith", category: "Academic", publishedAt: "1 day ago", status: "Inactive", professor: "Dr. Johnson" },
    { title: "Campus Networking Event", category: "Event", publishedAt: "2 days ago", status: "Inactive", professor: "Dr. Johnson" },
    { title: "Holiday Announcement", category: "General", publishedAt: "2 days ago", status: "Active", professor: "Dr. Johnson" }
  ])
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const fetchNotices = useCallback(async () => {
    if (externalNotices) {
      const mapped = externalNotices.map(mapNoticeForTable);
      setNotices(mapped);
      return;
    }

    // ❌ Otherwise fetch ALL notices (default behavior)
    try {
      const noticesFromApi = await fetchNotice();
      const list = noticesFromApi.map(mapNoticeForTable);
      setNotices(list);
    } catch (error) {
      console.error(error);
    }
  }, [externalNotices]);

  // notice delete code 
  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Delete this notice?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete",
      cancelButtonText: "Cancel"
    });

    if (!result.isConfirmed) return;

    try {
      await deleteNotice(id);
      setNotices((prevNotices) =>
        prevNotices.filter((notice) => notice._id !== id)
      ); // ✅ auto refresh
      Swal.fire({
        icon: "success",
        title: "Notice deleted",
        timer: 1200,
        showConfirmButton: false
      });
    } catch (error) {
      if (error.status === 401 || error.status === 403) {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        localStorage.removeItem("name");
        navigate("/unauthorized");
        return;
      }
      Swal.fire({
        icon: "error",
        title: "Delete failed",
        text: error.message || "Unable to delete notice"
      });
    }
  };

  useEffect(() => {
    fetchNotices()
  }, [fetchNotices])

  return (
    <Card className="shadow-sm">
      <Card.Body>

        {/* Header */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2 mb-3">
          <Card.Title className="mb-0">Notices Management</Card.Title>
          <Button onClick={() => setShowAddModal(true)}>
            + Add Notice
          </Button>
        </div>

        {/* Responsive Table Wrapper */}
        <div className="table-responsive">
          <Table className="text-center align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>No.</th>
                <th>Title</th>
                <th>Category</th>
                <th className="d-none d-md-table-cell">Date</th>
                <th className="d-none d-lg-table-cell">Author</th>
                <th>Status</th>
                <th>Doc</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {!loading && notices.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center text-muted">
                    No notices found
                  </td>
                </tr>
              )}

              {notices.map((n, i) => (
                <tr key={i}>
                  <td>{i + 1}</td>

                  {/* Title with wrap */}
                  <td className="text-start">
                    <div className="fw-semibold text-truncate" style={{ maxWidth: "150px" }}>
                      {n.title}
                    </div>
                  </td>

                  {/* Category */}
                  <td>
                    <Badge bg={categoryVariant[n.category]}>
                      {n.category}
                    </Badge>
                  </td>

                  {/* Hidden on small screens */}
                  <td className="d-none d-md-table-cell">{n.publishedAt}</td>

                  <td className="d-none d-lg-table-cell">
                    {n.createdBy?.name || n.professor || "N/A"}
                  </td>

                  {/* Status */}
                  <td>
                    <Badge bg={n.status === "Active" ? "primary" : "warning"}>
                      {n.status}
                    </Badge>
                  </td>

                  {/* Document */}
                  <td>
                    <button
                      className="btn btn-outline-primary btn-sm"
                      onClick={() => {
                        setSelectedDoc(n.documentUrl);
                        setShowModal(true);
                      }}
                    >
                      <i className="fa-solid fa-eye"></i>
                    </button>
                  </td>

                  {/* Actions */}
                  <td>
                    <div className="d-flex justify-content-center gap-1 flex-wrap">

                      <button
                        className="btn btn-warning btn-sm"
                        onClick={() => {
                          setEditNotice(n);
                          setShowAddModal(true);
                        }}
                      >
                        <i className="fa-solid fa-pen"></i>
                      </button>

                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDelete(n._id)}
                      >
                        <i className="fa-solid fa-trash"></i>
                      </button>

                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>

        {/* Modals */}
        <NoticeAdd
          show={showAddModal}
          onClose={() => {
            setShowAddModal(false);
            setEditNotice(null);
          }}
          onSubmit={fetchNotices}
          mode={editNotice ? "edit" : "add"}
          notice={editNotice}
        />

        <DocumentViewerModal
          show={showModal}
          onHide={() => setShowModal(false)}
          documentUrl={selectedDoc}
        />

      </Card.Body>
    </Card>
  )
}
