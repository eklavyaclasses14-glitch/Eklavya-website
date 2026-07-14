import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, User, BookOpen, UploadCloud, LogOut, Menu, X, UserPlus, UserCheck, FileText, CalendarCheck, DollarSign, Activity } from 'lucide-react';
import { apiFetch } from '../utils/apiFetch';
import '../styles/AdminLayout.css';

export default function AdminLayout({ children }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('user')) || {};
      return stored.user || {};
    } catch {
      return {};
    }
  });

  const navigate = useNavigate();
  const location = useLocation();

  // Listen for profile updates
  useEffect(() => {
    const handleSync = () => {
      console.log('[AdminLayout] Syncing user data from localStorage...');
      try {
        const stored = JSON.parse(localStorage.getItem('user')) || {};
        setUser(stored.user || {});
      } catch (err) {
        console.error('[AdminLayout] Sync error:', err);
      }
    };

    window.addEventListener('profileUpdated', handleSync);
    window.addEventListener('storage', handleSync); 

    return () => {
      window.removeEventListener('profileUpdated', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, []);

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

  const navItems = [
    { label: 'Dashboard',        path: '/admin/dashboard',    icon: <LayoutDashboard size={18} /> },
    { label: 'Manage Students',  path: '/admin/students',     icon: <UserCheck size={18} /> },
    { label: 'Add Student',      path: '/admin/students/new', icon: <UserPlus size={18} /> },
    { label: 'Live Activity',    path: '/admin/live-tracking',icon: <Activity size={18} /> },
    { label: 'Manage Documents', path: '/admin/notes',        icon: <FileText size={18} /> },
    { label: 'Upload Document',  path: '/admin/notes/upload', icon: <UploadCloud size={18} /> },
    { label: 'Manage Subjects',  path: '/admin/subjects',     icon: <BookOpen size={18} /> },
    { label: 'Attendance',       path: '/admin/attendance',   icon: <CalendarCheck size={18} /> },
    { label: 'Manage Fees',      path: '/admin/fees',         icon: <DollarSign size={18} /> },
    { label: 'Profile',          path: '/admin/profile',      icon: <User size={18} />   },
    { label: 'Manage Staff',       path: '/admin/staff',        icon: <Users size={18} />  }
  ];

  const currentPage = navItems.find(i => i.path === location.pathname);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--color-background)' }}>

      {/* ── Dark Sidebar ── */}
      <aside className={`admin-sidebar ${isMobileMenuOpen ? 'open' : ''}`}>
        {/* Brand */}
        <div className="admin-sidebar-brand">
          <div className="admin-sidebar-brand-icon" style={{ background: 'transparent', boxShadow: 'none' }}>
            <img src="/eklavya-logo.png" alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
          <div className="admin-sidebar-brand-text">
            <span className="admin-sidebar-brand-title">Eklavya Portal</span>
            <span className="admin-sidebar-brand-sub">Administration</span>
          </div>
          <button className="admin-sidebar-close-btn" onClick={() => setIsMobileMenuOpen(false)}>
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <p className="admin-sidebar-section-label">Main Menu</p>
        <nav className="admin-sidebar-nav">
          {navItems.map(item => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => { navigate(item.path); setIsMobileMenuOpen(false); }}
                className={`admin-nav-btn ${isActive ? 'active' : ''}`}
              >
                <span className="nav-icon">{item.icon}</span>
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* User / Logout */}
        <div className="admin-sidebar-footer">
          <div 
            className="admin-sidebar-user" 
            onClick={handleLogout} 
            title="Logout"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && handleLogout()}
          >
            <div className="admin-sidebar-avatar">
              {user.avatar ? (
                <img src={user.avatar} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
              ) : (
                (user.name || 'A')[0].toUpperCase()
              )}
            </div>
            <span className="admin-sidebar-user-name">{user.name || 'Administrator'}</span>
            <LogOut size={15} className="admin-sidebar-logout" />
          </div>
        </div>
      </aside>

      {/* ── Main Area ── */}
      <div className="admin-main-content">
        {/* Top Header */}
        <header className="admin-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button className="admin-hamburger" onClick={() => setIsMobileMenuOpen(true)}>
              <Menu size={22} />
            </button>
            <div>
              <p className="admin-header-page-title">{currentPage?.label || 'Administration'}</p>
              <p className="admin-header-breadcrumb">Eklavya Portal › {currentPage?.label || 'Admin'}</p>
            </div>
          </div>

          <div className="admin-header-right">
            <div>
              <p style={{ fontSize: '0.8125rem', fontWeight: 600, textAlign: 'right' }}>{user.name || 'Administrator'}</p>
            </div>
            <div 
              className="admin-header-avatar" 
              onClick={() => navigate('/admin/profile')}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && navigate('/admin/profile')}
            >
              {user.avatar ? (
                <img src={user.avatar} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
              ) : (
                (user.name || 'A')[0].toUpperCase()
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="admin-page-body">
          {children}
        </main>
      </div>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div className="admin-overlay" onClick={() => setIsMobileMenuOpen(false)} />
      )}
    </div>
  );
}
