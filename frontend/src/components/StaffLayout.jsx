import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, BookOpen, UploadCloud, LogOut, Menu, X, UserPlus, UserCheck, FileText, CalendarCheck, DollarSign } from 'lucide-react';
import { apiFetch } from '../utils/apiFetch';
import '../styles/AdminLayout.css';

export default function StaffLayout({ children }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await apiFetch('api/auth/logout', { method: 'POST' });
    } catch (err) {
      console.error('Logout error:', err);
    }
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/login');
  };

return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-brand">
          <span className="admin-sidebar-brand-title">
            Staff Panel
          </span>
        </div>

        <nav className="admin-sidebar-nav">
          <button
            className="admin-nav-btn"
            onClick={() => navigate("/staff/dashboard")}
          >
            Dashboard
          </button>

          <button
            className="admin-nav-btn"
            onClick={() => window.location.href = '/staff/attendance'}
          >
            Attendance
          </button>
        </nav>

        <div className="admin-sidebar-footer">
          <button onClick={handleLogout} className="admin-nav-btn">
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="admin-main-content">
        <main className="admin-page-body">
          {children}
        </main>
      </div>
    </div>
  );
}