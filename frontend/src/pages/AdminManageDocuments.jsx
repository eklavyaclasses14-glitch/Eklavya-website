import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../components/AdminLayout';
import {
  FileText, Search, Pencil, Trash2, Plus, X,
  CheckCircle2, Image, Link2, BookOpen, AlertCircle, Building2, GraduationCap
} from 'lucide-react';
import { apiFetch } from '../utils/apiFetch';
import '../styles/AdminManageDocuments.css';

//  Validation 
const validate = (field, value) => {
  if (field === 'title') {
    if (!value.trim()) return 'Title is required';
  }
  if (field === 'google_drive_file_id') {
    if (!value.trim()) return 'Drive ID is required';
  }
  return '';
};

//  Toast 
function Toast({ message, type = 'success', onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [onClose]);
  return (
    <div className="amd-toast">
      {type === 'success'
        ? <CheckCircle2 size={16} color="#34d399" />
        : <AlertCircle size={16} color="#f87171" />}
      {message}
      <button onClick={onClose} style={{ marginLeft: '0.5rem', color: 'rgba(255,255,255,0.5)', background: 'none', cursor: 'pointer', border: 'none' }}>
        <X size={14} />
      </button>
    </div>
  );
}

//  Edit Modal 
function EditModal({ note, onClose, onSave }) {
  const [form, setForm] = useState({ ...note });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: validate(name, value) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    ['title', 'google_drive_file_id'].forEach(f => {
      const err = validate(f, form[f] || '');
      if (err) newErrors[f] = err;
    });
    if (Object.keys(newErrors).length) { setErrors(newErrors); return; }

    setSaving(true);
    try {
      const res = await apiFetch(`http://localhost:5000/api/admin/notes/${note._id}`, {
        method: 'PUT',
        body: JSON.stringify({
          title: form.title,
          file_type: form.file_type,
          google_drive_file_id: form.google_drive_file_id
        }),
      });
      const updated = await res.json();
      onSave(updated);
    } catch {
      onSave(form); // optimistic fallback
    } finally {
      setSaving(false);
    }
  };

  const fieldClass = (name) =>
    `amd-modal-input${errors[name] ? ' amd-modal-input-error' : ''}`;

  return (
    <div className="amd-modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="amd-modal">
        {/* Header */}
        <div className="amd-modal-header">
          <span className="amd-modal-title">
            <Pencil size={16} style={{ color: 'var(--color-primary)' }} />
            Edit Document
          </span>
          <button className="amd-modal-close" onClick={onClose}><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="amd-modal-body">

            {/* Title */}
            <div className="amd-modal-field">
              <label className="amd-modal-label"><FileText size={12} /> Document Title *</label>
              <input
                type="text" name="title"
                className={fieldClass('title')}
                value={form.title} onChange={handleChange}
                placeholder="e.g. Unit 3 Notes" autoComplete="off"
              />
              {errors.title && <span style={{ fontSize: '0.72rem', color: '#ef4444', marginTop: '0.1rem' }}>{errors.title}</span>}
            </div>

            {/* Subject Info (read-only) */}
            <div className="amd-modal-row">
              <div className="amd-modal-field">
                <label className="amd-modal-label"><BookOpen size={12} /> Subject</label>
                <input
                  type="text" className="amd-modal-input"
                  value={form.subject_id?.subject_name || ''}
                  readOnly style={{ opacity: 0.6, cursor: 'not-allowed' }}
                />
              </div>
              <div className="amd-modal-field">
                <label className="amd-modal-label">File Type *</label>
                <select name="file_type" className="amd-modal-input" value={form.file_type} onChange={handleChange}>
                  <option value="pdf">PDF</option>
                  <option value="image">Image</option>
                </select>
              </div>
            </div>

            {/* Drive Link */}
            <div className="amd-modal-field">
              <label className="amd-modal-label"><Link2 size={12} /> Google Drive File ID *</label>
              <input
                type="text" name="google_drive_file_id"
                className={fieldClass('google_drive_file_id')}
                value={form.google_drive_file_id}
                onChange={handleChange}
                placeholder="e.g. 1BxiMVs0XRA5nFM..." autoComplete="off"
              />
              {errors.google_drive_file_id && <span style={{ fontSize: '0.72rem', color: '#ef4444' }}>{errors.google_drive_file_id}</span>}
            </div>

          </div>

          <div className="amd-modal-footer">
            <button type="button" className="amd-modal-cancel" onClick={onClose}>Cancel</button>
            <button type="submit" className="amd-modal-save" disabled={saving}>
              {saving ? <><CheckCircle2 size={15} /> Saving…</> : <><CheckCircle2 size={15} /> Save Changes</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

//  Main Page 
export default function AdminManageDocuments() {
  const navigate = useNavigate();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [editing, setEditing] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    apiFetch('http://localhost:5000/api/admin/notes')
      .then(r => r.json())
      .then(data => { setNotes(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = notes.filter(n => {
    const matchSearch = n.title.toLowerCase().includes(search.toLowerCase()) ||
                        (n.subject_id?.subject_name || '').toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === 'All' || n.file_type === typeFilter;
    return matchSearch && matchType;
  });

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete document "${title}"? This cannot be undone.`)) return;
    try {
      await apiFetch(`http://localhost:5000/api/admin/notes/${id}`, { method: 'DELETE' });
      setNotes(prev => prev.filter(n => n._id !== id));
      setToast({ message: `"${title}" deleted`, type: 'success' });
    } catch {
      setToast({ message: 'Delete failed — try again', type: 'error' });
    }
  };

  const handleSave = useCallback((updated) => {
    setNotes(prev => prev.map(n => n._id === updated._id ? updated : n));
    setEditing(null);
    setToast({ message: `"${updated.title}" updated successfully`, type: 'success' });
  }, []);

  return (
    <AdminLayout>
      {/*  Header  */}
      <div className="amd-students-header">
        <div>
          <h1 className="amd-students-title">Manage Documents</h1>
          <p className="amd-students-sub">View, edit, and remove study materials</p>
        </div>
        <button className="amd-add-new-btn" onClick={() => navigate('/admin/notes/upload')}>
          <Plus size={16} /> Upload Document
        </button>
      </div>

      {/*  Stats  */}
      <div className="amd-students-stats">
        <div className="amd-stat-card indigo">
          <div className="amd-stat-value">{notes.length}</div>
          <div className="amd-stat-label">Total Documents</div>
        </div>
        <div className="amd-stat-card sky">
          <div className="amd-stat-value">{notes.filter(n => n.file_type === 'pdf').length}</div>
          <div className="amd-stat-label">PDF Files</div>
        </div>
        <div className="amd-stat-card emerald">
          <div className="amd-stat-value">{notes.filter(n => n.file_type === 'image').length}</div>
          <div className="amd-stat-label">Image Files</div>
        </div>
        <div className="amd-stat-card amber">
          <div className="amd-stat-value">{[...new Set(notes.map(n => n.subject_id?._id))].length}</div>
          <div className="amd-stat-label">Subjects with Notes</div>
        </div>
      </div>

      {/*  Table card  */}
      <div className="amd-table-card">
        {/* Toolbar */}
        <div className="amd-toolbar">
          <span className="amd-toolbar-title">
            <FileText size={16} style={{ color: 'var(--color-primary)' }} />
            All Documents
            <span className="amd-count-pill">{filtered.length}</span>
          </span>

          {/* Search */}
          <div className="amd-search-wrap">
            <Search size={14} className="amd-search-icon" />
            <input
              type="text"
              className="amd-search-input"
              placeholder="Search by title or subject…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          {/* Type filter */}
          <select
            className="amd-filter-select"
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
          >
            <option value="All">All Types</option>
            <option value="pdf">PDF</option>
            <option value="image">Image</option>
          </select>
        </div>

        {/* Table header */}
        <div className="amd-table-header">
          <span>Document</span>
          <span>Subject</span>
          <span>Type</span>
          <span style={{ textAlign: 'right' }}>Actions</span>
        </div>

        {/* Rows */}
        {loading ? (
          <div className="amd-empty">Loading documents…</div>
        ) : filtered.length === 0 ? (
          <div className="amd-empty">
            {search || typeFilter !== 'All'
              ? 'No documents match your filters.'
              : 'No documents uploaded yet.'}
          </div>
        ) : (
          filtered.map(note => (
            <div key={note._id} className="amd-student-row" style={{ gridTemplateColumns: '2.5fr 1.5fr 1fr 100px' }}>
              {/* Identity */}
              <div className="amd-student-identity">
                <div className="amd-student-avatar" style={{ background: note.file_type === 'pdf' ? 'rgba(239,68,68,0.1)' : 'rgba(14,165,233,0.1)', color: note.file_type === 'pdf' ? '#ef4444' : 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none' }}>
                  {note.file_type === 'pdf' ? <FileText size={18} /> : <Image size={18} />}
                </div>
                <div>
                  <div className="amd-student-name" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    {note.title}
                    <a href={`https://drive.google.com/file/d/${note.google_drive_file_id}/view`} target="_blank" rel="noreferrer" title="Open in Drive" style={{ color: 'var(--color-primary)' }}>
                      <Link2 size={12} />
                    </a>
                  </div>
                  <div className="amd-student-uid" style={{ fontFamily: 'inherit' }}>
                    {new Date(note.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>

              {/* Subject */}
              <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text)' }}>
                {note.subject_id?.subject_name || 'Unknown'}
                <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', fontWeight: 400 }}>
                  Sem {note.subject_id?.semester}
                </div>
              </div>

              {/* Type */}
              <span className="amd-dept-tag" style={{ alignSelf: 'center', width: 'fit-content' }}>
                {note.file_type.toUpperCase()}
              </span>

              {/* Actions */}
              <div className="amd-actions">
                <button
                  className="amd-btn-edit"
                  onClick={() => setEditing(note)}
                  title="Edit document"
                >
                  <Pencil size={14} />
                </button>
                <button
                  className="amd-btn-delete"
                  onClick={() => handleDelete(note._id, note.title)}
                  title="Delete document"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/*  Edit Modal  */}
      {editing && (
        <EditModal
          note={editing}
          onClose={() => setEditing(null)}
          onSave={handleSave}
        />
      )}

      {/*  Toast  */}
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </AdminLayout>
  );
}
