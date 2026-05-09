import { useState, useEffect, useRef } from 'react';
import AdminLayout from '../components/AdminLayout';
import {
  BookOpen, Plus, Search, Trash2, CheckCircle2,
  Building2, GraduationCap, AlertCircle, X
} from 'lucide-react';
import { apiFetch } from '../utils/apiFetch';
import '../styles/AdminManageSubjects.css';

const DEPARTMENTS = [
  'Computer Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
  'Electrical Engineering',
];

const DOT_CLASSES = ['dot-indigo', 'dot-sky', 'dot-emerald', 'dot-amber', 'dot-rose'];

const DEPT_SHORT = {
  'Computer Engineering':   'CSE',
  'Mechanical Engineering': 'MECH',
  'Civil Engineering':      'CIVIL',
  'Electrical Engineering': 'EEE',
};

function Toast({ message, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div className="ams-toast">
      <CheckCircle2 size={16} color="#34d399" />
      {message}
      <button onClick={onClose} style={{ marginLeft: '0.5rem', color: 'rgba(255,255,255,0.5)', background: 'none', cursor: 'pointer' }}>
        <X size={14} />
      </button>
    </div>
  );
}

export default function AdminManageSubjects() {
  const [subjects, setSubjects]         = useState([]);
  const [loading, setLoading]           = useState(true);
  const [search, setSearch]             = useState('');
  const [deptFilter, setDeptFilter]     = useState('All');
  const [toast, setToast]               = useState('');
  const [submitted, setSubmitted]       = useState(false);
  const [fieldError, setFieldError]     = useState('');

  const [form, setForm] = useState({
    subject_name: '',
    department: 'Computer Engineering',
    semester: 1,
  });

  useEffect(() => {
    apiFetch('http://localhost:5000/api/admin/subjects')
      .then(r => r.json())
      .then(data => { setSubjects(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  // Derived data
  const departments   = ['All', ...DEPARTMENTS];
  const uniqueDepts   = [...new Set(subjects.map(s => s.department))];
  const totalSems     = [...new Set(subjects.map(s => s.semester))].length;

  const filtered = subjects.filter(s => {
    const matchDept   = deptFilter === 'All' || s.department === deptFilter;
    const matchSearch = s.subject_name.toLowerCase().includes(search.toLowerCase());
    return matchDept && matchSearch;
  });

  // Handlers
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: name === 'semester' ? Number(value) : value }));
    if (name === 'subject_name') setFieldError('');
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.subject_name.trim()) {
      setFieldError('Subject name is required');
      return;
    }
    // Check duplicate in same dept+semester
    const dup = subjects.find(
      s => s.subject_name.toLowerCase() === form.subject_name.trim().toLowerCase()
        && s.department === form.department
        && s.semester === form.semester
    );
    if (dup) {
      setFieldError('This subject already exists for the selected department & semester');
      return;
    }

    setSubmitted(true);

    try {
      const res = await apiFetch('http://localhost:5000/api/admin/subjects', {
        method: 'POST',
        body: JSON.stringify(form),
      });
      const newSub = await res.json();
      setSubjects(prev => [...prev, newSub]);
      setForm({ subject_name: '', department: 'Computer Engineering', semester: 1 });
      setToast(`"${newSub.subject_name}" added successfully`);
    } catch {
      setToast('Failed to add subject — please try again');
    } finally {
      setSubmitted(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete subject "${name}"? This cannot be undone.`)) return;
    try {
      await apiFetch(`http://localhost:5000/api/admin/subjects/${id}`, { method: 'DELETE' });
      setSubjects(prev => prev.filter(s => s._id !== id));
      setToast(`"${name}" removed`);
    } catch {
      setToast('Delete failed — please try again');
    }
  };

  return (
    <AdminLayout>
      {/* ── Page header ── */}
      <div className="ams-page-header">
        <div>
          <h1 className="ams-page-title">Manage Subjects</h1>
          <p className="ams-page-sub">Add, view, and remove subjects for each department and semester</p>
        </div>
      </div>

      {/* ── Stats strip ── */}
      <div className="ams-stats-strip">
        <div className="ams-stat-pill">
          <div className="ams-stat-pill-value">{subjects.length}</div>
          <div className="ams-stat-pill-label">Total Subjects</div>
        </div>
        <div className="ams-stat-pill">
          <div className="ams-stat-pill-value">{uniqueDepts.length}</div>
          <div className="ams-stat-pill-label">Departments</div>
        </div>
        <div className="ams-stat-pill">
          <div className="ams-stat-pill-value">{totalSems}</div>
          <div className="ams-stat-pill-label">Semesters Used</div>
        </div>
      </div>

      {/* ── Main layout ── */}
      <div className="ams-layout">

        {/* ── Subjects Table ── */}
        <div className="ams-table-card">
          {/* Toolbar */}
          <div className="ams-table-toolbar">
            <span className="ams-table-title">
              <BookOpen size={16} style={{ color: 'var(--color-primary)' }} />
              All Subjects
              <span style={{
                background: 'rgba(74, 92, 106,0.08)', color: 'var(--color-primary)',
                fontSize: '0.72rem', fontWeight: 700,
                padding: '0.15rem 0.5rem', borderRadius: 99
              }}>{filtered.length}</span>
            </span>
            <div className="ams-search-wrap">
              <Search size={14} className="ams-search-icon" />
              <input
                type="text"
                className="ams-search-input"
                placeholder="Search subjects…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Department filter tabs */}
          <div className="ams-dept-tabs">
            {departments.map(dept => (
              <button
                key={dept}
                className={`ams-dept-tab ${deptFilter === dept ? 'active' : ''}`}
                onClick={() => setDeptFilter(dept)}
              >
                {dept === 'All' ? 'All Departments' : DEPT_SHORT[dept] || dept}
                {dept !== 'All' && (
                  <span style={{ opacity: 0.7, marginLeft: '0.25rem' }}>
                    ({subjects.filter(s => s.department === dept).length})
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Table header */}
          <div className="ams-row ams-row-header">
            <span>Subject Name</span>
            <span>Department</span>
            <span>Semester</span>
            <span></span>
          </div>

          {/* Rows */}
          {loading ? (
            <div className="ams-empty">Loading subjects…</div>
          ) : filtered.length === 0 ? (
            <div className="ams-empty">
              {search ? `No subjects match "${search}"` : 'No subjects found.'}
            </div>
          ) : (
            filtered.map((sub, i) => (
              <div key={sub._id} className="ams-row">
                <div className="ams-subject-cell">
                  <span className={`ams-subject-dot ${DOT_CLASSES[i % DOT_CLASSES.length]}`} />
                  <span className="ams-subject-name">{sub.subject_name}</span>
                </div>
                <span className="ams-dept-badge">{DEPT_SHORT[sub.department] || sub.department}</span>
                <span className="ams-sem-badge">Sem {sub.semester}</span>
                <button
                  className="ams-delete-btn"
                  onClick={() => handleDelete(sub._id, sub.subject_name)}
                  title="Delete subject"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))
          )}
        </div>

        {/* ── Add Subject Form ── */}
        <div className="ams-form-card">
          <div className="ams-form-header">
            <div className="ams-form-header-icon stat-icon-indigo">
              <Plus size={16} />
            </div>
            <span className="ams-form-title">Add New Subject</span>
          </div>

          <form className="ams-form-body" onSubmit={handleAdd} noValidate>

            {/* Subject name */}
            <div className="ams-field">
              <label className="ams-label">
                <BookOpen size={12} />
                Subject Name <span className="ams-required">*</span>
              </label>
              <input
                type="text"
                name="subject_name"
                className={`ams-input ${fieldError ? 'error' : ''}`}
                placeholder="e.g. Data Structures"
                value={form.subject_name}
                onChange={handleFormChange}
                autoComplete="off"
              />
              {fieldError ? (
                <span className="ams-input-error"><AlertCircle size={12} /> {fieldError}</span>
              ) : (
                <span className="ams-hint">Use the full official subject name</span>
              )}
            </div>

            {/* Department */}
            <div className="ams-field">
              <label className="ams-label">
                <Building2 size={12} />
                Department <span className="ams-required">*</span>
              </label>
              <select
                name="department"
                className="ams-input"
                value={form.department}
                onChange={handleFormChange}
              >
                {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>

            {/* Semester selector */}
            <div className="ams-field">
              <label className="ams-label">
                <GraduationCap size={12} />
                Semester <span className="ams-required">*</span>
              </label>
              <div className="ams-sem-grid">
                {[1,2,3,4,5,6,7,8].map(n => (
                  <label key={n} className="ams-sem-option">
                    <input
                      type="radio"
                      name="semester"
                      value={n}
                      checked={form.semester === n}
                      onChange={handleFormChange}
                    />
                    <span className="ams-sem-label">{n}</span>
                  </label>
                ))}
              </div>
            </div>

            <button type="submit" className="ams-form-submit-btn" disabled={submitted}>
              {submitted
                ? <><CheckCircle2 size={16} /> Adding…</>
                : <><Plus size={16} /> Add Subject</>
              }
            </button>
          </form>
        </div>
      </div>

      {/* Toast */}
      {toast && <Toast message={toast} onClose={() => setToast('')} />}
    </AdminLayout>
  );
}
