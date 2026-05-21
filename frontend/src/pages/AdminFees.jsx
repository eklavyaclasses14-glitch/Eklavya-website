import { useState, useEffect } from "react";
import AdminLayout from "../components/AdminLayout";
import { Plus, Trash2, Check, X, Users, Pencil, AlertCircle, ChevronDown } from "lucide-react";
import { apiFetch } from "../utils/apiFetch";
import "../styles/AdminForms.css";

// ─── constants ───────────────────────────────────────────────────────────────

const emptyForm = {
  student_id: "",
  department: "",
  semester: 1,
  amount: "",
  paid_amount: 0,
  due_date: "",
  status: "Pending",
  description: "",
  payment_date: "",
  transaction_id: "",
};

const emptyBulk = {
  department: "",
  semester: 1,
  amount: "",
  due_date: "",
  description: "",
};

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

const badgeClass = (s) =>
  s === "Paid"
    ? "badge badge-paid"
    : s === "Partial Paid"
      ? "badge"
      : s === "Pending"
        ? "badge badge-pending"
        : "badge badge-overdue";

const getBadgeStyle = (s) => {
  if (s === "Partial Paid") {
    return { backgroundColor: "rgba(245,158,11,0.15)", color: "#d97706" };
  }
  return {};
}

/** Format a Date/ISO string → YYYY-MM-DD for <input type="date"> */
const toDateInput = (val) => {
  if (!val) return "";
  return new Date(val).toISOString().slice(0, 10);
};

// ─── apiFetch wrapper that always sends JSON ──────────────────────────────────
const jsonFetch = (url, options = {}) =>
  apiFetch(url, {
    ...options,
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
  });

// ─── component ────────────────────────────────────────────────────────────────

