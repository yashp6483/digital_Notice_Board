import React, { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar';
import TopHeader from '../components/Topheader';
import StateCards from '../components/StateCards';
import NoticeTable from '../components/NoticeTable';
import { fetchNotice } from '../services/noticeServices';
import Swal from "sweetalert2";
import {
    calculateNoticeStats,
    getInitialNoticeStats,
} from '../utils/statHelpers';

export default function ProfessorNotice() {
    const navigate = useNavigate();
    const [noticeStats, setNoticeStats] = useState(getInitialNoticeStats());
    const [loading, setLoading] = useState(false);

    const loadPageStats = useCallback(async () => {
        setLoading(true);
        try {
            const noticesFromApi = await fetchNotice();
            const normalizedNotices = noticesFromApi || [];
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
                        <h4 className="fw-bold text-dark">Institutional Notices</h4>
                        <p className="text-muted small">Browse all public notices and announcements across departments.</p>
                    </div>

                    {/* STATS */}
                    <div className="row g-4 mb-5">
                        <StateCards title="Total notices" value={noticeStats.total} icon="fa-bullhorn" color="primary" />
                        <StateCards title="Active notices" value={noticeStats.active} icon="fa-circle-check" color="info" />
                        <StateCards title="Inactive notices" value={noticeStats.inactive} icon="fa-clock" color="warning" />
                    </div>

                    {/* TABLE */}
                    <div className="row g-4">
                        <div className="col-12">
                            {loading ? (
                                <div className="text-center py-5 bg-white rounded-4 shadow-sm">
                                    <div className="spinner-border text-primary mb-3"></div>
                                    <h6 className="text-muted">Loading notice board...</h6>
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
    )
}
