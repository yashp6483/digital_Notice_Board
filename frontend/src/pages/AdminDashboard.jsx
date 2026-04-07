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

  // ✅ FIXED STATES
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
    <div className='container-fluid'>
      <div className='row min-vh-100'>

        <Sidebar />

        <div className='col p-4 bg-body-secondary'>

          <TopHeader />

          {/* ✅ STATS */}
          <div className="row g-3 mb-4 mt-3">

            <StateCards title="Total Notices" value={noticeStats.total} bg="primary" />
            <StateCards title="Active Notices" value={noticeStats.active} bg="info" />
            <StateCards title="Inactive Notices" value={noticeStats.inactive} bg="warning" />

            <StateCards title="Total Professors" value={professorStats.total} bg="secondary" />
            <StateCards title="Active Professors" value={professorStats.active} bg="success" />
            <StateCards title="Inactive Professors" value={professorStats.inactive} bg="danger" />

            {/* ✅ NEW ADMIN CARDS */}
            <StateCards title="Total Admins" value={adminStats.total} bg="dark" />
            <StateCards title="Active Admins" value={adminStats.active} bg="success" />

          </div>

          {/* TABLES */}
          <div className='row'>
            <div className='col-12 col-lg-6 mb-4'>
              <RecentNotices />
            </div>
            <div className='col-12 col-lg-6 mb-4'>
              <ProfessorList showDetails={false} maxEntries={5} />
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
