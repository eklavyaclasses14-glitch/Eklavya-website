import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Login              from './pages/Login';
import StudentDashboard   from './pages/StudentDashboard';
import StudentNotes       from './pages/StudentNotes';
import AdminDashboard     from './pages/AdminDashboard';
import AdminAddStudent    from './pages/AdminAddStudent';
import AdminUploadDocument from './pages/AdminUploadDocument';
import AdminManageSubjects  from './pages/AdminManageSubjects';
import AdminManageStudents  from './pages/AdminManageStudents';
import AdminManageDocuments from './pages/AdminManageDocuments';

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
      <Routes>
        <Route path="/"    element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />

        {/* Student */}
        <Route path="/student/dashboard"  element={<StudentDashboard />} />
        <Route path="/student/notes"      element={<StudentNotes />} />

        {/* Admin */}
        <Route path="/admin/dashboard"     element={<AdminDashboard />} />
        <Route path="/admin/students"       element={<AdminManageStudents />} />
        <Route path="/admin/students/new"  element={<AdminAddStudent />} />
        <Route path="/admin/notes"         element={<AdminManageDocuments />} />
        <Route path="/admin/notes/upload"  element={<AdminUploadDocument />} />
        <Route path="/admin/subjects"       element={<AdminManageSubjects />} />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
