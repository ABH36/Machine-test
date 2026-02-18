import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';

const Signup = () => {
    const [formData, setFormData] = useState({ 
        name: '', 
        email: '', 
        password: '', 
        role: 'user' // Default role
    });
    const [loading, setLoading] = useState(false); // Loading state
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true); // Disable button
        
        try {
            const res = await api.post('/auth/register', formData);
            
            // Store Data
            localStorage.setItem('token', res.data.data.token);
            localStorage.setItem('user', JSON.stringify(res.data.data));
            
            toast.success('Registration Successful');
            
            // ROLE BASED REDIRECT
            // If Vendor -> Go to Vendor Panel
            // If Buyer -> Go to User Dashboard
            if (res.data.data.role === 'vendor') {
                navigate('/vendor');
            } else {
                navigate('/dashboard');
            }

        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || 'Signup failed');
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
                <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Create Account</h2>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                        <input 
                            type="text" 
                            required
                            placeholder="Enter your name" 
                            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                        />
                    </div>

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
                            placeholder="Create a password" 
                            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
                            value={formData.password}
                            onChange={(e) => setFormData({...formData, password: e.target.value})}
                        />
                    </div>

                    {/* Role Selector */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            I want to:
                        </label>
                        <select 
                            value={formData.role}
                            onChange={(e) => setFormData({...formData, role: e.target.value})}
                            className="w-full p-2 border rounded bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                        >
                            <option value="user">Buy Products (Customer)</option>
                            <option value="vendor">Sell Products (Vendor)</option>
                        </select>
                    </div>

                    <button 
                        disabled={loading}
                        className={`w-full text-white p-2 rounded transition font-medium ${
                            loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                        }`}
                    >
                        {loading ? 'Creating Account...' : 'Sign Up'}
                    </button>
                </form>

                <p className="mt-4 text-center text-sm text-gray-600">
                    Already have an account? <Link to="/login" className="text-blue-600 font-semibold hover:underline">Login</Link>
                </p>
            </motion.div>
        </div>
    );
};
export default Signup;