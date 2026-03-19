import React, { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar';
import StateCards from '../components/StateCards';
import NoticeTable from '../components/NoticeTable';
import Swal from "sweetalert2";
import {
    calculateNoticeStats,
    getInitialNoticeStats,
} from '../utils/statHelpers';
import { fetchMyNotice } from '../servieces/noticeServices';

export default function MyNotice() {
    const navigate = useNavigate();
    const [notices, setNotices] = useState([[
        { title: "Exam Schedule Update", category: "Exam", publishedAt: "1 day ago", status: "Active", professor: "Dr. Johnson" },
        { title: "Emergency Lockdown Drill", category: "Emergency", publishedAt: "1 day ago", status: "Active", professor: "Dr. Johnson" },
        { title: "Guest Lecture by Dr. Smith", category: "Academic", publishedAt: "1 day ago", status: "Inactive", professor: "Dr. Johnson" },
        { title: "Campus Networking Event", category: "Event", publishedAt: "2 days ago", status: "Inactive", professor: "Dr. Johnson" },
        { title: "Holiday Announcement", category: "General", publishedAt: "2 days ago", status: "Active", professor: "Dr. Johnson" }
    ]]);
    const [noticeStats, setNoticeStats] = useState(getInitialNoticeStats());

    const loadPageStats = useCallback(async () => {
        try {
            const noticesFromApi = await fetchMyNotice();
            const normalizedNotices = noticesFromApi || [];
            setNotices(normalizedNotices);
            setNoticeStats(calculateNoticeStats(normalizedNotices));
        } catch (error) {
            console.error(error);

            if (error.message.includes("401") || error.message.includes("403")) {
                localStorage.clear();
                navigate("/unauthorized");
                return;
            }

            Swal.fire({
                icon: "error",
                title: "Failed to load notice stats",
                text: error.message
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
                    <div className="mt-4 d-flex justify-content-between">
                        <h4>My Notices</h4>
                        <button className="btn btn-light">Settings</button>
                    </div>

                    <div className="row g-3 mb-4">
                        <StateCards title="Total Notices" value={noticeStats.total} bg="primary" />
                        <StateCards title="Active Notices" value={noticeStats.active} bg="info" />
                        <StateCards title="Inactive Notices" value={noticeStats.inactive} bg="warning" />
                    </div>

                    <NoticeTable notices={notices} />
                </div>
            </div>
        </div>
    );
}
