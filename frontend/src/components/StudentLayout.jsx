import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, FileText, LogOut, Menu, X, CalendarCheck, DollarSign, User } from 'lucide-react';
import { apiFetch } from '../utils/apiFetch';
import { useActivityTracker } from '../hooks/useActivityTracker';
import '../styles/StudentLayout.css';

const SidebarContent = ({ navItems, location, goTo, setDrawerOpen, avatarUrl, student, handleLogout }) => (
  <>
    {/* Brand */}
    <div className="student-sidebar-brand">
      <div className="student-sidebar-brand-icon" style={{ background: 'transparent', boxShadow: 'none' }}>
        <img src="/eklavya-logo.png" alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
      </div>
      <div>
        <div className="student-sidebar-brand-title">Eklavya Portal</div>
        <div className="student-sidebar-brand-sub">Student Access</div>
      </div>
      {/* Close button — only visible inside mobile drawer */}
      <button
        className="student-sidebar-close-btn"
        onClick={() => setDrawerOpen(false)}
        aria-label="Close menu"
      >
        <X size={20} />
      </button>
    </div>

    {/* Nav */}
    <nav className="student-sidebar-nav">
      {navItems.map(item => {
        const isActive = location.pathname === item.path;
        return (
          <button
            key={item.path}
            onClick={() => goTo(item.path)}
            className={`student-nav-btn ${isActive ? 'active' : ''}`}
          >
            {item.icon}
            {item.label}
          </button>
        );
      })}
    </nav>

    {/* User footer */}
    <div className="student-sidebar-footer">
      <div className="student-sidebar-user">
        <div className="student-sidebar-avatar">
          <img src={avatarUrl} alt={student.name} />
        </div>
        <span className="student-sidebar-name">{student.name || 'Student'}</span>
        <button className="student-sidebar-logout" onClick={handleLogout} title="Logout">
          <LogOut size={16} />
        </button>
      </div>
    </div>
  </>
);

export default function StudentLayout({ children }) {
  // Initialize the global activity tracker for the student portal
  useActivityTracker();
  
  const [drawerOpen, setDrawerOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const student = user?.user || {};

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
    { label: 'Dashboard',  path: '/student/dashboard',  icon: <Home size={20} /> },
    { label: 'Notes',      path: '/student/notes',      icon: <FileText size={20} /> },
    { label: 'Attendance', path: '/student/attendance', icon: <CalendarCheck size={20} /> },
    { label: 'Fees',       path: '/student/fees',       icon: <DollarSign size={20} /> },
    { label: 'Profile',    path: '/student/profile',    icon: <User size={20} /> },
  ];

  const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(student.name || 'Student')}&background=4f46e5&color=fff&bold=true`;
  const currentPage = navItems.find(i => i.path === location.pathname);

  const goTo = (path) => {
    navigate(path);
    setDrawerOpen(false);
  };

  // ── Sidebar inner content (shared by desktop + mobile drawer) ──

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--color-background)' }}>

      {/* ── Desktop Sidebar ── */}
      <aside className="student-sidebar">
        <SidebarContent navItems={navItems} location={location} goTo={goTo} setDrawerOpen={setDrawerOpen} avatarUrl={avatarUrl} student={student} handleLogout={handleLogout} />
      </aside>

      {/* ── Mobile Drawer ── */}
      {drawerOpen && (
        <div 
          className="student-overlay" 
          onClick={() => setDrawerOpen(false)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && setDrawerOpen(false)}
        />
      )}
      <aside className={`student-drawer ${drawerOpen ? 'open' : ''}`}>
        <SidebarContent navItems={navItems} location={location} goTo={goTo} setDrawerOpen={setDrawerOpen} avatarUrl={avatarUrl} student={student} handleLogout={handleLogout} />
      </aside>

      {/* ── Main Area ── */}
      <div className="student-main">

        {/* Header */}
        <header className="student-header">
          <div className="student-header-left">
            {/* Hamburger — mobile only */}
            <button
              className="student-hamburger"
              onClick={() => setDrawerOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={22} />
            </button>

            {/* Mobile brand (shown next to hamburger) */}
            <div className="student-header-mobile-brand">
              {/* <div className="student-header-mobile-brand-icon">E</div>
              <span style={{ fontWeight: 800, fontSize: '1rem' }}>Eklavya</span> */}
            </div>

            {/* Desktop page title */}
            <span className="student-header-page-title">
              {currentPage?.label || 'Portal'}
            </span>
          </div>

          <div className="student-header-right">
            <div style={{ textAlign: 'right' }}>
              <div className="student-header-name">{student.name || 'Student'}</div>
              <div className="student-header-dept">
                {student.department || ''} {student.semester ? `· Sem ${student.semester}` : ''}
              </div>
            </div>
            <div className="student-header-avatar">
              <img src={avatarUrl} alt={student.name} />
            </div>
            <button className="student-header-logout" onClick={handleLogout} title="Logout">
              <LogOut size={18} />
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="student-page-body">
          {children}
        </main>
      </div>

      {/* ── Mobile Bottom Tab Bar ── */}
      <nav className="student-bottom-tab">
        {navItems.map(item => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => goTo(item.path)}
              className={`student-tab-btn ${isActive ? 'active' : ''}`}
            >
              {item.icon}
              <span className="student-tab-label">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
