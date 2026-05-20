import { useState, useEffect } from "react";
import AdminLayout from "../components/AdminLayout";
import { Plus, Trash2, Check, X, Users, Pencil, AlertCircle } from "lucide-react";
import { apiFetch } from "../utils/apiFetch";
import "../styles/AdminForms.css";

// ─── constants ───────────────────────────────────────────────────────────────

const emptyForm = {
  student_id: "",
  department: "",
  amount: "",
  due_date: "",
  status: "Pending",
  description: "",
  payment_date: "",
  transaction_id: "",
};

const emptyBulk = {
  student_ids: [],
  department: "",
  amount: "",
  due_date: "",
  status: "Pending",
  description: "",
};

const badgeClass = (s) =>
  s === "Paid"
    ? "badge badge-paid"
    : s === "Pending"
      ? "badge badge-pending"
      : "badge badge-overdue";

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

  // modal: null | 'add' | 'edit' | 'bulk'
  const [modal, setModal] = useState(null);
  const [editId, setEditId] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

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
      amount: fee.amount ?? "",
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

const filteredStudents = students.filter((s) => {
  const matchesSearch =
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    (s.user_id ?? "").toLowerCase().includes(search.toLowerCase());

  const matchesDepartment =
    !bulkForm.department ||
    s.department?.toLowerCase() === bulkForm.department.toLowerCase();

  return matchesSearch && matchesDepartment;
});

  const allVisible =
    filteredStudents.length > 0 &&
    filteredStudents.every((s) => bulkForm.student_ids.includes(s._id));

  const toggleStudent = (id) =>
    setBulkForm((p) => ({
      ...p,
      student_ids: p.student_ids.includes(id)
        ? p.student_ids.filter((sid) => sid !== id)
        : [...p.student_ids, id],
    }));

  const toggleAll = () => {
    const ids = filteredStudents.map((s) => s._id);
    setBulkForm((p) => ({
      ...p,
      student_ids: allVisible
        ? p.student_ids.filter((id) => !ids.includes(id))
        : [...new Set([...p.student_ids, ...ids])],
    }));
  };

  const handleBulkAdd = async (e) => {
    e.preventDefault();
    if (!bulkForm.student_ids.length) {
      setError("Select at least one student.");
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

  const updateStatus = async (id, status) => {
    try {
      const res = await jsonFetch(
        `api/admin/fees/${id}`,
        {
          method: "PUT",
          body: JSON.stringify({
            status,
            ...(status === "Paid"
              ? { payment_date: new Date().toISOString() }
              : {}),
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
          <div className="admin-fees-actions">
            <button
              className="admin-add-new-btn admin-add-new-btn--accent"
              onClick={() => {
                setError("");
                setBulkForm(emptyBulk);
                setModal("bulk");
              }}
            >
              <Users size={15} /> Bulk Add Fees
            </button>
            <button className="admin-add-new-btn" onClick={openAdd}>
              <Plus size={15} /> Add Fee Record
            </button>
          </div>
        </div>

        {/* ── table ── */}
        <div className="admin-table-wrapper" style={{ marginTop: "2rem" }}>
          <div className="admin-table-card">
            <table>
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Department</th>
                  <th>Amount</th>
                  <th>Due Date</th>
                  <th>Description</th>
                  <th>Status</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {fees.length === 0 && (
                  <tr>
                    <td colSpan={7} className="empty-state">
                      No fee records found.
                    </td>
                  </tr>
                )}
                {fees.map((f) => (
                  <tr key={f._id}>
                    <td>
                      <div className="student-name">{f.student_id?.name}</div>
                      <div className="student-id">{f.student_id?.user_id}</div>
                    </td>
                    <td
                      style={{
                        fontSize: "0.82rem",
                        color: "var(--color-text-muted)",
                      }}
                    >
                      {f.department || "—"}
                    </td>
                    <td style={{ fontWeight: 600 }}>
                      ₹{f.amount?.toLocaleString()}
                    </td>
                    <td>{new Date(f.due_date).toLocaleDateString()}</td>
                    <td
                      style={{
                        color: "var(--color-text-muted)",
                        fontSize: "0.82rem",
                        maxWidth: "180px",
                      }}
                    >
                      <div
                        style={{
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {f.description || "—"}
                      </div>
                    </td>
                    <td>
                      <span className={badgeClass(f.status)}>{f.status}</span>
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
                            onClick={() => updateStatus(f._id, "Paid")}
                            title="Mark as Paid"
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
                ))}
              </tbody>
            </table>
          </div>

          {/* ════════════════════════════════════════
            ADD MODAL
        ════════════════════════════════════════ */}
          {modal === "add" && (
            <div className="modal-overlay" onClick={closeModal}>
              <div className="modal-box" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                  <h2 className="modal-title">Add Fee Record</h2>
                  <button className="modal-close-btn" onClick={closeModal}>
                    <X size={18} />
                  </button>
                </div>
                {error && <div className="form-error">{error}</div>}
                <form onSubmit={handleAddFee}>
                  <FormField label="Student">
                    <select
                      className="admin-input"
                      value={formData.student_id}
                      onChange={(e) => {
                        const student = students.find(
                          (s) => s._id === e.target.value,
                        );

                        setFormData((prev) => ({
                          ...prev,
                          student_id: e.target.value,
                          department: student?.department || "",
                        }));
                      }}
                      required
                    >
                      <option value="">— Select student —</option>

                      {students.map((s) => (
                        <option key={s._id} value={s._id}>
                          {s.name} ({s.user_id})
                        </option>
                      ))}
                    </select>
                  </FormField>

                  <FormField label="Department">
                    <input
                      type="text"
                      className="admin-input"
                      value={formData.department}
                      readOnly
                    />
                  </FormField>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "0.75rem",
                    }}
                  >
                    <FormField label="Amount (₹)">
                      <input
                        type="number"
                        className="admin-input"
                        placeholder="5000"
                        min="0"
                        value={formData.amount}
                        onChange={setField("amount")}
                        required
                      />
                    </FormField>
                    <FormField label="Status">
                      <select
                        className="admin-input"
                        value={formData.status}
                        onChange={setField("status")}
                      >
                        <option>Pending</option>
                        <option>Paid</option>
                        <option>Overdue</option>
                      </select>
                    </FormField>
                  </div>

                  <FormField label="Due Date">
                    <input
                      type="date"
                      className="admin-input"
                      value={formData.due_date}
                      onChange={setField("due_date")}
                      required
                    />
                  </FormField>

                  <FormField label="Description">
                    <input
                      type="text"
                      className="admin-input"
                      placeholder="e.g. Tuition Fee – Term 1"
                      value={formData.description}
                      onChange={setField("description")}
                    />
                  </FormField>

                  <button
                    type="submit"
                    className="admin-submit-btn"
                    style={{ width: "100%", marginTop: "0.75rem" }}
                    disabled={loading}
                  >
                    {loading ? "Saving…" : "Add Fee Record"}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* ════════════════════════════════════════
            EDIT MODAL
        ════════════════════════════════════════ */}
          {modal === "edit" && (
            <div className="modal-overlay" onClick={closeModal}>
              <div className="modal-box" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                  <h2 className="modal-title">Edit Fee Record</h2>
                  <button className="modal-close-btn" onClick={closeModal}>
                    <X size={18} />
                  </button>
                </div>
                {error && <div className="form-error">{error}</div>}
                <form onSubmit={handleEditFee}>
                  {/* Student — read-only in edit to prevent re-assigning */}
                  <FormField label="Student">
                    <select
                      className="admin-input"
                      value={formData.student_id}
                      onChange={(e) => {
                        const student = students.find(
                          (s) => s._id === e.target.value,
                        );

                        setFormData((prev) => ({
                          ...prev,
                          student_id: e.target.value,
                          department: student?.department || "",
                        }));
                      }}
                      required
                    >
                      <option value="">— Select student —</option>

                      {students.map((s) => (
                        <option key={s._id} value={s._id}>
                          {s.name} ({s.user_id})
                        </option>
                      ))}
                    </select>
                  </FormField>

                  <FormField label="Department">
                    <input
                      type="text"
                      className="admin-input"
                      value={formData.department}
                      readOnly
                    />
                  </FormField>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "0.75rem",
                    }}
                  >
                    <FormField label="Amount (₹)">
                      <input
                        type="number"
                        className="admin-input"
                        min="0"
                        value={formData.amount}
                        onChange={setField("amount")}
                        required
                      />
                    </FormField>
                    <FormField label="Status">
                      <select
                        className="admin-input"
                        value={formData.status}
                        onChange={setField("status")}
                      >
                        <option>Pending</option>
                        <option>Paid</option>
                        <option>Overdue</option>
                      </select>
                    </FormField>
                  </div>

                  <FormField label="Due Date">
                    <input
                      type="date"
                      className="admin-input"
                      value={formData.due_date}
                      onChange={setField("due_date")}
                      required
                    />
                  </FormField>

                  <FormField label="Description">
                    <input
                      type="text"
                      className="admin-input"
                      placeholder="e.g. Tuition Fee – Term 1"
                      value={formData.description}
                      onChange={setField("description")}
                    />
                  </FormField>

                  <hr className="modal-divider" />

                  <div className="admin-field-row">
                    <FormField label="Payment Date">
                      <input
                        type="date"
                        className="admin-input"
                        value={formData.payment_date}
                        onChange={setField("payment_date")}
                      />
                    </FormField>
                    <FormField label="Transaction ID">
                      <input
                        type="text"
                        className="admin-input"
                        placeholder="TXN123456"
                        value={formData.transaction_id}
                        onChange={setField("transaction_id")}
                      />
                    </FormField>
                  </div>

                  <button
                    type="submit"
                    className="admin-submit-btn"
                    style={{ width: "100%", marginTop: "0.75rem" }}
                    disabled={loading}
                  >
                    {loading ? "Updating…" : "Update Fee Record"}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* ════════════════════════════════════════
            BULK ADD MODAL
        ════════════════════════════════════════ */}
          {modal === "bulk" && (
            <div className="modal-overlay" onClick={closeModal}>
              <div
                className="modal-box modal-box--wide"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="modal-header">
                  <h2 className="modal-title">Bulk Add Fee Records</h2>
                  <button className="modal-close-btn" onClick={closeModal}>
                    <X size={18} />
                  </button>
                </div>
                {error && <div className="form-error">{error}</div>}

                {/* ⚠ The outer element is NOT a <form> to avoid nested-form HTML violation.
                  The submit button inside calls handleBulkAdd via onClick. */}
                <div className="bulk-modal-grid">
                  {/* ── LEFT: student picker ── */}
                  <div>
                    <p className="bulk-section-label">
                      Select Students&nbsp;
                      <span
                        style={{ color: "var(--color-text)", fontWeight: 700 }}
                      >
                        ({bulkForm.student_ids.length} selected)
                      </span>
                    </p>

                    <input
                      className="admin-input"
                      placeholder="Search by name or ID…"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      style={{ marginBottom: "0.5rem" }}
                    />

                    <div className="student-list">
                      <label className="student-check-row student-check-row--all">
                        <input
                          type="checkbox"
                          checked={allVisible}
                          onChange={toggleAll}
                        />
                        <span
                          className="student-name"
                          style={{ fontWeight: 600 }}
                        >
                          Select all visible
                        </span>
                      </label>
                      {filteredStudents.length === 0 && (
                        <p className="empty-state" style={{ padding: "1rem" }}>
                          No students found.
                        </p>
                      )}
                      {filteredStudents.map((s) => (
                        <label key={s._id} className="student-check-row">
                          <input
                            type="checkbox"
                            checked={bulkForm.student_ids.includes(s._id)}
                            onChange={() => toggleStudent(s._id)}
                          />
                          <div>
                            <p className="student-name">{s.name}</p>
                            <p className="student-id">{s.user_id}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* ── RIGHT: fee details — plain <form> (not nested) ── */}
                  <form onSubmit={handleBulkAdd}>
                    <p className="bulk-section-label">
                      Fee Details (applied to all selected)
                    </p>
                    {/* ── Updated Bulk Department Field ── */}
                  <FormField label="Department">
  <select
    className="admin-input"
    value={bulkForm.department}
    onChange={setBulkField("department")}
    required
  >
    <option value="">-- Select Department --</option>

    {[...new Set(students.map((s) => s.department))].map((dept) => (
      <option key={dept} value={dept}>
        {dept}
      </option>
    ))}
  </select>
</FormField>

                    <div className="admin-field-row">
                      <FormField label="Amount (₹)">
                        <input
                          type="number"
                          className="admin-input"
                          placeholder="5000"
                          min="0"
                          value={bulkForm.amount}
                          onChange={setBulkField("amount")}
                          required
                        />
                      </FormField>
                      <FormField label="Status">
                        <select
                          className="admin-input"
                          value={bulkForm.status}
                          onChange={setBulkField("status")}
                        >
                          <option>Pending</option>
                          <option>Paid</option>
                          <option>Overdue</option>
                        </select>
                      </FormField>
                    </div>

                    <FormField label="Due Date">
                      <input
                        type="date"
                        className="admin-input"
                        value={bulkForm.due_date}
                        onChange={setBulkField("due_date")}
                        required
                      />
                    </FormField>
                    {/* department */}
                    <FormField label="Description">
                      <input
                        type="text"
                        className="admin-input"
                        placeholder="e.g. Tuition Fee – Term 1"
                        value={bulkForm.description}
                        onChange={setBulkField("description")}
                      />
                    </FormField>

                    <button
                      type="submit"
                      className="admin-submit-btn admin-submit-btn--accent"
                      style={{ width: "100%", marginTop: "0.75rem" }}
                      disabled={loading || bulkForm.student_ids.length === 0}
                    >
                      {loading
                        ? "Creating…"
                        : `Create ${bulkForm.student_ids.length || 0} Fee Record${bulkForm.student_ids.length !== 1 ? "s" : ""}`}
                    </button>
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
            Are you sure you want to delete the fee record for student <strong style={{ color: "var(--color-text, #f8fafc)" }}>"{studentName}"</strong>?
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

// ─── small reusable pieces ────────────────────────────────────────────────────

function FormField({ label, children }) {
  return (
    <div className="admin-field-group">
      <label className="admin-field-label">{label}</label>
      {children}
    </div>
  );
}
