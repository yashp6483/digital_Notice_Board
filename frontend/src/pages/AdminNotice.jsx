import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import TopHeader from "../components/Topheader";
import StateCards from "../components/StateCards";
import NoticeTable from "../components/NoticeTable";
import { fetchNotice } from "../servieces/noticeServices";
import { fetchProfessor } from "../servieces/professorServices";
import Swal from "sweetalert2";
import {
    calculateNoticeStats,
    getInitialNoticeStats,
    calculateProfessorStats,
    getInitialProfessorStats,
} from "../utils/statHelpers";

export default function AdminNotice() {
    const navigate = useNavigate();

    const [noticeStats, setNoticeStats] = useState(getInitialNoticeStats());
    const [professorStats, setProfessorStats] = useState(getInitialProfessorStats());
    const [loading, setLoading] = useState(false);

    const loadPageStats = useCallback(async () => {
        setLoading(true);
        try {
            const [noticesFromApi, professorsFromApi] = await Promise.all([
                fetchNotice(),
                fetchProfessor(),
            ]);

            const normalizedNotices = noticesFromApi || [];
            const normalizedProfessors = professorsFromApi || [];

            setNoticeStats(calculateNoticeStats(normalizedNotices));
            setProfessorStats(calculateProfessorStats(normalizedProfessors));
        } catch (error) {
            console.error(error);
            if (error.status === 401 || error.status === 403) {
                localStorage.clear();
                navigate("/unauthorized");
                return;
            }
            Swal.fire({
                icon: "error",
                title: "Failed to load data",
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

                    <div className="mb-4">
                        <h4 className="fw-bold text-dark">Notice Management</h4>
                        <p className="text-muted small">Manage, publish, and track all institutional notices from one place.</p>
                    </div>

                    {/* STATS */}
                    <div className="row g-4 mb-3">
                        <StateCards title="Total Notices" value={noticeStats.total} icon="fa-bullhorn" color="primary" />
                        <StateCards title="Active Notices" value={noticeStats.active} icon="fa-circle-check" color="info" />
                        <StateCards title="Inactive Notices" value={noticeStats.inactive} icon="fa-clock" color="warning" />
                        <StateCards title="Pending Approvals" value={noticeStats.pending} icon="fa-hourglass-half" color="danger" />
                        <StateCards title="Total Professors" value={professorStats.total} icon="fa-user-tie" color="success" />
                    </div>

                    {/* TABLE */}
                    <div className="row g-4">
                        <div className="col-12">
                            {loading ? (
                                <div className="text-center py-5 bg-white rounded-4 shadow-sm">
                                    <div className="spinner-border text-primary mb-3"></div>
                                    <h6 className="text-muted">Loading archive...</h6>
                                </div>
                            ) : (
                                <NoticeTable />
                            )}
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
