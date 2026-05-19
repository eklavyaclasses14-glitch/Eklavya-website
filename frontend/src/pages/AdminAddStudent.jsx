import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../components/AdminLayout';
import { UserPlus, ArrowLeft, User, Hash, Lock, Building2, GraduationCap, CheckCircle2, Phone, Smartphone, AlertCircle } from 'lucide-react';
import { apiFetch } from '../utils/apiFetch';
import '../styles/AdminForms.css';

const DEPARTMENTS = [
  'Automation & Robotics',
  'Automobile Engineering',
  'Civil Engineering',
  'Electrical Engineering',
  'Computer Engineering',
  'Information Technology',
  'Mechanical Engineering',
  'Mechanical Engineering (CAD/CAM)',
  'Information & Communication Technology',
  'Metallurgy',
  'Power Electronics',
  'Architecture',
];

// ── Validation rules ──────────────────────────────
const VALIDATORS = {
  name: {
    test: (v) => /^[a-zA-Z\s]+$/.test(v.trim()),
    msg: 'Name must contain alphabets only (no numbers or symbols)',
  },
  student_contact: {
    test: (v) => /^\d{10}$/.test(v),
    msg: 'Must be exactly 10 digits (numbers only)',
  },
  parent_contact: {
    test: (v) => /^\d{10}$/.test(v),
    msg: 'Must be exactly 10 digits (numbers only)',
  },
  password: {
    test: (v) => v.length >= 6,
    msg: 'Password must be at least 6 characters',
  },
  email: {
    test: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
    msg: 'Enter a valid email address',
  },
};

