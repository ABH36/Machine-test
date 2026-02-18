import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';

const Login = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false); // Added Loading State
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true); // Disable button
        
        try {
            const res = await api.post('/auth/login', formData);
            
            // Store Data
            localStorage.setItem('token', res.data.data.token);
            localStorage.setItem('user', JSON.stringify(res.data.data)); 
            
            toast.success('Login Successful');
            
            // ROLE BASED REDIRECT LOGIC
            const role = res.data.data.role;
            
            if (role === 'admin') {
                navigate('/admin');
            } else if (role === 'vendor') {
                navigate('/vendor'); // Redirect Vendor to Vendor Panel
            } else {
                navigate('/dashboard'); // Buyers go to User Dashboard
            }

        } catch (err) {
            console.error(err); // Debugging
            toast.error(err.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false); // Re-enable button
        }
    };

    return (
        <div className="flex h-screen items-center justify-center bg-gray-100">
            <motion.div 
                initial={{ opacity: 0, y: -20 }} 
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md p-8 bg-white rounded shadow-md"
            >
                <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Login</h2>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input 
                            type="email" 
                            required
                            placeholder="Enter your email" 
                            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
                            value={formData.email}
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                        <input 
                            type="password" 
                            required
                            placeholder="Enter your password" 
                            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
                            value={formData.password}
                            onChange={(e) => setFormData({...formData, password: e.target.value})}
                        />
                    </div>

                    <button 
                        disabled={loading}
                        className={`w-full text-white p-2 rounded transition font-medium ${
                            loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                        }`}
                    >
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>

                <p className="mt-4 text-center text-sm text-gray-600">
                    Don't have an account? <Link to="/signup" className="text-blue-600 font-semibold hover:underline">Sign up</Link>
                </p>
                
                <div className="mt-4 border-t pt-4 text-center">
                    <Link to="/" className="text-gray-500 text-xs hover:text-gray-700">Back to Home</Link>
                </div>
            </motion.div>
        </div>
    );
};
export default Login;