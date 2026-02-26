import './App.css';
import { Route, Routes } from 'react-router-dom';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import ProfessorDashboard from './pages/ProfessorDashboard';
import ProtectedRoute from './components/ProtectedRoutes';
import AdminNotice from './pages/AdminNotice';

function App() {
  return (
    <Routes>
      {/* default route */}
      <Route path="/" element={<Login />} />
      {/* login route  */}
      <Route path='/login' element={<Login />} />
      <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
      </Route>
      <Route element={<ProtectedRoute allowedRoles={["professor"]} />}>
        <Route path='/professor-dashboard' element={<ProfessorDashboard />} />
      </Route>
      <Route element={<ProtectedRoute allowedRoles={["admin", "professor"]} />}>
        <Route path='/admin/notices' element={<AdminNotice />} />
      </Route>
    </Routes>
  );
}

export default App;
