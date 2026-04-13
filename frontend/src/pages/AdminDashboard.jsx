import React, { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar';
import TopHeader from '../components/Topheader';
import StateCards from '../components/StateCards';
import RecentNotices from './RecentNotice';
import ProfessorList from './ProfessorList';
import { fetchNotice, mapNoticeForTable } from '../servieces/noticeServices';
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

export default function AdminDashboard() {
  const navigate = useNavigate();

  const [noticeStats, setNoticeStats] = useState(getInitialNoticeStats());
  const [professorStats, setProfessorStats] = useState(getInitialProfessorStats());
  const [adminStats, setAdminStats] = useState(getInitialAdminStats());

  const loadDashboardData = useCallback(async () => {
    try {
      const [noticesFromApi, professorsFromApi, adminsFromApi] = await Promise.all([
        fetchNotice(),
        fetchProfessor(),
        fetchAdmins()
      ]);

      const normalizedNotices = (noticesFromApi || []).map(mapNoticeForTable);
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
        title: "Failed to load dashboard data",
        text: error.message || "Something went wrong"
      });
    }
  }, [navigate]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  return (
    <div className='container-fluid p-0'>
      <div className='d-flex min-vh-100 overflow-hidden'>

        <Sidebar />

        <div className='flex-grow-1 p-3 p-md-4 overflow-auto custom-scrollbar' style={{ backgroundColor: "#f8fafc", height: "100vh" }}>

          <TopHeader />

          {/* STATS SECTION */}
          <div className="row g-4 mb-3">
            <StateCards title="Total Notices" value={noticeStats.total} icon="fa-bullhorn" color="primary" />
            <StateCards title="Active Notices" value={noticeStats.active} icon="fa-circle-check" color="info" />
            <StateCards title="Inactive Notices" value={noticeStats.inactive} icon="fa-clock" color="warning" />
            
            <StateCards title="Total Professors" value={professorStats.total} icon="fa-user-tie" color="secondary" />
            <StateCards title="Active Professors" value={professorStats.active} icon="fa-user-check" color="success" />
            <StateCards title="Inactive Professors" value={professorStats.inactive} icon="fa-user-slash" color="danger" />

            <StateCards title="Total Admins" value={adminStats.total} icon="fa-user-shield" color="dark" />
            <StateCards title="Active Admins" value={adminStats.active} icon="fa-shield-check" color="success" />
          </div>

          {/* TABLES SECTION */}
          <div className='row g-4'>
            <div className='col-12 col-xl-7'>
                <div className="card border-0 shadow-sm rounded-4 h-100 overflow-hidden">
                    <RecentNotices />
                </div>
            </div>
            <div className='col-12 col-xl-5'>
                <div className="card border-0 shadow-sm rounded-4 h-100 overflow-hidden">
                    <ProfessorList showDetails={false} maxEntries={5} />
                </div>
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
