import React, { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar';
import StateCards from '../components/StateCards';
import ProfessorList from './ProfessorList';
import { fetchNotice } from '../servieces/noticeServices';
import { fetchProfessor } from '../servieces/professorServices';
import Swal from "sweetalert2";
import {
    calculateNoticeStats,
    getInitialNoticeStats,
    calculateProfessorStats,
    getInitialProfessorStats
} from '../utils/statHelpers';

export default function AdminPage() {
    const navigate = useNavigate();
    const [noticeStats, setNoticeStats] = useState(getInitialNoticeStats);
    const [professorStats, setProfessorStats] = useState(getInitialProfessorStats);

    const name = localStorage.getItem("name");

    const loadPageStats = useCallback(async () => {
        try {
            const [noticesFromApi, professorsFromApi] = await Promise.all([
                fetchNotice(),
                fetchProfessor()
            ]);

            const normalizedNotices = noticesFromApi || [];
            const normalizedProfessors = professorsFromApi || [];

            setNoticeStats(calculateNoticeStats(normalizedNotices));
            setProfessorStats(calculateProfessorStats(normalizedProfessors));
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
                title: "Failed to load professor stats",
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
                <div className='col bg-body-secondary'>
                    <div className="align-items-center mb-3">
                        <div className="rounded d-flex justify-content-between align-items-center mt-4">
                            <div>
                                <h4>Admin Management</h4>
                            </div>
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
                    </div>
                    <div className="row g-3 mb-4">
                        <StateCards title="Total Notices" value={noticeStats.total} bg="primary" />
                        <StateCards title="Active Notices" value={noticeStats.active} bg="info" />
                        <StateCards title="Inactive Notices" value={noticeStats.inactive} bg="warning" />
                        <StateCards title="Total Professors" value={professorStats.total} bg="success" />
                    </div>
                    <div className='row'>
                        <div className='mb-4'>
                            {/* <ProfessorList showDetails={true} /> */}
                        </div>
                    </div>
                </div>
            </div>
        </div >
    )
}
