import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../components/AdminLayout';
import { UploadCloud, ArrowLeft, FileText, Image, Link2, BookOpen, Building2, GraduationCap, CheckCircle2, AlertTriangle, File as FileIcon } from 'lucide-react';
import { apiFetch } from '../utils/apiFetch';
import '../styles/AdminForms.css';

const DEPARTMENTS = [
  'Computer Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
  'Electrical Engineering',
];

export default function AdminUploadDocument() {
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    department: 'Computer Engineering',
    semester: 4,
    subject_id: '',
    file_type: 'pdf',
    google_drive_file_id: '',
  });

  useEffect(() => {
    apiFetch('http://localhost:5000/api/admin/subjects')
      .then(res => res.json())
      .then(data => {
        setSubjects(data);
        if (data.length > 0) {
          setFormData(prev => ({ ...prev, subject_id: data[0]._id }));
        }
      })
      .catch(console.error);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const filteredSubjects = subjects.filter(
    s => s.department === formData.department && s.semester == formData.semester
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    try {
      const res = await apiFetch('http://localhost:5000/api/admin/notes', {
        method: 'POST',
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || 'Upload failed');
      }

      setSubmitted(true);
      setTimeout(() => navigate('/admin/dashboard'), 1500);
    } catch (err) {
      alert(err.message);
      setUploading(false);
    }
  };

  const driveIdHasValue = formData.google_drive_file_id.trim().length > 0;

  return (
    <AdminLayout>
      <div className="admin-form-page">

        {/* ── Page Header ── */}
        <div className="admin-form-page-header">
          <button className="admin-back-btn" onClick={() => navigate('/admin/dashboard')}>
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="admin-form-page-title">Upload Study Material</h1>
            <p className="admin-form-page-sub">Add notes, PDFs, or diagrams for students via Google Drive</p>
          </div>
        </div>

        <div className="admin-form-layout">

          {/* ── Main Form ── */}
          <div className="admin-form-card">
            <div className="admin-form-card-header">
              <div className="admin-form-card-header-icon stat-icon-sky">
                <UploadCloud size={18} />
              </div>
              <span className="admin-form-card-header-title">Document Details</span>
            </div>

            <form onSubmit={handleSubmit} className="admin-form-card-body">

              {/* Document Title */}
              <div className="admin-field-group">
                <label className="admin-field-label">
                  <FileText size={13} />
                  Document Title <span className="admin-field-label-required">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  className="admin-input"
                  placeholder="e.g. Unit 3 – Data Structures Notes"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  autoComplete="off"
                />
              </div>

              {/* Department + Semester */}
              <div className="admin-field-row">
                <div className="admin-field-group">
                  <label className="admin-field-label">
                    <Building2 size={13} />
                    Department <span className="admin-field-label-required">*</span>
                  </label>
                  <select name="department" className="admin-input" value={formData.department} onChange={handleChange} required>
                    {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>

                <div className="admin-field-group">
                  <label className="admin-field-label">
                    <GraduationCap size={13} />
                    Semester <span className="admin-field-label-required">*</span>
                  </label>
                  <select name="semester" className="admin-input" value={formData.semester} onChange={handleChange} required>
                    {[1,2,3,4,5,6,7,8].map(n => <option key={n} value={n}>Semester {n}</option>)}
                  </select>
                </div>
              </div>

              {/* Subject */}
              <div className="admin-field-group">
                <label className="admin-field-label">
                  <BookOpen size={13} />
                  Subject <span className="admin-field-label-required">*</span>
                </label>
                <select name="subject_id" className="admin-input" value={formData.subject_id} onChange={handleChange} required>
                  {filteredSubjects.length === 0 && <option value="">No subjects for this dept/semester</option>}
                  {filteredSubjects.map(sub => <option key={sub._id} value={sub._id}>{sub.subject_name}</option>)}
                </select>
                {filteredSubjects.length === 0 && (
                  <span className="admin-input-hint" style={{ color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <AlertTriangle size={13} /> No subjects found — try changing department or semester
                  </span>
                )}
              </div>

              {/* File Type toggle */}
              <div className="admin-field-group">
                <label className="admin-field-label">File Type <span className="admin-field-label-required">*</span></label>
                <div className="admin-file-type-group">
                  <label className="admin-file-type-option">
                    <input
                      type="radio"
                      name="file_type"
                      value="pdf"
                      checked={formData.file_type === 'pdf'}
                      onChange={handleChange}
                    />
                    <span className="admin-file-type-label">
                      <span className="admin-file-type-icon" style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444' }}><FileIcon size={18} /></span>
                      <span className="admin-file-type-name">PDF</span>
                      <span className="admin-file-type-desc">Lecture notes, question papers, assignments</span>
                    </span>
                  </label>

                  <label className="admin-file-type-option">
                    <input
                      type="radio"
                      name="file_type"
                      value="image"
                      checked={formData.file_type === 'image'}
                      onChange={handleChange}
                    />
                    <span className="admin-file-type-label">
                      <span className="admin-file-type-icon" style={{ background: 'rgba(14,165,233,0.1)', color: 'var(--color-primary)' }}><Image size={18} /></span>
                      <span className="admin-file-type-name">Image</span>
                      <span className="admin-file-type-desc">Diagrams, charts, hand-written notes</span>
                    </span>
                  </label>
                </div>
              </div>

              {/* Google Drive ID dropzone */}
              <div className="admin-field-group">
                <label className="admin-field-label">
                  <Link2 size={13} />
                  Google Drive File ID <span className="admin-field-label-required">*</span>
                </label>

                <div className={`admin-dropzone ${driveIdHasValue ? 'has-value' : ''}`}>
                  <div className="admin-dropzone-icon">
                    <UploadCloud size={26} />
                  </div>
                  <p className="admin-dropzone-title">
                    {driveIdHasValue ? '✅ Drive ID linked' : 'Paste your Google Drive File ID'}
                  </p>
                  <p className="admin-dropzone-sub">
                    Open the file in Google Drive → Share → Copy link → extract the ID between <code>/d/</code> and <code>/view</code>
                  </p>
                  <input
                    type="text"
                    name="google_drive_file_id"
                    className="admin-input admin-dropzone-input"
                    placeholder="e.g. 1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms"
                    value={formData.google_drive_file_id}
                    onChange={handleChange}
                    required
                  />
                </div>
                <span className="admin-input-hint">The file must be set to "Anyone with the link can view"</span>
              </div>

              <div className="admin-form-divider" />

              {/* Actions */}
              <div className="admin-form-actions">
                <button type="button" className="admin-cancel-btn" onClick={() => navigate('/admin/dashboard')}>
                  Cancel
                </button>
                <button type="submit" className="admin-submit-btn" disabled={uploading || submitted || filteredSubjects.length === 0}>
                  {submitted ? (
                    <><CheckCircle2 size={16} /> Uploaded!</>
                  ) : uploading ? (
                    'Uploading...'
                  ) : (
                    <><UploadCloud size={16} /> Upload Document</>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* ── Right Sidebar Tips ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

            {/* Preview */}
            <div className="admin-info-card">
              <div className="admin-info-card-header">Document Preview</div>
              <div className="admin-info-card-body" style={{ alignItems: 'center', textAlign: 'center' }}>
                <div style={{
                  width: 56, height: 56, borderRadius: 'var(--radius-lg)',
                  background: formData.file_type === 'pdf' ? 'rgba(239,68,68,0.1)' : 'rgba(14,165,233,0.1)',
                  color: formData.file_type === 'pdf' ? '#ef4444' : 'var(--color-primary)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto'
                }}>
                  {formData.file_type === 'pdf' ? <FileText size={28} /> : <Image size={28} />}
                </div>
                <p style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--color-text)', marginTop: '0.75rem' }}>
                  {formData.title || 'Document Title'}
                </p>
                <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
                  {formData.department} · Sem {formData.semester}
                </p>
                <span style={{
                  marginTop: '0.5rem', display: 'inline-block',
                  fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase',
                  padding: '0.2rem 0.6rem', borderRadius: 99,
                  background: formData.file_type === 'pdf' ? 'rgba(239,68,68,0.1)' : 'rgba(14,165,233,0.1)',
                  color: formData.file_type === 'pdf' ? '#ef4444' : 'var(--color-primary)'
                }}>
                  {formData.file_type}
                </span>
              </div>
            </div>

            {/* Tips */}
            <div className="admin-info-card">
              <div className="admin-info-card-header">How to get Drive ID</div>
              <div className="admin-info-card-body">
                {[
                  { step: '1', text: 'Upload the file to Google Drive' },
                  { step: '2', text: 'Right-click the file → "Share"' },
                  { step: '3', text: 'Set access to "Anyone with the link"' },
                  { step: '4', text: 'Copy the link — the ID is between /d/ and /view' },
                ].map(item => (
                  <div key={item.step} className="admin-info-item">
                    <div className="admin-info-item-icon" style={{
                      background: 'rgba(74, 92, 106, 0.1)', color: 'var(--color-primary)',
                      fontWeight: 800, fontSize: '0.8125rem'
                    }}>
                      {item.step}
                    </div>
                    <div>
                      <p className="admin-info-item-desc" style={{ marginTop: 0 }}>{item.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
