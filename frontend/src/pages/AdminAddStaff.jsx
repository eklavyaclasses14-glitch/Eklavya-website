import { useEffect, useState } from "react";
import AdminLayout from "../components/AdminLayout";
import { apiFetch } from "../utils/apiFetch";
import { UserPlus, Trash2, User, Mail, Lock, AlertCircle, CheckCircle2, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "../styles/AdminForms.css";

// ── Validation rules ──────────────────────────────
const VALIDATORS = {
  name: {
    test: (v) => /^[a-zA-Z\s]+$/.test(v.trim()),
    msg: 'Name must contain alphabets only',
  },
  email: {
    test: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
    msg: 'Enter a valid email address',
  },
  password: {
    test: (v) => v.length >= 6,
    msg: 'Password must be at least 6 characters',
  },
};

export default function AdminAddStaff() {
  const navigate = useNavigate();
  const [staffList, setStaffList] = useState([]);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [message, setMessage] = useState({ text: "", type: "" });
  const [submitting, setSubmitting] = useState(false);

  // ─── FETCH STAFF ─────────────────
  const fetchStaff = async () => {
    try {
      const res = await apiFetch("/api/admin/staff");
      if (!res.ok) throw new Error("Failed to fetch staff");
      const data = await res.json();
      setStaffList(data);
    } catch (err) {
      console.error(err);
      setMessage({ text: "Could not load staff list", type: "error" });
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  // ─── VALIDATION ───────────────────
  const validate = (name, value) => {
    if (!VALIDATORS[name]) return "";
    return VALIDATORS[name].test(value) ? "" : VALIDATORS[name].msg;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (touched[name]) {
      setErrors(prev => ({ ...prev, [name]: validate(name, value) }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    setErrors(prev => ({ ...prev, [name]: validate(name, value) }));
  };

  // ─── CREATE STAFF ─────────────────
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setMessage({ text: "", type: "" });

    // Run all validators
    const newErrors = {};
    Object.keys(VALIDATORS).forEach(field => {
      const err = validate(field, form[field]);
      if (err) newErrors[field] = err;
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setTouched({ name: true, email: true, password: true });
      return;
    }

    setSubmitting(true);
    try {
      const res = await apiFetch("http://localhost:5000/api/admin/staff", {
        method: "POST",
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to create staff");

      setForm({ name: "", email: "", password: "" });
      setTouched({});
      setErrors({});
      setMessage({ text: "Staff created successfully!", type: "success" });
      fetchStaff();
    } catch (err) {
      setMessage({ text: err.message, type: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  // ─── DELETE STAFF ─────────────────
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this staff member?")) return;

    try {
      const res = await apiFetch(`http://localhost:5000/api/admin/staff/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete staff");
      setMessage({ text: "Staff member removed", type: "success" });
      fetchStaff();
    } catch (err) {
      setMessage({ text: err.message, type: "error" });
    }
  };

  const fieldClass = (name) =>
    `admin-input${errors[name] && touched[name] ? ' admin-input-error' : ''}`;

  return (
    <AdminLayout>
      <div className="admin-form-page">

        {/* HEADER */}
        <div className="admin-form-page-header">
          <button className="admin-back-btn" onClick={() => navigate('/admin/dashboard')}>
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="admin-form-page-title">Manage Staff</h1>
            <p className="admin-form-page-sub">
              Create and manage staff users for the portal
            </p>
          </div>
        </div>

        <div className="admin-form-layout">
          
          {/* CREATE STAFF FORM */}
          <div className="admin-form-card">
            <div className="admin-form-card-header">
              <div className="admin-form-card-header-icon stat-icon-indigo">
                <UserPlus size={18} />
              </div>
              <span className="admin-form-card-header-title">Enter Staff Details</span>
            </div>

            <form onSubmit={handleSubmit} className="admin-form-card-body" noValidate>
              
              <div className="admin-field-group">
                <label className="admin-field-label">
                  <User size={13} /> Name <span className="admin-field-label-required">*</span>
                </label>
                <input
                  name="name"
                  className={fieldClass('name')}
                  placeholder="e.g. John Doe"
                  value={form.name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  autoComplete="off"
                />
                {errors.name && touched.name && (
                  <span className="admin-field-error"><AlertCircle size={12} /> {errors.name}</span>
                )}
              </div>

              <div className="admin-field-group">
                <label className="admin-field-label">
                  <Mail size={13} /> Email <span className="admin-field-label-required">*</span>
                </label>
                <input
                  name="email"
                  type="email"
                  className={fieldClass('email')}
                  placeholder="staff@eklavya.edu"
                  value={form.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  autoComplete="off"
                />
                {errors.email && touched.email && (
                  <span className="admin-field-error"><AlertCircle size={12} /> {errors.email}</span>
                )}
              </div>

              <div className="admin-field-group">
                <label className="admin-field-label">
                  <Lock size={13} /> Password <span className="admin-field-label-required">*</span>
                </label>
                <input
                  name="password"
                  type="password"
                  className={fieldClass('password')}
                  placeholder="Min 6 characters"
                  value={form.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  autoComplete="new-password"
                />
                {errors.password && touched.password && (
                  <span className="admin-field-error"><AlertCircle size={12} /> {errors.password}</span>
                )}
              </div>

              {message.text && (
                <div className={`admin-form-alert ${message.type === 'success' ? 'alert-success' : 'alert-error'}`}>
                  {message.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                  <span>{message.text}</span>
                </div>
              )}

              <div className="admin-form-actions">
                <button 
                  type="submit" 
                  className="admin-btn-primary" 
                  disabled={submitting}
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  {submitting ? "Adding..." : <><UserPlus size={16} /> Add Staff Member</>}
                </button>
              </div>
            </form>
          </div>

          {/* STAFF LIST */}
          <div className="admin-form-card">
            <div className="admin-form-card-header">
              <div className="admin-form-card-header-icon stat-icon-emerald">
                <User size={18} />
              </div>
              <span className="admin-form-card-header-title">Existing Staff Members</span>
            </div>

            <div className="admin-form-card-body">
              {staffList.length === 0 ? (
                <div className="empty-state" style={{ padding: '2rem' }}>No staff members found</div>
              ) : (
                <div className="admin-staff-list" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {staffList.map((staff) => (
                    <div key={staff._id} className="admin-table-row" style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
                      <div className="admin-student-avatar avatar-color-0">
                        {staff.name?.charAt(0).toUpperCase()}
                      </div>
                      <div className="admin-student-info" style={{ flex: 1 }}>
                        <div className="admin-student-name" style={{ fontSize: '0.9rem' }}>{staff.name}</div>
                        <div className="admin-student-enr" style={{ fontSize: '0.8rem' }}>{staff.email}</div>
                      </div>
                      <button
                        onClick={() => handleDelete(staff._id)}
                        className="admin-section-action-btn"
                        style={{ color: 'var(--color-error)', background: 'rgba(239, 68, 68, 0.1)' }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>

      </div>
    </AdminLayout>
  );
}
