import { useState, useEffect } from 'react';
import { Activity, Clock, FileText, Monitor, Smartphone, Search, RefreshCw, XCircle } from 'lucide-react';
import { apiFetch } from '../utils/apiFetch';
import AdminLayout from '../components/AdminLayout';
import '../styles/AdminDashboard.css'; // Reuse table styles

export default function AdminLiveTracking() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');

  const fetchActiveSessions = async () => {
    try {
      const res = await apiFetch('/api/admin/students/active-students');
      const data = await res.json();
      setSessions(data.activeSessions || []);
    } catch (err) {
      setError('Failed to load active sessions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveSessions();
    const interval = setInterval(fetchActiveSessions, 10000); // Polling every 10s
    return () => clearInterval(interval);
  }, []);

  const getStatusBadge = (session) => {
    // Dynamic status calculation
    const secondsAgo = Math.floor((new Date() - new Date(session.last_active)) / 1000);
    
    let displayStatus = session.status;
    if (secondsAgo > 300) displayStatus = 'offline';
    else if (secondsAgo > 90 && displayStatus === 'online') displayStatus = 'idle';

    if (!session.is_visible && displayStatus === 'online') displayStatus = 'background';

    const colors = {
      online: { bg: 'rgba(34, 197, 94, 0.1)', color: '#4ade80', text: 'Online' },
      viewing_document: { bg: 'rgba(168, 85, 247, 0.1)', color: '#c084fc', text: 'Reading' },
      idle: { bg: 'rgba(234, 179, 8, 0.1)', color: '#facc15', text: 'Idle' },
      background: { bg: 'rgba(148, 163, 184, 0.1)', color: '#cbd5e1', text: 'Background' },
      offline: { bg: 'rgba(239, 68, 68, 0.1)', color: '#f87171', text: 'Offline' }
    };

    const style = colors[displayStatus] || colors.online;

    return (
      <span style={{ 
        display: 'inline-flex', alignItems: 'center', gap: '0.4rem', 
        padding: '0.3rem 0.6rem', borderRadius: '1rem', 
        background: style.bg, color: style.color, 
        fontSize: '0.8rem', fontWeight: 600 
      }}>
        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: style.color }}></span>
        {style.text}
      </span>
    );
  };

  const getRelativeTime = (dateStr) => {
    const diff = Math.floor((new Date() - new Date(dateStr)) / 1000);
    if (diff < 15) return 'Just now';
    if (diff < 60) return `${diff} seconds ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)} mins ago`;
    return 'Offline';
  };

  const filteredSessions = sessions.filter(session => {
    const s = session.student_id;
    if (!s) return false; // Edge case if student was deleted
    const searchMatch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        s.department.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterStatus !== 'All') {
      const secondsAgo = Math.floor((new Date() - new Date(session.last_active)) / 1000);
      let calculatedStatus = session.status;
      if (secondsAgo > 300) calculatedStatus = 'offline';
      else if (secondsAgo > 90 && calculatedStatus === 'online') calculatedStatus = 'idle';

      if (filterStatus === 'Online' && calculatedStatus !== 'online') return false;
      if (filterStatus === 'Idle' && calculatedStatus !== 'idle') return false;
      if (filterStatus === 'Reading' && calculatedStatus !== 'viewing_document') return false;
    }
    
    return searchMatch;
  });

  const onlineCount = sessions.filter(s => Math.floor((new Date() - new Date(s.last_active)) / 1000) <= 90).length;
  const readingCount = sessions.filter(s => s.status === 'viewing_document' && Math.floor((new Date() - new Date(s.last_active)) / 1000) <= 90).length;

  return (
    <AdminLayout>
      <div className="admin-page fade-in">
        <div className="admin-page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 className="admin-page-title" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Activity className="text-primary" size={28} />
            Live Activity Tracker
          </h1>
          <p className="admin-page-subtitle">Real-time overview of active student sessions and tab states.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <div style={{ background: 'var(--color-surface)', padding: '0.75rem 1.5rem', borderRadius: '12px', border: '1px solid var(--color-border)', textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#4ade80' }}>{onlineCount}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Live Now</div>
          </div>
          <div style={{ background: 'var(--color-surface)', padding: '0.75rem 1.5rem', borderRadius: '12px', border: '1px solid var(--color-border)', textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#c084fc' }}>{readingCount}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Reading</div>
          </div>
        </div>
      </div>

      <div className="admin-filters-bar" style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <div className="search-wrapper" style={{ flex: 1, minWidth: '250px', position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
          <input
            type="text"
            placeholder="Search student or department..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ 
              width: '100%', 
              padding: '0.85rem 1rem 0.85rem 3.25rem', 
              background: 'rgba(255, 255, 255, 0.03)', 
              border: '1px solid rgba(255, 255, 255, 0.1)', 
              borderRadius: '12px', 
              color: '#fff', 
              fontSize: '0.95rem',
              outline: 'none',
              transition: 'all 0.2s ease',
              boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = 'var(--color-primary)';
              e.target.style.background = 'rgba(255, 255, 255, 0.05)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
              e.target.style.background = 'rgba(255, 255, 255, 0.03)';
            }}
          />
        </div>
        
        <div style={{ position: 'relative' }}>
          <select 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{ 
              appearance: 'none',
              width: '200px', 
              padding: '0.85rem 2.5rem 0.85rem 1.25rem', 
              background: 'rgba(255, 255, 255, 0.03)', 
              border: '1px solid rgba(255, 255, 255, 0.1)', 
              borderRadius: '12px', 
              color: '#fff', 
              fontSize: '0.95rem',
              outline: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)'
            }}
            onFocus={(e) => e.target.style.borderColor = 'var(--color-primary)'}
            onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
          >
            <option value="All" style={{ background: '#0f172a' }}>All Statuses</option>
            <option value="Online" style={{ background: '#0f172a' }}>Active Online</option>
            <option value="Reading" style={{ background: '#0f172a' }}>Reading Documents</option>
            <option value="Idle" style={{ background: '#0f172a' }}>Idle</option>
          </select>
          <div style={{ position: 'absolute', right: '1.25rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--color-text-muted)', fontSize: '0.7rem' }}>
            ▼
          </div>
        </div>

        <button 
          onClick={fetchActiveSessions} 
          style={{ 
            display: 'flex', alignItems: 'center', gap: '0.5rem', 
            padding: '0.85rem 1.5rem', 
            background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.15), rgba(79, 70, 229, 0.25))', 
            border: '1px solid rgba(79, 70, 229, 0.4)', 
            borderRadius: '12px', 
            color: '#a5b4fc', 
            fontSize: '0.95rem', 
            fontWeight: 600, 
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => { 
            e.currentTarget.style.background = 'linear-gradient(135deg, rgba(79, 70, 229, 0.25), rgba(79, 70, 229, 0.4))'; 
            e.currentTarget.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={(e) => { 
            e.currentTarget.style.background = 'linear-gradient(135deg, rgba(79, 70, 229, 0.15), rgba(79, 70, 229, 0.25))';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
          onMouseDown={(e) => {
            e.currentTarget.style.transform = 'translateY(1px)';
          }}
          onMouseUp={(e) => {
            e.currentTarget.style.transform = 'translateY(-1px)';
          }}
        >
          <RefreshCw size={18} /> Refresh
        </button>
      </div>

      <div className="admin-table-container">
        {loading ? (
          <div className="admin-loading-spinner" style={{ padding: '3rem', textAlign: 'center' }}>Loading live sessions...</div>
        ) : error ? (
          <div className="admin-error-message" style={{ padding: '2rem', textAlign: 'center', color: '#f87171' }}>
            <XCircle size={32} style={{ margin: '0 auto 1rem' }} />
            {error}
          </div>
        ) : filteredSessions.length === 0 ? (
          <div className="admin-empty-state" style={{ padding: '4rem', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
            <Monitor size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
            <h3>No active sessions found</h3>
            <p>Students will appear here as soon as they log in or navigate the portal.</p>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Department</th>
                <th>Status</th>
                <th>Current Page</th>
                <th>Last Action</th>
                <th>Last Active</th>
              </tr>
            </thead>
            <tbody>
              {filteredSessions.map((session) => {
                const s = session.student_id;
                return (
                  <tr key={`${session.session_id}-${session.tab_id}`}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <img 
                          src={`https://ui-avatars.com/api/?name=${encodeURIComponent(s.name)}&background=4f46e5&color=fff`} 
                          alt="" 
                          style={{ width: '36px', height: '36px', borderRadius: '50%' }}
                        />
                        <div>
                          <div style={{ fontWeight: 600 }}>{s.name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>{s.user_id}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div>{s.department}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>Sem {s.semester}</div>
                    </td>
                    <td>{getStatusBadge(session)}</td>
                    <td>
                      <div style={{ fontWeight: 500 }}>{session.page_title || 'Unknown'}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>{session.current_route}</div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {session.metadata?.resourceType === 'note' && <FileText size={14} style={{ color: '#c084fc' }} />}
                        {session.action || 'Browsing'}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>
                        <Clock size={14} />
                        {getRelativeTime(session.last_active)}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
    </AdminLayout>
  );
}
