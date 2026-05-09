import { useState, useEffect } from 'react';
import StudentLayout from '../components/StudentLayout';
import { FileText, File, Image, Download, BookOpen, Filter } from 'lucide-react';
import { apiFetch } from '../utils/apiFetch';
import '../styles/StudentNotes.css';

const FILTERS = [
  { label: 'All',    value: 'all'   },
  { label: 'PDFs',   value: 'pdf'   },
  { label: 'Images', value: 'image' },
];

export default function StudentNotes() {
  const [notes, setNotes]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [filter, setFilter]   = useState('all');

  const user      = JSON.parse(localStorage.getItem('user') || '{}');
  const studentId = user?.user?._id;

  useEffect(() => {
    if (!studentId) { setLoading(false); return; }
    apiFetch(`http://localhost:5000/api/student/${studentId}/notes`)
      .then(res => { if (!res.ok) throw new Error('Failed to load'); return res.json(); })
      .then(d  => { setNotes(d.notes || []); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  }, [studentId]);

  const filtered = filter === 'all' ? notes : notes.filter(n => n.file_type === filter);

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

  return (
    <StudentLayout>
      {/* ── Header ── */}
      <div className="sn-page-header">
        <div className="sn-header-icon">
          <FileText size={24} />
        </div>
        <div>
          <h1 className="sn-page-title">Study Materials</h1>
          <p className="sn-page-sub">{notes.length} document{notes.length !== 1 ? 's' : ''} available for your subjects</p>
        </div>
      </div>

      {/* ── Filter bar ── */}
      <div className="sn-filter-bar">
        <Filter size={16} style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} />
        {FILTERS.map(f => (
          <button
            key={f.value}
            className={`sn-filter-btn ${filter === f.value ? 'active' : ''}`}
            onClick={() => setFilter(f.value)}
          >
            {f.value === 'pdf'   && <File  size={13} />}
            {f.value === 'image' && <Image size={13} />}
            {f.label}
            {f.value !== 'all' && (
              <span style={{ opacity: 0.7 }}>
                ({notes.filter(n => n.file_type === f.value).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Notes grid ── */}
      <div className="sn-grid">
        {filtered.map(note => {
          const isPdf = note.file_type === 'pdf';
          return (
            <div key={note._id} className="sn-card">
              {/* Thumbnail */}
              <div className={`sn-card-thumb ${isPdf ? 'pdf' : 'image'}`}>
                {isPdf
                  ? <File size={52} className="sn-card-thumb-icon" />
                  : <Image size={52} className="sn-card-thumb-icon" />
                }
              </div>

              {/* Body */}
              <div className="sn-card-body">
                <span className={`sn-card-type-badge ${isPdf ? 'pdf' : 'image'}`}>
                  {isPdf ? <File size={10} /> : <Image size={10} />}
                  {note.file_type}
                </span>
                <p className="sn-card-title">{note.title}</p>
                <p className="sn-card-subject">
                  <BookOpen size={12} style={{ display: 'inline', marginRight: '0.3rem', verticalAlign: 'middle' }} />
                  {note.subject_name || 'Subject'}
                </p>
              </div>

              {/* Footer */}
              <div className="sn-card-footer">
                <button
                  className="sn-download-btn"
                  onClick={() => {
                    const id = note.google_drive_file_id;
                    if (id) {
                      window.open(`https://drive.google.com/file/d/${id}/view`, '_blank');
                    }
                  }}
                >
                  <Download size={14} />
                  View / Download
                </button>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="sn-empty">
            <FileText size={48} className="sn-empty-icon" />
            <p className="sn-empty-title">No {filter !== 'all' ? filter.toUpperCase() + ' ' : ''}documents found</p>
            <p className="sn-empty-sub">
              {filter !== 'all' ? 'Try switching the filter above.' : 'Your admin hasn\'t uploaded any notes yet.'}
            </p>
          </div>
        )}
      </div>
    </StudentLayout>
  );
}
