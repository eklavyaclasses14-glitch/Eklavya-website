import { Navigate, Outlet } from 'react-router-dom';

/**
 * ProtectedRoute
 * Route guard component that secures frontend routes based on JWT authentication and role-based access control.
 * Prevents unauthorized page mounting, layout flickering, and unauthorized API requests.
 */
export default function ProtectedRoute({ allowedRoles }) {
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');

  // 1. If not authenticated, redirect to login page
  if (!token || !userStr) {
    return <Navigate to="/login" replace />;
  }

  try {
    const userData = JSON.parse(userStr);
    const role = userData.role;

    // 2. If authenticated but role is not permitted for this route
    if (!allowedRoles.includes(role)) {
      console.warn(`[ProtectedRoute] Unauthorized access attempt by role: ${role}. Redirecting to default dashboard.`);
      
      // Redirect to the user's respective default landing dashboard
      if (role === 'student') {
        return <Navigate to="/student/dashboard" replace />;
      } else if (role === 'staff') {
        return <Navigate to="/staff/dashboard" replace />;
      } else if (role === 'admin') {
        return <Navigate to="/admin/dashboard" replace />;
      }
      
      // Fallback if role is corrupted or unknown
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return <Navigate to="/login" replace />;
    }

    // 3. Authorized, render the child routes inside the Outlet
    return <Outlet />;
  } catch (err) {
    console.error('[ProtectedRoute] Error parsing user details:', err);
    // Clear corrupted localStorage and redirect to login
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return <Navigate to="/login" replace />;
  }
}
