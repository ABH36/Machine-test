import { useState, useEffect } from 'react';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import Loader from '../components/Loader'; // Import Loader
import { toast } from 'react-toastify';

const Profile = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    
    // State for initial data fetch
    const [pageLoading, setPageLoading] = useState(true);
    // State for update button
    const [updateLoading, setUpdateLoading] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const { data } = await api.get('/users/profile');
                setName(data.data.name);
                setEmail(data.data.email);
            } catch (error) {
                toast.error('Failed to load profile');
            } finally {
                setPageLoading(false); // Stop loader
            }
        };
        fetchProfile();
    }, []);

    const handleUpdate = async (e) => {
        e.preventDefault();
        setUpdateLoading(true);
        try {
            const { data } = await api.put('/users/profile', { name, email, password });
            localStorage.setItem('user', JSON.stringify(data.data)); 
            toast.success('Profile Updated');
            setPassword('');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Update failed');
        } finally {
            setUpdateLoading(false);
        }
    };

    return (
        <>
            <Navbar />
            <div className="container mx-auto p-4 max-w-lg">
                <h1 className="text-2xl font-bold mb-4">Profile</h1>
                
                {/* Conditional Rendering */}
                {pageLoading ? (
                    <Loader />
                ) : (
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
                                disabled // Email usually shouldn't be changed easily in basic setups
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
                            disabled={updateLoading}
                            className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:bg-blue-300"
                        >
                            {updateLoading ? 'Updating...' : 'Update Profile'}
                        </button>
                    </form>
                )}
            </div>
        </>
    );
};

export default Profile;