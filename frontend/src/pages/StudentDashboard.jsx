import { useState, useEffect } from 'react';
import StudentLayout from '../components/StudentLayout';
import { BookOpen, Clock, FileText, File, Image, Sun, CalendarCheck, DollarSign } from 'lucide-react';
import { apiFetch } from '../utils/apiFetch';
import '../styles/StudentDashboard.css';

const DOT_COLORS = ['dot-0', 'dot-1', 'dot-2', 'dot-3', 'dot-4'];

export default function StudentDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const student = user?.user || {};
  const studentId = student?._id || student?.id || user?.id || user?._id;

  useEffect(() => {
    if (!studentId) { setLoading(false); return; }
    apiFetch(`/api/student/${studentId}/dashboard`)
      .then(res => { if (!res.ok) throw new Error('Failed to load'); return res.json(); })
      .then(d => { setData(d); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  }, [studentId]);

  if (loading) return (
    <StudentLayout>
      <div className="sd-loading"><div className="sd-spinner"></div></div>
    </StudentLayout>
  );

  if (error) return (
    <StudentLayout>
      <div className="sd-section-card" style={{ padding: '2rem', textAlign: 'center', color: '#ef4444' }}>
        <p>{error}</p>
      </div>
    </StudentLayout>
  );

  // Compute overall %
  const attendance = data?.attendance || [];
  const overall = attendance.length
    ? Math.round(attendance.reduce((s, a) => s + a.percentage, 0) / attendance.length)
    : 0;

  return (
    <StudentLayout>
      {/* ── Welcome ── */}
      <div className="sd-welcome">
        <p className="sd-welcome-greeting" style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
          <Sun size={15} style={{ color: '#f59e0b' }} /> Good day
        </p>
        <h1 className="sd-welcome-name">{data?.student?.name || student.name || 'Student'}</h1>
        <p className="sd-welcome-dept">
          {data?.student?.department || student.department || ''} &nbsp;·&nbsp; Semester {data?.student?.semester || student.semester || '—'}
        </p>
      </div>

      {/* ── Stats ── */}
      <div className="sd-stats">
        <div className="sd-stat-card indigo">
          <div className="sd-stat-icon indigo"><BookOpen size={22} /></div>
          <div>
            <div className="sd-stat-value">{data?.subjects?.length ?? 0}</div>
            <div className="sd-stat-label">Subjects</div>
          </div>
        </div>

        <div className="sd-stat-card amber">
          <div className="sd-stat-icon amber"><Clock size={22} /></div>
          <div>
            <div className="sd-stat-value">Sem {data?.student?.semester || '—'}</div>
            <div className="sd-stat-label">Current</div>
          </div>
        </div>

        <div className="sd-stat-card emerald">
          <div className="sd-stat-icon emerald"><CalendarCheck size={22} /></div>
          <div>
            <div className="sd-stat-value">{overall}%</div>
            <div className="sd-stat-label">Attendance</div>
          </div>
        </div>

        <div className="sd-stat-card sky">
          <div className="sd-stat-icon sky"><DollarSign size={22} /></div>
          <div>
            <div className="sd-stat-value">${data?.pendingFees ?? 0}</div>
            <div className="sd-stat-label">Pending Fees</div>
          </div>
        </div>
      </div>

      {/* ── Content grid ── */}
      <div className="sd-content-grid">

        {/* Subjects */}
        <div className="sd-section-card">
          <div className="sd-section-header">
            <BookOpen size={16} style={{ color: 'var(--color-primary)' }} /> My Subjects
          </div>
          {data?.subjects?.length > 0 ? data.subjects.map((s, i) => (
            <div key={s._id} className="sd-subject-row">
              <span className={`sd-subject-dot ${DOT_COLORS[i % DOT_COLORS.length]}`} />
              <span className="sd-subject-name">{s.subject_name}</span>
            </div>
          )) : <p className="sd-empty">No subjects found.</p>}
        </div>

        {/* Recent Notes */}
        <div className="sd-section-card">
          <div className="sd-section-header">
            <FileText size={16} style={{ color: 'var(--color-primary)' }} /> Recent Notes
          </div>
          {data?.recentNotes?.length > 0 ? data.recentNotes.map(note => (
            <div key={note._id} className="sd-note-row">
              <div className={`sd-note-icon ${note.file_type === 'pdf' ? 'pdf' : 'image'}`}>
                {note.file_type === 'pdf' ? <File size={18} /> : <Image size={18} />}
              </div>
              <div>
                <div className="sd-note-title">{note.title}</div>
                <span className={`sd-note-badge ${note.file_type === 'pdf' ? 'pdf' : 'image'}`}>{note.file_type}</span>
              </div>
            </div>
          )) : <p className="sd-empty">No notes yet.</p>}
        </div>
      </div>
    </StudentLayout>
  );
}
