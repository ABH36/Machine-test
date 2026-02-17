import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';

const Signup = () => {
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('/auth/register', formData);
            localStorage.setItem('token', res.data.data.token);
            localStorage.setItem('user', JSON.stringify(res.data.data));
            toast.success('Registration Successful');
            navigate('/dashboard');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Signup failed');
        }
    };

    return (
        <div className="flex h-screen items-center justify-center bg-gray-100">
            <motion.div 
                initial={{ opacity: 0, y: -20 }} 
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md p-8 bg-white rounded shadow-md"
            >
                <h2 className="text-2xl font-bold mb-6 text-center">Sign Up</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input 
                        type="text" 
                        placeholder="Name" 
                        className="w-full p-2 border rounded"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                    <input 
                        type="email" 
                        placeholder="Email" 
                        className="w-full p-2 border rounded"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                    />
                    <input 
                        type="password" 
                        placeholder="Password" 
                        className="w-full p-2 border rounded"
                        value={formData.password}
                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                    />
                    <button className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700">Sign Up</button>
                </form>
                <p className="mt-4 text-center text-sm">
                    Already have an account? <Link to="/login" className="text-blue-600">Login</Link>
                </p>
            </motion.div>
        </div>
    );
};
export default Signup;