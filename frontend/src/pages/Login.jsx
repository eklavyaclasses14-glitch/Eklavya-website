import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, User, Lock, GraduationCap, AlertCircle, BookOpen, CalendarCheck, FileText } from 'lucide-react';
import '../styles/Login.css';

export default function Login() {
  const [enrollmentNo, setEnrollmentNo] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enrollment_no: enrollmentNo, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify({ role: data.role, user: data.user }));

      if (data.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/student/dashboard');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page-wrapper">

      {/* ── Left Decorative Panel ── */}
      <div className="login-left-panel">
        {/* Animated blobs */}
        <div className="login-blob login-blob-1"></div>
        <div className="login-blob login-blob-2"></div>
        <div className="login-blob login-blob-3"></div>

        <div className="login-panel-content">
          <div className="login-panel-logo"><img src="/eklavya-logo.png" alt="Eklavya" style={{ width: '100%', height: '100%', objectFit: 'contain' }} /></div>

          <h2 className="login-panel-title">
            Eklavya<br />Student Portal
          </h2>

          <p className="login-panel-subtitle">
            Your academic journey, organized.<br />
            Access attendance, notes, and more — all in one place.
          </p>

          <div className="login-panel-badges">
            <span className="login-panel-badge"><BookOpen size={13} /> Study Notes</span>
            <span className="login-panel-badge"><CalendarCheck size={13} /> Attendance</span>
            <span className="login-panel-badge"><GraduationCap size={13} /> Academics</span>
          </div>
        </div>
      </div>

      {/* ── Right Form Panel ── */}
      <div className="login-right-panel">
        <div className="login-form-container">

          {/* Mobile brand header */}
          <div className="login-mobile-brand">
          <div className="login-mobile-brand-icon"><img src="/eklavya-logo.png" alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} /></div>
          <div>
              <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>Eklavya Portal</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Student Academic System</div>
            </div>
          </div>

          {/* Heading */}
          <div className="login-form-heading">
            <h1>Welcome back</h1>
            <p>Sign in to continue to your dashboard</p>
          </div>

          {/* Error */}
          {error && (
            <div className="login-error-banner">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin}>
            <div className="login-input-group">
              <label className="login-input-label">Enrollment Number</label>
              <div className="login-input-wrapper">
                <User size={17} className="login-input-icon" />
                <input
                  id="enrollment-input"
                  type="text"
                  className="input-field login-input"
                  placeholder="e.g. ENR001 or admin"
                  value={enrollmentNo}
                  onChange={(e) => setEnrollmentNo(e.target.value)}
                  autoComplete="username"
                  required
                />
              </div>
            </div>

            <div className="login-input-group">
              <label className="login-input-label">Password</label>
              <div className="login-input-wrapper">
                <Lock size={17} className="login-input-icon" />
                <input
                  id="password-input"
                  type="password"
                  className="input-field login-input"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />
              </div>
            </div>

            <button
              id="login-submit-btn"
              type="submit"
              className="login-submit-btn"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="login-spinner"></div>
                  Signing in…
                </>
              ) : (
                <>
                  <LogIn size={18} />
                  Sign In
                </>
              )}
            </button>
          </form>

          {/* Demo credentials */}
          <div className="login-demo-credentials">
            <p>Demo Credentials</p>
            <div className="login-demo-row">
              <span className="login-demo-role">Admin</span>
              <span className="login-demo-cred">admin / admin</span>
            </div>
            <div className="login-demo-row">
              <span className="login-demo-role">Student</span>
              <span className="login-demo-cred">ENR001 / password123</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
