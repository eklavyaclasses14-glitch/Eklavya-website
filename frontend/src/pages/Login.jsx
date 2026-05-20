import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, User, Lock, AlertCircle, Eye, EyeOff } from 'lucide-react';
import '../styles/Login.css';
import {apiFetch} from '../utils';
export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    if (token && userStr) {
      try {
        const userData = JSON.parse(userStr);
        if (userData.role === 'admin') {
          navigate('/admin/dashboard', { replace: true });
        } else if (userData.role === 'staff') {
          navigate('/staff/dashboard', { replace: true });
        } else {
          navigate('/student/dashboard', { replace: true });
        }
      } catch (e) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await apiFetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error('Too many login attempts. Please wait 15 minutes.');
        }
        throw new Error(data.error || 'Login failed');
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify({ role: data.role, user: data.user }));

      if (data.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (data.role === 'staff') {
        navigate('/staff/dashboard');
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
      {/* Dynamic Animated Ambient Background Layer for Deep Glass Blur */}
      <div className="login-bg-glows">
        <div className="login-bg-glow glow-primary"></div>
        <div className="login-bg-glow glow-secondary"></div>
        <div className="login-bg-glow glow-tertiary"></div>
      </div>

      {/* Left Decorative Information Board */}
      <div className="login-left-panel">
        <div className="login-grid-overlay"></div>
        
        <div className="login-panel-content">
          {/* Back to Homepage Button */}
          <button type="button" className="back-home-btn" onClick={() => navigate('/')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="back-arrow-icon">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            <span>Back to Homepage</span>
          </button>

          {/* Unified Brand Identity */}
          <div className="login-panel-logo" onClick={() => navigate('/')}>
            <div className="login-brand-icon-box">
              <img src="/eklavya-logo.png" alt="Eklavya Logo" className="login-brand-svg" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </div>
            <span className="login-brand-name">Eklavya</span>
          </div>

          <h2 className="login-panel-title">
            Academic Spaces,<br />Orchestrated.
          </h2>

          <p className="login-panel-subtitle">
            Experience an elegant administrative platform connecting learners, educators, and institutional operations with absolute speed.
          </p>

          <div className="login-showcase-features">
            <div className="showcase-feature-item">
              <div className="feature-item-bullet"></div>
              <div className="feature-item-text">
                <strong>Syllabus Archives</strong>
                <span>Instant access to curated materials</span>
              </div>
            </div>
            <div className="showcase-feature-item">
              <div className="feature-item-bullet"></div>
              <div className="feature-item-text">
                <strong>Secure Registers</strong>
                <span>Encrypted role-specific privileges</span>
              </div>
            </div>
            <div className="showcase-feature-item">
              <div className="feature-item-bullet"></div>
              <div className="feature-item-text">
                <strong>Attendance Feeds</strong>
                <span>Real-time classroom session logging</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Login Input Form Panel */}
      <div className="login-right-panel">
        <div className="login-form-card">
          {/* Brand header specifically for Mobile/Tablet displays */}
          <div className="mobile-brand-header" onClick={() => navigate('/')}>
            <img src="/eklavya-logo.png" alt="Eklavya Logo" className="mobile-brand-svg" style={{ width: '32px', height: '32px', objectFit: 'contain', borderRadius: '5px' }} />
            <span className="mobile-brand-name">Eklavya</span>
          </div>

          <div className="login-form-heading">
            <h1>Secure Sign In</h1>
            <p>Access your institutional workspace dashboard</p>
          </div>

          {error && (
            <div className="login-alert fade-in">
              <AlertCircle size={18} className="alert-icon" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div className="login-input-group">
              <label className="login-input-label">Email Address</label>
              <div className="login-input-container">
                <input
                  type="email"
                  className="login-field"
                  placeholder="name@eklavya.academy"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="username"
                  required
                />
                <User size={18} className="login-input-icon" />
              </div>
            </div>

            <div className="login-input-group">
              <label className="login-input-label">Password</label>
              <div className="login-input-container">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="login-field"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                  style={{ paddingRight: '3.5rem' }}
                />
                <Lock size={18} className="login-input-icon" />
                <button
                  type="button"
                  className="login-password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? (
                <div className="login-spinner"></div>
              ) : (
                <>
                  <span>Authenticate Dashboard</span>
                  <LogIn size={18} className="login-btn-arrow" />
                </>
              )}
            </button>
          </form>

          {/* Direct path back to landing page for mobile users */}
          <div className="mobile-back-container">
            <span className="mobile-back-text" onClick={() => navigate('/')}>
              ← Back to Homepage
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
