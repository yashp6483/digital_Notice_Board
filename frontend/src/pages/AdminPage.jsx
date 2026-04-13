import React, { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar';
import TopHeader from '../components/Topheader';
import StateCards from '../components/StateCards';
import { fetchNotice } from '../servieces/noticeServices';
import { fetchProfessor } from '../servieces/professorServices';
import { fetchAdmins } from '../servieces/adminServices';
import Swal from "sweetalert2";
import {
    calculateNoticeStats,
    getInitialNoticeStats,
    calculateProfessorStats,
    getInitialProfessorStats,
    calculateAdminStats,
    getInitialAdminStats
} from '../utils/statHelpers';
import AdminList from './AdminList';

export default function AdminPage() {
    const navigate = useNavigate();

    const [noticeStats, setNoticeStats] = useState(getInitialNoticeStats());
    const [professorStats, setProfessorStats] = useState(getInitialProfessorStats());
    const [adminStats, setAdminStats] = useState(getInitialAdminStats());
    const [loading, setLoading] = useState(false);

    const loadPageStats = useCallback(async () => {
        setLoading(true);
        try {
            const [noticesFromApi, professorsFromApi, adminsFromApi] = await Promise.all([
                fetchNotice(),
                fetchProfessor(),
                fetchAdmins()
            ]);

            const normalizedNotices = noticesFromApi || [];
            const normalizedProfessors = professorsFromApi || [];
            const normalizedAdmins = adminsFromApi || [];

            setNoticeStats(calculateNoticeStats(normalizedNotices));
            setProfessorStats(calculateProfessorStats(normalizedProfessors));
            setAdminStats(calculateAdminStats(normalizedAdmins));

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
                        <h4 className="fw-bold text-dark">Administrative Controls</h4>
                        <p className="text-muted small">Manage administrative accounts, access levels, and platform-wide statistics.</p>
                    </div>

                    {/* STATS */}
                    <div className="row g-4 mb-3">
                        <StateCards title="Total Notices" value={noticeStats.total} icon="fa-bullhorn" color="primary" />
                        <StateCards title="Active Notices" value={noticeStats.active} icon="fa-circle-check" color="info" />
                        <StateCards title="Inactive Notices" value={noticeStats.inactive} icon="fa-clock" color="warning" />
                        <StateCards title="Total Professors" value={professorStats.total} icon="fa-user-tie" color="success" />
                        <StateCards title="Total Admins" value={adminStats.total} icon="fa-user-shield" color="dark" />
                    </div>

                    {/* TABLE */}
                    <div className="row g-4">
                        <div className="col-12">
                            {loading ? (
                                <div className="text-center py-5 bg-white rounded-4 shadow-sm">
                                    <div className="spinner-border text-primary mb-3"></div>
                                    <h6 className="text-muted">Loading administrative data...</h6>
                                </div>
                            ) : (
                                <AdminList />
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
