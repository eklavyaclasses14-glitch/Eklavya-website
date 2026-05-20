import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../components/AdminLayout";
import {
  FileText,
  Search,
  Pencil,
  Trash2,
  Plus,
  X,
  CheckCircle2,
  Image,
  Link2,
  BookOpen,
  AlertCircle,
  Building2,
  GraduationCap,
  UploadCloud,
  File,
} from "lucide-react";
import { apiFetch } from "../utils/apiFetch";
import "../styles/AdminManageDocuments.css";

//  Validation
const validate = (field, value) => {
  if (field === "title") {
    if (!value.trim()) return "Title is required";
  }
  return "";
};

//  Toast
function Toast({ message, type = "success", onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [onClose]);
  return (
    <div className="amd-toast">
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
          border: "none",
        }}
      >
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
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: validate(name, value) }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setSelectedFile(file);
    const isPdf = file.type === "application/pdf";
    setForm((prev) => ({ ...prev, file_type: isPdf ? "pdf" : "image" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    ["title"].forEach((f) => {
      const err = validate(f, form[f] || "");
      if (err) newErrors[f] = err;
    });
    if (Object.keys(newErrors).length) {
      setErrors(newErrors);
      return;
    }

    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      const data = new FormData();
      data.append("title", form.title);
      data.append("file_type", form.file_type);
      if (selectedFile) {
        data.append("file", selectedFile);
      }

      const res = await apiFetch(
        `/api/admin/notes/${note._id}`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
          body: data,
        }
      );
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Update failed");
      }
      const updated = await res.json();
      onSave(updated);
    } catch {
      onSave(form); // optimistic fallback
    } finally {
      setSaving(false);
    }
  };

  const fieldClass = (name) =>
    `amd-modal-input${errors[name] ? " amd-modal-input-error" : ""}`;

  return (
    <div
      className="amd-modal-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="amd-modal">
        {/* Header */}
        <div className="amd-modal-header">
          <span className="amd-modal-title">
            <Pencil size={16} style={{ color: "var(--color-primary) " }} />
            Edit Document
          </span>

          <button className="amd-modal-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="amd-modal-body">
            {/* Title */}
            <div className="amd-modal-field">
              <label className="amd-modal-label">
                <FileText size={12} /> Document Title *
              </label>
              <input
                type="text"
                name="title"
                className={fieldClass("title")}
                value={form.title}
                onChange={handleChange}
                placeholder="e.g. Unit 3 Notes"
                autoComplete="off"
              />
              {errors.title && (
                <span
                  style={{
                    fontSize: "0.72rem",
                    color: "#ef4444",
                    marginTop: "0.1rem",
                  }}
                >
                  {errors.title}
                </span>
              )}
            </div>

            {/* Subject Info (read-only) */}
            <div className="amd-modal-row">
              <div className="amd-modal-field">
                <label className="amd-modal-label">
                  <BookOpen size={12} /> Subject
                </label>
                <input
                  type="text"
                  className="amd-modal-input"
                  value={form.subject_id?.subject_name || ""}
                  readOnly
                  style={{ opacity: 0.6, cursor: "not-allowed" }}
                />
              </div>
              <div className="amd-modal-field">
                <label className="amd-modal-label">File Type *</label>
                <select
                  name="file_type"
                  className="amd-modal-input"
                  value={form.file_type}
                  onChange={handleChange}
                >
                  <option value="pdf">PDF</option>
                  <option value="image">Image</option>
                </select>
              </div>
            </div>

            {/* File Upload Box */}
            <div className="amd-modal-field">
              <label className="amd-modal-label">
                <UploadCloud size={12} /> Replace Document File (Optional)
              </label>
              <label
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  padding: '1.5rem',
                  cursor: 'pointer',
                  border: `2px dashed ${selectedFile ? 'var(--color-primary)' : 'var(--color-border)'}`,
                  borderRadius: 'var(--radius-md, 8px)',
                  background: selectedFile ? 'rgba(74,92,106,0.08)' : 'transparent',
                  transition: 'all 0.2s ease',
                  marginTop: '0.5rem'
                }}
              >
                {selectedFile ? (
                  <>
                    {selectedFile.type === 'application/pdf' ? (
                      <File size={28} style={{ color: 'var(--color-primary)' }} />
                    ) : (
                      <Image size={28} style={{ color: 'var(--color-primary)' }} />
                    )}
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text)' }}>
                      {selectedFile.name}
                    </span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB (Click to change)
                    </span>
                  </>
                ) : (
                  <>
                    <UploadCloud size={28} style={{ color: 'var(--color-text-muted)' }} />
                    <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', textAlign: 'center' }}>
                      Click to upload a new PDF or Image file
                    </span>
                    <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', textAlign: 'center' }}>
                      Leaves the current file unchanged if empty
                    </span>
                  </>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,image/*"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />
              </label>
            </div>
          </div>

          <div className="amd-modal-footer">
            <button
              type="button"
              className="amd-modal-cancel"
              onClick={onClose}
            >
              Cancel
            </button>
            <button type="submit" className="amd-modal-save" disabled={saving}>
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

function DeleteConfirmModal({ title, onClose, onConfirm }) {
  return (
    <div
      className="amd-modal-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="amd-modal" style={{ maxWidth: '400px' }}>
        <div className="amd-modal-header" style={{ borderBottom: 'none', paddingBottom: '0.5rem' }}>
          <span className="amd-modal-title" style={{ color: '#ef4444', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertCircle size={20} />
            Confirm Delete
          </span>
          <button className="amd-modal-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="amd-modal-body" style={{ padding: '1.5rem', paddingTop: '0.5rem' }}>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem', lineHeight: '1.5' }}>
            Are you sure you want to delete <strong style={{ color: 'var(--color-text)' }}>"{title}"</strong>?
          </p>
          <p style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '0.75rem', fontWeight: 600 }}>
            ⚠️ This action is permanent and cannot be undone.
          </p>
        </div>

        <div className="amd-modal-footer" style={{ borderTop: 'none', paddingTop: '0.5rem' }}>
          <button
            type="button"
            className="amd-modal-cancel"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="button"
            className="amd-modal-save"
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

//  Main Page
export default function AdminManageDocuments() {
  const navigate = useNavigate();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("");
  const [semFilter, setSemFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [editing, setEditing] = useState(null);
  const [toast, setToast] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    if (!deptFilter && !semFilter) {
      setNotes([]);
      setTotalPages(1);
      return;
    }

    setLoading(true);
    const params = new URLSearchParams();
    if (deptFilter) params.append("department", deptFilter);
    if (semFilter) params.append("semester", semFilter);
    params.append("page", currentPage);
    params.append("limit", itemsPerPage);

    apiFetch(`api/admin/notes?${params.toString()}`)
      .then((r) => r.json())
      .then((data) => {
        setNotes(data.notes || []);
        setTotalPages(data.pages || 1);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [deptFilter, semFilter, currentPage]);

  const filtered = notes.filter((n) => {
    const matchSearch =
      n.title.toLowerCase().includes(search.toLowerCase()) ||
      (n.subject_id?.subject_name || "")
        .toLowerCase()
        .includes(search.toLowerCase());
    const matchType = typeFilter === "All" || n.file_type === typeFilter;
    return matchSearch && matchType;
  });

  // Pagination is now server-side
  const paginatedNotes = filtered;

  const handleDelete = (id, title) => {
    setDeleteConfirm({ id, title });
  };

  const executeDelete = async () => {
    if (!deleteConfirm) return;
    const { id, title } = deleteConfirm;
    setDeleteConfirm(null);
    try {
      await apiFetch(`http://localhost:5000/api/admin/notes/${id}`, {
        method: "DELETE",
      });
      setNotes((prev) => prev.filter((n) => n._id !== id));
      setToast({ message: `"${title}" deleted`, type: "success" });
    } catch {
      setToast({ message: "Delete failed — try again", type: "error" });
    }
  };

  const handleSave = useCallback((updated) => {
    setNotes((prev) => prev.map((n) => (n._id === updated._id ? updated : n)));
    setEditing(null);
    setToast({
      message: `"${updated.title}" updated successfully`,
      type: "success",
    });
  }, []);

  return (
    <AdminLayout>
      {/*  Header  */}
      <div className="amd-students-header">
        <div>
          <h1 className="amd-students-title">Manage Documents</h1>
          <p className="amd-students-sub">
            View, edit, and remove study materials
          </p>
        </div>
        <button
          className="amd-add-new-btn"
          onClick={() => navigate("/admin/notes/upload")}
        >
          <Plus size={16} /> Upload Document
        </button>
      </div>

      {/*  Filters & Stats Wrapper  */}
      <div className="amd-filters-section" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '2rem' }}>

        {/* Stats */}
        <div className="amd-students-stats" style={{ marginBottom: 0 }}>
          <div className="amd-stat-card indigo">
            <div className="amd-stat-value">{notes.length}</div>
            <div className="amd-stat-label">Total Documents</div>
          </div>
          <div className="amd-stat-card sky">
            <div className="amd-stat-value">
              {notes.filter((n) => n.file_type === "pdf").length}
            </div>
            <div className="amd-stat-label">PDF Files</div>
          </div>
          <div className="amd-stat-card emerald">
            <div className="amd-stat-value">
              {notes.filter((n) => n.file_type === "image").length}
            </div>
            <div className="amd-stat-label">Image Files</div>
          </div>
          <div className="amd-stat-card amber">
            <div className="amd-stat-value">
              {[...new Set(notes.map((n) => n.subject_id?._id))].length}
            </div>
            <div className="amd-stat-label">Subjects</div>
          </div>
        </div>

        {/* Global Filters */}
        <div className="amd-global-filters" style={{
          display: 'flex',
          gap: '1rem',
          background: 'var(--color-surface)',
          padding: '1.25rem',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-border)',
          alignItems: 'center',
          flexWrap: 'wrap'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
            <Building2 size={18} /> Department:
          </div>
          <select
            className="amd-filter-select"
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            style={{ minWidth: '200px' }}
          >
            <option value="">Select Department</option>
            {FILTER_DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
          </select>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-muted)', fontSize: '0.9rem', marginLeft: '1rem' }}>
            <GraduationCap size={18} /> Semester:
          </div>
          <select
            className="amd-filter-select"
            value={semFilter}
            onChange={(e) => setSemFilter(e.target.value)}
            style={{ minWidth: '150px' }}
          >
            <option value="">Select Semester</option>
            {[1, 2, 3, 4, 5, 6, 7, 8].map(s => <option key={s} value={s}>Semester {s}</option>)}
          </select>

          <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.5rem' }}>
            {(deptFilter || semFilter) && (
              <button
                className="amd-filter-reset"
                onClick={() => { setDeptFilter(""); setSemFilter(""); setNotes([]); }}
                style={{
                  fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem'
                }}
              >
                <X size={14} /> Reset Filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/*  Table card  */}
      <div className="amd-table-card">
        {/* Toolbar */}
        <div className="amd-toolbar">
          <span className="amd-toolbar-title">
            <FileText size={16} style={{ color: "var(--color-primary)" }} />
            Results
            <span className="amd-count-pill">{filtered.length}</span>
          </span>

          {/* Search */}
          <div className="amd-search-wrap">
            <Search size={14} className="amd-search-icon" />
            <input
              type="text"
              className="amd-search-input"
              placeholder="Search in results…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              disabled={!notes.length}
            />
          </div>

          {/* Type filter */}
          <select
            className="amd-filter-select"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            disabled={!notes.length}
          >
            <option value="All">All Types</option>
            <option value="pdf">PDF</option>
            <option value="image">Image</option>
          </select>
        </div>

        {/* Card Grid */}
        <div
          className="amd-card-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "1.5rem",
            padding: "1.5rem",
            minHeight: '300px'
          }}
        >
          {loading ? (
            <div className="amd-empty" style={{ gridColumn: "1 / -1" }}>
              <div className="sd-spinner" style={{ margin: '0 auto 1rem' }}></div>
              Loading documents…
            </div>
          ) : !deptFilter && !semFilter ? (
            <div className="amd-empty" style={{ gridColumn: "1 / -1" }}>
              <Search size={48} style={{ margin: '0 auto 1rem', opacity: 0.2, display: 'block' }} />
              Please select <b>Department</b> and <b>Semester</b> to fetch documents.
            </div>
          ) : paginatedNotes.length === 0 ? (
            <div className="amd-empty" style={{ gridColumn: "1 / -1" }}>
              {search || typeFilter !== "All"
                ? "No documents match your search filters."
                : "No documents found for this criteria."}
            </div>
          ) : (
            paginatedNotes.map((note) => (
              <div
                key={note._id}
                className="admin-info-card"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  height: "100%",
                }}
              >
                <div
                  className="admin-info-card-body"
                  style={{ flex: 1, textAlign: "center", padding: "1.5rem" }}
                >
                  <div
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: "var(--radius-lg)",
                      background:
                        note.file_type === "pdf"
                          ? "rgba(239,68,68,0.1)"
                          : "rgba(14,165,233,0.1)",
                      color:
                        note.file_type === "pdf"
                          ? "#ef4444"
                          : "var(--color-primary)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto",
                    }}
                  >
                    {note.file_type === "pdf" ? (
                      <FileText size={28} />
                    ) : (
                      <Image size={28} />
                    )}
                  </div>
                  <h3
                    style={{
                      fontWeight: 700,
                      fontSize: "1rem",
                      color: "var(--color-text)",
                      marginTop: "1rem",
                    }}
                  >
                    {note.title}
                  </h3>
                  <p
                    style={{
                      fontSize: "0.8rem",
                      color: "var(--color-text-muted)",
                      marginTop: "0.5rem",
                    }}
                  >
                    {note.subject_id?.subject_name} · Sem{" "}
                    {note.subject_id?.semester}
                  </p>
                  <div
                    style={{
                      marginTop: "1rem",
                      display: "flex",
                      justifyContent: "center",
                      gap: "0.5rem",
                    }}
                  >
                    <span className="amd-dept-tag">
                      {note.file_type.toUpperCase()}
                    </span>
                    <a
                      href={note.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="amd-dept-tag"
                      style={{
                        background: "rgba(52,211,153,0.1)",
                        color: "#059669",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.25rem",
                      }}
                    >
                      <Link2 size={12} /> View
                    </a>
                  </div>
                </div>
                <div
                  style={{
                    padding: "1rem",
                    borderTop: "1px solid var(--color-border)",
                    display: "flex",
                    justifyContent: "center",
                    gap: "1rem",
                    background: "var(--color-background)",
                  }}
                >
                  <button
                    className="amd-btn-edit"
                    onClick={() => setEditing(note)}
                    title="Edit document"
                  >
                    <Pencil size={14} /> Edit
                  </button>
                  <button
                    className="amd-btn-delete"
                    onClick={() => handleDelete(note._id, note.title)}
                    title="Delete document"
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="amd-pagination" style={{
            padding: '1.5rem',
            borderTop: '1px solid var(--color-border)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '1rem'
          }}>
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => prev - 1)}
              className="amd-page-btn"
            >
              Previous
            </button>
            <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>
              Page {currentPage} of {totalPages}
            </span>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => prev + 1)}
              className="amd-page-btn"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/*  Edit Modal  */}
      {
        editing && (
          <EditModal
            note={editing}
            onClose={() => setEditing(null)}
            onSave={handleSave}
          />
        )
      }

      {/* Delete Confirmation Modal */}
      {
        deleteConfirm && (
          <DeleteConfirmModal
            title={deleteConfirm.title}
            onClose={() => setDeleteConfirm(null)}
            onConfirm={executeDelete}
          />
        )
      }

      {/*  Toast  */}
      {
        toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )
      }
    </AdminLayout >
  );
}
