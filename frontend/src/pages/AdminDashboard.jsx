import React from 'react'
import Sidebar from '../components/Sidebar';
import TopHeader from '../components/Topheader';
import StateCards from '../components/StateCards';
import RecentNotices from './RecentNotice';
import ProfessorList from './ProfessorList';

export default function AdminDashboard() {
  return (
    <div className='container-fluid'>
      <div className='row min-vh-100'>
        <Sidebar />
        <div className='col p-4 bg-body-secondary'>
          <div className="align-items-center">
            <TopHeader />
          </div>
          <StateCards />
          <div className='row'>
            <div className='col-12 col-lg-6 mb-4'>
              <RecentNotices />
            </div>
            <div className ='col-12 col-lg-6 mb-4'>
              <ProfessorList />
            </div>
          </div>
        </div>
      </div>
    </div >
  )
}