export default function AdminFees() {
  const [fees, setFees] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [modal, setModal] = useState(null);
  const [editId, setEditId] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const [formData, setFormData] = useState(emptyForm);
  const [bulkForm, setBulkForm] = useState(emptyBulk);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  // ── data ────────────────────────────────────────────────────────────────────

  const fetchData = async () => {
    try {
      const [resFees, resStudents] = await Promise.all([
        jsonFetch("api/admin/fees"),
        jsonFetch("api/admin/students?limit=1000"), // Need students for dropdowns
      ]);
      
      const feesData = await resFees.json();
      const studentsData = await resStudents.json();
      
      setFees(feesData);
      setStudents(studentsData.students || []);
    } catch (err) {
      console.error("fetchData error:", err);
    }
  };

  // ── open/close modals ────────────────────────────────────────────────────────

  const openAdd = () => {
    setError("");
    const firstStudent = students[0];
    setFormData({
      ...emptyForm,
      student_id: firstStudent?._id || "",
      department: firstStudent?.department || "",
    });
    setModal("add");
  };

  const openEdit = (fee) => {
    setError("");
    setEditId(fee._id);
    setFormData({
      // Check if student_id is an object (populated) or just an ID
      student_id: fee.student_id?._id || fee.student_id || "",
      department: fee.student_id?.department || fee.department || "",
      semester: fee.semester || fee.student_id?.semester || 1,
      amount: fee.amount ?? "",
      paid_amount: fee.paid_amount ?? 0,
      due_date: toDateInput(fee.due_date),
      status: fee.status || "Pending",
      description: fee.description || "",
      payment_date: toDateInput(fee.payment_date),
      transaction_id: fee.transaction_id || "",
    });
    setModal("edit");
  };

  const closeModal = () => {
    setModal(null);
    setEditId(null);
    setError("");
    setSearch("");
    setFormData(emptyForm);
    setBulkForm(emptyBulk);
  };

  // ── single add ───────────────────────────────────────────────────────────────

  const handleAddFee = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await jsonFetch("api/admin/fees", {
        method: "POST",
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to add fee.");
        return;
      }
      closeModal();
      fetchData();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── edit (PUT) ───────────────────────────────────────────────────────────────

  const handleEditFee = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await jsonFetch(
        `api/admin/fees/${editId}`,
        {
          method: "PUT",
          body: JSON.stringify(formData),
        },
      );
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to update fee.");
        return;
      }
      closeModal();
      fetchData();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── bulk add ─────────────────────────────────────────────────────────────────

  const handleBulkAdd = async (e) => {
    e.preventDefault();
    if (!bulkForm.department || !bulkForm.semester) {
      setError("Department and Semester are required.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await jsonFetch("api/admin/fees/bulk", {
        method: "POST",
        body: JSON.stringify(bulkForm),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to create bulk fees.");
        return;
      }
      alert(data.message || `${data.count} record(s) created.`);
      closeModal();
      fetchData();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── status / delete ──────────────────────────────────────────────────────────

  const updateStatus = async (id, status, fullAmount) => {
    try {
      const res = await jsonFetch(
        `api/admin/fees/${id}`,
        {
          method: "PUT",
          body: JSON.stringify({
            status,
            ...(status === "Paid" ? { paid_amount: fullAmount, payment_date: new Date().toISOString() } : {}),
          }),
        },
      );
      if (!res.ok) {
        const d = await res.json();
        alert(d.error || "Failed to update.");
        return;
      }
      fetchData();
    } catch {
      alert("Network error.");
    }
  };

  const handleDelete = (id, studentName) => {
    setDeleteConfirm({ id, studentName });
  };

  const executeDelete = async () => {
    if (!deleteConfirm) return;
    const { id } = deleteConfirm;
    setDeleteConfirm(null);
    try {
      await jsonFetch(`api/admin/fees/${id}`, {
        method: "DELETE",
      });
      fetchData();
    } catch {
      alert("Failed to delete.");
    }
  };

  // ── shared form field setter helpers ────────────────────────────────────────

  const setField = (key) => (e) =>
    setFormData((p) => ({ ...p, [key]: e.target.value }));
  const setBulkField = (key) => (e) =>
    setBulkForm((p) => ({ ...p, [key]: e.target.value }));

  // ── render ───────────────────────────────────────────────────────────────────

  return (
    <AdminLayout>
      <div className="admin-form-page">
        {/* ── page header ── */}
        <div className="admin-fees-header">
          <div>
            <h1 className="admin-form-page-title">Manage Student Fees</h1>
            <p className="admin-form-page-sub">
              Track payments, dues, and overdue fees
            </p>
          </div>
          <div className="admin-fees-actions" style={{ position: "relative" }}>
            {/* Invisible overlay to close menu when clicking outside */}
            {isMenuOpen && (
              <div 
                style={{ position: "fixed", inset: 0, zIndex: 40 }} 
                onClick={() => setIsMenuOpen(false)}
              ></div>
            )}
            
            <button
              className="admin-add-new-btn"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              style={{ padding: "0.6rem 1.25rem", borderRadius: "8px", display: "flex", gap: "0.5rem", alignItems: "center", position: "relative" }}
            >
              Actions <ChevronDown size={16} style={{ transform: isMenuOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }} />
            </button>
            
            {isMenuOpen && (
              <div 
                style={{
                  position: "absolute",
                  top: "calc(100% + 0.5rem)",
                  right: 0,
                  background: "var(--color-surface)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "10px",
                  boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
                  minWidth: "220px",
                  zIndex: 50,
                  display: "flex",
                  flexDirection: "column",
                  overflow: "hidden"
                }}
              >
                <button
                  type="button"
                  style={{
                    padding: "0.85rem 1.25rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                    background: "none",
                    border: "none",
                    borderBottom: "1px solid var(--color-border)",
                    cursor: "pointer",
                    textAlign: "left",
                    color: "var(--color-text)",
                    fontSize: "0.95rem",
                    fontWeight: 600,
                    transition: "all 0.2s"
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "var(--color-background-soft)"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "none"}
                  onClick={() => {
                    setIsMenuOpen(false);
                    setError("");
                    setBulkForm(emptyBulk);
                    setModal("bulk");
                  }}
                >
                  <Users size={18} style={{ color: "#3b82f6" }} /> Create Fees Rule
                </button>
                <button
                  type="button"
                  style={{
                    padding: "0.85rem 1.25rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    textAlign: "left",
                    color: "var(--color-text)",
                    fontSize: "0.95rem",
                    fontWeight: 600,
                    transition: "all 0.2s"
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "var(--color-background-soft)"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "none"}
                  onClick={() => {
                    setIsMenuOpen(false);
                    openAdd();
                  }}
                >
                  <Plus size={18} style={{ color: "#10b981" }} /> Add Fee Record
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ── table ── */}
        <div className="admin-table-wrapper" style={{ marginTop: "2rem" }}>
          <div className="admin-table-card">
            <table>
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Dept/Sem</th>
                  <th>Amount</th>
                  <th>Paid Amount</th>
                  <th>Remaining</th>
                  <th>Due Date</th>
                  <th>Status</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {fees.length === 0 && (
                  <tr>
                    <td colSpan={8} className="empty-state">
                      No fee records found.
                    </td>
                  </tr>
                )}
                {fees.map((f) => {
                  const remaining = (f.amount || 0) - (f.paid_amount || 0);
                  return (
                  <tr key={f._id}>
                    <td>
                      <div className="student-name">{f.student_id?.name}</div>
                      <div className="student-id">{f.student_id?.user_id}</div>
                    </td>
                    <td>
                      <div style={{ fontSize: "0.85rem", color: "var(--color-text-muted)" }}>
                        {f.department || "—"}
                      </div>
                      <div style={{ fontSize: "0.85rem", fontWeight: 600 }}>
                        Sem {f.semester || 1}
                      </div>
                    </td>
                    <td style={{ fontWeight: 600 }}>
                      ₹{f.amount?.toLocaleString()}
                    </td>
                    <td style={{ fontWeight: 600, color: "#10b981" }}>
                      ₹{f.paid_amount?.toLocaleString() || 0}
                    </td>
                    <td style={{ fontWeight: 600, color: remaining > 0 ? "#ef4444" : "inherit" }}>
                      ₹{remaining.toLocaleString()}
                    </td>
                    <td>{new Date(f.due_date).toLocaleDateString()}</td>
                    <td>
                      <span className={badgeClass(f.status)} style={getBadgeStyle(f.status)}>{f.status}</span>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "flex-end",
                          gap: "0.2rem",
                        }}
                      >
                        {f.status !== "Paid" && (
                          <button
                            className="icon-btn icon-btn--success"
                            onClick={() => updateStatus(f._id, "Paid", f.amount)}
                            title="Mark as Full Paid"
                          >
                            <Check size={16} />
                          </button>
                        )}
                        <button
                          className="icon-btn icon-btn--edit"
                          onClick={() => openEdit(f)}
                          title="Edit"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          className="icon-btn icon-btn--danger"
                          onClick={() => handleDelete(f._id, f.student_id?.name || "Student")}
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )})}
              </tbody>
            </table>
          </div>

          {modal === "add" && (
            <div className="modal-overlay" onClick={closeModal} style={{ padding: "1rem" }}>
              <div 
                className="modal-box" 
                onClick={(e) => e.stopPropagation()} 
                style={{ 
                  padding: 0, 
                  overflow: "hidden", 
                  maxWidth: "480px", 
                  background: "#0f172a", 
                  border: "1px solid rgba(255,255,255,0.08)", 
                  boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)" 
                }}
              >
                <div style={{ padding: "1.5rem 1.5rem 1rem", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <h2 style={{ margin: 0, fontSize: "1.25rem", fontWeight: 700, color: "#f8fafc" }}>Add Fee Record</h2>
                    <button onClick={closeModal} style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: "0.25rem", borderRadius: "0.375rem" }} onMouseEnter={(e) => e.currentTarget.style.color = "#f8fafc"} onMouseLeave={(e) => e.currentTarget.style.color = "#94a3b8"}>
                      <X size={20} />
                    </button>
                  </div>
                  <p style={{ margin: "0.5rem 0 0", fontSize: "0.875rem", color: "#94a3b8" }}>Create a new individual fee record for a student.</p>
                </div>

                <div style={{ padding: "1.5rem", maxHeight: "calc(100vh - 12rem)", overflowY: "auto" }}>
                  {error && (
                    <div style={{ padding: "0.75rem", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: "8px", color: "#ef4444", fontSize: "0.875rem", marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <AlertCircle size={16} /> {error}
                    </div>
                  )}

                  <form onSubmit={handleAddFee} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                      <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>Student</label>
                      <select
                        style={{ width: "100%", padding: "0.75rem 1rem", background: "#1e293b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#f8fafc", fontSize: "0.95rem", outline: "none", appearance: "none" }}
                        value={formData.student_id}
                        onChange={(e) => {
                          const student = students.find((s) => s._id === e.target.value);
                          setFormData((prev) => ({ 
                            ...prev, 
                            student_id: e.target.value, 
                            department: student?.department || "",
                            semester: student?.semester || 1
                          }));
                        }}
                        required
                      >
                        <option value="">— Select student —</option>
                        {students.map((s) => (
                          <option key={s._id} value={s._id}>{s.name} ({s.user_id})</option>
                        ))}
                      </select>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                        <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>Department</label>
                        <input type="text" style={{ width: "100%", padding: "0.75rem 1rem", background: "rgba(30,41,59,0.5)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "8px", color: "#94a3b8", fontSize: "0.95rem", outline: "none", boxSizing: "border-box" }} value={formData.department} readOnly />
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                        <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>Semester</label>
                        <select style={{ width: "100%", padding: "0.75rem 1rem", background: "rgba(30,41,59,0.5)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "8px", color: "#94a3b8", fontSize: "0.95rem", outline: "none", appearance: "none" }} value={formData.semester} disabled>
                          {[1, 2, 3, 4, 5, 6].map((sem) => <option key={sem} value={sem}>Semester {sem}</option>)}
                        </select>
                      </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                        <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>Amount (₹)</label>
                        <input type="number" placeholder="5000" min="0" style={{ width: "100%", padding: "0.75rem 1rem", background: "#1e293b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#f8fafc", fontSize: "0.95rem", outline: "none", boxSizing: "border-box" }} value={formData.amount} onChange={setField("amount")} required />
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                        <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>Due Date</label>
                        <input type="date" style={{ width: "100%", padding: "0.75rem 1rem", background: "#1e293b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#f8fafc", fontSize: "0.95rem", outline: "none", boxSizing: "border-box" }} value={formData.due_date} onChange={setField("due_date")} required />
                      </div>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                      <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>Description</label>
                      <input type="text" placeholder="e.g. Tuition Fee – Term 1" style={{ width: "100%", padding: "0.75rem 1rem", background: "#1e293b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#f8fafc", fontSize: "0.95rem", outline: "none", boxSizing: "border-box" }} value={formData.description} onChange={setField("description")} />
                    </div>

                    <div style={{ marginTop: "1rem", paddingTop: "1.25rem", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                      <button type="submit" disabled={loading} style={{ width: "100%", padding: "0.875rem", background: "linear-gradient(135deg, #10b981, #059669)", color: "white", border: "none", borderRadius: "8px", fontSize: "0.95rem", fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1, transition: "opacity 0.2s" }}>
                        {loading ? "Saving…" : "Add Fee Record"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}

          {modal === "edit" && (
            <div className="modal-overlay" onClick={closeModal} style={{ padding: "1rem" }}>
              <div 
                className="modal-box" 
                onClick={(e) => e.stopPropagation()} 
                style={{ 
                  padding: 0, 
                  overflow: "hidden", 
                  maxWidth: "480px", 
                  background: "#0f172a", 
                  border: "1px solid rgba(255,255,255,0.08)", 
                  boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)" 
                }}
              >
                <div style={{ padding: "1.5rem 1.5rem 1rem", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <h2 style={{ margin: 0, fontSize: "1.25rem", fontWeight: 700, color: "#f8fafc" }}>Edit Fee Record</h2>
                    <button onClick={closeModal} style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: "0.25rem", borderRadius: "0.375rem" }} onMouseEnter={(e) => e.currentTarget.style.color = "#f8fafc"} onMouseLeave={(e) => e.currentTarget.style.color = "#94a3b8"}>
                      <X size={20} />
                    </button>
                  </div>
                </div>

                <div style={{ padding: "1.5rem", maxHeight: "calc(100vh - 12rem)", overflowY: "auto" }}>
                  {error && (
                    <div style={{ padding: "0.75rem", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: "8px", color: "#ef4444", fontSize: "0.875rem", marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <AlertCircle size={16} /> {error}
                    </div>
                  )}

                  <form onSubmit={handleEditFee} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                      <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>Student</label>
                      <select style={{ width: "100%", padding: "0.75rem 1rem", background: "rgba(30,41,59,0.5)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "8px", color: "#94a3b8", fontSize: "0.95rem", outline: "none", appearance: "none" }} value={formData.student_id} disabled>
                        <option value="">— Select student —</option>
                        {students.map((s) => <option key={s._id} value={s._id}>{s.name} ({s.user_id})</option>)}
                      </select>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                        <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>Department</label>
                        <input type="text" style={{ width: "100%", padding: "0.75rem 1rem", background: "rgba(30,41,59,0.5)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "8px", color: "#94a3b8", fontSize: "0.95rem", outline: "none", boxSizing: "border-box" }} value={formData.department} readOnly />
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                        <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>Semester</label>
                        <select style={{ width: "100%", padding: "0.75rem 1rem", background: "rgba(30,41,59,0.5)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "8px", color: "#94a3b8", fontSize: "0.95rem", outline: "none", appearance: "none" }} value={formData.semester} disabled>
                          {[1, 2, 3, 4, 5, 6].map((sem) => <option key={sem} value={sem}>Semester {sem}</option>)}
                        </select>
                      </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                        <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>Total Amount (₹)</label>
                        <input type="number" min="0" style={{ width: "100%", padding: "0.75rem 1rem", background: "#1e293b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#f8fafc", fontSize: "0.95rem", outline: "none", boxSizing: "border-box" }} value={formData.amount} onChange={setField("amount")} required />
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                        <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>Due Date</label>
                        <input type="date" style={{ width: "100%", padding: "0.75rem 1rem", background: "#1e293b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#f8fafc", fontSize: "0.95rem", outline: "none", boxSizing: "border-box" }} value={formData.due_date} onChange={setField("due_date")} required />
                      </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", padding: "1rem", background: "rgba(16,185,129,0.03)", border: "1px dashed rgba(16,185,129,0.3)", borderRadius: "8px" }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                        <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "#10b981", textTransform: "uppercase", letterSpacing: "0.05em" }}>Paid Amount (₹)</label>
                        <input type="number" min="0" style={{ width: "100%", padding: "0.75rem 1rem", background: "#1e293b", border: "1px solid rgba(16,185,129,0.4)", borderRadius: "8px", color: "#10b981", fontSize: "0.95rem", outline: "none", boxSizing: "border-box" }} value={formData.paid_amount} onChange={setField("paid_amount")} required />
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                        <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>Remaining (₹)</label>
                        <input type="number" style={{ width: "100%", padding: "0.75rem 1rem", background: "rgba(30,41,59,0.5)", border: "1px solid transparent", borderRadius: "8px", color: ((formData.amount || 0) - (formData.paid_amount || 0)) > 0 ? '#ef4444' : '#10b981', fontWeight: 700, fontSize: "0.95rem", outline: "none", boxSizing: "border-box" }} value={(formData.amount || 0) - (formData.paid_amount || 0)} readOnly />
                      </div>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                      <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>Description</label>
                      <input type="text" style={{ width: "100%", padding: "0.75rem 1rem", background: "#1e293b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#f8fafc", fontSize: "0.95rem", outline: "none", boxSizing: "border-box" }} value={formData.description} onChange={setField("description")} />
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                        <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>Payment Date</label>
                        <input type="date" style={{ width: "100%", padding: "0.75rem 1rem", background: "#1e293b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#f8fafc", fontSize: "0.95rem", outline: "none", boxSizing: "border-box" }} value={formData.payment_date} onChange={setField("payment_date")} />
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                        <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>Transaction ID</label>
                        <input type="text" placeholder="TXN123..." style={{ width: "100%", padding: "0.75rem 1rem", background: "#1e293b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#f8fafc", fontSize: "0.95rem", outline: "none", boxSizing: "border-box" }} value={formData.transaction_id} onChange={setField("transaction_id")} />
                      </div>
                    </div>

                    <div style={{ marginTop: "0.5rem", paddingTop: "1.25rem", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                      <button type="submit" disabled={loading} style={{ width: "100%", padding: "0.875rem", background: "linear-gradient(135deg, #3b82f6, #2563eb)", color: "white", border: "none", borderRadius: "8px", fontSize: "0.95rem", fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1, transition: "opacity 0.2s" }}>
                        {loading ? "Updating…" : "Update Fee Record"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}

          {modal === "bulk" && (
            <div className="modal-overlay" onClick={closeModal} style={{ padding: "1rem" }}>
              <div 
                className="modal-box" 
                onClick={(e) => e.stopPropagation()} 
                style={{ 
                  padding: 0, 
                  overflow: "hidden", 
                  maxWidth: "480px", 
                  background: "#0f172a", 
                  border: "1px solid rgba(255,255,255,0.08)", 
                  boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)" 
                }}
              >
                <div style={{ padding: "1.5rem 1.5rem 1rem", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                      <div style={{ width: "36px", height: "36px", borderRadius: "8px", background: "rgba(59,130,246,0.1)", color: "#3b82f6", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Users size={18} />
                      </div>
                      <h2 style={{ margin: 0, fontSize: "1.25rem", fontWeight: 700, color: "#f8fafc" }}>Create Fees Rule</h2>
                    </div>
                    <button onClick={closeModal} style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: "0.25rem", borderRadius: "0.375rem" }} onMouseEnter={(e) => e.currentTarget.style.color = "#f8fafc"} onMouseLeave={(e) => e.currentTarget.style.color = "#94a3b8"}>
                      <X size={20} />
                    </button>
                  </div>
                  <p style={{ margin: "1rem 0 0", fontSize: "0.875rem", color: "#94a3b8", lineHeight: "1.5" }}>Automatically assign a new fee record to an entire batch of students by department and semester.</p>
                </div>

                <div style={{ padding: "1.5rem", maxHeight: "calc(100vh - 12rem)", overflowY: "auto" }}>
                  {error && (
                    <div style={{ padding: "0.75rem", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: "8px", color: "#ef4444", fontSize: "0.875rem", marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <AlertCircle size={16} /> {error}
                    </div>
                  )}

                  {bulkForm.department && bulkForm.semester && (
                    <div style={{ padding: "0.75rem 1rem", background: "rgba(56,189,248,0.05)", border: "1px dashed rgba(56,189,248,0.3)", borderRadius: "8px", color: "#38bdf8", fontSize: "0.875rem", marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <Check size={16} /> Will apply to {students.filter(s => s.department === bulkForm.department && s.semester === Number(bulkForm.semester)).length} matching student(s).
                    </div>
                  )}

                  <form onSubmit={handleBulkAdd} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "1.25rem" }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                        <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>Target Department</label>
                        <select style={{ width: "100%", padding: "0.75rem 1rem", background: "#1e293b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#f8fafc", fontSize: "0.95rem", outline: "none", appearance: "none" }} value={bulkForm.department} onChange={setBulkField("department")} required>
                          <option value="">— Select Department —</option>
                          {DEPARTMENTS.map((dept) => <option key={dept} value={dept}>{dept}</option>)}
                        </select>
                      </div>
                      
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                        <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>Target Semester</label>
                        <select style={{ width: "100%", padding: "0.75rem 1rem", background: "#1e293b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#f8fafc", fontSize: "0.95rem", outline: "none", appearance: "none", opacity: !bulkForm.department ? 0.5 : 1 }} value={bulkForm.semester} onChange={setBulkField("semester")} required disabled={!bulkForm.department}>
                          <option value="">— Select Semester —</option>
                          {[1, 2, 3, 4, 5, 6].map((sem) => <option key={sem} value={sem}>Semester {sem}</option>)}
                        </select>
                      </div>
                    </div>

                    <div style={{ height: "1px", background: "rgba(255,255,255,0.05)", margin: "0.5rem 0" }}></div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                        <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>Total Amount (₹)</label>
                        <input type="number" placeholder="25000" min="0" style={{ width: "100%", padding: "0.75rem 1rem", background: "#1e293b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#f8fafc", fontSize: "0.95rem", outline: "none", boxSizing: "border-box" }} value={bulkForm.amount} onChange={setBulkField("amount")} required />
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                        <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>Due Date</label>
                        <input type="date" style={{ width: "100%", padding: "0.75rem 1rem", background: "#1e293b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#f8fafc", fontSize: "0.95rem", outline: "none", boxSizing: "border-box" }} value={bulkForm.due_date} onChange={setBulkField("due_date")} required />
                      </div>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                      <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>Description (Optional)</label>
                      <input type="text" placeholder="e.g. Annual Semester Fees" style={{ width: "100%", padding: "0.75rem 1rem", background: "#1e293b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#f8fafc", fontSize: "0.95rem", outline: "none", boxSizing: "border-box" }} value={bulkForm.description} onChange={setBulkField("description")} />
                    </div>

                    <div style={{ marginTop: "1rem", paddingTop: "1.25rem", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                      <button type="submit" disabled={loading} style={{ width: "100%", padding: "0.875rem", background: "linear-gradient(135deg, #8b5cf6, #6d28d9)", color: "white", border: "none", borderRadius: "8px", fontSize: "0.95rem", fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1, transition: "opacity 0.2s", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
                        {loading ? "Creating Rule…" : <><Users size={18} /> Create Fees Rule</>}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <DeleteConfirmModal
          studentName={deleteConfirm.studentName}
          onClose={() => setDeleteConfirm(null)}
          onConfirm={executeDelete}
        />
      )}
    </AdminLayout>
  );
}

function DeleteConfirmModal({ studentName, onClose, onConfirm }) {
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
        <div style={{ padding: "0 1.5rem 1.5rem" }}>
          <p style={{ color: "var(--color-text-muted, #cbd5e1)", fontSize: "0.95rem", lineHeight: "1.5", margin: 0 }}>
            Are you sure you want to delete the fee record for student <strong style={{ color: "var(--color-text, #f8fafc)" }}>"{studentName}"</strong>?
          </p>
          <p style={{ color: "#ef4444", fontSize: "0.8rem", marginTop: "0.75rem", fontWeight: 600, margin: "0.75rem 0 0" }}>
            ⚠️ This action is permanent and cannot be undone.
          </p>
        </div>
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

function FormField({ label, children }) {
  return (
    <div className="admin-field-group">
      <label className="admin-field-label">{label}</label>
      {children}
    </div>
  );
}
