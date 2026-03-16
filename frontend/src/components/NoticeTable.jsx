import React from 'react'
import { Badge, Button, Card, Table } from 'react-bootstrap'
import NoticeAdd from './NoticeAdd'
import { categoryVariant } from '../constants/categoryVariant'
import { useCallback, useEffect, useState } from 'react'
import DocumentViewerModal from "./DocumentViewerModal";
import { deleteNotice, fetchNotice, mapNoticeForTable } from '../servieces/noticeServices'
import { useNavigate } from 'react-router-dom'
import Swal from "sweetalert2";

export default function NoticeTable() {
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
    setLoading(true);
    try {
      const noticesFromApi = await fetchNotice();
      const list = noticesFromApi.map(mapNoticeForTable);
      if (list.length > 0) {
        setNotices(list)
      }
    } catch (error) {
      console.error(error);
      if (error.status === 401 || error.status === 403) {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        localStorage.removeItem("name");
        navigate("/unauthorized");
        return;
      }
      Swal.fire({
        icon: "error",
        title: "Failed to load notices",
        text: error.message || "Something went wrong"
      });
    } finally {
      setLoading(false);
    }
  }, [navigate]);


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
      await fetchNotice();
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

        <div className="d-flex justify-content-between mb-3">
          <Card.Title>Notices Management</Card.Title>
          <Button onClick={() => setShowAddModal(true)}>
            + Add Notice
          </Button>
        </div>

        <Table className='text-center align-middle'>
          <thead >
            <tr>
              <th>No.</th>
              <th>Title</th>
              <th>Category</th>
              <th>Date</th>
              <th>Author</th>
              <th>Status</th>
              <th>document</th>
              <th>Action</th>
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
                <td>{n.createdBy?.name || n.professor}</td>
                <td>
                  <Badge bg={n.status === "Active" ? "primary" : "secondary"}>
                    {n.status}
                  </Badge>
                </td>
                <td className="">
                  <div className='text-center'>
                    <button
                      className="btn btn-outline-primary btn-sm text-center"
                      onClick={() => {
                        setSelectedDoc(n.documentUrl);
                        setShowModal(true);
                      }}
                    >
                      <i className="fa-solid fa-eye"></i>

                    </button>
                  </div>
                </td>
                <td>
                  <div className="d-flex justify-content-center gap-2">

                    {/* Edit Button */}
                    <button
                      className="btn btn-warning btn-sm"
                      onClick={() => {
                        setEditNotice(n);
                        setShowAddModal(true);
                      }}
                    >
                      <i className="fa-solid fa-pen"></i>
                    </button>

                    {/* Delete Button */}
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
