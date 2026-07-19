import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';

// Lazy load all pages
const Landing             = lazy(() => import('./pages/Landing'));
const Login               = lazy(() => import('./pages/Login'));
const StudentDashboard    = lazy(() => import('./pages/StudentDashboard'));
const StudentNotes        = lazy(() => import('./pages/StudentNotes'));
const AdminDashboard      = lazy(() => import('./pages/AdminDashboard'));
const AdminAddStudent     = lazy(() => import('./pages/AdminAddStudent'));
const AdminUploadDocument  = lazy(() => import('./pages/AdminUploadDocument'));
const AdminManageSubjects   = lazy(() => import('./pages/AdminManageSubjects'));
const AdminManageDepartments= lazy(() => import('./pages/AdminManageDepartments'));
const AdminManageStudents   = lazy(() => import('./pages/AdminManageStudents'));
const AdminLiveTracking     = lazy(() => import('./pages/AdminLiveTracking'));
const AdminManageDocuments  = lazy(() => import('./pages/AdminManageDocuments'));
const AdminAttendance       = lazy(() => import('./pages/AdminAttendance'));
const AdminProfile          = lazy(() => import('./pages/AdminProfile'));
const AdminAddStaff         = lazy(() => import('./pages/AdminAddStaff'));
const StaffDashboard       = lazy(() => import('./pages/StaffDashboard'));
const StaffLayout          = lazy(() => import('./components/StaffLayout'));
const StaffAttendance      = lazy(() => import('./pages/StaffAttendance'));
const AdminFees            = lazy(() => import('./pages/AdminFees'));
const StudentFees          = lazy(() => import('./pages/StudentFees'));
const StudentAttendance    = lazy(() => import('./pages/StudentAttendance'));
const StudentProfile       = lazy(() => import('./pages/StudentProfile'));
const PrivacyPolicy        = lazy(() => import('./pages/PrivacyPolicy'));


function PageLoader() {
  return (
    <div style={{
      height: '100vh', width: '100%', display: 'flex', alignItems: 'center',
      justifyContent: 'center', background: 'var(--color-background)',
      flexDirection: 'column', gap: '1.5rem'
    }}>
      <div className="sd-spinner" style={{ width: '40px', height: '40px' }}></div>
      <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', fontWeight: 500 }}>
        Loading experience...
      </p>
    </div>
  );
}

function NotFound() {
  const navigate = useNavigate();
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      gap: '1rem', background: 'var(--color-background)'
    }}>
      <div style={{
        fontSize: '5rem', fontWeight: 900, color: 'var(--color-border)',
        lineHeight: 1
      }}>404</div>
      <p style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--color-text)' }}>Page Not Found</p>
      <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>The page you're looking for doesn't exist.</p>
      <button
        onClick={() => navigate('/login')}
        style={{
          marginTop: '0.5rem', padding: '0.75rem 2rem',
          background: 'linear-gradient(135deg,var(--color-primary),var(--color-primary-hover))',
          color: 'white', borderRadius: '99px', fontWeight: 700,
          fontSize: '0.875rem', cursor: 'pointer', border: 'none',
          boxShadow: '0 4px 14px rgba(74, 92, 106,0.35)'
        }}
      >
        Back to Login
      </button>
    </div>
  );
}

function App() {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/"    element={<Landing />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/login" element={<Login />} />

          {/* Student Protected Routes */}
          <Route element={<ProtectedRoute allowedRoles={['student']} />}>
            <Route path="/student/dashboard"  element={<StudentDashboard />} />
            <Route path="/student/notes"      element={<StudentNotes />} />
            <Route path="/student/attendance" element={<StudentAttendance />} />
            <Route path="/student/fees"       element={<StudentFees />} />
            <Route path="/student/profile"    element={<StudentProfile />} />
          </Route>

          {/* Staff Protected Routes */}
          <Route element={<ProtectedRoute allowedRoles={['admin', 'staff']} />}>
            <Route path="/staff/dashboard"    element={<StaffDashboard />} />
            <Route path="/staff/layout"        element={<StaffLayout />} />
            <Route path="/staff/attendance"   element={<StaffAttendance />} />
          </Route>

          {/* Admin Protected Routes */}
          <Route element={<ProtectedRoute allowedRoles={['admin', 'staff']} />}>
            <Route path="/admin/dashboard"     element={<AdminDashboard />} />
            <Route path="/admin/students"       element={<AdminManageStudents />} />
            <Route path="/admin/students/new"  element={<AdminAddStudent />} />
            <Route path="/admin/live-tracking" element={<AdminLiveTracking />} />
            <Route path="/admin/notes"         element={<AdminManageDocuments />} />
            <Route path="/admin/notes/upload"  element={<AdminUploadDocument />} />
            <Route path="/admin/subjects"       element={<AdminManageSubjects />} />
            <Route path="/admin/departments"    element={<AdminManageDepartments />} />
            <Route path="/admin/attendance"    element={<AdminAttendance />} />
            <Route path="/admin/fees"          element={<AdminFees />} />
            <Route path="/admin/profile"       element={<AdminProfile />} />
            <Route path="/admin/staff"         element={<AdminAddStaff />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
