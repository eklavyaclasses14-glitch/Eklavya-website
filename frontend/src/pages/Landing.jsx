import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Hero3D from '../components/Hero3D';
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
            <a href="#portals" className="nav-link">Portal Showcase</a>
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
            <span>Version 2.0 Management Suite</span>
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
          {/* Card 1: Large Feature (Structured Notes Directory) */}
          <div className="bento-card card-large">
            <div className="bento-content">
              <div className="bento-icon-box">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="bento-icon">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                  <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
              </div>
              <h3 className="bento-card-title">Structured Notes Vault</h3>
              <p className="bento-card-desc">
                Organize, upload, and download syllabus documents and structured study guides. Supports rich tags, file categories, and quick downloads.
              </p>
            </div>

            {/* Visual Preview element in large card */}
            <div className="bento-visual notes-vault-preview">
              <div className="mini-note-item">
                <div className="mini-note-icon">PDF</div>
                <div className="mini-note-details">
                  <span className="mini-note-title">Thermodynamics_Lec3.pdf</span>
                  <span className="mini-note-size">4.2 MB • Physics</span>
                </div>
                <span className="mini-download-badge">Download</span>
              </div>
              <div className="mini-note-item">
                <div className="mini-note-icon docx">DOCX</div>
                <div className="mini-note-details">
                  <span className="mini-note-title">Calculus_Sheet_4.docx</span>
                  <span className="mini-note-size">1.8 MB • Mathematics</span>
                </div>
                <span className="mini-download-badge">Download</span>
              </div>
              <div className="mini-note-item">
                <div className="mini-note-icon zip">ZIP</div>
                <div className="mini-note-details">
                  <span className="mini-note-title">Data_Structures_Labs.zip</span>
                  <span className="mini-note-size">18.5 MB • Computer Science</span>
                </div>
                <span className="mini-download-badge">Download</span>
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
          <div className="bento-card card-medium">
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
            {/* Visual payment receipt bar */}
            <div className="bento-visual payment-preview">
              <div className="mini-receipt">
                <div className="receipt-header">
                  <span>Semester Fee Record</span>
                  <span className="status-paid-badge">Paid</span>
                </div>
                <div className="receipt-divider"></div>
                <div className="receipt-amount">₹11,000.00</div>
                <span className="receipt-date">Updated on May 15, 2026</span>
              </div>
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

      {/* Interactive Tabs Showcase Section */}
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
                  <span className="mockup-url">Eklavya/student/dashboard</span>
                </div>
                <div className="mockup-body">
                  <div className="mockup-hero-stat">
                    <span className="mockup-stat-title">Current Semester Attendance</span>
                    <span className="mockup-stat-num text-success">94.2%</span>
                    <span className="mockup-stat-footer">Status: Excellent Standing</span>
                  </div>

                  <div className="mockup-list-title">My Recent Subject Notes</div>
                  <div className="mockup-list-item">
                    <span className="mockup-item-tag physics">Physics</span>
                    <span className="mockup-item-name font-semibold">Quantum Mechanics I</span>
                    <span className="mockup-item-btn">Get PDF</span>
                  </div>
                  <div className="mockup-list-item">
                    <span className="mockup-item-tag math">Math</span>
                    <span className="mockup-item-name font-semibold">Linear Algebra Worksheet</span>
                    <span className="mockup-item-btn">Get DOCX</span>
                  </div>

                  <div className="mockup-list-title">Fee Summary</div>
                  <div className="mockup-fee-card">
                    <div className="mockup-fee-info">
                      <span className="fee-card-head">Tuition Balance</span>
                      <span className="fee-card-val">₹11,000.00</span>
                    </div>
                    <span className="mockup-paid-tag">Paid in Full</span>
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
                  <span className="mockup-url">Eklavya/staff/dashboard</span>
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
                  <span className="mockup-url">Eklavya/admin/dashboard</span>
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
      </section>

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
              <span className="faq-question">How does role-based security validation function?</span>
              <span className="faq-chevron-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </span>
            </button>
            <div className={`faq-answer-container ${openFaq === 1 ? 'expanded' : ''}`}>
              <div className="faq-answer">
                Eklavya enforces solid security validation by using JSON Web Tokens (JWT) stored safely inside cookies/auth states. When you login as either Student, Staff, or Admin, the application grants view permissions strictly tailored to your security scope, preventing unauthorized dashboard access.
              </div>
            </div>
          </div>

          <div className="faq-item">
            <button className={`faq-trigger ${openFaq === 2 ? 'active' : ''}`} onClick={() => toggleFaq(2)}>
              <span className="faq-question">Who can upload classroom notes and documents?</span>
              <span className="faq-chevron-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </span>
            </button>
            <div className={`faq-answer-container ${openFaq === 2 ? 'expanded' : ''}`}>
              <div className="faq-answer">
                Designated administrators can securely upload educational notes, attach study documents, select relevant subjects from the database, and publish them. Students can instantly access and download these files from their student dashboard.
              </div>
            </div>
          </div>

          <div className="faq-item">
            <button className={`faq-trigger ${openFaq === 3 ? 'active' : ''}`} onClick={() => toggleFaq(3)}>
              <span className="faq-question">Is the fee processing engine integrated with the database?</span>
              <span className="faq-chevron-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </span>
            </button>
            <div className={`faq-answer-container ${openFaq === 3 ? 'expanded' : ''}`}>
              <div className="faq-answer">
                Absolutely. Administrative coordinators edit fee parameters for specific student accounts directly inside the portal. The student dashboard updates automatically with transparent transaction records.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter / Call-to-Action Panel Section */}
      <section id="contact" className="newsletter-section">
        <div className="newsletter-card">
          <div className="newsletter-card-glow"></div>
          <div className="newsletter-content">
            <h2 className="newsletter-title">Subscribe for Portal Upgrades</h2>
            <p className="newsletter-desc">
              Receive direct releases, new platform features, framework updates, and security announcements from Eklavya core teams.
            </p>

            {subscribed ? (
              <div className="newsletter-success-box">
                <div className="success-icon-box">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="success-svg">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </div>
                <div className="success-msg-wrap">
                  <span className="success-headline">Successfully Subscribed!</span>
                  <span className="success-subtitle">We will notify you at your email.</span>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="newsletter-form">
                <input
                  type="email"
                  placeholder="Enter your administrative email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="newsletter-input"
                  aria-label="Email Address"
                />
                <button type="submit" className="btn-newsletter">
                  Subscribe
                </button>
              </form>
            )}
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
            <div className="footer-links-col">
              <span className="col-title">Security</span>
              <a href="#" className="footer-link">JWT Policy</a>
              <a href="#" className="footer-link">Data Integrity</a>
              <a href="#" className="footer-link">Terms of Access</a>
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
