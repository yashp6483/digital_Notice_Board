import React, { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar';
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

    // ✅ FIXED STATES
    const [noticeStats, setNoticeStats] = useState(getInitialNoticeStats());
    const [professorStats, setProfessorStats] = useState(getInitialProfessorStats());
    const [adminStats, setAdminStats] = useState(getInitialAdminStats());

    const name = localStorage.getItem("name");

    const loadPageStats = useCallback(async () => {
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
        }
    }, [navigate]);

    useEffect(() => {
        loadPageStats();
    }, [loadPageStats]);

    return (
        <div className='container-fluid'>
            <div className='row min-vh-100'>

                <Sidebar />

                <div className='col bg-body-secondary p-4'>

                    {/* HEADER */}
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <h4>Admin Management</h4>

                        <div
                            className="d-flex justify-content-center align-items-center rounded-circle bg-primary text-white"
                            style={{
                                width: "42px",
                                height: "42px",
                            }}
                        >
                            <span className="fw-bold">
                                {name ? name.charAt(0).toUpperCase() : "U"}
                            </span>
                        </div>
                    </div>

                    {/* ✅ STATS */}
                    <div className="row g-3 mb-4">

                        {/* Notices (UNCHANGED) */}
                        <StateCards title="Total Notices" value={noticeStats.total} bg="primary" />
                        <StateCards title="Active Notices" value={noticeStats.active} bg="info" />
                        <StateCards title="Inactive Notices" value={noticeStats.inactive} bg="warning" />

                        {/* ✅ Only 1 Professor Card */}
                        <StateCards title="Total Professors" value={professorStats.total} bg="success" />

                        {/* ✅ Admin Card */}
                        <StateCards title="Total Admins" value={adminStats.total} bg="dark" />

                    </div>

                    {/* TABLE */}
                    <div className='row'>
                        <div className='mb-4'>
                            <AdminList />
                        </div>
                    </div>

                </div>
            </div>
        </div>
    )
}
