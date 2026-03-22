import React, { useCallback, useEffect, useState } from "react";
import { Badge, Button, Card, Table } from "react-bootstrap";
import NoticeAdd from "./NoticeAdd";
import { categoryVariant } from "../constants/categoryVariant";
import DocumentViewerModal from "./DocumentViewerModal";
import {
  deleteNotice,
  fetchNotice,
  mapNoticeForTable,
} from "../servieces/noticeServices";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

export default function NoticeTable({ notices: externalNotices }) {
  const navigate = useNavigate();

  const [editNotice, setEditNotice] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);

  // ✅ USER DATA FROM LOCALSTORAGE
  const role = localStorage.getItem("role");
  const loggedInUser = localStorage.getItem("name");

  // 🔥 FETCH DATA
  const fetchNotices = useCallback(async () => {
    setLoading(true);
    try {
      if (externalNotices) {
        setNotices(externalNotices.map(mapNoticeForTable));
      } else {
        const data = await fetchNotice();
        setNotices(data.map(mapNoticeForTable));
      }
    } catch (error) {
      console.error(error);
      setNotices([]);
    } finally {
      setLoading(false);
    }
  }, [externalNotices]);

  useEffect(() => {
    fetchNotices();
  }, [fetchNotices]);

  // 🔥 DELETE
  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Delete this notice?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete",
    });

    if (!result.isConfirmed) return;

    try {
      await deleteNotice(id);

      setNotices((prev) =>
        prev.filter((n) => n._id !== id)
      );

      Swal.fire({
        icon: "success",
        title: "Deleted!",
        timer: 1200,
        showConfirmButton: false,
      });
    } catch (error) {
      if (error.status === 401 || error.status === 403) {
        localStorage.clear();
        navigate("/unauthorized");
        return;
      }

      Swal.fire({
        icon: "error",
        title: "Delete failed",
      });
    }
  };

  return (
    <Card className="shadow-sm">
      <Card.Body>

        {/* ✅ ADD BUTTON */}
        {(role === "admin" || role === "professor") && (
          <div className="d-flex justify-content-between mb-3">
            <Card.Title>Notices Management</Card.Title>
            <Button onClick={() => setShowAddModal(true)}>
              + Add Notice
            </Button>
          </div>
        )}

        <Table className="text-center align-middle">
          <thead>
            <tr>
              <th>No.</th>
              <th>Title</th>
              <th>Category</th>
              <th>Date</th>
              <th>Author</th>
              <th>Status</th>
              <th>Doc</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {loading && (
              <tr>
                <td colSpan={8}>Loading...</td>
              </tr>
            )}

            {!loading && notices.length === 0 && (
              <tr>
                <td colSpan={8}>No notices found</td>
              </tr>
            )}

            {!loading &&
              notices.map((n, i) => {
                // ✅ CHECK OWNER
                const isOwner =
                  n.createdBy?.name === loggedInUser ||
                  n.professor === loggedInUser;

                // ✅ PERMISSION
                const canEditDelete =
                  role === "admin" || isOwner;

                return (
                  <tr key={i}>
                    <td>{i + 1}</td>

                    <td>{n.title}</td>

                    <td>
                      <Badge bg={categoryVariant[n.category]}>
                        {n.category}
                      </Badge>
                    </td>

                    <td>{n.publishedAt}</td>

                    <td>
                      {n.createdBy?.name ||
                        n.professor ||
                        "N/A"}
                    </td>

                    <td>
                      <Badge
                        bg={
                          n.status === "Active"
                            ? "primary"
                            : "warning"
                        }
                      >
                        {n.status}
                      </Badge>
                    </td>

                    <td>
                      <button
                        className="btn btn-outline-primary btn-sm"
                        onClick={() => {
                          setSelectedDoc(n.documentUrl);
                          setShowModal(true);
                        }}
                      >
                        👁
                      </button>
                    </td>

                    {/* ✅ ACTION */}
                    <td>
                      {canEditDelete ? (
                        <div className="d-flex gap-1 justify-content-center">
                          <button
                            className="btn btn-warning btn-sm"
                            onClick={() => {
                              setEditNotice(n);
                              setShowAddModal(true);
                            }}
                          >
                            ✏️
                          </button>

                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() =>
                              handleDelete(n._id)
                            }
                          >
                            🗑
                          </button>
                        </div>
                      ) : (
                        <span className="text-muted">
                          No Access
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </Table>

        {/* MODALS */}
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
  );
}
