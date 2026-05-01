import React, { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar';
import TopHeader from '../components/Topheader';
import StateCards from '../components/StateCards';
import ProfessorList from './ProfessorList';
import { fetchProfessor } from '../services/professorServices';
import Swal from "sweetalert2";
import {
    calculateProfessorStats,
    getInitialProfessorStats
} from '../utils/statHelpers';

export default function AdminProfessor() {
    const navigate = useNavigate();
    const [professorStats, setProfessorStats] = useState(getInitialProfessorStats());
    const [loading, setLoading] = useState(false);

    const loadPageStats = useCallback(async () => {
        setLoading(true);
        try {
            const professorsFromApi = await fetchProfessor();
            const normalizedProfessors = professorsFromApi || [];

            setProfessorStats(calculateProfessorStats(normalizedProfessors));
        } catch (error) {
            console.error(error);
            if (error.status === 401 || error.status === 403) {
                localStorage.clear();
                navigate("/unauthorized");
                return;
            }
            Swal.fire({
                icon: "error",
                title: "Failed to load professor stats",
                text: error.message || "Something went wrong"
            });
        } finally {
            setLoading(false);
        }
    }, [navigate]);

    useEffect(() => {
        loadPageStats();
    }, [loadPageStats]);

    return (
        <div className='container-fluid p-0'>
            <div className='d-flex min-vh-100 overflow-hidden'>
                <Sidebar />
                <div className='flex-grow-1 p-3 p-md-4 overflow-auto custom-scrollbar' style={{ backgroundColor: "#f8fafc", height: "100vh" }}>
                    <TopHeader />
                    
                    <div className="mb-4">
                        <h4 className="fw-bold text-dark">Professor Management</h4>
                        <p className="text-muted small">Manage faculty members, their departments, and account statuses.</p>
                    </div>

                    <div className="row g-4 mb-3">
                        <StateCards title="Total Professors" value={professorStats.total} icon="fa-user-tie" color="primary" />
                        <StateCards title="Active Professors" value={professorStats.active} icon="fa-user-check" color="success" />
                        <StateCards title="Inactive Professors" value={professorStats.inactive} icon="fa-user-slash" color="warning" />
                    </div>

                    <div className='row g-4'>
                        <div className='col-12'>
                            {loading ? (
                                <div className="text-center py-5 bg-white rounded-4 shadow-sm">
                                    <div className="spinner-border text-primary mb-3"></div>
                                    <h6 className="text-muted">Loading professors...</h6>
                                </div>
                            ) : (
                                <ProfessorList showDetails={true} />
                            )}
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
        </div >
    )
}
