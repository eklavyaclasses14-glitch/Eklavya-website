import { useState, useEffect } from 'react';
import StudentLayout from '../components/StudentLayout';
import ProtectedViewer from '../components/ProtectedViewer';
import { FileText, File, Image, BookOpen, Filter, Eye, Lock, Building2, GraduationCap, Search, X } from 'lucide-react';
import { apiFetch } from '../utils/apiFetch';
import '../styles/StudentNotes.css';

const FILTERS = [
  { label: 'All',    value: 'all'   },
  { label: 'PDFs',   value: 'pdf'   },
  { label: 'Images', value: 'image' },
];

const DEPARTMENTS = [
  "Computer Engineering",
  "Mechanical Engineering",
  "Civil Engineering",
  "Electrical Engineering",
];
const FILTER_DEPARTMENTS = ["All", ...DEPARTMENTS];

export default function StudentNotes() {
  const [notes, setNotes]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [filter, setFilter]     = useState('all');
  const [viewing, setViewing]   = useState(null); 
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 6;

  const user      = JSON.parse(localStorage.getItem('user') || '{}');
  const student   = user?.user || {};
  const studentId = student?._id || student?.id || user?.id || user?._id;

  useEffect(() => {
    if (!studentId) { setLoading(false); return; }
    
    // Use student's own department and semester for automatic fetching
    const dept = student.department;
    const sem  = student.semester;

    if (!dept || !sem) {
      setNotes([]);
      setLoading(false);
      return;
    }

    const fetchNotes = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        params.append("department", dept);
        params.append("semester", sem);
        params.append("page", currentPage);
        params.append("limit", itemsPerPage);
        params.append("file_type", filter);

        const res = await apiFetch(`api/student/${studentId}/notes?${params.toString()}`);
        if (!res.ok) throw new Error('Failed to load');
        const d = await res.json();
        
        setNotes(d.notes || []); 
        setTotalPages(d.pages || 1);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    fetchNotes();
  }, [studentId, currentPage, filter]);

  // Filtering is now done server-side for type, but we keep the local variable for UI consistency
  const paginatedNotes = notes;

  if (error) return (
    <StudentLayout>
      <div style={{ textAlign: 'center', padding: '3rem', color: '#ef4444' }}>{error}</div>
    </StudentLayout>
  );

  return (
    <StudentLayout>
      {viewing && (
        <ProtectedViewer note={viewing} onClose={() => setViewing(null)} />
      )}

      {/* ── Header ── */}
      <div className="sn-page-header">
        <div className="sn-header-icon">
          <FileText size={24} />
        </div>
        <div>
          <h1 className="sn-page-title">Study Materials</h1>
          <p className="sn-page-sub">
            {notes.length} document{notes.length !== 1 ? 's' : ''} for your course · View Only
          </p>
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.4rem',
          fontSize: '0.75rem', color: '#6b7280',
          background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
          padding: '0.35rem 0.75rem', borderRadius: '8px', marginLeft: 'auto',
        }}>
          <Lock size={12} />
          Protected Content
        </div>
      </div>

      {/* ── Type filter ── */}
      <div className="sn-filter-bar">
        <Filter size={16} style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} />
        {FILTERS.map(f => (
          <button
            key={f.value}
            className={`sn-filter-btn ${filter === f.value ? 'active' : ''}`}
            onClick={() => { setFilter(f.value); setCurrentPage(1); }}
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
        {loading ? (
           <div className="sn-empty" style={{ gridColumn: '1/-1' }}>
             <div className="sd-spinner" style={{ margin: '0 auto 1.5rem' }}></div>
             <p>Fetching your documents...</p>
           </div>
        ) : paginatedNotes.length === 0 ? (
          <div className="sn-empty" style={{ gridColumn: '1/-1' }}>
            <FileText size={48} className="sn-empty-icon" />
            <p className="sn-empty-title">No documents found</p>
            <p className="sn-empty-sub">
              {filter !== 'all' ? 'Try switching the filter above.' : "No notes uploaded for your department yet."}
            </p>
          </div>
        ) : (
          paginatedNotes.map(note => {
            const isPdf = note.file_type === 'pdf';
            return (
              <div
                key={note._id}
                className="sn-card"
                style={{ cursor: 'pointer' }}
                onClick={() => setViewing(note)}
              >
                <div className={`sn-card-thumb ${isPdf ? 'pdf' : 'image'}`}>
                  {isPdf
                    ? <File size={52} className="sn-card-thumb-icon" />
                    : (
                      note.fileUrl
                        ? <img src={note.fileUrl} alt={note.title} style={{ width: '100%', height: '100%', objectFit: 'cover', pointerEvents: 'none' }} draggable={false} />
                        : <Image size={52} className="sn-card-thumb-icon" />
                    )
                  }
                </div>

                <div className="sn-card-body">
                  <span className={`sn-card-type-badge ${isPdf ? 'pdf' : 'image'}`}>
                    {isPdf ? <File size={10} /> : <Image size={10} />}
                    {note.file_type}
                  </span>
                  <p className="sn-card-title">{note.title}</p>
                  <p className="sn-card-subject">
                    <BookOpen size={12} style={{ display: 'inline', marginRight: '0.3rem', verticalAlign: 'middle' }} />
                    {note.subject_id?.subject_name || 'Subject'}
                  </p>
                </div>

                <div className="sn-card-footer">
                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    gap: '0.5rem', width: '100%',
                    padding: '0.55rem 1rem',
                    background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)',
                    borderRadius: '8px', color: '#818cf8', fontSize: '0.8rem', fontWeight: 600,
                  }}>
                    <Eye size={14} />
                    View Document
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <div className="sn-pagination">
          <button 
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => prev - 1)}
            className="sn-page-btn"
          >
            Previous
          </button>
          <span className="sn-page-info">
            Page {currentPage} of {totalPages}
          </span>
          <button 
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(prev => prev + 1)}
            className="sn-page-btn"
          >
            Next
          </button>
        </div>
      )}
    </StudentLayout>
  );
}
