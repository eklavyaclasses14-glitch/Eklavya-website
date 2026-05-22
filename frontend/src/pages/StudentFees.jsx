import { useState, useEffect } from "react";
import StudentLayout from "../components/StudentLayout";
import {
  DollarSign,
  CreditCard,
  Clock,
  CheckCircle,
  AlertTriangle,
  Receipt,
  Calendar,
} from "lucide-react";
import { apiFetch } from "../utils/apiFetch";
import "../styles/StudentDashboard.css"; // Reuse some styles

export default function StudentFees() {
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const user      = JSON.parse(localStorage.getItem("user") || "{}");
  const student   = user?.user || {};
  const studentId = student?._id || student?.id || user?.id || user?._id;

  useEffect(() => {
    if (!studentId) return;
    const loadFees = async () => {
      try {
        const res = await apiFetch(`api/student/${studentId}/fees`);
        const data = await res.json();
        setFees(data.fees || []);
      } catch (err) {
        setError("Failed to load fees");
      } finally {
        setLoading(false);
      }
    };

    loadFees();
  }, [studentId]);

  const totalPending = fees
    .filter((f) => f.status !== "Paid")
    .reduce((sum, f) => sum + f.amount, 0);

  if (loading)
    return (
      <StudentLayout>
        <div className="sd-loading">
          <div className="sd-spinner"></div>
        </div>
      </StudentLayout>
    );

  return (
    <StudentLayout>
      <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "2rem" }}>
        <div
          style={{
            background: "rgba(16,185,129,0.1)",
            color: "#10b981",
            width: "48px",
            height: "48px",
            borderRadius: "12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <DollarSign size={24} />
        </div>
        <div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--color-text)", margin: 0, lineHeight: 1.2 }}>Fees & Payments</h1>
          <p style={{ fontSize: "0.9rem", color: "var(--color-text-muted)", margin: "0.25rem 0 0 0" }}>View your fee history and pending dues</p>
        </div>
      </div>

      <div
        style={{
          background: "linear-gradient(135deg, #10b981, #059669)",
          borderRadius: "16px",
          padding: "2rem 2.5rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          color: "white",
          boxShadow: "0 10px 25px -5px rgba(16,185,129,0.4)",
          position: "relative",
          overflow: "hidden"
        }}
      >
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600, opacity: 0.9, marginBottom: "0.5rem" }}>Total Outstanding</div>
          <div style={{ fontSize: "3rem", fontWeight: 800, lineHeight: 1, marginBottom: "0.5rem" }}>₹{totalPending.toLocaleString()}</div>
          <div style={{ fontSize: "0.95rem", opacity: 0.9, display: "flex", alignItems: "center", gap: "0.5rem" }}>
            {totalPending > 0
              ? <><AlertTriangle size={16} /> Please complete your payments soon</>
              : <><CheckCircle size={16} /> All fees are up to date!</>}
          </div>
        </div>
        <CreditCard size={120} style={{ opacity: 0.15, position: "absolute", right: "-10px", bottom: "-20px", transform: "rotate(-15deg)" }} />
      </div>

<div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", marginTop: "2.5rem" }}>
  {fees.length === 0 ? (
    <div style={{ padding: "3rem", textAlign: "center", background: "var(--color-surface)", borderRadius: "16px", border: "1px dashed var(--color-border)", color: "var(--color-text-muted)" }}>
      <Receipt size={48} style={{ opacity: 0.2, margin: "0 auto 1rem", display: "block" }} />
      <p style={{ fontSize: "1.1rem", fontWeight: 500 }}>No fee records found.</p>
      <p style={{ fontSize: "0.9rem", marginTop: "0.5rem" }}>You're all caught up!</p>
    </div>
  ) : (
    fees.map((fee) => {
      const remaining = (fee.amount || 0) - (fee.paid_amount || 0);
      const isPaid = fee.status === 'Paid';
      const isPartial = fee.status === 'Partial Paid';
      
      return (
        <div 
          key={fee._id} 
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            borderRadius: "16px",
            padding: "1.5rem 2rem",
            boxShadow: "0 4px 6px rgba(0,0,0,0.02)",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-3px)";
            e.currentTarget.style.boxShadow = "0 12px 24px rgba(0,0,0,0.06)";
            e.currentTarget.style.borderColor = "var(--color-primary)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "none";
            e.currentTarget.style.boxShadow = "0 4px 6px rgba(0,0,0,0.02)";
            e.currentTarget.style.borderColor = "var(--color-border)";
          }}
        >
          {/* Left: Info */}
          <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", flex: 1 }}>
            <div style={{
              width: "56px",
              height: "56px",
              borderRadius: "14px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              background: isPaid ? 'rgba(16,185,129,0.1)' : isPartial ? 'rgba(245,158,11,0.1)' : 'rgba(239,68,68,0.1)',
              color: isPaid ? '#10b981' : isPartial ? '#f59e0b' : '#ef4444'
            }}>
              <Receipt size={28} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700, color: "var(--color-text)", display: "flex", alignItems: "center", gap: "0.75rem" }}>
                {fee.description || `Semester ${fee.semester || 1} Fees`}
                <span style={{
                  fontSize: "0.7rem",
                  padding: "0.25rem 0.6rem",
                  borderRadius: "99px",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  background: isPaid ? 'rgba(16,185,129,0.1)' : isPartial ? 'rgba(245,158,11,0.1)' : 'rgba(239,68,68,0.1)',
                  color: isPaid ? '#10b981' : isPartial ? '#d97706' : '#ef4444',
                  display: "flex",
                  alignItems: "center",
                  gap: "0.25rem"
                }}>
                  {isPaid ? <CheckCircle size={12} /> : <AlertTriangle size={12} />}
                  {fee.status}
                </span>
              </h3>
              <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", marginTop: "0.5rem", color: "var(--color-text-muted)", fontSize: "0.9rem" }}>
                <span suppressHydrationWarning style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                  <Calendar size={14} /> 
                  Due: <strong suppressHydrationWarning style={{ color: "var(--color-text)", fontWeight: 600 }}>{new Date(fee.due_date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</strong>
                </span>
              </div>
            </div>
          </div>

          {/* Right: Amounts */}
          <div style={{ display: "flex", alignItems: "center", gap: "3rem", paddingLeft: "2rem", borderLeft: "1px solid var(--color-border)" }}>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600, marginBottom: "0.25rem" }}>Total Amount</div>
              <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--color-text)" }}>₹{fee.amount?.toLocaleString()}</div>
            </div>
            
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600, marginBottom: "0.25rem" }}>Amount Paid</div>
              <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "#10b981" }}>₹{fee.paid_amount?.toLocaleString() || 0}</div>
            </div>

            <div style={{ textAlign: "right", minWidth: "100px" }}>
              <div style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600, marginBottom: "0.25rem" }}>Remaining</div>
              <div style={{ fontSize: "1.25rem", fontWeight: 800, color: remaining > 0 ? "#ef4444" : "#10b981" }}>
                ₹{remaining.toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      );
    })
  )}
</div>
    </StudentLayout>
  );
}
