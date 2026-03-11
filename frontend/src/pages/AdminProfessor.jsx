import React from 'react'
import Sidebar from '../components/Sidebar';
import StateCards from '../components/StateCards';
import ProfessorList from './ProfessorList';

export default function AdminProfessor() {
    return (
        <div className='container-fluid'>
            <div className='row min-vh-100'>
                <Sidebar />
                <div className='col bg-body-secondary'>
                    <div className="align-items-center mb-3">
                        <div className="rounded d-flex justify-content-between align-items-center mt-4">
                            <div>
                                <h4>Professor Management</h4>
                            </div>
                            <button className="btn btn-light">⚙ Settings</button>
                        </div>
                    </div>
                    <div className="row g-3 mb-4">
                        <StateCards title="Total Notices" value="120" bg="primary" />
                        <StateCards title="Active Notices" value="98" bg="info" />
                        <StateCards title="Inactive Notices" value="22" bg="warning" />
                        <StateCards title="Pending Approval" value="5" bg="success" />
                    </div>
                    <div className='row'>
                        <div className='mb-4'>
                            <ProfessorList showDetails={true} />
                        </div>
                    </div>
                </div>
            </div>
        </div >
    )
}
