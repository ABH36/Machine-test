import { useState, useEffect } from 'react';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import { toast } from 'react-toastify';

const Profile = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

   useEffect(() => {
        const fetchProfile = async () => {
            try {
                const { data } = await api.get('/users/profile');
                // FIX: Accessing data.data due to new API structure
                setName(data.data.name);
                setEmail(data.data.email);
            } catch (error) {
                toast.error('Failed to load profile');
            }
        };
        fetchProfile();
    }, []);

    const handleUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { data } = await api.put('/users/profile', { name, email, password });
            // FIX: Accessing data.data
            localStorage.setItem('user', JSON.stringify(data.data)); 
            toast.success('Profile Updated');
            setPassword('');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Update failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Navbar />
            <div className="container mx-auto p-4 max-w-lg">
                <h1 className="text-2xl font-bold mb-4">Profile</h1>
                <form onSubmit={handleUpdate} className="bg-white p-6 rounded shadow space-y-4">
                    <div>
                        <label className="block text-sm font-medium">Name</label>
                        <input 
                            type="text" 
                            value={name} 
                            onChange={(e) => setName(e.target.value)} 
                            className="w-full border p-2 rounded"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Email</label>
                        <input 
                            type="email" 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                            className="w-full border p-2 rounded"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium">New Password</label>
                        <input 
                            type="password" 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            placeholder="Leave blank to keep current"
                            className="w-full border p-2 rounded"
                        />
                    </div>
                    <button 
                        disabled={loading}
                        className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:bg-blue-300"
                    >
                        {loading ? 'Updating...' : 'Update Profile'}
                    </button>
                </form>
            </div>
        </>
    );
};

export default Profile;