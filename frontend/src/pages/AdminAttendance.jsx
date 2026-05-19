
import { useState, useEffect } from "react";
import AdminLayout from "../components/AdminLayout";
import { Calendar, Check, X, Save, ChevronLeft, ChevronRight, ClipboardList, BarChart2 } from "lucide-react";
import { apiFetch } from "../utils/apiFetch";
import "../styles/AdminForms.css";

export default function AdminAttendance() {
  // ─── SHARED STATE ────────────────────────────────────────────────────────────
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);

  // ─── SECTION 1: Mark Attendance ──────────────────────────────────────────────
  const [markDepartment, setMarkDepartment] = useState("");
  const [markSemester, setMarkSemester] = useState("");
  const [markSubject, setMarkSubject] = useState("");
  const [markDate, setMarkDate] = useState(() => {
    const n = new Date();
    return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, "0")}-${String(n.getDate()).padStart(2, "0")}`;
  });
  const [attendance, setAttendance] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // ─── SECTION 2: Calendar View ─────────────────────────────────────────────────
  const [calDepartment, setCalDepartment] = useState("");
  const [calSemester, setCalSemester] = useState("");
  const [calSubject, setCalSubject] = useState("");
  const [calStudent, setCalStudent] = useState("");
  const [safeAttendanceData, setsafeAttendanceData] = useState({});
  // Track exactly which student+subject combo was used to load safeAttendanceData.
  // The calendar ONLY reads from safeAttendanceData when this matches the current selection,
  // preventing any stale data from a previous student ever appearing.
  const [dataOwner, setDataOwner] = useState({ student: null, subject: null });
  const [calLoading, setCalLoading] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [calSelectedDate, setCalSelectedDate] = useState(null);

  // Derived: only use loaded data when it truly belongs to the current student+subject
  const safesafeAttendanceData =
    dataOwner.student === calStudent && dataOwner.subject === calSubject
      ? safeAttendanceData
      : {};

  // ─── INITIAL LOAD ────────────────────────────────────────────────────────────
  useEffect(() => {
    const initFetch = async () => {
      try {
        const [resStudents, resSubjects] = await Promise.all([
          apiFetch("api/admin/students?limit=1000"), // Get all for selection
          apiFetch("api/admin/subjects"),
        ]);

        const studentsData = await resStudents.json();
        const subjectsData = await resSubjects.json();

        setStudents(studentsData.students || []); // Extract array
        setSubjects(subjectsData);
      } catch (err) {
        console.error(err);
      }
    };
    initFetch();
  }, []);

  // ─── FETCH ATTENDANCE FOR CALENDAR VIEW ──────────────────────────────────────
  useEffect(() => {
    // Immediately invalidate the owner so safesafeAttendanceData returns {} at once
    setDataOwner({ student: null, subject: null });
    setsafeAttendanceData({});
    setCalSelectedDate(null);

    if (!calStudent || !calSubject) {
      setCalLoading(false);
      return;
    }

    // Snapshot the values this fetch is for
    const fetchStudent = calStudent;
    const fetchSubject = calSubject;

    let cancelled = false;
    const fetchAttendance = async () => {
      setCalLoading(true);
      try {
        const res = await apiFetch(`api/admin/attendance?student_id=${fetchStudent}&subject_id=${fetchSubject}`);
        const records = await res.json();

        if (cancelled) return;

        const map = {};
        records.forEach((rec) => {
          const raw = rec.date;
          let dateKey;
          if (raw.includes("T")) {
            const d = new Date(raw);
            dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
          } else {
            dateKey = raw.slice(0, 10);
          }
          map[dateKey] = rec.status;
        });

        setsafeAttendanceData(map);
        setDataOwner({ student: fetchStudent, subject: fetchSubject });
      } catch (err) {
        if (!cancelled) console.error(err);
      } finally {
        if (!cancelled) setCalLoading(false);
      }
    };

    fetchAttendance();

    return () => { cancelled = true; };
  }, [calStudent, calSubject]);

  // ─── FILTERED DATA: SECTION 1 ────────────────────────────────────────────────
  const markFilteredSubjects = subjects.filter(
    (s) => s.department === markDepartment && String(s.semester) === String(markSemester)
  );
  const markFilteredStudents = students.filter(
    (s) => s.department === markDepartment && String(s.semester) === String(markSemester)
  );

  // ─── FILTERED DATA: SECTION 2 ────────────────────────────────────────────────
  const calFilteredSubjects = subjects.filter(
    (s) => s.department === calDepartment && String(s.semester) === String(calSemester)
  );
  const calFilteredStudents = students.filter(
    (s) => s.department === calDepartment && String(s.semester) === String(calSemester)
  );

  // ─── ATTENDANCE HANDLERS ─────────────────────────────────────────────────────
  const handleStatusChange = (studentId, status) => {
    setAttendance((prev) => ({ ...prev, [studentId]: status }));
  };

  const handleSave = async () => {
    setLoading(true);
    setMessage("");
    try {
      await Promise.all(
        Object.entries(attendance).map(([studentId, status]) =>
          apiFetch("api/admin/attendance", {
            method: "POST",
            body: JSON.stringify({
              student_id: studentId,
              subject_id: markSubject,
              date: markDate,
              status,
            }),
          })
        )
      );
      setMessage("Attendance saved successfully!");
      // If the calendar is viewing the same subject, trigger a refresh
      if (markSubject === calSubject) {
        setDataOwner({ student: null, subject: null });
      }
    } catch {
      setMessage("Failed to save attendance.");
    } finally {
      setLoading(false);
    }
  };

  // ─── CALENDAR HELPERS ────────────────────────────────────────────────────────
  // Build "YYYY-MM-DD" from local parts — never use toISOString() which shifts
  // dates by the UTC offset (e.g. India UTC+5:30 shifts July 1 → June 30 in UTC)
  const toLocalISO = (y, m, d) =>
    `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

  const getMonthDays = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const startDay = new Date(year, month, 1).getDay();
    const lastDate = new Date(year, month + 1, 0).getDate();
    const days = Array(startDay).fill(null);
    for (let i = 1; i <= lastDate; i++) {
      days.push({ label: i, value: toLocalISO(year, month, i) });
    }
    return days;
  };

  const calendarDays = getMonthDays(currentMonth);
  const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const _n = new Date();
  const today = toLocalISO(_n.getFullYear(), _n.getMonth(), _n.getDate());

  // ─── ATTENDANCE SUMMARY FOR CALENDAR SECTION ─────────────────────────────────
  const totalDays = Object.keys(safeAttendanceData).length;
  const presentDays = Object.values(safeAttendanceData).filter((s) => s === "Present").length;
  const absentDays = totalDays - presentDays;
  const attendancePct = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : null;

  return (
    <AdminLayout>
      <div className="admin-form-page">

        {/* ════════════════════════════════════════════════════════════════════ */}
        {/*  PAGE HEADER                                                        */}
        {/* ════════════════════════════════════════════════════════════════════ */}
        <div className="attendance-header">
          <div>
            <h1 className="admin-form-page-title">Manage Attendance</h1>
            <p className="admin-form-page-sub">
              Mark attendance and view student records
            </p>
          </div>

          <div className="attendance-stats">
            <div className="attendance-stat-card">
              <span>Total Students</span>
              <strong>{markFilteredStudents.length}</strong>
            </div>
            <div className="attendance-stat-card attendance-stat-card--present">
              <span>Present</span>
              <strong>{Object.values(attendance).filter((s) => s === "Present").length}</strong>
            </div>
            <div className="attendance-stat-card attendance-stat-card--absent">
              <span>Absent</span>
              <strong>{Object.values(attendance).filter((s) => s === "Absent").length}</strong>
            </div>
          </div>
        </div>

        {/* ════════════════════════════════════════════════════════════════════ */}
        {/*  TWO-SECTION LAYOUT                                                 */}
        {/* ════════════════════════════════════════════════════════════════════ */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "1.5rem", alignItems: "start" }}>

          {/* ╔══════════════════════════════════════════════════════════════╗ */}
          {/*  SECTION 1 — MARK ATTENDANCE                                   */}
          {/* ╚══════════════════════════════════════════════════════════════╝ */}
          <div className="admin-form-card">
            {/* Section header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.6rem",
                padding: "1rem 1.25rem 0.75rem",
                borderBottom: "1px solid #f0f0f0",
              }}
            >
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 32,
                  height: 32,
                  borderRadius: "8px",
                  background: "rgba(99,102,241,0.1)",
                }}
              >
                <ClipboardList size={16} color="#6366f1" />
              </span>
              <div>
                <h2 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 700, color: "#9ca3af" }}>
                  Mark Attendance
                </h2>
                <p style={{ margin: 0, fontSize: "0.75rem", color: "#9ca3af" }}>
                  Select filters and mark student attendance
                </p>
              </div>
            </div>

            <div className="admin-form-card-body">

              {/* ── Filters ── */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "1rem" }}>

                <div className="admin-field-group">
                  <label className="admin-field-label">Department</label>
                  <select
                    className="admin-input"
                    value={markDepartment}
                    onChange={(e) => {
                      setMarkDepartment(e.target.value);
                      setMarkSemester("");
                      setMarkSubject("");
                      setAttendance({});
                    }}
                  >
                    <option value="">Select Department</option>
                    {[...new Set(students.map((s) => s.department))].map((dep) => (
                      <option key={dep} value={dep}>{dep}</option>
                    ))}
                  </select>
                </div>

                <div className="admin-field-group">
                  <label className="admin-field-label">Semester</label>
                  <select
                    className="admin-input"
                    value={markSemester}
                    onChange={(e) => {
                      setMarkSemester(e.target.value);
                      setMarkSubject("");
                      setAttendance({});
                    }}
                    disabled={!markDepartment}
                  >
                    <option value="">Select Semester</option>
                    {[...new Set(
                      students
                        .filter((s) => s.department === markDepartment)
                        .map((s) => s.semester)
                    )].map((sem) => (
                      <option key={sem} value={sem}>Semester {sem}</option>
                    ))}
                  </select>
                </div>

                <div className="admin-field-group">
                  <label className="admin-field-label">Subject</label>
                  <select
                    className="admin-input"
                    value={markSubject}
                    onChange={(e) => setMarkSubject(e.target.value)}
                    disabled={!markSemester}
                  >
                    <option value="">Select Subject</option>
                    {markFilteredSubjects.map((subject) => (
                      <option key={subject._id} value={subject._id}>
                        {subject.subject_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="admin-field-group">
                  <label className="admin-field-label">
                    <Calendar size={13} style={{ marginRight: 4 }} color="white" />
                    Date
                  </label>
                  <input
                    type="date"
                    className="admin-input"
                    value={markDate}
                    onChange={(e) => setMarkDate(e.target.value)}
                  />
                </div>

              </div>

              {/* ── Empty state ── */}
              {markDepartment && markSemester && markSubject && markFilteredStudents.length === 0 && (
                <div className="empty-state">No students found.</div>
              )}

              {/* ── Attendance grid ── */}
              <div className="attendance-grid-wrapper">
                <div className="attendance-grid">
                  {markFilteredStudents.map((student) => {
                    const status = attendance[student._id];
                    return (
                      <div
                        key={student._id}
                        className={`attendance-card ${status === "Present"
                          ? "attendance-card--present"
                          : status === "Absent"
                            ? "attendance-card--absent"
                            : ""
                          }`}
                      >
                        <div className="attendance-card-top">
                          <div>
                            <h3>{student.name}</h3>
                            <p>{student.user_id}</p>
                          </div>
                          <div className="attendance-status-pill">
                            {status || "Not Marked"}
                          </div>
                        </div>

                        <div className="attendance-card-actions">
                          <button
                            className={`attendance-btn attendance-btn--present ${status === "Present" ? "active" : ""}`}
                            onClick={() => handleStatusChange(student._id, "Present")}
                          >
                            <Check size={16} /> Present
                          </button>
                          <button
                            className={`attendance-btn attendance-btn--absent ${status === "Absent" ? "active" : ""}`}
                            onClick={() => handleStatusChange(student._id, "Absent")}
                          >
                            <X size={16} /> Absent
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ── Save action ── */}
              <div className="admin-form-actions" style={{ marginTop: "1.5rem" }}>
                {message && (
                  <span style={{ marginRight: "auto", color: message.includes("success") ? "#10b981" : "#ef4444" }}>
                    {message}
                  </span>
                )}
                <button
                  className="admin-submit-btn"
                  onClick={handleSave}
                  disabled={loading || !markSubject || markFilteredStudents.length === 0}
                >
                  <Save size={16} />
                  {loading ? "Saving..." : "Save Attendance"}
                </button>
              </div>

            </div>
          </div>
          <br />
          {/* ╔══════════════════════════════════════════════════════════════╗ */}
          {/*  SECTION 2 — CALENDAR VIEW                                     */}
          {/* ╚══════════════════════════════════════════════════════════════╝ */}
          <div className="admin-form-card">
            {/* Section header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.6rem",
                padding: "1rem 1.25rem 0.75rem",
                borderBottom: "1px solid #f0f0f0",
              }}
            >
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 32,
                  height: 32,
                  borderRadius: "8px",
                  background: "rgba(16,185,129,0.1)",
                }}
              >
                <BarChart2 size={16} color="#10b981" />
              </span>
              <div>
                <h2 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 700, color: "#9ca3af" }}>
                  Attendance Calendar
                </h2>
                <p style={{ margin: 0, fontSize: "0.75rem", color: "#9ca3af" }}>
                  View a student's attendance history month-wise
                </p>
              </div>
            </div>

            <div className="admin-form-card-body">

              {/* ── Filters ── */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "1rem" }}>

                <div className="admin-field-group">
                  <label className="admin-field-label">Department</label>
                  <select
                    className="admin-input"
                    value={calDepartment}
                    onChange={(e) => {
                      setCalDepartment(e.target.value);
                      setCalSemester("");
                      setCalSubject("");
                      setCalStudent("");
                      setsafeAttendanceData({});
                      setCalSelectedDate(null);
                    }}
                  >
                    <option value="">Select Department</option>
                    {[...new Set(students.map((s) => s.department))].map((dep) => (
                      <option key={dep} value={dep}>{dep}</option>
                    ))}
                  </select>
                </div>

                <div className="admin-field-group">
                  <label className="admin-field-label">Semester</label>
                  <select
                    className="admin-input"
                    value={calSemester}
                    onChange={(e) => {
                      setCalSemester(e.target.value);
                      setCalSubject("");
                      setCalStudent("");
                      setsafeAttendanceData({});
                      setCalSelectedDate(null);
                    }}
                    disabled={!calDepartment}
                  >
                    <option value="">Select Semester</option>
                    {[...new Set(
                      students
                        .filter((s) => s.department === calDepartment)
                        .map((s) => s.semester)
                    )].map((sem) => (
                      <option key={sem} value={sem}>Semester {sem}</option>
                    ))}
                  </select>
                </div>

                <div className="admin-field-group">
                  <label className="admin-field-label">Subject</label>
                  <select
                    className="admin-input"
                    value={calSubject}
                    onChange={(e) => {
                      setCalSubject(e.target.value);
                      setCalStudent("");
                      setsafeAttendanceData({});
                      setCalSelectedDate(null);
                    }}
                    disabled={!calSemester}
                  >
                    <option value="">Select Subject</option>
                    {calFilteredSubjects.map((subject) => (
                      <option key={subject._id} value={subject._id}>
                        {subject.subject_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="admin-field-group">
                  <label className="admin-field-label">Student</label>
                  <select
                    className="admin-input"
                    value={calStudent}
                    onChange={(e) => {
                      setCalStudent(e.target.value);
                      setsafeAttendanceData({});
                      setCalSelectedDate(null);
                    }}
                    disabled={!calSubject}
                  >
                    <option value="">Select Student</option>
                    {calFilteredStudents.map((s) => (
                      <option key={s._id} value={s._id}>{s.name}</option>
                    ))}
                  </select>
                </div>

              </div>

              {/* ── Attendance summary pills ── */}
              {calStudent && calSubject && attendancePct !== null && (
                <div
                  style={{
                    display: "flex",
                    gap: "0.65rem",
                    marginBottom: "1rem",
                    flexWrap: "wrap",
                  }}
                >
                  <span
                    style={{
                      padding: "4px 12px",
                      borderRadius: "999px",
                      background: "#d1fae5",
                      color: "#065f46",
                      fontSize: "0.78rem",
                      fontWeight: 600,
                    }}
                  >
                    ✔ Present: {presentDays}
                  </span>
                  <span
                    style={{
                      padding: "4px 12px",
                      borderRadius: "999px",
                      background: "#fee2e2",
                      color: "#7f1d1d",
                      fontSize: "0.78rem",
                      fontWeight: 600,
                    }}
                  >
                    ✖ Absent: {absentDays}
                  </span>
                  <span
                    style={{
                      padding: "4px 12px",
                      borderRadius: "999px",
                      background: attendancePct >= 75 ? "#d1fae5" : "#fef3c7",
                      color: attendancePct >= 75 ? "#065f46" : "#92400e",
                      fontSize: "0.78rem",
                      fontWeight: 600,
                    }}
                  >
                    📊 {attendancePct}% Attendance
                  </span>
                </div>
              )}

              {/* ── Placeholder when no student selected ── */}
              {(!calStudent || !calSubject) && (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "3rem 1rem",
                    border: "1.5px dashed #e5e7eb",
                    borderRadius: "12px",
                    color: "#9ca3af",
                    gap: "0.5rem",
                  }}
                >
                  <Calendar size={32} strokeWidth={1.2} color="#d1d5db" />
                  <p style={{ margin: 0, fontSize: "0.85rem", fontWeight: 500 }}>
                    Select a student and subject to view calendar
                  </p>
                </div>
              )}

              {/* ── Calendar ── */}
              {calStudent && calSubject && (
                <div
                  style={{
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    borderRadius: "12px",
                    padding: "1.1rem",
                    background: "rgba(2, 6, 23, 0.5)",
                  }}
                >
                  {/* Month navigation */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: "0.85rem",
                    }}
                  >
                    <button
                      onClick={() =>
                        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))
                      }
                      style={{
                        background: "none",
                        border: "1px solid #e5e7eb",
                        borderRadius: "6px",
                        padding: "4px 10px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        color: "white",
                      }}
                    >
                      <ChevronLeft size={16} />
                    </button>

                    <h3 style={{ margin: 0, fontWeight: 600, fontSize: "0.95rem", color: "#f3f4f6" }}>
                      {currentMonth.toLocaleString("default", { month: "long", year: "numeric" })}
                    </h3>

                    <button
                      onClick={() =>
                        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))
                      }
                      style={{
                        background: "none",
                        border: "1px solid #e5e7eb",
                        borderRadius: "6px",
                        padding: "4px 10px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        color: "white",
                      }}
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>

                  {/* Legend */}
                  <div style={{ display: "flex", gap: "0.85rem", marginBottom: "0.65rem", fontSize: "0.73rem", color: "#9ca3af", flexWrap: "wrap" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <span style={{ width: 9, height: 9, borderRadius: "50%", background: "#10b981", display: "inline-block" }} />
                      Present
                    </span>
                    <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <span style={{ width: 9, height: 9, borderRadius: "50%", background: "#ef4444", display: "inline-block" }} />
                      Absent
                    </span>
                    <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <span style={{ width: 9, height: 9, borderRadius: "50%", background: "#6366f1", display: "inline-block" }} />
                      Selected
                    </span>
                    <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <span style={{ width: 9, height: 9, borderRadius: "2px", border: "1.5px solid #6366f1", display: "inline-block" }} />
                      Today
                    </span>
                  </div>

                  {/* Day-name row */}
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "3px", marginBottom: "3px" }}>
                    {DAY_NAMES.map((d) => (
                      <div
                        key={d}
                        style={{
                          textAlign: "center",
                          fontSize: "0.68rem",
                          fontWeight: 600,
                          color: "#9ca3af",
                          padding: "3px 0",
                        }}
                      >
                        {d}
                      </div>
                    ))}
                  </div>

                  {/* Day cells */}
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "3px" }}>
                    {calendarDays.map((day, index) => {
                      if (!day) return <div key={index} />;

                      const isToday = today === day.value;
                      const isSelected = calSelectedDate === day.value;
                      const status = safeAttendanceData[day.value];

                      let bg = "rgba(255, 255, 255, 0.03)";
                      let border = "1px solid rgba(255, 255, 255, 0.08)";
                      let color = "#9ca3af";
                      let shadow = "none";

                      // Selected takes highest visual priority
                      if (isSelected) {
                        bg = "#6366f1";
                        border = "2px solid #4f46e5";
                        color = "#fff";
                        shadow = "0 2px 10px rgba(99,102,241,0.35)";
                      } else if (status === "Present") {
                        bg = "rgba(16, 185, 129, 0.15)";
                        border = "1px solid rgba(16, 185, 129, 0.3)";
                        color = "#10b981";
                      } else if (status === "Absent") {
                        bg = "rgba(239, 68, 68, 0.15)";
                        border = "1px solid rgba(239, 68, 68, 0.3)";
                        color = "#ef4444";
                      } else if (isToday) {
                        border = "1.5px solid #6366f1";
                        shadow = "0 0 0 2px rgba(99,102,241,0.12)";
                      }

                      return (
                        <div
                          key={day.value}
                          onClick={() =>
                            setCalSelectedDate((prev) => (prev === day.value ? null : day.value))
                          }
                          style={{
                            background: bg,
                            border,
                            borderRadius: "7px",
                            padding: "5px 3px",
                            textAlign: "center",
                            cursor: "pointer",
                            boxShadow: shadow,
                            transition: "all 0.15s ease",
                            minHeight: "42px",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "2px",
                          }}
                        >
                          <strong style={{ fontSize: "0.78rem", color }}>{day.label}</strong>
                          {status && !isSelected && (
                            <span style={{ fontSize: "0.6rem", color, opacity: 0.8 }}>
                              {status === "Present" ? "✔" : "✖"}
                            </span>
                          )}
                          {isSelected && (
                            <span style={{ fontSize: "0.6rem", color: "#e0e7ff" }}>●</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ── Date detail panel (shown when a calendar date is clicked) ── */}
              {calSelectedDate && calStudent && calSubject && (() => {
                const status = safeAttendanceData[calSelectedDate];
                const [dy, dm, dd] = calSelectedDate.split("-").map(Number);
                const dateLabel = new Date(dy, dm - 1, dd).toLocaleDateString("default", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                });

                const isPresent = status === "Present";
                const isAbsent = status === "Absent";
                const isNoRecord = !status;

                const panelBg = isPresent ? "rgba(16, 185, 129, 0.1)" : isAbsent ? "rgba(239, 68, 68, 0.1)" : "rgba(255, 255, 255, 0.05)";
                const accentColor = isPresent ? "#10b981" : isAbsent ? "#ef4444" : "#9ca3af";
                const textColor = isPresent ? "#10b981" : isAbsent ? "#ef4444" : "#e5e7eb";
                const borderColor = isPresent ? "rgba(16, 185, 129, 0.2)" : isAbsent ? "rgba(239, 68, 68, 0.2)" : "rgba(255, 255, 255, 0.1)";
                const icon = isPresent ? "✔" : isAbsent ? "✖" : "—";
                const label = isPresent ? "Present" : isAbsent ? "Absent" : "No Record";

                return (
                  <div
                    style={{
                      marginTop: "1rem",
                      border: `1.5px solid ${borderColor}`,
                      borderRadius: "10px",
                      padding: "0.9rem 1.1rem",
                      background: panelBg,
                      display: "flex",
                      alignItems: "center",
                      gap: "1rem",
                      animation: "fadeIn 0.18s ease",
                    }}
                  >
                    {/* Big status icon */}
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: "50%",
                        background: accentColor,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        fontSize: "1.15rem",
                        color: "#fff",
                        fontWeight: 700,
                        boxShadow: `0 2px 8px ${accentColor}55`,
                      }}
                    >
                      {icon}
                    </div>

                    {/* Date + status text */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p
                        style={{
                          margin: 0,
                          fontSize: "0.72rem",
                          color: "#9ca3af",
                          fontWeight: 500,
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                        }}
                      >
                        {dateLabel}
                      </p>
                      <p
                        style={{
                          margin: "2px 0 0",
                          fontSize: "1rem",
                          fontWeight: 700,
                          color: textColor,
                        }}
                      >
                        {label}
                      </p>
                      {!status && (
                        <p style={{ margin: "4px 0 0", fontSize: "0.75rem", color: "#9ca3af" }}>
                          No attendance was recorded for this date.
                        </p>
                      )}
                    </div>

                    {/* Dismiss */}
                    <button
                      onClick={() => setCalSelectedDate(null)}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: "#9ca3af",
                        padding: "4px",
                        display: "flex",
                        alignItems: "center",
                        borderRadius: "4px",
                        flexShrink: 0,
                      }}
                      title="Dismiss"
                    >
                      <X size={15} />
                    </button>
                  </div>
                );
              })()}

            </div>
          </div>

        </div>
      </div>
    </AdminLayout>
  );
}