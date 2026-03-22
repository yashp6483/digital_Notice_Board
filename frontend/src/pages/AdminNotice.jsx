import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
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

    // ✅ FIXED INITIAL STATE
    const [noticeStats, setNoticeStats] = useState(
        getInitialNoticeStats()
    );
    const [professorStats, setProfessorStats] = useState(
        getInitialProfessorStats()
    );

    const [loading, setLoading] = useState(false);

    const name = localStorage.getItem("name");

    // 🔥 LOAD DATA
    const loadPageStats = useCallback(async () => {
        setLoading(true);
        try {
            const [noticesFromApi, professorsFromApi] =
                await Promise.all([
                    fetchNotice(),
                    fetchProfessor(),
                ]);

            const normalizedNotices = noticesFromApi || [];
            const normalizedProfessors = professorsFromApi || [];

            // ✅ SET STATS
            setNoticeStats(
                calculateNoticeStats(normalizedNotices)
            );
            setProfessorStats(
                calculateProfessorStats(normalizedProfessors)
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
        <div className="container-fluid">
            <div className="row min-vh-100">

                {/* Sidebar */}
                <Sidebar />

                {/* Main Content */}
                <div className="col bg-body-secondary p-4">

                    {/* HEADER */}
                    <div className="d-flex justify-content-between align-items-center mt-3 mb-4">
                        <h4 className="mb-0">Notice Management</h4>

                        {/* USER ICON */}
                        <div
                            className="d-flex justify-content-center align-items-center rounded-circle bg-primary text-white"
                            style={{
                                width: "42px",
                                height: "42px",
                                cursor: "pointer",
                            }}
                        >
                            <span className="fw-bold">
                                {name
                                    ? name.charAt(0).toUpperCase()
                                    : "U"}
                            </span>
                        </div>
                    </div>

                    {/* STATS */}
                    <div className="row g-3 mb-4">
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
                        <StateCards
                            title="Total Professors"
                            value={professorStats.total}
                            bg="success"
                        />
                    </div>

                    {/* TABLE */}
                    <div className="row">
                        <div className="col-12">

                            {loading ? (
                                <div className="text-center py-5">
                                    <h6 className="text-muted">
                                        Loading data...
                                    </h6>
                                </div>
                            ) : (
                                <NoticeTable />
                            )}

                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
