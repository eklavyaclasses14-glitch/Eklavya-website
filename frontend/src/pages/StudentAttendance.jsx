import { useState, useEffect } from 'react';
import StudentLayout from '../components/StudentLayout';
import { CalendarCheck, AlertTriangle, CheckCircle, TrendingUp, ShieldCheck, ShieldAlert, ShieldX } from 'lucide-react';
import '../styles/StudentAttendance.css';

export default function StudentAttendance() {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');

  const user      = JSON.parse(localStorage.getItem('user') || '{}');
  const studentId = user?.user?._id;

  useEffect(() => {
    if (!studentId) { setLoading(false); return; }
    fetch(`http://localhost:5000/api/student/${studentId}/dashboard`)
      .then(res => { if (!res.ok) throw new Error('Failed to load'); return res.json(); })
      .then(d  => { setAttendance(d.attendance || []); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  }, [studentId]);

  if (loading) return (
    <StudentLayout>
      <div className="sd-loading"><div className="sd-spinner"></div></div>
    </StudentLayout>
  );

  if (error) return (
    <StudentLayout>
      <div style={{ textAlign: 'center', padding: '3rem', color: '#ef4444' }}>{error}</div>
    </StudentLayout>
  );

  // Compute overall %
  const overall = attendance.length
    ? Math.round(attendance.reduce((s, a) => s + a.percentage, 0) / attendance.length)
    : 0;

  const safe    = attendance.filter(a => a.percentage >= 75).length;
  const danger  = attendance.filter(a => a.percentage < 75).length;

  // SVG ring dimensions
  const R  = 34;
  const C  = 2 * Math.PI * R;
  const strokeDash = (overall / 100) * C;
  const ringColor  = overall < 75 ? '#ef4444' : overall < 85 ? '#f59e0b' : '#10b981';

  const statusPill = (pct) => {
    if (pct >= 85) return { cls: 'safe',   label: 'Good'       };
    if (pct >= 75) return { cls: 'warn',   label: 'Borderline' };
    return            { cls: 'danger', label: 'Low'        };
  };

  return (
    <StudentLayout>
      {/* ── Header ── */}
      <div className="sa-page-header">
        <div className="sa-header-icon">
          <CalendarCheck size={24} />
        </div>
        <div>
          <h1 className="sa-page-title">Attendance</h1>
          <p className="sa-page-sub">Subject-wise attendance overview</p>
        </div>
      </div>

      {/* ── Overall banner ── */}
      <div className="sa-summary-banner">
        <div>
          <div className="sa-summary-label">Overall Attendance</div>
          <div className="sa-summary-value" style={{ color: ringColor }}>{overall}%</div>
          <div className="sa-summary-desc">
            {danger > 0
              ? `${danger} subject${danger > 1 ? 's' : ''} below 75% — take action`
              : 'All subjects above 75% — great work!'}
          </div>

          {/* Mini summary row */}
          <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8125rem', opacity: 0.85 }}>
              <CheckCircle size={14} color="#34d399" />
              {safe} safe
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8125rem', opacity: 0.85 }}>
              <AlertTriangle size={14} color="#fbbf24" />
              {danger} low
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8125rem', opacity: 0.85 }}>
              <TrendingUp size={14} color="#a5b4fc" />
              {attendance.length} subjects
            </div>
          </div>
        </div>

        {/* SVG Ring */}
        <svg className="sa-summary-ring" viewBox="0 0 80 80">
          <circle cx="40" cy="40" r={R} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="7" />
          <circle
            cx="40" cy="40" r={R}
            fill="none"
            stroke={ringColor}
            strokeWidth="7"
            strokeLinecap="round"
            strokeDasharray={`${strokeDash} ${C}`}
            strokeDashoffset={C / 4}
            style={{ transition: 'stroke-dasharray 0.8s ease' }}
          />
          <text x="40" y="44" textAnchor="middle" fill="white" fontSize="14" fontWeight="900">{overall}%</text>
        </svg>
      </div>

      {/* ── Subject cards ── */}
      <div className="sa-grid">
        {attendance.map(item => {
          const pct    = item.percentage;
          const color  = pct < 75 ? '#ef4444' : pct < 85 ? '#f59e0b' : '#10b981';
          const pill   = statusPill(pct);

          return (
            <div key={item._id} className={`sa-card ${pct < 75 ? 'danger' : ''}`}>
              <div className="sa-card-top">
                <span className="sa-card-subject">{item.subject_name}</span>
                <span className="sa-card-pct" style={{ color }}>{pct}%</span>
              </div>

              <div className="sa-bar-track">
                <div
                  className="sa-bar-fill"
                  style={{ width: `${pct}%`, background: color }}
                />
              </div>

              <span className={`sa-status-pill ${pill.cls}`}>
                {pill.cls === 'safe'   && <ShieldCheck  size={12} />}
                {pill.cls === 'warn'   && <ShieldAlert  size={12} />}
                {pill.cls === 'danger' && <ShieldX      size={12} />}
                {pill.label}
              </span>

              {pct < 75 && (
                <p className="sa-danger-msg">
                  <AlertTriangle size={13} />
                  Below minimum — requires attention
                </p>
              )}
            </div>
          );
        })}

        {attendance.length === 0 && (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)', gridColumn: '1 / -1' }}>
            No attendance records found.
          </div>
        )}
      </div>
    </StudentLayout>
  );
}
