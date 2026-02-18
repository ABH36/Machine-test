import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = ({ adminOnly = false, vendorOnly = false }) => {
    const token = localStorage.getItem('token');
    
    // Safer JSON parsing to prevent white-screen crashes if data is corrupted
    let user = null;
    try {
        user = JSON.parse(localStorage.getItem('user'));
    } catch (e) {
        localStorage.removeItem('user'); // Clean up bad data
    }

    // 1. Not Logged In? -> Go to Login
    if (!token || !user) {
        return <Navigate to="/login" replace />;
    }

    // 2. Admin Route Protection
    if (adminOnly && user.role !== 'admin') {
        // If a vendor/user tries to access admin, send them to dashboard
        return <Navigate to="/dashboard" replace />;
    }

    // 3. Vendor Route Protection (NEW)
    if (vendorOnly && user.role !== 'vendor') {
        // If a normal user tries to access vendor panel, send them back
        return <Navigate to="/dashboard" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;