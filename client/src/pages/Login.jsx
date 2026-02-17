import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';

const Login = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
    e.preventDefault();
    try {
        const res = await api.post('/auth/login', formData);
        localStorage.setItem('token', res.data.data.token);
        // Note: Backend response structure check kar lena (res.data.data)
        localStorage.setItem('user', JSON.stringify(res.data.data)); 
        
        toast.success('Login Successful');
        
        // YAHAN CHANGE KIYA HAI: Role check karke redirect karo
        if (res.data.data.role === 'admin') {
            navigate('/admin');
        } else {
            navigate('/dashboard');
        }

    } catch (err) {
        toast.error(err.response?.data?.message || 'Login failed');
    }
};

    return (
        <div className="flex h-screen items-center justify-center bg-gray-100">
            <motion.div 
                initial={{ opacity: 0, y: -20 }} 
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md p-8 bg-white rounded shadow-md"
            >
                <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
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
                    <button className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700">Login</button>
                </form>
                <p className="mt-4 text-center text-sm">
                    Don't have an account? <Link to="/signup" className="text-blue-600">Sign up</Link>
                </p>
            </motion.div>
        </div>
    );
};
export default Login;