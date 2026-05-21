import { useState, useEffect, useRef } from "react";
import AdminLayout from "../components/AdminLayout";
import {
  BookOpen,
  Plus,
  Search,
  Trash2,
  CheckCircle2,
  Building2,
  GraduationCap,
  AlertCircle,
  X,
} from "lucide-react";
import { apiFetch } from "../utils/apiFetch";
import "../styles/AdminManageSubjects.css";

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
const semesters = ["All", 1, 2, 3, 4, 5, 6];

const DOT_CLASSES = [
  "dot-indigo",
  "dot-sky",
  "dot-emerald",
  "dot-amber",
  "dot-rose",
];

const DEPT_SHORT = {
 "Computer Engineering": "CSE",
  "Mechanical Engineering": "MECH",
  "Civil Engineering": "CIVIL",
  "Electrical Engineering": "EEE",
  "Automation & Robotics": "AUTO  & ROBOT",
  "Automobile Engineering": "AUTO",
  "Information Technology": "IT",
  "Mechanical Engineering (CAD/CAM)": "MECH( CAD/CAM )",
  "Information & Communication Technology": "ICT",
  "Metallurgy": "MET",
  "Power Electronics": "PE",
  "Architecture": "ARCH"
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
      <button
        onClick={onClose}
        style={{
          marginLeft: "0.5rem",
          cursor: "pointer",
        }}
      >
        <X size={14} />
      </button>
    </div>
  );
}

