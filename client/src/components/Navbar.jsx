import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const Navbar = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));
    const token = localStorage.getItem('token');

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        toast.info("Logged out");
        navigate('/login');
    };

    if (!token) return null;

    return (
        <nav className="bg-white shadow p-4 mb-6">
            <div className="container mx-auto flex justify-between items-center">
                <Link to="/dashboard" className="text-xl font-bold text-blue-600">MERN App</Link>
                <div className="space-x-4">
                    <Link to="/profile" className="text-gray-600 hover:text-blue-500">Profile</Link>
                    {user?.role === 'admin' && (
                        <Link to="/admin" className="text-gray-600 hover:text-blue-500">Admin</Link>
                    )}
                    <button onClick={handleLogout} className="text-red-500 font-medium">Logout</button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;