import { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import {
  User, Mail, Image, Lock, Eye, EyeOff,
  ShieldCheck, Clock, Monitor, Save, KeyRound, AlertCircle,
} from 'lucide-react';
import { apiFetch } from '../utils/apiFetch';
import '../styles/AdminProfile.css';

// ── helpers ──────────────────────────────────────────────────────────────────
const getStored = () => { try { return JSON.parse(localStorage.getItem('user')) || {} } catch { return {} } }

function strengthScore(pw) {
  let s = 0
  if (pw.length >= 8) s++
  if (pw.length >= 12) s++
  if (/[A-Z]/.test(pw)) s++
  if (/[0-9]/.test(pw)) s++
  if (/[^A-Za-z0-9]/.test(pw)) s++
  return s
}
const STRENGTH_LABELS = ['', 'Very Weak', 'Weak', 'Fair', 'Strong', 'Very Strong']
const STRENGTH_CLASSES = ['', 'strength-very-weak', 'strength-weak', 'strength-fair', 'strength-strong', 'strength-very-strong']

function fmtTime(ts) {
  try {
    const diff = Math.floor((Date.now() - new Date(ts)) / 60000)
    if (diff < 1) return 'Just now'
    if (diff < 60) return `${diff}m ago`
    if (diff < 1440) return `${Math.floor(diff / 60)}h ago`
    return new Date(ts).toLocaleDateString('en-IN')
  } catch { return '' }
}

// ── sub-components ───────────────────────────────────────────────────────────
function InputField({ label, icon: Icon, name, type = 'text', value, onChange, placeholder, readOnly }) {
  return (
    <div className="ap-field">
      <label className="ap-field-label">{label}</label>
      <div className="ap-field-wrap">
        {Icon && <Icon size={16} className="ap-field-icon" />}
        <input
          name={name} type={type} value={value} readOnly={readOnly}
          onChange={onChange} placeholder={placeholder}
          className={`ap-field-input${readOnly ? ' ap-field-input--readonly' : ''}`}
        />
      </div>
    </div>
  )
}

function PasswordStrength({ password }) {
  const score = strengthScore(password)
  if (!password) return null
  return (
    <div className="ap-strength">
      <div className="ap-strength-bars">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={`bar-${i}`} className={`ap-strength-bar${i <= score ? ` ${STRENGTH_CLASSES[score]}` : ''}`} />
        ))}
      </div>
      <span className={`ap-strength-label ${STRENGTH_CLASSES[score]}`}>{STRENGTH_LABELS[score]}</span>
    </div>
  )
}

function ActivityEntry({ icon, action, detail, time }) {
  return (
    <div className="ap-activity-entry">
      <div className="ap-activity-icon">{icon}</div>
      <div className="ap-activity-body">
        <p className="ap-activity-action">{action}</p>
        {detail && <p className="ap-activity-detail">{detail}</p>}
      </div>
      <span className="ap-activity-time">{time}</span>
    </div>
  )
}

function Toast({ toast }) {
  if (!toast) return null
  return (
    <div className={`ap-toast ap-toast--${toast.type}`}>
      {toast.type === 'success' ? <ShieldCheck size={18} /> : <AlertCircle size={18} />}
      {toast.msg}
    </div>
  )
}

