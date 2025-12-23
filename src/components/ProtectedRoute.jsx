import { Navigate } from 'react-router-dom';

/**
 * Protected Route Component
 * Ensures user is authenticated and has the correct role
 */
export default function ProtectedRoute({ children, allowedRoles }) {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');

    // Not authenticated - redirect to login
    if (!token) {
        return <Navigate to="/auth" replace />;
    }

    // Check role if roles are specified
    if (allowedRoles && allowedRoles.length > 0) {
        try {
            const user = JSON.parse(userStr || '{}');

            // User doesn't have required role - redirect to home
            if (!allowedRoles.includes(user.role)) {
                return <Navigate to="/" replace />;
            }
        } catch (error) {
            // Invalid user data - redirect to login
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            return <Navigate to="/auth" replace />;
        }
    }

    // Authenticated and authorized
    return children;
}