function DeleteConfirmModal({ title, onClose, onConfirm }) {
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(15, 23, 42, 0.75)",
        backdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        padding: "1rem"
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        style={{
          background: "var(--color-background-soft, #1e293b)",
          border: "1px solid var(--color-border, #334155)",
          borderRadius: "var(--radius-lg, 12px)",
          width: "100%",
          maxWidth: "400px",
          overflow: "hidden",
          boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.3)"
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "1.25rem 1.5rem",
            borderBottom: "1px solid transparent"
          }}
        >
          <span
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              fontSize: "1.1rem",
              fontWeight: 700,
              color: "#ef4444"
            }}
          >
            <AlertCircle size={20} />
            Confirm Delete
          </span>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: "var(--color-text-muted, #94a3b8)",
              cursor: "pointer",
              padding: "0.25rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "4px",
              transition: "color 0.15s ease"
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = "var(--color-text, #f8fafc)"}
            onMouseLeave={(e) => e.currentTarget.style.color = "var(--color-text-muted, #94a3b8)"}
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: "0 1.5rem 1.5rem" }}>
          <p style={{ color: "var(--color-text-muted, #cbd5e1)", fontSize: "0.95rem", lineHeight: "1.5", margin: 0 }}>
            Are you sure you want to delete subject <strong style={{ color: "var(--color-text, #f8fafc)" }}>"{title}"</strong>?
          </p>
          <p style={{ color: "#ef4444", fontSize: "0.8rem", marginTop: "0.75rem", fontWeight: 600, margin: "0.75rem 0 0" }}>
            ⚠️ This action is permanent and cannot be undone.
          </p>
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "0.75rem",
            padding: "1rem 1.5rem 1.25rem",
            background: "rgba(0, 0, 0, 0.1)"
          }}
        >
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: "0.5rem 1rem",
              borderRadius: "6px",
              fontSize: "0.875rem",
              fontWeight: 600,
              background: "none",
              border: "1px solid var(--color-border, #334155)",
              color: "var(--color-text-muted, #94a3b8)",
              cursor: "pointer",
              transition: "all 0.15s ease"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
              e.currentTarget.style.color = "var(--color-text, #f8fafc)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "none";
              e.currentTarget.style.color = "var(--color-text-muted, #94a3b8)";
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            style={{
              padding: "0.5rem 1.25rem",
              borderRadius: "6px",
              fontSize: "0.875rem",
              fontWeight: 600,
              background: "#ef4444",
              border: "1px solid #ef4444",
              color: "#ffffff",
              cursor: "pointer",
              transition: "all 0.15s ease"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#dc2626";
              e.currentTarget.style.borderColor = "#dc2626";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#ef4444";
              e.currentTarget.style.borderColor = "#ef4444";
            }}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminManageSubjects() {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("All");
  const [toast, setToast] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [fieldError, setFieldError] = useState("");
  const [semesterFilter, setSemesterFilter] = useState("");
  const [form, setForm] = useState({
    subject_name: "",
    department: "Computer Engineering",
    semester: 1,
  });

  useEffect(() => {
    apiFetch("api/admin/subjects")
      .then((r) => r.json())
      .then((data) => {
        setSubjects(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Derived data
  const departments = ["All", ...DEPARTMENTS];
  const uniqueDepts = [...new Set(subjects.map((s) => s.department))];
  const totalSems = [...new Set(subjects.map((s) => s.semester))].length;

  const filtered = subjects.filter((s) => {
    const matchDept = deptFilter === "All" || s.department === deptFilter;

    const matchSemester =
      semesterFilter === "All" || String(s.semester) === String(semesterFilter);

    const matchSearch = s.subject_name
      .toLowerCase()
      .includes(search.toLowerCase());

    return matchDept && matchSemester && matchSearch;
  });

  // Handlers
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "semester" ? Number(value) : value,
    }));
    if (name === "subject_name") setFieldError("");
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.subject_name.trim()) {
      setFieldError("Subject name is required");
      return;
    }
    // Check duplicate in same dept+semester
    const dup = subjects.find(
      (s) =>
        s.subject_name.toLowerCase() ===
        form.subject_name.trim().toLowerCase() &&
        s.department === form.department &&
        s.semester === form.semester,
    );
    if (dup) {
      setFieldError(
        "This subject already exists for the selected department & semester",
      );
      return;
    }

    setSubmitted(true);

    try {
      const res = await apiFetch("api/admin/subjects", {
        method: "POST",
        body: JSON.stringify(form),
      });
      const newSub = await res.json();
      setSubjects((prev) => [...prev, newSub]);
      setForm({
        subject_name: "",
        department: "Computer Engineering",
        semester: 1,
      });
      setToast(`"${newSub.subject_name}" added successfully`);
    } catch {
      setToast("Failed to add subject — please try again");
    } finally {
      setSubmitted(false);
    }
  };

  const handleDelete = (id, name) => {
    setDeleteConfirm({ id, name });
  };

  const executeDelete = async () => {
    if (!deleteConfirm) return;
    const { id, name } = deleteConfirm;
    setDeleteConfirm(null);
    try {
      await apiFetch(`api/admin/subjects/${id}`, {
        method: "DELETE",
      });
      setSubjects((prev) => prev.filter((s) => s._id !== id));
      setToast(`"${name}" removed`);
    } catch {
      setToast("Delete failed — please try again");
    }
  };

  return (
    <AdminLayout>
      {/* ── Page header ── */}
      <div className="ams-page-header">
        <div>
          <h1 className="ams-page-title">Manage Subjects</h1>
          <p className="ams-page-sub">
            Add, view, and remove subjects for each department and semester
          </p>
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
              <BookOpen size={16} style={{ color: "var(--color-primary)" }} />
              All Subjects
              <span
                style={{
                  background: "rgba(74, 92, 106,0.08)",
                  color: "var(--color-primary)",
                  fontSize: "0.72rem",
                  fontWeight: 700,
                  padding: "0.15rem 0.5rem",
                  borderRadius: 99,
                }}
              >
                {filtered.length}
              </span>
            </span>
            <div className="ams-search-wrap">
              <Search size={14} className="ams-search-icon" />
              <input
                type="text"
                className="ams-search-input"
                placeholder="Search subjects…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Department filter tabs */}
          <div className="ams-dept-tabs">
            {departments.map((dept) => (
              <button
                key={dept}
                className={`ams-dept-tab ${deptFilter === dept ? "active" : ""}`}
                onClick={() => setDeptFilter(dept)}
              >
                {dept === "All" ? "All Departments" : DEPT_SHORT[dept] || dept}
                {dept !== "All" && (
                  <span style={{ opacity: 0.7, marginLeft: "0.25rem" }}>
                    ({subjects.filter((s) => s.department === dept).length})
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="ams-sem-filter">
            {semesters.map((sem) => (
              <button
                key={sem}
                className={`ams-sem-filter-btn ${semesterFilter === sem ? "active" : ""
                  }`}
                onClick={() => setSemesterFilter(sem)}
              >
                {sem === "" ? "" : `Sem ${sem}`}
              </button>
            ))}
          </div>
          <div className="ams-table-scroll">
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
                {search
                  ? `No subjects match "${search}"`
                  : "No subjects found."}
              </div>
            ) : (
              filtered.map((sub, i) => (
                <div key={sub._id} className="ams-row">
                  <div className="ams-subject-cell">
                    <span
                      className={`ams-subject-dot ${DOT_CLASSES[i % DOT_CLASSES.length]}`}
                    />
                    <span className="ams-subject-name">{sub.subject_name}</span>
                  </div>
                  <span className="ams-dept-badge">
                    {DEPT_SHORT[sub.department] || sub.department}
                  </span>
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
                className={`ams-input ${fieldError ? "error" : ""}`}
                placeholder="e.g. Data Structures"
                value={form.subject_name}
                onChange={handleFormChange}
                autoComplete="off"
              />
              {fieldError ? (
                <span className="ams-input-error">
                  <AlertCircle size={12} /> {fieldError}
                </span>
              ) : (
                <span className="ams-hint">
                  Use the full official subject name
                </span>
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
                {DEPARTMENTS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            {/* Semester selector */}
            <div className="ams-field">
              <label className="ams-label">
                <GraduationCap size={12} />
                Semester <span className="ams-required">*</span>
              </label>
              <div className="ams-sem-grid">
                {[1, 2, 3, 4, 5, 6].map((n) => (
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

            <button
              type="submit"
              className="ams-form-submit-btn"
              disabled={submitted}
            >
              {submitted ? (
                <>
                  <CheckCircle2 size={16} /> Adding…
                </>
              ) : (
                <>
                  <Plus size={16} /> Add Subject
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <DeleteConfirmModal
          title={deleteConfirm.name}
          onClose={() => setDeleteConfirm(null)}
          onConfirm={executeDelete}
        />
      )}

      {/* Toast */}
      {toast && <Toast message={toast} onClose={() => setToast("")} />}
    </AdminLayout>
  );
}
