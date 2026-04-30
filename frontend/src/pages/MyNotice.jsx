import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import TopHeader from "../components/Topheader";
import StateCards from "../components/StateCards";
import NoticeTable from "../components/NoticeTable";
import Swal from "sweetalert2";
import {
    calculateNoticeStats,
    getInitialNoticeStats,
} from "../utils/statHelpers";
import { fetchMyNotice } from "../services/noticeServices";

export default function MyNotice() {
    const navigate = useNavigate();

    const [notices, setNotices] = useState([]);
    const [loading, setLoading] = useState(false);
    const [noticeStats, setNoticeStats] = useState(
        getInitialNoticeStats()
    );

    const loadPageStats = useCallback(async () => {
        setLoading(true);
        try {
            const noticesFromApi = await fetchMyNotice();
            const normalized = noticesFromApi || [];

            setNotices(normalized);
            setNoticeStats(calculateNoticeStats(normalized));
        } catch (error) {
            console.error(error);

            if (
                error.message?.includes("401") ||
                error.message?.includes("403")
            ) {
                localStorage.clear();
                navigate("/unauthorized");
                return;
            }

            Swal.fire({
                icon: "error",
                title: "Failed to load notices",
                text: error.message,
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
                        <h4 className="fw-bold text-dark">My Personal Notices</h4>
                        <p className="text-muted small">View and manage the notices you have specifically published.</p>
                    </div>

                    <div className="row g-4 mb-3">
                        <StateCards
                            title="My Total Notices"
                            value={noticeStats.total}
                            icon="fa-bullhorn"
                            color="primary"
                        />
                        <StateCards
                            title="My Active Notices"
                            value={noticeStats.active}
                            icon="fa-circle-check"
                            color="info"
                        />
                        <StateCards
                            title="My Inactive Notices"
                            value={noticeStats.inactive}
                            icon="fa-clock"
                            color="warning"
                        />
                    </div>

                    <div className="row g-4">
                        <div className="col-12">
                            {loading ? (
                                <div className="text-center py-5 bg-white rounded-4 shadow-sm">
                                    <div className="spinner-border text-primary mb-3"></div>
                                    <h6 className="text-muted">Loading your notices...</h6>
                                </div>
                            ) : (
                                <NoticeTable notices={notices} />
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
