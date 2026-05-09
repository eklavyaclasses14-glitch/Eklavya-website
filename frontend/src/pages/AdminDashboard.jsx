import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../components/AdminLayout';
import { Users, BookOpen, UploadCloud, UserPlus, GraduationCap, FileText } from 'lucide-react';
import { apiFetch } from '../utils/apiFetch';
import '../styles/AdminDashboard.css';

const AVATAR_COLORS = ['avatar-color-0', 'avatar-color-1', 'avatar-color-2', 'avatar-color-3', 'avatar-color-4'];
const DOT_COLORS    = ['subject-dot-color-0', 'subject-dot-color-1', 'subject-dot-color-2', 'subject-dot-color-3', 'subject-dot-color-4'];

export default function AdminDashboard() {
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      apiFetch('http://localhost:5000/api/admin/students').then(r => r.json()),
      apiFetch('http://localhost:5000/api/admin/subjects').then(r => r.json()),
    ]).then(([studentsData, subjectsData]) => {
      setStudents(studentsData);
      setSubjects(subjectsData);
    }).catch(console.error);
  }, []);

  // Derive quick stats
  const departments = [...new Set(students.map(s => s.department))];
  const totalNotes  = subjects.length * 2; // mock estimate

  return (
    <AdminLayout>
      {/* ── Page Header ── */}
      <div className="admin-page-header">
        <h1>Dashboard Overview</h1>
        <p>Welcome back, Administrator — here's what's happening today.</p>
      </div>

      {/* ── Stat Cards ── */}
      <div className="admin-stats-grid">
        <div className="admin-stat-card stat-indigo">
          <div className="admin-stat-icon stat-icon-indigo">
            <Users size={20} />
          </div>
          <div>
            <div className="admin-stat-value">{students.length}</div>
            <div className="admin-stat-label">Total Students</div>
          </div>
        </div>

        <div className="admin-stat-card stat-emerald">
          <div className="admin-stat-icon stat-icon-emerald">
            <BookOpen size={20} />
          </div>
          <div>
            <div className="admin-stat-value">{subjects.length}</div>
            <div className="admin-stat-label">Total Subjects</div>
          </div>
        </div>

        <div className="admin-stat-card stat-amber">
          <div className="admin-stat-icon stat-icon-amber">
            <GraduationCap size={20} />
          </div>
          <div>
            <div className="admin-stat-value">{departments.length}</div>
            <div className="admin-stat-label">Departments</div>
          </div>
        </div>

        <div className="admin-stat-card stat-sky">
          <div className="admin-stat-icon stat-icon-sky">
            <FileText size={20} />
          </div>
          <div>
            <div className="admin-stat-value">{totalNotes}</div>
            <div className="admin-stat-label">Study Materials</div>
          </div>
        </div>
      </div>

      {/* ── Quick Actions ── */}
      <div className="admin-quick-actions">
        <button className="admin-quick-card" onClick={() => navigate('/admin/students/new')}>
          <div className="admin-quick-card-icon stat-icon-indigo">
            <UserPlus size={22} />
          </div>
          <div className="admin-quick-card-title">Add New Student</div>
          <div className="admin-quick-card-desc">Enroll a new student and assign them to a department and semester.</div>
        </button>

        <button className="admin-quick-card" onClick={() => navigate('/admin/notes/upload')}>
          <div className="admin-quick-card-icon stat-icon-sky">
            <UploadCloud size={22} />
          </div>
          <div className="admin-quick-card-title">Upload Material</div>
          <div className="admin-quick-card-desc">Upload PDFs or images as study notes linked via Google Drive.</div>
        </button>
      </div>

      {/* ── Content Grid ── */}
      <div className="admin-content-grid">

        {/* Students table */}
        <div className="admin-section-card">
          <div className="admin-section-header">
            <span className="admin-section-title">
              <Users size={17} style={{ color: 'var(--color-primary)' }} />
              Recent Students
            </span>
            <button className="admin-section-action-btn" onClick={() => navigate('/admin/students/new')}>
              + Add
            </button>
          </div>

          <div className="admin-student-table">
            {students.slice(0, 6).map((student, i) => (
              <div key={student._id} className="admin-table-row">
                <div className={`admin-student-avatar ${AVATAR_COLORS[i % AVATAR_COLORS.length]}`}>
                  {student.name?.charAt(0).toUpperCase()}
                </div>
                <div className="admin-student-info">
                  <div className="admin-student-name">{student.name}</div>
                  <div className="admin-student-enr">{student.enrollment_no}</div>
                </div>
                <span className="admin-student-dept-badge">
                  {student.department?.substring(0, 4) || 'N/A'}
                </span>
              </div>
            ))}
            {students.length === 0 && (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
                No students enrolled yet.
              </div>
            )}
          </div>
        </div>

        {/* Subjects list */}
        <div className="admin-section-card">
          <div className="admin-section-header">
            <span className="admin-section-title">
              <BookOpen size={17} style={{ color: '#f59e0b' }} />
              Subjects
            </span>
            <button className="admin-section-action-btn">
              + Add
            </button>
          </div>

          <div>
            {subjects.slice(0, 7).map((subject, i) => (
              <div key={subject._id} className="admin-subject-row">
                <span className={`admin-subject-dot ${DOT_COLORS[i % DOT_COLORS.length]}`}></span>
                <span className="admin-subject-name">{subject.subject_name}</span>
                <span className="admin-subject-sem">Sem {subject.semester}</span>
              </div>
            ))}
            {subjects.length === 0 && (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
                No subjects added yet.
              </div>
            )}
          </div>
        </div>

      </div>
    </AdminLayout>
  );
}
