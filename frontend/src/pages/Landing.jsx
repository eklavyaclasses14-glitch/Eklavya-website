import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Hero3D from '../components/Hero3D';
import { MapPin, Phone, Sparkles } from "lucide-react";
import '../styles/Landing.css';

const Landing = () => {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('student');
  const [openFaq, setOpenFaq] = useState(null);
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  // Scroll spy to add styling to navbar on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 5000); // reset state after 5 seconds
    }
  };

  const toggleFaq = (index) => {
    if (openFaq === index) {
      setOpenFaq(null);
    } else {
      setOpenFaq(index);
    }
  };

  return (
    <div className="landing-container">
      {/* Background Ambient Lights */}
      <div className="ambient-glow glow-1"></div>
      <div className="ambient-glow glow-2"></div>
      <div className="ambient-glow glow-3"></div>
      <div className="grid-overlay"></div>

      {/* Glassmorphic Navbar */}
      <header className={`landing-header ${scrolled ? 'header-scrolled' : ''}`}>
        <div className="nav-wrapper">
          <div className="brand-logo" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="brand-icon-box">
              <img src="/eklavya-logo.png" alt="Eklavya Logo" className="brand-svg" style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '5px' }} />
            </div>
            <span className="brand-name">Eklavya</span>
          </div>

          {/* Desktop Nav Links */}
          <nav className="desktop-nav">
            <a href="#features" className="nav-link">Features</a>
            <a href="#faqs" className="nav-link">FAQs</a>
            <a href="#contact" className="nav-link">Contact</a>
          </nav>

          {/* Nav CTA Buttons */}
          <div className="nav-ctas">
            <button onClick={() => navigate('/login')} className="btn-secondary-custom">
              Portal Login
            </button>
            <button onClick={() => navigate('/login')} className="btn-primary-custom">
              Get Started
            </button>
          </div>

          {/* Mobile Menu Toggle Button */}
          <button className="mobile-toggle" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label="Toggle menu">
            <div className={`hamburger ${mobileMenuOpen ? 'active' : ''}`}>
              <span></span>
              <span></span>
              <span></span>
            </div>
          </button>
        </div>

        {/* Mobile Navigation Drawer */}
        <div className={`mobile-drawer ${mobileMenuOpen ? 'drawer-open' : ''}`}>
          <nav className="mobile-links">
            <a href="#features" onClick={() => setMobileMenuOpen(false)}>Features</a>
            <a href="#portals" onClick={() => setMobileMenuOpen(false)}>Portal Showcase</a>
            <a href="#faqs" onClick={() => setMobileMenuOpen(false)}>FAQs</a>
            <a href="#contact" onClick={() => setMobileMenuOpen(false)}>Contact</a>
            <div className="mobile-drawer-divider"></div>
            <button onClick={() => { setMobileMenuOpen(false); navigate('/login'); }} className="mobile-btn secondary">
              Portal Login
            </button>
            <button onClick={() => { setMobileMenuOpen(false); navigate('/login'); }} className="mobile-btn primary">
              Get Started
            </button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-canvas-container">

        </div>

        <div className="hero-content">
          <div className="hero-badge">
            <span className="badge-pulse"></span>
            <span>Eklavya Engineering classes</span>
          </div>
          <h1 className="hero-title">
            Digital Learning.<br />
            <span className="accent-text-gradient">Intelligently Structured.</span>
          </h1>
          <p className="hero-subtitle">
            A comprehensive, dark-themed academic portal enabling students, instructors, and administrators to seamlessly manage curriculums, check real-time attendance, and view financial statements in one high-performance interface.
          </p>
          <div className="hero-buttons">
            <button onClick={() => navigate('/login')} className="btn-primary-hero">
              Access Student Portal
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="btn-arrow-icon">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </button>
            <a href="#features" className="btn-outline-hero">
              Explore Features
            </a>
          </div>
        </div>

        <div className="hero-scroll-indicator" onClick={() => document.getElementById('stats').scrollIntoView({ behavior: 'smooth' })}>
          <span>Scroll to Explore</span>
          <div className="mouse-scroller">
            <span className="mouse-wheel"></span>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section id="stats" className="stats-section">
        <div className="stats-container">
          <div className="stat-card">
            <div className="stat-value">100+</div>
            <div className="stat-label">Active Learners</div>
            <div className="stat-card-glow"></div>
          </div>
          <div className="stat-card">
            <div className="stat-value">98.4%</div>
            <div className="stat-label">System Uptime</div>
            <div className="stat-card-glow"></div>
          </div>
          <div className="stat-card">
            <div className="stat-value">100+</div>
            <div className="stat-label">Lecture Notes Distributed</div>
            <div className="stat-card-glow"></div>
          </div>
          <div className="stat-card">
            <div className="stat-value">2x</div>
            <div className="stat-label">Administrative Speedup</div>
            <div className="stat-card-glow"></div>
          </div>
        </div>
      </section>

      {/* Bento Grid Features Section */}
      <section id="features" className="features-section">
        <div className="section-header">
          <span className="section-tag">Core Features</span>
          <h2 className="section-title">Designed for Modern Academics</h2>
          <p className="section-desc">Eklavya wraps administrative power and intuitive design in a fast, responsive interface, optimized specifically for self-motivated excellence.</p>
        </div>

        <div className="bento-grid">
          {/* Card 1: Large Feature (Institute Excellence) */}
          <div className="bento-card card-large">
            <div className="bento-content">
              <div className="bento-icon-box">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="bento-icon">
                  <path d="M12 14l9-5-9-5-9 5 9 5z"></path>
                  <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"></path>
                  <path d="M12 14v6"></path>
                </svg>
              </div>
              <h3 className="bento-card-title">Academic Excellence & Mentorship</h3>
              <p className="bento-card-desc">
                Empowering the next generation of engineers with industry-experienced faculty, a comprehensive curriculum, and a proven track record of outstanding academic success.
              </p>
            </div>

            {/* Visual Preview element in large card */}
            <div className="bento-visual notes-vault-preview" style={{ flexDirection: 'column', gap: '0.75rem' }}>
              <div className="mini-note-item" style={{ borderLeft: '3px solid #f59e0b', background: 'var(--color-surface)' }}>
                <div className="mini-note-icon" style={{ background: 'rgba(245,158,11,0.2)', color: '#f59e0b', padding: '0.4rem', borderRadius: '8px' }}>
                   <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                </div>
                <div className="mini-note-details">
                  <span className="mini-note-title" style={{ color: '#fff' }}>15+ Years Legacy</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Proven track record in engineering</span>
                </div>
              </div>
              <div className="mini-note-item" style={{ borderLeft: '3px solid #10b981', background: 'var(--color-surface)' }}>
                <div className="mini-note-icon" style={{ background: 'rgba(16,185,129,0.2)', color: '#10b981', padding: '0.4rem', borderRadius: '8px' }}>
                   <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                </div>
                <div className="mini-note-details">
                  <span className="mini-note-title" style={{ color: '#fff' }}>Top State Ranks</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Consistent top-tier results</span>
                </div>
              </div>
              <div className="mini-note-item" style={{ borderLeft: '3px solid #3b82f6', background: 'var(--color-surface)' }}>
                <div className="mini-note-icon" style={{ background: 'rgba(59,130,246,0.2)', color: '#3b82f6', padding: '0.4rem', borderRadius: '8px' }}>
                   <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="23" y1="11" x2="17" y2="11"></line></svg>
                </div>
                <div className="mini-note-details">
                  <span className="mini-note-title" style={{ color: '#fff' }}>Expert Faculty</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Dedicated industry mentors</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Medium Feature (Digital Attendance Tracking) */}
          <div className="bento-card card-medium">
            <div className="bento-content">
              <div className="bento-icon-box">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="bento-icon">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
              </div>
              <h3 className="bento-card-title">Real-Time Attendance Monitoring</h3>
              <p className="bento-card-desc">
                Instructors mark attendance dynamically, giving students instant mobile-responsive dashboard notifications regarding current standing.
              </p>
            </div>
            {/* Visual Attendance Tracker Graph */}
            <div className="bento-visual attendance-preview">
              <div className="circular-progress-box">
                <div className="circle-svg-wrap">
                  <svg viewBox="0 0 36 36" className="circular-chart">
                    <path className="circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                    <path className="circle" strokeDasharray="92, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  </svg>
                  <div className="percentage-text">92%</div>
                </div>
                <div className="progress-legend">
                  <span className="legend-main">Overall Attendance</span>
                  <span className="legend-sub">Excellent standing</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Medium Feature (Transparent Fee Tracking) */}
          <div className="bento-card card-small">
            <div className="bento-content">
              <div className="bento-icon-box">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="bento-icon">
                  <line x1="12" y1="1" x2="12" y2="23"></line>
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                </svg>
              </div>
              <h3 className="bento-card-title">Transparent Fee Tracking</h3>
              <p className="bento-card-desc">
                Track outstanding tuition balances, check detailed semester fee statements, and review payment history with ease.
              </p>
            </div>
          </div>

          {/* Card 4: Small Feature (Security & Authentication) */}
          <div className="bento-card card-small">
            <div className="bento-content">
              <div className="bento-icon-box">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="bento-icon">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
              </div>
              <h3 className="bento-card-title">JWT Session Shield</h3>
              <p className="bento-card-desc">
                Your portal operations remain securely isolated via JSON Web Token security layers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Tabs Showcase Section
      <section id="portals" className="portals-showcase-section">
        <div className="section-header">
          <span className="section-tag">Role Capability</span>
          <h2 className="section-title">One Unified Core. Three Tailored Views.</h2>
          <p className="section-desc">Eklavya delivers context-specific dashboards, serving custom functionalities based on logged-in security privileges.</p>
        </div>

        <div className="tabs-nav-container">
          <div className="tabs-nav">
            <button className={`tab-nav-btn ${activeTab === 'student' ? 'tab-active' : ''}`} onClick={() => setActiveTab('student')}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="tab-icon">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
              </svg>
              For Students
            </button>
            <button className={`tab-nav-btn ${activeTab === 'instructor' ? 'tab-active' : ''}`} onClick={() => setActiveTab('instructor')}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="tab-icon">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
              For Staff & Instructors
            </button>
            <button className={`tab-nav-btn ${activeTab === 'admin' ? 'tab-active' : ''}`} onClick={() => setActiveTab('admin')}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="tab-icon">
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.5 1z"></path>
              </svg>
              For Administrators
            </button>
          </div>
        </div>

        <div className="tab-showcase-display">
          {activeTab === 'student' && (
            <div className="tab-pane-content fade-in-animation">
              <div className="tab-pane-text">
                <span className="pane-kicker">Self-Guided Portal</span>
                <h3 className="pane-headline">Everything you need to accelerate your knowledge path</h3>
                <p className="pane-paragraph">
                  As a student, Eklavya offers you an isolated self-service terminal. Instantly download verified classroom lecture notes, review structured subject descriptions, watch your dynamic attendance statistics, and check outstanding fee statements.
                </p>
                <ul className="pane-list">
                  <li>
                    <span className="pane-bullet-icon">✓</span>
                    <span>Download classroom syllabuses in PDF, Word, or ZIP archives.</span>
                  </li>
                  <li>
                    <span className="pane-bullet-icon">✓</span>
                    <span>Review direct overall attendance tracking with alert warnings.</span>
                  </li>
                  <li>
                    <span className="pane-bullet-icon">✓</span>
                    <span>View outstanding pending tuition balances and paid transaction records.</span>
                  </li>
                </ul>
              </div>

              <div className="tab-pane-mockup student-mockup">
                <div className="mockup-header">
                  <div className="mockup-dots"><span></span><span></span><span></span></div>
                  <span className="mockup-url">eklavyaengineeringclasses.in/</span>
                </div>
                <div className="mockup-body">
                  <div className="mockup-hero-stat">
                    <span className="mockup-stat-title">Current Semester Attendance</span>
                    <span className="mockup-stat-num text-success">94.2%</span>
                    <span className="mockup-stat-footer">Status: Excellent Standing</span>
                  </div>

                  <div className="mockup-list-title">My Recent Subject Notes</div>
                  <div className="mockup-list-item">
                    <span className="mockup-item-tag physics">Web</span>
                    <span className="mockup-item-name font-semibold">React.js</span>
                  </div>
                  <div className="mockup-list-item">
                    <span className="mockup-item-tag math">App</span>
                    <span className="mockup-item-name font-semibold">Flutter</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'instructor' && (
            <div className="tab-pane-content fade-in-animation">
              <div className="tab-pane-text">
                <span className="pane-kicker">Academic Administration Terminal</span>
                <h3 className="pane-headline">Mark classroom status in seconds</h3>
                <p className="pane-paragraph">
                  Educators require robust tools without clutter. The instructor workspace enables classroom teachers to mark daily attendance dynamically, view active class statistics, and coordinate student records through a lightning-fast dark-slate terminal.
                </p>
                <ul className="pane-list">
                  <li>
                    <span className="pane-bullet-icon">✓</span>
                    <span>Interactive toggle grids to submit daily student attendance files.</span>
                  </li>
                  <li>
                    <span className="pane-bullet-icon">✓</span>
                    <span>Track active student registries and department directories in real-time.</span>
                  </li>
                  <li>
                    <span className="pane-bullet-icon">✓</span>
                    <span>Access dedicated staff profile cards detailing institutional information.</span>
                  </li>
                </ul>
              </div>

              <div className="tab-pane-mockup instructor-mockup">
                <div className="mockup-header">
                  <div className="mockup-dots"><span></span><span></span><span></span></div>
                  <span className="mockup-url">eklavyaengineeringclasses.in/</span>
                </div>
                <div className="mockup-body">
                  <div className="mockup-row">
                    <div className="mockup-mini-card">
                      <span className="mini-card-lbl">Active Classes</span>
                      <span className="mini-card-val">4</span>
                    </div>
                    <div className="mockup-mini-card">
                      <span className="mini-card-lbl">Lectures Logged</span>
                      <span className="mini-card-val">76</span>
                    </div>
                  </div>

                  <div className="mockup-list-title">Quick Staff Actions</div>
                  <button className="mockup-action-btn primary">+ Mark Attendance</button>

                  <div className="mockup-list-title">Classroom 4A Attendance Grid</div>
                  <div className="mockup-grid-student">
                    <span>Aarav Mehta</span>
                    <span className="toggle-pill active">Present</span>
                  </div>
                  <div className="mockup-grid-student">
                    <span>Diya Sharma</span>
                    <span className="toggle-pill active">Present</span>
                  </div>
                  <div className="mockup-grid-student">
                    <span>Rohan Das</span>
                    <span className="toggle-pill inactive">Absent</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'admin' && (
            <div className="tab-pane-content fade-in-animation">
              <div className="tab-pane-text">
                <span className="pane-kicker">Total Institutional Control</span>
                <h3 className="pane-headline">Full visibility and granular administrative power</h3>
                <p className="pane-paragraph">
                  Eklavya gives administrative staff total database orchestration capability. Oversee staff rosters, process total enrollment fees, manage specific course subject listings, review general attendance audit files, and authorize accounts in real-time.
                </p>
                <ul className="pane-list">
                  <li>
                    <span className="pane-bullet-icon">✓</span>
                    <span>Full database orchestration over both Student and Staff accounts.</span>
                  </li>
                  <li>
                    <span className="pane-bullet-icon">✓</span>
                    <span>Robust course creation and subject list editing.</span>
                  </li>
                  <li>
                    <span className="pane-bullet-icon">✓</span>
                    <span>Audited overview of payment logs and security actions.</span>
                  </li>
                </ul>
              </div>

              <div className="tab-pane-mockup admin-mockup">
                <div className="mockup-header">
                  <div className="mockup-dots"><span></span><span></span><span></span></div>
                  <span className="mockup-url">eklavyaengineeringclasses.in/</span>
                </div>
                <div className="mockup-body">
                  <div className="mockup-row-triple">
                    <div className="mockup-mini-card">
                      <span className="mini-card-lbl">Total Students</span>
                      <span className="mini-card-val">340</span>
                    </div>
                    <div className="mockup-mini-card">
                      <span className="mini-card-lbl">Staff Members</span>
                      <span className="mini-card-val">12</span>
                    </div>
                    <div className="mockup-mini-card">
                      <span className="mini-card-lbl">Course Modules</span>
                      <span className="mini-card-val">18</span>
                    </div>
                  </div>

                  <div className="mockup-list-title">System Status Log</div>
                  <div className="mockup-log-item">
                    <span className="log-dot success"></span>
                    <span className="log-text">Database Connection Secure</span>
                  </div>
                  <div className="mockup-log-item">
                    <span className="log-dot success"></span>
                    <span className="log-text">Admin Session Valid (JWT Verified)</span>
                  </div>

                  <div className="mockup-list-title">Manage Accounts</div>
                  <div className="mockup-row">
                    <button className="mockup-btn-sm">+ New Student</button>
                    <button className="mockup-btn-sm">+ Register Staff</button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section> */}

      {/* Interactive Collapsible FAQ Accordion Section */}
      <section id="faqs" className="faqs-section">
        <div className="section-header">
          <span className="section-tag">Help Desk</span>
          <h2 className="section-title">Frequently Asked Questions</h2>
          <p className="section-desc">Have questions about the platform? Check out our quick answers below or contact the support terminal.</p>
        </div>

        <div className="faqs-wrapper">
          <div className="faq-item">
            <button className={`faq-trigger ${openFaq === 0 ? 'active' : ''}`} onClick={() => toggleFaq(0)}>
              <span className="faq-question">What is Eklavya and who is it designed for?</span>
              <span className="faq-chevron-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </span>
            </button>
            <div className={`faq-answer-container ${openFaq === 0 ? 'expanded' : ''}`}>
              <div className="faq-answer">
                Eklavya is a production-grade digital academic portal structured explicitly for modern institutes, academies, and self-guided learning groups. It allows students to manage study assets, track classroom attendance logs, check pending dues, and securely authenticate via role-specific portals.
              </div>
            </div>
          </div>

          <div className="faq-item">
            <button className={`faq-trigger ${openFaq === 1 ? 'active' : ''}`} onClick={() => toggleFaq(1)}>
              <span className="faq-question">Are demo classes available before admission?</span>
              <span className="faq-chevron-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </span>
            </button>
            <div className={`faq-answer-container ${openFaq === 1 ? 'expanded' : ''}`}>
              <div className="faq-answer">
                Yes, students can attend a free demo class to understand our teaching methodology before enrolling.
              </div>
            </div>
          </div>

          <div className="faq-item">
            <button className={`faq-trigger ${openFaq === 2 ? 'active' : ''}`} onClick={() => toggleFaq(2)}>
              <span className="faq-question">Who can join the coaching classes?</span>
              <span className="faq-chevron-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </span>
            </button>
            <div className={`faq-answer-container ${openFaq === 2 ? 'expanded' : ''}`}>
              <div className="faq-answer">
                Students from Classes 9 to 12 preparing for engineering entrance exams or strengthening their science and mathematics concepts can join.
              </div>
            </div>
          </div>

          <div className="faq-item">
            <button className={`faq-trigger ${openFaq === 3 ? 'active' : ''}`} onClick={() => toggleFaq(3)}>
              <span className="faq-question">How are doubts solved during the course?</span>
              <span className="faq-chevron-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </span>
            </button>
            <div className={`faq-answer-container ${openFaq === 3 ? 'expanded' : ''}`}>
              <div className="faq-answer">
                Dedicated doubt-solving sessions are conducted regularly, and students can also ask questions directly during classes.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Scratch Card Contact Section */}
      <section id="contact" className="newsletter-section">
        <div className="newsletter-card">
          <div className="newsletter-card-glow"></div>
          <div className="newsletter-content scratch-wrapper">
            <div className="scratch-card-container">
              <div className="scratch-card-content">
                <div className="scratch-info-group">
                  <h4><MapPin size={18} /> Eklavya Engineering Classes</h4>
                  <p>1st floor, Athwa Arcade, M17, Near Athwa Arcade BRTS, Athwa Gate, Surat, Gujarat 395001</p>
                </div>
                <div className="scratch-info-group">
                  <h4><Phone size={18} /> Contact Numbers</h4>
                  <p>+91 95861 68989</p>
                  <p>+91 99249 71360</p>
                </div>
              </div>
              <div className="scratch-card-cover">
                <div className="scratch-cover-inner">
                  <Sparkles className="scratch-icon" />
                  <span>Hover to reveal Contact Details</span>
                </div>
              </div>
            </div>
          </div>
        </div> 
      </section>
      {/* Upgraded Multi-Column Footer */}
      <footer className="landing-footer">
        <div className="footer-top">
          <div className="footer-brand-column">
            <div className="brand-logo" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <div className="brand-icon-box">
                <img src="/eklavya-logo.png" alt="Eklavya Logo" className="brand-svg" style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '5px' }} />
              </div>
              <span className="brand-name">Eklavya</span>
            </div>
            <p className="footer-tagline">
              Orchestrating modern academic workspaces with digital clarity, structural elegance, and high-performance safety.
            </p>
          </div>

          <div className="footer-links-grid">
            <div className="footer-links-col">
              <span className="col-title">Navigation</span>
              <a href="#features" className="footer-link">Features</a>
              <a href="#portals" className="footer-link">Portals</a>
              <a href="#faqs" className="footer-link">FAQs</a>
            </div>
            <div className="footer-links-col">
              <span className="col-title">Portal Roles</span>
              <button onClick={() => { navigate('/login'); }} className="footer-link-btn">Student Access</button>
              <button onClick={() => { navigate('/login'); }} className="footer-link-btn">Staff Terminals</button>
              <button onClick={() => { navigate('/login'); }} className="footer-link-btn">Admin Portal</button>
            </div>
          </div>
        </div>

        <div className="footer-divider"></div>

        <div className="footer-bottom">
          <span className="footer-copy">
            © {new Date().getFullYear()} Eklavya. All rights reserved. Managed with Dark-Slate design guidelines.
          </span>

          <button className="scroll-to-top" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} aria-label="Scroll to top">
            <span>Scroll to Top</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="top-arrow">
              <line x1="12" y1="19" x2="12" y2="5"></line>
              <polyline points="5 12 12 5 19 12"></polyline>
            </svg>
          </button>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
