import { useState, useEffect } from "react";
import StudentLayout from "../components/StudentLayout";
import {
  DollarSign,
  CreditCard,
  Clock,
  CheckCircle,
  AlertTriangle,
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
      <div className="sa-page-header">
        <div
          className="sa-header-icon"
          style={{ background: "rgba(16,185,129,0.1)", color: "#10b981" }}
        >
          <DollarSign size={24} />
        </div>
        <div>
          <h1 className="sa-page-title">Fees & Payments</h1>
          <p className="sa-page-sub">View your fee history and pending dues</p>
        </div>
      </div>

      <div
        className="sa-summary-banner"
        style={{ background: "linear-gradient(135deg, #10b981, #059669)" }}
      >
        <div>
          <div className="sa-summary-label">Total Outstanding</div>
          <div className="sa-summary-value">${totalPending}</div>
          <div className="sa-summary-desc">
            {totalPending > 0
              ? "Please complete your payments soon"
              : "All fees are up to date!"}
          </div>
        </div>
        <CreditCard size={64} style={{ opacity: 0.2 }} />
      </div>

    <div
  className="sd-content-grid"
  style={{
    gridTemplateColumns: '1fr',
    marginTop: '2rem'
  }}
>

  <div className="sa-attendance-list">

    {fees.length === 0 ? (

      <div className="sa-attendance-empty">
        No fee records found.
      </div>

    ) : (

      fees.map((fee) => (

        <div
          key={fee._id}
          className="sa-attendance-card"
        >

          <div className="sa-attendance-left">

            <div
              className="sa-attendance-icon"
              style={{
                background:
                  fee.status === 'Paid'
                    ? 'rgba(16,185,129,.12)'
                    : 'rgba(245,158,11,.12)',

                color:
                  fee.status === 'Paid'
                    ? '#10b981'
                    : '#f59e0b'
              }}
            >
              <DollarSign size={20} />
            </div>

            <div>

              <div className="sa-attendance-subject">
                {fee.description || 'Semester Fees'}
              </div>

              <div className="sa-attendance-date">
                Due:
                {' '}
                {new Date(fee.due_date).toLocaleDateString()}
              </div>

            </div>

          </div>

          <div
            className={`sa-attendance-status ${
              fee.status === 'Paid'
                ? 'present'
                : 'absent'
            }`}
          >

            {fee.status === 'Paid'
              ? <CheckCircle size={14} />
              : <AlertTriangle size={14} />
            }

            ₹{fee.amount} • {fee.status}

          </div>

        </div>

      ))

    )}

  </div>

</div>
    </StudentLayout>
  );
}
