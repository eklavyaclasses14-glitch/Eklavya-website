import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { apiFetch } from '../utils/apiFetch';

export const useActivityTracker = () => {
  const location = useLocation();
  const sessionRef = useRef(null);
  const tabRef = useRef(null);
  const heartbeatInterval = useRef(null);
  const idleTimeout = useRef(null);
  
  // Track state to avoid sending identical heartbeats too often
  const currentState = useRef({
    status: 'online',
    action: 'Browsing',
    isVisible: true,
    metadata: {}
  });

  const getOrCreateIds = () => {
    // Session ID is per login/browser
    let sessionId = localStorage.getItem('activity_session_id');
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      localStorage.setItem('activity_session_id', sessionId);
    }
    
    // Tab ID is per open tab
    let tabId = sessionStorage.getItem('activity_tab_id');
    if (!tabId) {
      tabId = crypto.randomUUID();
      sessionStorage.setItem('activity_tab_id', tabId);
    }
    
    sessionRef.current = sessionId;
    tabRef.current = tabId;
  };

  const getPageTitle = (pathname) => {
    if (pathname.includes('/student/notes')) return 'Study Materials';
    if (pathname.includes('/student/fees')) return 'Fees Portal';
    if (pathname.includes('/student/attendance')) return 'Attendance';
    if (pathname.includes('/student/profile')) return 'Student Profile';
    if (pathname.includes('/student/dashboard')) return 'Dashboard';
    return 'Student Portal';
  };

  const sendHeartbeat = async (overrideData = {}) => {
    const user = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    // Only track if logged in as a student
    if (!user || !token) return;
    try {
      const userData = JSON.parse(user);
      if (userData.role !== 'student') return;
    } catch (e) {
      return;
    }

    if (!sessionRef.current || !tabRef.current) getOrCreateIds();

    const payload = {
      sessionId: sessionRef.current,
      tabId: tabRef.current,
      currentRoute: location.pathname,
      pageTitle: getPageTitle(location.pathname),
      action: currentState.current.action,
      status: currentState.current.status,
      isVisible: currentState.current.isVisible,
      metadata: currentState.current.metadata,
      ...overrideData
    };

    // Update current state reference
    currentState.current = { ...currentState.current, ...overrideData };

    try {
      if (overrideData.status === 'offline') {
        // Use sendBeacon for reliable delivery during page unload
        const url = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
        const beaconData = new Blob([JSON.stringify(payload)], { type: 'application/json' });
        navigator.sendBeacon(`${url}/api/student/heartbeat?token=${token}`, beaconData);
      } else {
        await apiFetch('/api/student/heartbeat', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
      }
    } catch (err) {
      console.error('Failed to send heartbeat', err);
    }
  };

  // Reset idle timer on user activity
  const resetIdleTimer = () => {
    if (currentState.current.status === 'idle') {
      sendHeartbeat({ status: 'online' });
    }
    
    if (idleTimeout.current) clearTimeout(idleTimeout.current);
    
    // Set user as idle after 5 minutes of no input
    idleTimeout.current = setTimeout(() => {
      sendHeartbeat({ status: 'idle' });
    }, 5 * 60 * 1000);
  };

  useEffect(() => {
    getOrCreateIds();

    // Setup activity listeners
    const activityEvents = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart'];
    activityEvents.forEach(event => document.addEventListener(event, resetIdleTimer, { passive: true }));
    
    // Setup visibility listener
    const handleVisibilityChange = () => {
      const isVisible = document.visibilityState === 'visible';
      sendHeartbeat({ isVisible });
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Setup graceful exit handler using pagehide instead of unload/beforeunload
    const handlePageHide = (event) => {
      sendHeartbeat({ status: 'offline' });
    };
    window.addEventListener('pagehide', handlePageHide);

    // Initial heartbeat on mount
    resetIdleTimer();
    sendHeartbeat({ action: 'Browsing', status: 'online' });

    // Periodic heartbeat every 60 seconds
    heartbeatInterval.current = setInterval(() => {
      sendHeartbeat();
    }, 60 * 1000);

    return () => {
      activityEvents.forEach(event => document.removeEventListener(event, resetIdleTimer));
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('pagehide', handlePageHide);
      if (heartbeatInterval.current) clearInterval(heartbeatInterval.current);
      if (idleTimeout.current) clearTimeout(idleTimeout.current);
    };
  }, []);

  // Send heartbeat on route change
  useEffect(() => {
    sendHeartbeat({ action: 'Browsing', metadata: {} });
  }, [location.pathname]);

  // Expose a method to manually send updates (e.g., from ProtectedViewer)
  return {
    updateActivity: (action, metadata = {}, status = 'online') => {
      sendHeartbeat({ action, metadata, status });
    }
  };
};