export default function AdminAddStudent() {
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [formData, setFormData] = useState({
    name: '',
    email: '', // ✅ ADD THIS
    user_id: '',
    department: 'Computer Engineering',
    semester: 1,
    password: '',
    student_contact: '',
    parent_contact: '',
  });

  const [submitting, setSubmitting] = useState(false);

  // Strip disallowed characters on the fly
  const sanitize = (name, value) => {
    if (name === 'name') {
      // Only allow letters + spaces
      return value.replace(/[^a-zA-Z\s]/g, '');
    }
    if (name === 'student_contact' || name === 'parent_contact') {
      // Only allow digits
      return value.replace(/\D/g, '').slice(0, 10);
    }
    return value;
  };

  const validate = (name, value) => {
    if (!VALIDATORS[name]) return '';
    return VALIDATORS[name].test(value) ? '' : VALIDATORS[name].msg;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const cleaned = sanitize(name, value);
    setFormData(prev => ({ ...prev, [name]: cleaned }));
    if (touched[name]) {
      setErrors(prev => ({ ...prev, [name]: validate(name, cleaned) }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    setErrors(prev => ({ ...prev, [name]: validate(name, value) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Run all validators
    const newErrors = {};
    Object.keys(VALIDATORS).forEach(field => {
      const err = validate(field, formData[field]);
      if (err) newErrors[field] = err;
    });
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setTouched({
        name: true,
        email: true, // ✅ ADD
        student_contact: true,
        parent_contact: true,
        password: true
      });
      return;
    }

    setSubmitting(true);
    try {
      const res = await apiFetch('http://localhost:5000/api/admin/students', {
        method: 'POST',
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to add student');
      }

      setSubmitted(true);
      setTimeout(() => navigate('/admin/students'), 1500);
    } catch (err) {
      alert(err.message);
      setSubmitting(false);
    }
  };

  const avatarInitial = formData.name ? formData.name.trim().charAt(0).toUpperCase() : '?';

  const fieldClass = (name) =>
    `admin-input${errors[name] && touched[name] ? ' admin-input-error' : ''}`;

  return (
    <AdminLayout>
      <div className="admin-form-page">

        {/* ── Page Header ── */}
        <div className="admin-form-page-header">
          <button className="admin-back-btn" onClick={() => navigate('/admin/dashboard')}>
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="admin-form-page-title">Add New Student</h1>
            <p className="admin-form-page-sub">Enroll a new student into the Eklavya portal</p>
          </div>
        </div>

        <div className="admin-form-layout">

          {/* ── Main Form ── */}
          <div className="admin-form-card">
            <div className="admin-form-card-header">
              <div className="admin-form-card-header-icon stat-icon-indigo">
                <UserPlus size={18} />
              </div>
              <span className="admin-form-card-header-title">Student Information</span>
            </div>

            <form onSubmit={handleSubmit} className="admin-form-card-body" noValidate>

              {/* Full Name */}
              <div className="admin-field-group">
                <label className="admin-field-label">
                  <User size={13} />
                  Full Name <span className="admin-field-label-required">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  className={fieldClass('name')}
                  placeholder="e.g. Ravi Kumar"
                  value={formData.name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                  autoComplete="off"
                />
                {errors.name && touched.name ? (
                  <span className="admin-field-error"><AlertCircle size={12} /> {errors.name}</span>
                ) : (
                  <span className="admin-input-hint">Alphabets and spaces only</span>
                )}
              </div>

              {/* Email */}
              <div className="admin-field-group">
                <label className="admin-field-label">
                  <User size={13} />
                  Email <span className="admin-field-label-required">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  className={fieldClass('email')}
                  placeholder="e.g. student@email.com"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                  autoComplete="off"
                />
                {errors.email && touched.email ? (
                  <span className="admin-field-error">
                    <AlertCircle size={12} /> {errors.email}
                  </span>
                ) : (
                  <span className="admin-input-hint">Used for login</span>
                )}
              </div>

              {/* User ID + Password */}
              <div className="admin-field-row">
                <div className="admin-field-group">
                  <label className="admin-field-label">
                    <Hash size={13} />
                    User ID <span className="admin-field-label-required">*</span>
                  </label>
                  <input
                    type="text"
                    name="user_id"
                    className="admin-input"
                    placeholder="e.g. UID20251"
                    value={formData.user_id}
                    onChange={handleChange}
                    required
                    autoComplete="off"
                  />
                  <span className="admin-input-hint">Must be unique — used to log in</span>
                </div>

                <div className="admin-field-group">
                  <label className="admin-field-label">
                    <Lock size={13} />
                    Initial Password <span className="admin-field-label-required">*</span>
                  </label>
                  <input
                    type="password"
                    name="password"
                    className={fieldClass('password')}
                    placeholder="Min. 6 characters"
                    value={formData.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                    autoComplete="new-password"
                  />
                  {errors.password && touched.password ? (
                    <span className="admin-field-error"><AlertCircle size={12} /> {errors.password}</span>
                  ) : (
                    <span className="admin-input-hint">Student can change after first login</span>
                  )}
                </div>
              </div>

              {/* Contact Numbers */}
              <div className="admin-field-row">
                <div className="admin-field-group">
                  <label className="admin-field-label">
                    <Smartphone size={13} />
                    Student Contact <span className="admin-field-label-required">*</span>
                  </label>
                  <input
                    type="tel"
                    name="student_contact"
                    className={fieldClass('student_contact')}
                    placeholder="e.g. 9876543210"
                    value={formData.student_contact}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                    autoComplete="off"
                    inputMode="numeric"
                    maxLength={10}
                  />
                  {errors.student_contact && touched.student_contact ? (
                    <span className="admin-field-error"><AlertCircle size={12} /> {errors.student_contact}</span>
                  ) : (
                    <span className="admin-input-hint">10-digit mobile number</span>
                  )}
                </div>

                <div className="admin-field-group">
                  <label className="admin-field-label">
                    <Phone size={13} />
                    Parent Contact <span className="admin-field-label-required">*</span>
                  </label>
                  <input
                    type="tel"
                    name="parent_contact"
                    className={fieldClass('parent_contact')}
                    placeholder="e.g. 9876543210"
                    value={formData.parent_contact}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                    autoComplete="off"
                    inputMode="numeric"
                    maxLength={10}
                  />
                  {errors.parent_contact && touched.parent_contact ? (
                    <span className="admin-field-error"><AlertCircle size={12} /> {errors.parent_contact}</span>
                  ) : (
                    <span className="admin-input-hint">Guardian's mobile number</span>
                  )}
                </div>
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
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(n => <option key={n} value={n}>Semester {n}</option>)}
                  </select>
                </div>
              </div>

              <div className="admin-form-divider" />

              <div className="admin-form-actions">
                <button type="button" className="admin-cancel-btn" onClick={() => navigate('/admin/dashboard')}>
                  Cancel
                </button>
                <button
                  type="submit"
                  className="admin-btn-primary"
                  disabled={submitting || submitted}
                >
                  {submitted ? (
                    <>
                      <CheckCircle2 size={16} /> Student Added!
                    </>
                  ) : submitting ? (
                    'Adding...'
                  ) : (
                    'Add Student'
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* ── Right Sidebar ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

            {/* Avatar Preview */}
            <div className="admin-info-card">
              <div className="admin-avatar-preview">
                <div className="admin-avatar-circle">{avatarInitial}</div>
                <div>
                  <p className="admin-avatar-name">{formData.name || 'Student Name'}</p>
                  <p className="admin-avatar-enr">{formData.user_id || 'UID—'}</p>
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textAlign: 'center' }}>
                  {formData.department} · Sem {formData.semester}
                </p>
                {(formData.student_contact || formData.parent_contact) && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', width: '100%', padding: '0 0.5rem' }}>
                    {formData.student_contact && (
                      <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem' }}>
                        <Smartphone size={12} /> {formData.student_contact}
                      </p>
                    )}
                    {formData.parent_contact && (
                      <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem' }}>
                        <Phone size={12} /> Parent: {formData.parent_contact}
                      </p>
                    )}
                  </div>
                )}
              </div>
              <div className="admin-info-card-body" style={{ padding: '0.875rem 1.25rem' }}>
                <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textAlign: 'center', lineHeight: 1.6 }}>
                  Preview updates as you fill the form.
                </p>
              </div>
            </div>

            {/* Guidelines */}
            <div className="admin-info-card">
              <div className="admin-info-card-header">Guidelines</div>
              <div className="admin-info-card-body">
                {[
                  { icon: <Hash size={16} />, title: 'User ID', desc: 'Unique identifier used by the student to log in (e.g. UID2025001).' },
                  { icon: <User size={16} />, title: 'Name', desc: 'Only alphabets and spaces are allowed — no numbers or symbols.' },
                  { icon: <Phone size={16} />, title: 'Contact Numbers', desc: 'Must be exactly 10 digits. Only numbers are accepted.' },
                  { icon: <Building2 size={16} />, title: 'Department', desc: 'Determines which subjects and notes are visible to the student.' },
                ].map(tip => (
                  <div key={tip.title} className="admin-info-item">
                    <div className="admin-info-item-icon" style={{ background: 'var(--color-background)', color: 'var(--color-primary)' }}>
                      {tip.icon}
                    </div>
                    <div>
                      <p className="admin-info-item-title">{tip.title}</p>
                      <p className="admin-info-item-desc">{tip.desc}</p>
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