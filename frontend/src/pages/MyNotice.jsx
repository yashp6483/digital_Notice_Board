import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import StateCards from "../components/StateCards";
import NoticeTable from "../components/NoticeTable";
import Swal from "sweetalert2";
import {
    calculateNoticeStats,
    getInitialNoticeStats,
} from "../utils/statHelpers";
import { fetchMyNotice } from "../servieces/noticeServices";

export default function MyNotice() {
    const navigate = useNavigate();

    const name = localStorage.getItem("name");

    const [notices, setNotices] = useState([]);
    const [noticeStats, setNoticeStats] = useState(
        getInitialNoticeStats()
    );

    const loadPageStats = useCallback(async () => {
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
        }
    }, [navigate]);

    useEffect(() => {
        loadPageStats();
    }, [loadPageStats]);

    return (
        <div className="container-fluid">
            <div className="row min-vh-100">
                <Sidebar />

                <div className="col bg-body-secondary">
                    <div className="align-items-center mb-3">
                        <div className="rounded d-flex justify-content-between align-items-center mt-4">
                            <div>
                                <h4>My Notice</h4>
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
                    </div>

                    {/* ✅ PASS NOTICES */}
                    <NoticeTable notices={notices} />
                </div>
            </div>
        </div>
    );
}
