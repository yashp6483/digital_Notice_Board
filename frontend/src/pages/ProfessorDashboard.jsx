import React from 'react'
import Sidebar from '../components/Sidebar'
import TopHeader from '../components/Topheader'
import StateCards from '../components/StateCards'
import RecentNotices from './RecentNotice'

export default function ProfessorDashboard() {
  return (
    <div className="container-fluid">
      <div className="row min-vh-100">
        {/* Sidebar — same as Admin */}
        <Sidebar />

        {/* Main content — same col structure as AdminDashboard */}
        <div className="col p-4 bg-body-secondary">
          {/* TopHeader */}
          <div className="align-items-center">
            <TopHeader />
          </div>

          {/* StateCards row — mirrors AdminDashboard StateCards */}
          <div className="row g-3 mb-4 mt-3">
            <StateCards title="My Notices"    value="34"  bg="primary" />
            <StateCards title="Active Notices" value="28"  bg="info"    />
            <StateCards title="Pending Approval" value="3" bg="warning" />
            <StateCards title="My Courses"    value="5"   bg="success" />
          </div>

          {/* Bottom row — Notices only (no course/professor list) */}
          <div className="row">
            <div className="col-12 mb-4">
              <RecentNotices />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
