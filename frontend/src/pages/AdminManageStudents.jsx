import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../components/AdminLayout";
import {
  Users,
  Search,
  Pencil,
  Trash2,
  Plus,
  X,
  CheckCircle2,
  User,
  Hash,
  Building2,
  GraduationCap,
  Smartphone,
  Phone,
  AlertCircle,
  Eye,
  EyeOff,
  Lock,
} from "lucide-react";
import { apiFetch } from "../utils/apiFetch";
import "../styles/AdminManageStudents.css";

function DeleteConfirmModal({ title, onClose, onConfirm }) {
  return (
    <div
      className="ams-modal-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="ams-modal" style={{ maxWidth: '400px' }}>
        <div className="ams-modal-header" style={{ borderBottom: 'none', paddingBottom: '0.5rem' }}>
          <span className="ams-modal-title" style={{ color: '#ef4444', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertCircle size={20} />
            Confirm Delete
          </span>
          <button className="ams-modal-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>
        
        <div className="ams-modal-body" style={{ padding: '1.5rem', paddingTop: '0.5rem' }}>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem', lineHeight: '1.5' }}>
            Are you sure you want to delete student <strong style={{ color: 'var(--color-text)' }}>"{title}"</strong>?
          </p>
          <p style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '0.75rem', fontWeight: 600 }}>
            ⚠️ This action is permanent and cannot be undone.
          </p>
        </div>

        <div className="ams-modal-footer" style={{ borderTop: 'none', paddingTop: '0.5rem' }}>
          <button
            type="button"
            className="ams-modal-cancel"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="button"
            className="ams-modal-save"
            onClick={onConfirm}
            style={{
              background: '#ef4444',
              borderColor: '#ef4444',
              color: '#ffffff'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#dc2626';
              e.currentTarget.style.borderColor = '#dc2626';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#ef4444';
              e.currentTarget.style.borderColor = '#ef4444';
            }}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

const DEPARTMENTS = [
  "Computer Engineering",
  "Mechanical Engineering",
  "Civil Engineering",
  "Electrical Engineering",
];
const FILTER_DEPARTMENTS = ["All", ...DEPARTMENTS];

const DEPT_SHORT = {
  "Computer Engineering": "CSE",
  "Mechanical Engineering": "MECH",
  "Civil Engineering": "CIVIL",
  "Electrical Engineering": "EEE",
};

// ── Validation ────────────────────────────────────────
const validate = (field, value) => {
  if (field === "name") {
    if (!value.trim()) return "Name is required";
    if (!/^[a-zA-Z\s]+$/.test(value.trim())) return "Alphabets and spaces only";
  }
  if (field === "student_contact" || field === "parent_contact") {
    if (value && !/^\d{10}$/.test(value)) return "Must be exactly 10 digits";
  }
  return "";
};

// ── Toast ─────────────────────────────────────────────
function Toast({ message, type = "success", onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [onClose]);
  return (
    <div className="ams-toast">
      {type === "success" ? (
        <CheckCircle2 size={16} color="#34d399" />
      ) : (
        <AlertCircle size={16} color="#f87171" />
      )}
      {message}
      <button
        onClick={onClose}
        style={{
          marginLeft: "0.5rem",
          color: "rgba(255,255,255,0.5)",
          background: "none",
          cursor: "pointer",
        }}
      >
        <X size={14} />
      </button>
    </div>
  );
}

// ── Edit Modal ────────────────────────────────────────
function EditModal({ student, onClose, onSave, setToast }) {
  const [form, setForm] = useState({
    name: student.name || "",
    user_id: student.user_id || "",
    department: student.department || "",
    semester: student.semester || "",
    student_contact: student.student_contact || "",
    parent_contact: student.parent_contact || "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const sanitize = (name, value) => {
    if (name === "name") return value.replace(/[^a-zA-Z\s]/g, "");
    if (name === "student_contact" || name === "parent_contact")
      return value.replace(/\D/g, "").slice(0, 10);
    return value;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const clean = sanitize(name, value);
    setForm((prev) => ({
      ...prev,
      [name]: name === "semester" ? Number(clean) : clean,
    }));
    setErrors((prev) => ({ ...prev, [name]: validate(name, clean) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    ["name", "student_contact", "parent_contact"].forEach((f) => {
      const err = validate(f, form[f] || "");
      if (err) newErrors[f] = err;
    });

    if (form.password && form.password.length < 8) {
      newErrors.password = "Min 8 characters";
    }
    if (!form.department) {
      newErrors.department = "Department is required";
    }

    if (!form.semester) {
      newErrors.semester = "Semester is required";
    }

    if (Object.keys(newErrors).length) {
      setErrors(newErrors);
      return;
    }

    setSaving(true);
    try {
      const res = await apiFetch(
        `http://localhost:5000/api/admin/students/${student._id}`,
        {
          method: "PUT",
          body: JSON.stringify(form),
        },
      );
      const updated = await res.json();
      onSave(updated);
    } catch {
      setToast({
        message: "Failed to update student",
        type: "error",
      });
      // optimistic fallback
    } finally {
      setSaving(false);
    }
  };

  const fieldClass = (name) =>
    `ams-modal-input${errors[name] ? " ams-modal-input-error" : ""}`;

  return (
    <div
      className="ams-modal-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="ams-modal">
        {/* Header */}
        <div className="ams-modal-header">
          <span className="ams-modal-title">
            <Pencil size={16} style={{ color: "var(--color-primary)" }} />
            Edit Student
          </span>
          <button className="ams-modal-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="ams-modal-body">
            {/* Full Name */}
            <div className="ams-modal-field">
              <label className="ams-modal-label">
                <User size={12} /> Full Name *
              </label>
              <input
                type="text"
                name="name"
                className={fieldClass("name")}
                value={form.name}
                onChange={handleChange}
                placeholder="e.g. Ravi Kumar"
                autoComplete="off"
              />
              {errors.name && (
                <span
                  style={{
                    fontSize: "0.72rem",
                    color: "#ef4444",
                    marginTop: "0.1rem",
                  }}
                >
                  {errors.name}
                </span>
              )}
            </div>

            {/* User ID (read-only — identifier) */}
            <div className="ams-modal-field">
              <label className="ams-modal-label">
                <Hash size={12} /> User ID
              </label>
              <input
                type="text"
                name="user_id"
                className="ams-modal-input"
                value={form.user_id}
                readOnly
                style={{ opacity: 0.6, cursor: "not-allowed" }}
              />
              <span
                style={{
                  fontSize: "0.72rem",
                  color: "var(--color-text-muted)",
                }}
              >
                User ID cannot be changed
              </span>
            </div>

            {/* Password */}
            <div className="ams-modal-field">
              <label className="ams-modal-label">
                <Lock size={12} /> New Password (Optional)
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  className={fieldClass("password")}
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Leave blank to keep current"
                  autoComplete="new-password"
                  style={{ paddingRight: "2.5rem" }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute",
                    right: "0.75rem",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    color: "var(--color-text-muted)",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "0.25rem",
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && (
                <span style={{ fontSize: "0.72rem", color: "#ef4444" }}>
                  {errors.password}
                </span>
              )}
            </div>

            {/* Department + Semester */}
            <div className="ams-modal-row">
              <div className="ams-modal-field">
                <label className="ams-modal-label">
                  <Building2 size={12} /> Department *
                </label>
                <select
                  name="department"
                  className="ams-modal-input"
                  value={form.department}
                  onChange={handleChange}
                >
                  <option value="" disabled>
                    Select Department
                  </option>

                  {FILTER_DEPARTMENTS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
              <div className="ams-modal-field">
                <label className="ams-modal-label">
                  <GraduationCap size={12} /> Semester *
                </label>
                <select
                  name="semester"
                  className="ams-modal-input"
                  value={form.semester}
                  onChange={handleChange}
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                    <option key={n} value={n}>
                      Semester {n}
                    </option>
                  ))}
                  <option value="">Select Semester</option>
                </select>
              </div>
            </div>

            {/* Contacts */}
            <div className="ams-modal-row">
              <div className="ams-modal-field">
                <label className="ams-modal-label">
                  <Smartphone size={12} /> Student Contact
                </label>
                <input
                  type="tel"
                  name="student_contact"
                  className={fieldClass("student_contact")}
                  value={form.student_contact || ""}
                  onChange={handleChange}
                  placeholder="10-digit number"
                  inputMode="numeric"
                  maxLength={10}
                />
                {errors.student_contact && (
                  <span style={{ fontSize: "0.72rem", color: "#ef4444" }}>
                    {errors.student_contact}
                  </span>
                )}
              </div>
              <div className="ams-modal-field">
                <label className="ams-modal-label">
                  <Phone size={12} /> Parent Contact
                </label>
                <input
                  type="tel"
                  name="parent_contact"
                  className={fieldClass("parent_contact")}
                  value={form.parent_contact || ""}
                  onChange={handleChange}
                  placeholder="10-digit number"
                  inputMode="numeric"
                  maxLength={10}
                />
                {errors.parent_contact && (
                  <span style={{ fontSize: "0.72rem", color: "#ef4444" }}>
                    {errors.parent_contact}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="ams-modal-footer">
            <button
              type="button"
              className="ams-modal-cancel"
              onClick={onClose}
            >
              Cancel
            </button>
            <button type="submit" className="ams-modal-save" disabled={saving}>
              {saving ? (
                <>
                  <CheckCircle2 size={15} /> Saving…
                </>
              ) : (
                <>
                  <CheckCircle2 size={15} /> Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────
export default function AdminManageStudents() {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("");
  const [semFilter, setSemFilter] = useState("");
  const [editing, setEditing] = useState(null); // student being edited
  const [toast, setToast] = useState(null); // { message, type }
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  const fetchStudents = useCallback(async () => {
    if (!deptFilter || !semFilter) {
      setStudents([]);
      setLoading(false);
      setTotalPages(1);
      return;
    }

    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("department", deptFilter);
      params.append("semester", semFilter);
      params.append("page", currentPage);
      params.append("limit", itemsPerPage);

      const res = await apiFetch(`api/admin/students?${params.toString()}`);
      const data = await res.json();
      setStudents(data.students || []);
      setTotalPages(data.pages || 1);
    } catch {
      setToast({ message: "Failed to fetch students", type: "error" });
    } finally {
      setLoading(false);
    }
  }, [deptFilter, semFilter, currentPage]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  // Derived stats
  const depts = [...new Set(students.map((s) => s.department))];
  const statDept = students.filter(
    (s) => s.department === "Computer Engineering",
  ).length;

  const semesters = [...new Set(students.map((s) => s.semester))].sort(
    (a, b) => a - b,
  );

  const filtered = students.filter((s) => {
    const matchSearch =
      (s.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (s.user_id || "").toLowerCase().includes(search.toLowerCase());
    const matchDept = deptFilter === "All" || s.department === deptFilter;
    const matchSem = semFilter === "All" || s.semester === Number(semFilter);
    return matchSearch && matchDept && matchSem;
  });

  const handleDelete = (id, name) => {
    setDeleteConfirm({ id, name });
  };

  const executeDelete = async () => {
    if (!deleteConfirm) return;
    const { id, name } = deleteConfirm;
    setDeleteConfirm(null);
    try {
      await apiFetch(`http://localhost:5000/api/admin/students/${id}`, {
        method: "DELETE",
      });
      setStudents((prev) => prev.filter((s) => s._id !== id));
      setToast({ message: `"${name}" deleted`, type: "success" });
    } catch {
      setToast({ message: "Delete failed — try again", type: "error" });
    }
  };

  const handleSave = useCallback((updated) => {
    setStudents((prev) =>
      prev.map((s) => (s._id === updated._id ? updated : s)),
    );
    setEditing(null);
    setToast({
      message: `"${updated.name}" updated successfully`,
      type: "success",
    });
  }, []);

  return (
    <AdminLayout>
      {/* ── Header ── */}
      <div className="ams-students-header">
        <div>
          <h1 className="ams-students-title">Manage Students</h1>
          <p className="ams-students-sub">
            View, edit, and remove enrolled students
          </p>
        </div>
        <button
          className="ams-add-new-btn"
          onClick={() => navigate("/admin/students/new")}
        >
          <Plus size={16} /> Add New Student
        </button>
      </div>

      {/* ── Stats ── */}
      <div className="ams-students-stats">
        <div className="ams-stat-card indigo">
          <div className="ams-stat-value">{students.length}</div>
          <div className="ams-stat-label">Total Students</div>
        </div>
        <div className="ams-stat-card sky">
          <div className="ams-stat-value">{depts.length}</div>
          <div className="ams-stat-label">Departments</div>
        </div>
        <div className="ams-stat-card emerald">
          <div className="ams-stat-value">
            {
              students.filter((s) => s.department === "Computer Engineering")
                .length
            }
          </div>
          <div className="ams-stat-label">CSE Students</div>
        </div>
        <div className="ams-stat-card amber">
          <div className="ams-stat-value">
            {[...new Set(students.map((s) => s.semester))].length}
          </div>
          <div className="ams-stat-label">Active Semesters</div>
        </div>
      </div>

      {/* ── Table card ── */}
      <div className="ams-table-card">
        {/* Toolbar */}
        <div className="ams-toolbar">
          <span className="ams-toolbar-title">
            <Users size={16} style={{ color: "var(--color-primary)" }} />
            All Students
            <span className="ams-count-pill">{filtered.length}</span>
          </span>

          {/* Search */}
          <div className="ams-search-wrap">
            <Search size={14} className="ams-search-icon" />
            <input
              type="text"
              className="ams-search-input"
              placeholder="Search by name or User ID…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Department filter */}
          <select
            className="ams-filter-select"
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
          >
            <option value="">Select Department</option>
            {DEPARTMENTS.map((d) => (
              <option key={d} value={d}>
                {DEPT_SHORT[d] || d}
              </option>
            ))}
          </select>

          {/* Semester filter */}
          <select
            className="ams-filter-select"
            value={semFilter}
            onChange={(e) => setSemFilter(e.target.value)}
          >
            <option value="">Select Semester</option>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <option key={n} value={n}>
                Semester {n}
              </option>
            ))}
          </select>
        </div>

        {/* Table header */}
        <div className="ams-table-header">
          <span>Student</span>
          <span>Department</span>
          <span>Semester</span>
          <span>Contacts</span>
          <span style={{ textAlign: "right" }}>Actions</span>
        </div>

        {/* Rows */}
        {loading ? (
          <div className="ams-empty">Loading students…</div>
        ) : !deptFilter || !semFilter ? (
          <div className="ams-empty">
            <div style={{ marginBottom: '1rem', opacity: 0.5 }}>
              <Users size={48} style={{ margin: '0 auto 1rem', display: 'block' }} />
            </div>
            Please select both <b>Department</b> and <b>Semester</b> to view students.
          </div>
        ) : filtered.length === 0 ? (
          <div className="ams-empty">
            No students found for the selected filters.
          </div>
        ) : (
          filtered.map((student) => (
            <div key={student._id} className="ams-student-row">
              {/* Identity */}
              <div className="ams-student-identity">
                <div className="ams-student-avatar">
                  <img
                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(student.name || "Student")}&background=4f46e5&color=fff&bold=true`}
                    alt={student.name}
                  />
                </div>
                <div>
                  <div className="ams-student-name">{student.name}</div>
                  <div className="ams-student-uid">
                    {student.user_id || student.enrollment_no}
                  </div>
                </div>
              </div>

              {/* Department */}
              <span className="ams-dept-tag">
                {DEPT_SHORT[student.department] || student.department}
              </span>

              {/* Semester */}
              <span className="ams-sem-tag">Sem {student.semester}</span>

              {/* Contacts */}
              <div className="ams-contact-cell">
                {student.student_contact && (
                  <span className="ams-contact-row">
                    <Smartphone size={11} /> {student.student_contact}
                  </span>
                )}
                {student.parent_contact && (
                  <span className="ams-contact-row">
                    <Phone size={11} /> {student.parent_contact}
                  </span>
                )}
                {!student.student_contact && !student.parent_contact && (
                  <span
                    style={{
                      color: "var(--color-text-muted)",
                      fontSize: "0.72rem",
                    }}
                  >
                    —
                  </span>
                )}
              </div>

              {/* Actions */}
              <div className="ams-actions">
                <button
                  className="ams-btn-edit"
                  onClick={() => setEditing(student)}
                  title="Edit student"
                >
                  <Pencil size={14} />
                </button>
                <button
                  className="ams-btn-delete"
                  onClick={() => handleDelete(student._id, student.name)}
                  title="Delete student"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <div className="ams-pagination" style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: '1rem', padding: '1.5rem', background: 'rgba(255,255,255,0.02)',
          borderTop: '1px solid rgba(255,255,255,0.05)', borderRadius: '0 0 12px 12px'
        }}>
          <button 
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => prev - 1)}
            style={{
              padding: '0.5rem 1rem', background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)', color: 'var(--color-text)',
              borderRadius: '6px', cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
              opacity: currentPage === 1 ? 0.5 : 1
            }}
          >
            Previous
          </button>
          <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
            Page {currentPage} of {totalPages}
          </span>
          <button 
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(prev => prev + 1)}
            style={{
              padding: '0.5rem 1rem', background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)', color: 'var(--color-text)',
              borderRadius: '6px', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
              opacity: currentPage === totalPages ? 0.5 : 1
            }}
          >
            Next
          </button>
        </div>
      )}

      {/* ── Edit Modal ── */}
      {editing && (
        <EditModal
          student={editing}
          onClose={() => setEditing(null)}
          onSave={handleSave}
          setToast={setToast}
          onError={(msg) =>
            setToast({
              message: msg,
              type: "error",
            })
          }
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <DeleteConfirmModal
          title={deleteConfirm.name}
          onClose={() => setDeleteConfirm(null)}
          onConfirm={executeDelete}
        />
      )}

      {/* ── Toast ── */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </AdminLayout>
  );
}