// ── main component ────────────────────────────────────────────────────────────
export default function AdminProfile() {
  const stored = getStored()

  const [profile, setProfile] = useState({ name: '', email: '', avatar: '' })
  const [passwords, setPasswords] = useState({ current: '', next: '', confirm: '' })
  const [showPw, setShowPw] = useState(false)
  const [profileBusy, setProfileBusy] = useState(false)
  const [pwBusy, setPwBusy] = useState(false)
  const [toast, setToast] = useState(null)
  const [activityLog, setActivityLog] = useState([])

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3200)
  }

  useEffect(() => {
    const log = (() => { try { return JSON.parse(localStorage.getItem('activityLog')) || [] } catch { return [] } })()
    const alreadyToday = log.find(l =>
      new Date(l.timestamp).toDateString() === new Date().toDateString() && l.action === 'Logged in'
    )
    if (!alreadyToday) {
      const updated = [{
        icon: '🔑', action: 'Logged in',
        detail: `From ${navigator.userAgent.includes('Mobile') ? 'mobile' : 'desktop'}`,
        timestamp: new Date().toISOString(),
      }, ...log].slice(0, 20)
      localStorage.setItem('activityLog', JSON.stringify(updated))
      setActivityLog(updated)
    } else {
      setActivityLog(log)
    }
  }, [])

  const addLog = (entry) => {
    const updated = [{ ...entry, timestamp: new Date().toISOString() }, ...activityLog].slice(0, 20)
    localStorage.setItem('activityLog', JSON.stringify(updated))
    setActivityLog(updated)
  }

  const handleProfileSave = async () => {
    if (!profile.name || !profile.email) return showToast('Name and email are required', 'error')
    try {
      setProfileBusy(true)
      const cleanProfile = {
        ...profile,
        avatar: (profile.avatar || '').trim()
      }

      await apiFetch('api/admin/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cleanProfile),
      })

      const updatedUser = { ...stored, ...cleanProfile }
      localStorage.setItem('user', JSON.stringify(updatedUser))

      console.log('[AdminProfile] Dispatching profileUpdated event...');
      window.dispatchEvent(new Event('profileUpdated'))
      addLog({ icon: '✏️', action: 'Updated profile', detail: `Name set to ${profile.name}` })
      setProfile({ name: '', email: '', avatar: '' })
      showToast('Profile updated successfully')
    } catch (err) {
      const cleanProfile = {
        ...profile,
        avatar: (profile.avatar || '').trim()
      }
      const updatedUser = { ...stored, ...cleanProfile }
      localStorage.setItem('user', JSON.stringify(updatedUser))

      window.dispatchEvent(new Event('profileUpdated'))
      addLog({ icon: '✏️', action: 'Updated profile (local)', detail: profile.name })
      setProfile({ name: '', email: '', avatar: '' })
      showToast('Profile updated locally')
    } finally { setProfileBusy(false) }
  }

  const handlePasswordChange = async () => {
    if (!passwords.current) return showToast('Enter your current password', 'error')
    if (passwords.next.length < 8) return showToast('New password must be at least 8 characters', 'error')
    if (passwords.next !== passwords.confirm) return showToast('Passwords do not match', 'error')
    if (strengthScore(passwords.next) < 2) return showToast('Password is too weak', 'error')
    try {
      setPwBusy(true)
      await apiFetch('api/admin/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: passwords.current, newPassword: passwords.next }),
      })
      setPasswords({ current: '', next: '', confirm: '' })
      addLog({ icon: '🔒', action: 'Changed password', detail: 'Password updated successfully' })
      showToast('Password changed successfully')
    } catch (err) {
      console.error('Password change error:', err);
      showToast(err?.message || 'Password change failed', 'error')
    } finally { setPwBusy(false) }
  }

  const initials = (profile.name || 'A').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()

  return (
    <AdminLayout>
      <Toast toast={toast} />

      {/* ── Page Header ── */}
      <div className="admin-page-header">
        <h1>Profile Settings</h1>
        <p>Manage your account details, security credentials, and activity history.</p>
      </div>

      {/* ── Avatar Hero Card ── */}
      <div className="ap-hero-card">
        <div className="ap-avatar-wrap">
          {profile.avatar
            ? <img src={profile.avatar} alt="avatar" className="ap-avatar-img"
              onError={e => (e.currentTarget.style.display = 'none')} />
            : <span className="ap-avatar-initials">{initials}</span>
          }
        </div>
        <div className="ap-hero-info">
          <h2 className="ap-hero-name">{profile.name || 'Administrator'}</h2>
          <p className="ap-hero-email">{profile.email || '—'}</p>
          <span className="ap-hero-badge">Admin</span>
        </div>
        <div className="ap-hero-session">
          <Monitor size={14} />
          <span>Session started: {new Date().toLocaleString('en-IN')}</span>
        </div>
      </div>

      {/* ── Main Grid ── */}
      <div className="ap-content-grid">

        {/* ── Left Column: Form Stack ── */}
        <div className="ap-left-stack">

          {/* Profile Info Card */}
          <div className="admins-section-card">
            <div className="admins-section-header">
              <span className="admins-section-title">
                <User size={18} style={{ color: 'var(--color-primary)' }} />
                Profile Information
              </span>
            </div>

            <div className="ap-card-body">
              <div className="ap-form-grid">
                <InputField
                  label="Full Name" icon={User} name="name"
                  value={profile.name}
                  onChange={e => setProfile(p => ({ ...p, name: e.target.value }))}
                  placeholder="Your full name"
                />
                <InputField
                  label="Email Address" icon={Mail} name="email" type="email"
                  value={profile.email}
                  onChange={e => setProfile(p => ({ ...p, email: e.target.value }))}
                  placeholder="admin@example.com"
                />
                <InputField
                  label="Avatar URL (optional)" icon={Image} name="avatar"
                  value={profile.avatar}
                  onChange={e => setProfile(p => ({ ...p, avatar: e.target.value }))}
                  placeholder="https://…"
                />
                <InputField
                  label="Role" icon={ShieldCheck} name="role"
                  value="Administrator" readOnly
                />
              </div>

              <div className="ap-form-actions">
                <button className="ap-btn ap-btn--primary" onClick={handleProfileSave} disabled={profileBusy}>
                  <Save size={16} />
                  {profileBusy ? 'Saving…' : 'Save Profile'}
                </button>
              </div>
            </div>
          </div>

          {/* Change Password Card */}
          <div className="admins-section-card">
            <div className="admins-section-header">
              <span className="admins-section-title">
                <KeyRound size={18} style={{ color: 'var(--color-warning)' }} />
                Change Password
              </span>
              <button className="ap-toggle-btn" onClick={() => setShowPw(v => !v)}>
                {showPw ? <><EyeOff size={14} /> Hide</> : <><Eye size={14} /> Show</>}
              </button>
            </div>

            <div className="ap-card-body">
              {!showPw && (
                <p className="ap-pw-hint">Click <strong>Show</strong> to update your security credentials.</p>
              )}

              {showPw && (
                <div className="ap-form-grid">
                  <InputField
                    label="Current Password" icon={Lock} name="current" type="password"
                    value={passwords.current}
                    onChange={e => setPasswords(p => ({ ...p, current: e.target.value }))}
                    placeholder="••••••••"
                  />
                  <div>
                    <InputField
                      label="New Password" icon={Lock} name="next" type="password"
                      value={passwords.next}
                      onChange={e => setPasswords(p => ({ ...p, next: e.target.value }))}
                      placeholder="Min 8 characters"
                    />
                    <PasswordStrength password={passwords.next} />
                  </div>
                  <InputField
                    label="Confirm New Password" icon={Lock} name="confirm" type="password"
                    value={passwords.confirm}
                    onChange={e => setPasswords(p => ({ ...p, confirm: e.target.value }))}
                    placeholder="Repeat password"
                  />
                  {passwords.next && passwords.confirm && passwords.next !== passwords.confirm && (
                    <p className="ap-mismatch">Passwords do not match</p>
                  )}
                  <div className="ap-form-actions">
                    <button className="ap-btn ap-btn--warning" onClick={handlePasswordChange} disabled={pwBusy}>
                      <KeyRound size={16} />
                      {pwBusy ? 'Updating…' : 'Change Password'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Right Column: Activity Log ──
        <div className="admins-section-card ap-activity-card">
          <div className="admins-section-header">
            <span className="admins-section-title">
              <Clock size={18} style={{ color: 'var(--color-primary)' }} />
              Activity Log
            </span>
            <span className="ap-log-count">Last {activityLog.length} actions</span>
          </div>

          <div className="ap-card-body">
            <div className="ap-activity-list">
              {activityLog.length === 0 && (
                <p className="ap-empty">No activity recorded yet.</p>
              )}
              {activityLog.map((entry, i) => (
                <ActivityEntry
                  key={entry.id || `activity-${i}`}
                  icon={entry.icon}
                  action={entry.action}
                  detail={entry.detail}
                  time={fmtTime(entry.timestamp)}
                />
              ))}
            </div>

            <div className="ap-session-info">
              <Monitor size={18} className="text-muted" />
              <div>
                <p className="ap-session-label">Browser Session</p>
                <p className="ap-session-value">{navigator.userAgent.split(' ').slice(-1)[0]}</p>
              </div>
            </div>
          </div>
        </div> */}

      </div>
    </AdminLayout>
  )
}