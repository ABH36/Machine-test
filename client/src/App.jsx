import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Pages
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Admin from './pages/Admin';
import NotFound from './pages/NotFound';

// Components
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        
        {/* User Protected Routes (Must be logged in) */}
        <Route element={<ProtectedRoute />}>
           {/* Redirect root to dashboard */}
           <Route path="/" element={<Navigate to="/dashboard" replace />} />
           <Route path="/dashboard" element={<Dashboard />} />
           <Route path="/profile" element={<Profile />} />
        </Route>

        {/* Admin Protected Routes (Must be Admin) */}
        <Route element={<ProtectedRoute adminOnly={true} />}>
            <Route path="/admin" element={<Admin />} />
        </Route>

        {/* 404 Catch-All Route (Must be last) */}
        <Route path="*" element={<NotFound />} />
      </Routes>

      {/* Global Toast Notifications */}
      <ToastContainer position="top-right" autoClose={3000} />
    </Router>
  );
}

export default App;