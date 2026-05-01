import React, { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar';
import TopHeader from '../components/Topheader';
import StateCards from '../components/StateCards';
import { fetchAdmins } from '../services/adminServices';
import Swal from "sweetalert2";
import {
    calculateAdminStats,
    getInitialAdminStats
} from '../utils/statHelpers';
import AdminList from './AdminList';

export default function AdminPage() {
    const navigate = useNavigate();

    const [adminStats, setAdminStats] = useState(getInitialAdminStats());
    const [loading, setLoading] = useState(false);

    const loadPageStats = useCallback(async () => {
        setLoading(true);
        try {
            const adminsFromApi = await fetchAdmins();
            const normalizedAdmins = adminsFromApi || [];
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
                        <StateCards title="Total Admins" value={adminStats.total} icon="fa-user-shield" color="primary" />
                        <StateCards title="Active Admins" value={adminStats.active} icon="fa-shield-check" color="success" />
                        <StateCards title="Inactive Admins" value={adminStats.inactive} icon="fa-user-slash" color="warning" />
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
