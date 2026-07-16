import { useState, useEffect } from "react";
import AdminLayout from "../components/AdminLayout";
import { Building2, Plus, Search, Trash2, CheckCircle2, AlertCircle, X, Pencil } from "lucide-react";
import { apiFetch } from "../utils/apiFetch";
import "../styles/AdminManageSubjects.css"; // Reuse subjects CSS for layout

function Toast({ message, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div className="ams-toast">
      <CheckCircle2 size={16} color="#34d399" />
      {message}
      <button onClick={onClose} style={{ marginLeft: "0.5rem", cursor: "pointer" }}>
        <X size={14} />
      </button>
    </div>
  );
}

export default function AdminManageDepartments() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [fieldError, setFieldError] = useState("");
  const [form, setForm] = useState({ name: "", short_name: "" });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = () => {
    apiFetch("/api/admin/departments")
      .then((r) => r.json())
      .then((data) => {
        setDepartments(data);
        setLoading(false);
      });
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setFieldError("");
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.short_name.trim()) {
      setFieldError("Both full name and short name are required.");
      return;
    }

    setSubmitted(true);
    try {
      const url = editingId ? `/api/admin/departments/${editingId}` : "/api/admin/departments";
      const method = editingId ? "PUT" : "POST";
      
      const res = await apiFetch(url, {
        method,
        body: JSON.stringify({
          name: form.name.trim(),
          short_name: form.short_name.trim(),
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to save");
      }

      setToast(editingId ? "Department updated successfully" : "Department added successfully");
      setForm({ name: "", short_name: "" });
      setEditingId(null);
      fetchDepartments(); // refresh list
    } catch (err) {
      setFieldError(err.message);
    } finally {
      setSubmitted(false);
    }
  };

  const handleEdit = (dept) => {
    setForm({ name: dept.name, short_name: dept.short_name });
    setEditingId(dept._id);
    setFieldError("");
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;
    
    try {
      const res = await apiFetch(`/api/admin/departments/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      setToast(`"${name}" deleted`);
      fetchDepartments();
    } catch (err) {
      alert(err.message);
    }
  };

  const filtered = departments.filter(d => 
    d.name.toLowerCase().includes(search.toLowerCase()) || 
    d.short_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="ams-header">
        <div>
          <h1 className="ams-page-title">Manage Departments</h1>
          <p className="ams-page-sub">Add, edit, and remove departments globally</p>
        </div>
      </div>

      <div className="ams-stats-strip">
        <div className="ams-stat-pill">
          <div className="ams-stat-pill-value">{departments.length}</div>
          <div className="ams-stat-pill-label">Total Departments</div>
        </div>
      </div>

      <div className="ams-layout">
        {/* Table */}
        <div className="ams-table-card">
          <div className="ams-table-toolbar">
            <span className="ams-table-title">
              <Building2 size={16} style={{ color: "var(--color-primary)" }} />
              All Departments
            </span>
            <div className="ams-search-wrap">
              <Search size={14} className="ams-search-icon" />
              <input
                type="text"
                className="ams-search-input"
                placeholder="Search departments…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="ams-table-scroll">
            <div className="ams-row ams-row-header" style={{ gridTemplateColumns: "2fr 1fr 1fr" }}>
              <span>Full Name</span>
              <span>Short Name</span>
              <span>Actions</span>
            </div>
            {loading ? (
              <div className="ams-empty">Loading departments…</div>
            ) : filtered.length === 0 ? (
              <div className="ams-empty">No departments found.</div>
            ) : (
              filtered.map((d) => (
                <div key={d._id} className="ams-row" style={{ gridTemplateColumns: "2fr 1fr 1fr" }}>
                  <div className="ams-subject-cell">
                    <span className="ams-subject-name">{d.name}</span>
                  </div>
                  <span className="ams-dept-badge">{d.short_name}</span>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="ams-edit-btn" onClick={() => handleEdit(d)} style={{ background: 'none', border: 'none', color: '#60a5fa', cursor: 'pointer' }}>
                      <Pencil size={14} />
                    </button>
                    <button className="ams-delete-btn" onClick={() => handleDelete(d._id, d.name)} title="Delete department">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Form */}
        <div className="ams-form-card">
          <div className="ams-form-header">
            <div className="ams-form-header-icon stat-icon-indigo">
              {editingId ? <Pencil size={16} /> : <Plus size={16} />}
            </div>
            <span className="ams-form-title">{editingId ? "Edit Department" : "Add New Department"}</span>
          </div>

          <form className="ams-form-body" onSubmit={handleSave} noValidate>
            <div className="ams-field">
              <label className="ams-label">
                <Building2 size={12} />
                Full Department Name <span className="ams-required">*</span>
              </label>
              <input
                type="text"
                name="name"
                className={`ams-input ${fieldError && !form.name ? "error" : ""}`}
                placeholder="e.g. Computer Engineering"
                value={form.name}
                onChange={handleFormChange}
              />
            </div>

            <div className="ams-field">
              <label className="ams-label">
                <Building2 size={12} />
                Short Name / Code <span className="ams-required">*</span>
              </label>
              <input
                type="text"
                name="short_name"
                className={`ams-input ${fieldError && !form.short_name ? "error" : ""}`}
                placeholder="e.g. CSE"
                value={form.short_name}
                onChange={handleFormChange}
              />
              {fieldError ? (
                <span className="ams-input-error"><AlertCircle size={12} /> {fieldError}</span>
              ) : (
                <span className="ams-hint">Used for badges and tags</span>
              )}
            </div>

            <button type="submit" className="ams-form-submit-btn" disabled={submitted}>
              {submitted ? (
                <><CheckCircle2 size={16} /> Saving…</>
              ) : (
                <>{editingId ? <Pencil size={16} /> : <Plus size={16} />} {editingId ? "Save Changes" : "Add Department"}</>
              )}
            </button>

            {editingId && (
              <button type="button" onClick={() => { setEditingId(null); setForm({ name: "", short_name: "" }); setFieldError(""); }} style={{ background: 'none', color: '#94a3b8', border: 'none', cursor: 'pointer', marginTop: '1rem', width: '100%' }}>
                Cancel Edit
              </button>
            )}
          </form>
        </div>
      </div>

      {toast && <Toast message={toast} onClose={() => setToast("")} />}
    </AdminLayout>
  );
}
