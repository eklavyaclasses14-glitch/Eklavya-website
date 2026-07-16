import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../components/AdminLayout';
import { ArrowLeft, UploadCloud, File, Image, CheckCircle2, AlertCircle, X } from 'lucide-react';
import { apiFetch } from '../utils/apiFetch';
import { useDepartments } from '../hooks/useDepartments';
import "../styles/AdminForms.css";
import "../styles/AdminUploadDocument.css";

export default function AdminUploadDocument() {
  const { departments: deptsData } = useDepartments();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [subjects, setSubjects] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [toast, setToast] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    label: '',
    department: 'Computer Engineering',
    semester: 1,
    subject_id: '',
    file_type: 'pdf',
    exam_date: '',
    description: '',
  });

  const [isCommonExam, setIsCommonExam] = useState(false);

  useEffect(() => {
    apiFetch('/api/admin/subjects')
      .then(res => res.json())
      .then(data => {
        setSubjects(data);
        if (data.length > 0) {
          setFormData(prev => ({ ...prev, subject_id: data[0]._id }));
        }
      });
  }, []);

  const filteredSubjects = subjects.filter(
    s => s.department === formData.department && s.semester == formData.semester
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'department' || name === 'semester') {
      const newSubjects = subjects.filter(
        s => s.department === (name === 'department' ? value : formData.department) &&
          s.semester == (name === 'semester' ? value : formData.semester)
      );
      setFormData(prev => ({
        ...prev,
        [name]: value,
        subject_id: newSubjects.length > 0 ? newSubjects[0]._id : '',
      }));
      return;
    }
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setSelectedFile(file);
    // Auto-detect file type
    const isPdf = file.type === 'application/pdf';
    setFormData(prev => ({ ...prev, file_type: isPdf ? 'pdf' : 'image' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setToast({ type: 'error', msg: 'Please select a file to upload' });
      return;
    }

    setUploading(true);
    setProgress(10);

    try {
      const data = new FormData();
      data.append('file', selectedFile);
      data.append('title', formData.title);
      data.append('file_type', formData.file_type);

      if (isCommonExam) {
        data.append('is_common', 'true');
        if (formData.exam_date) data.append('exam_date', formData.exam_date);
        if (formData.description) data.append('description', formData.description);
      } else {
        data.append('label', formData.label);
        data.append('subject_id', formData.subject_id);
      }

      const token = localStorage.getItem('token');
      setProgress(40);

      const res = await apiFetch('/api/admin/notes', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: data,
      });

      setProgress(90);
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || 'Upload failed');
      }

      setProgress(100);
      setToast({ type: 'success', msg: 'Document uploaded successfully!' });
      setSelectedFile(null);
      setFormData(prev => ({ ...prev, title: '', label: '' }));
      if (fileInputRef.current) fileInputRef.current.value = '';
      setTimeout(() => setProgress(0), 600);

    } catch (err) {
      setToast({ type: 'error', msg: err.message });
      setProgress(0);
    } finally {
      setUploading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="admin-form-page">

        {/* Header */}
        <div className="admin-form-page-header">
          <button className="admin-back-btn" onClick={() => navigate('/admin/dashboard')}>
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="admin-form-page-title">Upload Document</h1>
            <p className="admin-form-page-sub">Add study material for students via Cloudinary</p>
          </div>
        </div>

        {/* Toast */}
        {toast && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.75rem',
            padding: '0.9rem 1.25rem', borderRadius: '12px', marginBottom: '1.25rem',
            background: toast.type === 'success' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
            border: `1px solid ${toast.type === 'success' ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
            color: toast.type === 'success' ? '#34d399' : '#f87171',
          }}>
            {toast.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            <span style={{ flex: 1 }}>{toast.msg}</span>
            <button onClick={() => setToast(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}>
              <X size={16} />
            </button>
          </div>
        )}

        {/* Progress bar */}
        {progress > 0 && (
          <div style={{ height: '4px', background: 'var(--color-border)', borderRadius: '2px', marginBottom: '1.25rem', overflow: 'hidden' }}>
            <div style={{
              height: '100%', width: `${progress}%`,
              background: 'linear-gradient(90deg, var(--color-primary), #a855f7)',
              borderRadius: '2px',
              transition: 'width 0.4s ease',
            }} />
          </div>
        )}

        {/* Toggle */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', background: 'var(--color-surface)', padding: '0.5rem', borderRadius: '12px', border: '1px solid var(--color-border)', width: 'fit-content' }}>
          <button type="button" onClick={() => setIsCommonExam(false)} style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 600, background: !isCommonExam ? 'var(--color-primary)' : 'transparent', color: !isCommonExam ? '#fff' : 'var(--color-text-muted)' }}>
            Course Material
          </button>
          <button type="button" onClick={() => setIsCommonExam(true)} style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 600, background: isCommonExam ? 'var(--color-primary)' : 'transparent', color: isCommonExam ? '#fff' : 'var(--color-text-muted)' }}>
            Common Exam Paper
          </button>
        </div>

        {/* Form */}
        <div className="admin-form-card">
          <form onSubmit={handleSubmit} className="admin-form-card-body">

            {/* Title */}
            <div className="admin-field-group">
              <label>{isCommonExam ? 'Exam Name / Title *' : 'Title *'}</label>
              <input type="text" name="title" className="admin-input" value={formData.title} onChange={handleChange} required placeholder={isCommonExam ? "e.g. Midterm Common Paper" : "e.g. Data Structures - Unit 1"} />
            </div>

            {!isCommonExam && (
              <>
                <div className="admin-field-group">
                  <label>Label (Category) *</label>
                  <input type="text" name="label" className="admin-input" placeholder="e.g. Unit 1 / Assignment" value={formData.label} onChange={handleChange} required />
                </div>

                <div className="admin-field-row">
                  <div className="admin-field-group">
                    <label>Department *</label>
                    <select name="department" className="admin-input" value={formData.department} onChange={handleChange}>
                      {deptsData.map(d => <option key={d.name}>{d.name}</option>)}
                    </select>
                  </div>
                  <div className="admin-field-group">
                    <label>Semester *</label>
                    <select name="semester" className="admin-input" value={formData.semester} onChange={handleChange}>
                      {[1, 2, 3, 4, 5, 6].map(n => <option key={n}>{n}</option>)}
                    </select>
                  </div>
                </div>

                <div className="admin-field-group">
                  <label>Subject *</label>
                  <select name="subject_id" className="admin-input" value={formData.subject_id} onChange={handleChange} required>
                    <option value="">Select Subject</option>
                    {filteredSubjects.map(sub => (
                      <option key={sub._id} value={sub._id}>
                        {sub.subject_name} {sub.target_audience === 'ddcet' ? '(DDCET)' : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}

            {isCommonExam && (
              <>
                <div className="admin-field-group">
                  <label>Exam Date (Optional)</label>
                  <input type="date" name="exam_date" className="admin-input" value={formData.exam_date} onChange={handleChange} />
                </div>
                <div className="admin-field-group">
                  <label>Description (Optional)</label>
                  <textarea name="description" className="admin-input" rows="3" value={formData.description} onChange={handleChange} placeholder="Add any details about this exam paper..." />
                </div>
              </>
            )}

            {/* File Picker */}
            <div className="admin-field-group">
              <label>File (PDF or Image, max 20 MB)</label>
              <label style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                gap: '0.75rem', padding: '2rem', cursor: 'pointer',
                border: `2px dashed ${selectedFile ? 'var(--color-primary)' : 'var(--color-border)'}`,
                borderRadius: '12px', background: selectedFile ? 'rgba(74,92,106,0.08)' : 'transparent',
                transition: 'all 0.2s ease',
              }}>
                {selectedFile ? (
                  <>
                    {selectedFile.type === 'application/pdf' ? <File size={36} style={{ color: 'var(--color-primary)' }} /> : <Image size={36} style={{ color: 'var(--color-primary)' }} />}
                    <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-text)' }}>{selectedFile.name}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</span>
                  </>
                ) : (
                  <>
                    <UploadCloud size={36} style={{ color: 'var(--color-text-muted)' }} />
                    <span style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>Click to select a PDF or Image</span>
                  </>
                )}
                <input ref={fileInputRef} type="file" accept=".pdf,image/*" onChange={handleFileChange} style={{ display: 'none' }} />
              </label>
            </div>

            {/* Submit */}
            <button type="submit" className="admin-submit-btn" disabled={uploading}>
              {uploading ? `Uploading… ${progress}%` : (
                <><UploadCloud size={16} /> Upload Document</>
              )}
            </button>

          </form>
        </div>

      </div>
    </AdminLayout>
  );
}
