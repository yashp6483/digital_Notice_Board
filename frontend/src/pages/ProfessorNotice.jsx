import React, { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar';
import StateCards from '../components/StateCards';
import NoticeTable from '../components/NoticeTable';
import { fetchNotice } from '../servieces/noticeServices';
import Swal from "sweetalert2";
import {
    calculateNoticeStats,
    getInitialNoticeStats,
} from '../utils/statHelpers';

export default function ProfessorNotice() {
    const navigate = useNavigate();
    const [noticeStats, setNoticeStats] = useState(getInitialNoticeStats);

    const loadPageStats = useCallback(async () => {
        try {
            const [noticesFromApi] = await Promise.all([
                fetchNotice(),
            ]);

            const normalizedNotices = noticesFromApi || [];

            setNoticeStats(calculateNoticeStats(normalizedNotices));
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
                title: "Failed to load notice stats",
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
                                <h4>Notice Management</h4>
                            </div>
                            <button className="btn btn-light">Settings</button>
                        </div>
                    </div>
                    <div className="row g-3 mb-4">
                        <StateCards title="Total Notices" value={noticeStats.total} bg="primary" />
                        <StateCards title="Active Notices" value={noticeStats.active} bg="info" />
                        <StateCards title="Inactive Notices" value={noticeStats.inactive} bg="warning" />
                    </div>
                    <div className='row'>
                        <div className='mb-4'>
                            <NoticeTable />
                        </div>
                    </div>
                </div>
            </div>
        </div >
    )
}
