import './App.css';
import { Route, Routes } from 'react-router-dom';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import ProfessorDashboard from './pages/ProfessorDashboard';
import ProtectedRoute from './components/ProtectedRoutes';
import AdminNotice from './pages/AdminNotice';
import DocumentView from './components/DocumentViewerModal';
import Unauthorized from './pages/Unauthorized';
import AdminProfessor from './pages/AdminProfessor';
import ProfessorNotice from './pages/ProfessorNotice';
import ForgotPassword from './pages/ForgotPassword';
import MyNotice from "./pages/MyNotice";
import NoticeDisplay from './components/NoticeDisplay';
import DisplayControls from './components/DisplayControls';
function App() {
  return (
    <Routes>
      {/* default route */}
      <Route path="/" element={<Login />} />
      {/* login route  */}
      <Route path='/login' element={<Login />} />
      <Route path='/display' element={<NoticeDisplay />} />
      <Route path='/unauthorized' element={<Unauthorized />} />
      <Route path='/document-view' element={<DocumentView />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
        <Route path="/admin" element={<AdminDashboard />} />
        {/* <Route path="/admin-dashboard" element={<AdminDashboard />} /> */}
      </Route>
      <Route element={<ProtectedRoute allowedRoles={["professor"]} />}>
        <Route path='/professor' element={<ProfessorDashboard />} />
        <Route path='/professor/display' element={<DisplayControls />} />
        <Route path='/professor/notices' element={<ProfessorNotice />} />
        <Route path="/professor/my-notices" element={<MyNotice />} />
      </Route>
      <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
        <Route path='/admin/notices' element={<AdminNotice />} />
        <Route path='/admin/display' element={<DisplayControls />} />
        <Route path='/admin/professors' element={<AdminProfessor />} />
        <Route path="/admin/my-notices" element={<MyNotice />} />
      </Route>
    </Routes>
  );
}

export default App;
