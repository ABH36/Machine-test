import { useState, useEffect } from 'react';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import Loader from '../components/Loader';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    FaUsers, FaBoxes, FaShoppingCart, FaTrashAlt, 
    FaUserShield, FaStore, FaMoneyBillWave, FaGlobe 
} from 'react-icons/fa';

const Admin = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAdminData();
    }, []);

    const fetchAdminData = async () => {
        setLoading(true);
        try {
            // FIXED: Path must match your authRoutes.js registration
            const { data } = await api.get('/auth/admin/stats');
            setStats(data.data);
        } catch (error) {
            console.error("Admin Auth Error:", error.response);
            toast.error(error.response?.data?.message || "Security Clearance Failed: Access Denied");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteUser = async (id) => {
        if (!window.confirm("Permanently terminate this user account?")) return;
        try {
            // FIXED: Path must match your authRoutes.js registration
            await api.delete(`/auth/admin/user/${id}`);
            toast.success("User removed from platform");
            fetchAdminData();
        } catch (err) { 
            toast.error(err.response?.data?.message || "Action denied"); 
        }
    };

    if (loading) return <Loader />;

    const overviewCards = [
        { label: 'Total Revenue', value: `$${stats?.totalRevenue || 0}`, icon: <FaMoneyBillWave />, color: 'bg-emerald-600' },
        { label: 'Verified Users', value: stats?.users?.length || 0, icon: <FaUsers />, color: 'bg-blue-600' },
        { label: 'Total Inventory', value: stats?.products?.length || 0, icon: <FaBoxes />, color: 'bg-purple-600' },
        { label: 'Platform Sales', value: stats?.orders?.length || 0, icon: <FaShoppingCart />, color: 'bg-rose-600' },
    ];

    return (
        <div className="bg-[#0b0e11] min-h-screen pb-20 text-white">
            <Navbar />
            
            <div className="container mx-auto p-4 lg:p-10">
                
                {/* --- Console Header --- */}
                <div className="flex justify-between items-center mb-12">
                    <motion.div initial={{ x: -50, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
                        <h1 className="text-4xl md:text-6xl font-black tracking-tighter italic flex items-center gap-4">
                            <FaUserShield className="text-rose-600" /> ADMIN <span className="text-rose-600 underline">CONSOLE</span>
                        </h1>
                        <p className="text-gray-500 font-black uppercase text-[10px] tracking-[0.5em] mt-3">Global Infrastructure Control</p>
                    </motion.div>
                    <div className="hidden md:block bg-rose-600/10 border border-rose-600/20 px-6 py-3 rounded-2xl">
                        <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest animate-pulse">System Status: Optimal</p>
                    </div>
                </div>

                {/* --- Analytics Engine --- */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                    {overviewCards.map((card, i) => (
                        <motion.div 
                            whileHover={{ y: -10, scale: 1.02 }}
                            key={i} 
                            className={`${card.color} p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden group`}
                        >
                            <div className="relative z-10">
                                <p className="text-white/60 text-[10px] font-black uppercase tracking-widest">{card.label}</p>
                                <h3 className="text-4xl font-black mt-2 tracking-tighter">{card.value}</h3>
                            </div>
                            <div className="absolute top-1/2 -right-6 -translate-y-1/2 text-9xl text-white/10 rotate-12 group-hover:rotate-0 transition-all duration-700">
                                {card.icon}
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* --- Control Tabs --- */}
                <div className="flex flex-wrap gap-4 mb-10 bg-white/5 p-2 rounded-3xl w-fit border border-white/10 backdrop-blur-md">
                    {['overview', 'users', 'inventory', 'global-orders'].map(tab => (
                        <button 
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-6 md:px-10 py-3 md:py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all ${activeTab === tab ? 'bg-rose-600 text-white shadow-[0px_10px_20px_rgba(225,29,72,0.4)]' : 'text-gray-500 hover:text-white'}`}
                        >
                            {tab.replace('-', ' ')}
                        </button>
                    ))}
                </div>

                <AnimatePresence mode="wait">
                    {/* --- USERS TERMINAL --- */}
                    {activeTab === 'users' && (
                        <motion.div key="users" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="bg-[#151921] rounded-[3rem] border border-white/5 overflow-hidden shadow-2xl">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-white/5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">
                                            <th className="p-8">Node Identity</th>
                                            <th className="p-8">Access Level</th>
                                            <th className="p-8 text-right">Protocol</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {stats?.users.map(u => (
                                            <tr key={u._id} className="hover:bg-white/[0.03] transition-colors">
                                                <td className="p-8">
                                                    <p className="font-black text-xl tracking-tight uppercase">{u.name}</p>
                                                    <p className="text-xs text-rose-500/60 font-mono mt-1">{u.email}</p>
                                                </td>
                                                <td className="p-8">
                                                    <span className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest ${u.role === 'admin' ? 'bg-rose-500/20 text-rose-500 border border-rose-500/30' : u.role === 'vendor' ? 'bg-purple-500/20 text-purple-500 border border-purple-500/30' : 'bg-blue-500/20 text-blue-500 border border-blue-500/30'}`}>
                                                        {u.role}
                                                    </span>
                                                </td>
                                                <td className="p-8 text-right">
                                                    {u.role !== 'admin' ? (
                                                        <button onClick={() => handleDeleteUser(u._id)} className="p-5 bg-rose-500/10 text-rose-500 rounded-2xl hover:bg-rose-600 hover:text-white transition-all shadow-lg active:scale-90">
                                                            <FaTrashAlt />
                                                        </button>
                                                    ) : (
                                                        <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest italic">Immutable</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </motion.div>
                    )}

                    {/* --- INVENTORY MONITOR --- */}
                    {activeTab === 'inventory' && (
                        <motion.div key="inv" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {stats?.products.map(p => (
                                <div key={p._id} className="bg-[#151921] p-8 rounded-[3rem] border border-white/5 flex gap-8 items-center group hover:border-blue-500/30 transition-all">
                                    <div className="relative flex-shrink-0">
                                        <img src={p.image || "https://via.placeholder.com/150"} className="w-28 h-28 object-cover rounded-[1.5rem] shadow-2xl group-hover:scale-110 transition-transform duration-500" alt="" />
                                        <div className="absolute -top-3 -right-3 bg-blue-600 text-white p-2 rounded-xl text-[10px] font-black shadow-lg">
                                            ${p.price}
                                        </div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-blue-500 font-black text-[9px] uppercase tracking-[0.3em]">{p.category}</p>
                                        <h4 className="text-2xl font-black uppercase tracking-tighter mt-1 truncate">{p.name}</h4>
                                        <div className="flex items-center gap-2 mt-4 text-gray-500">
                                            <FaStore className="text-xs" />
                                            <p className="text-[10px] font-bold uppercase tracking-widest truncate">{p.vendor?.name || 'Unknown Vendor'}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </motion.div>
                    )}

                    {/* --- GLOBAL ORDERS LOG --- */}
                    {activeTab === 'global-orders' && (
                        <motion.div key="ords" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-[#151921] rounded-[3rem] border border-white/5 overflow-hidden shadow-2xl">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-white/5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">
                                            <th className="p-8">Transaction Hub</th>
                                            <th className="p-8">Stakeholder</th>
                                            <th className="p-8">Volume</th>
                                            <th className="p-8">Lifecycle</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {stats?.orders.map(o => (
                                            <tr key={o._id} className="hover:bg-white/[0.03] transition-colors">
                                                <td className="p-8">
                                                    <p className="font-mono text-xs text-blue-500">#{o._id.toUpperCase().slice(-6)}</p>
                                                    <p className="text-[10px] font-black text-gray-500 mt-1 uppercase">{new Date(o.createdAt).toLocaleDateString()}</p>
                                                </td>
                                                <td className="p-8">
                                                    <p className="font-black text-sm uppercase">{o.user?.name || "Deleted User"}</p>
                                                    <p className="text-[10px] text-gray-500 font-mono">{o.user?.email || "N/A"}</p>
                                                </td>
                                                <td className="p-8 font-black text-2xl text-emerald-500">${o.totalAmount}</td>
                                                <td className="p-8">
                                                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase ${o.status === 'Approved' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-amber-500/20 text-amber-500'}`}>
                                                        {o.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </motion.div>
                    )}

                    {/* --- OVERVIEW TAB --- */}
                    {activeTab === 'overview' && (
                        <motion.div key="overview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            <div className="bg-gradient-to-br from-rose-600/20 to-transparent p-10 rounded-[3rem] border border-white/5">
                                <h3 className="text-2xl font-black italic mb-6 uppercase tracking-tighter">System Integrity</h3>
                                <p className="text-gray-400 leading-relaxed text-sm">
                                    Current platform health is optimal. New node registrations have increased by 12% this session.
                                    Market interaction protocols are being monitored via Bearer Token authentication.
                                </p>
                                <div className="mt-8 h-2 bg-white/5 rounded-full overflow-hidden">
                                    <div className="w-[85%] h-full bg-rose-600"></div>
                                </div>
                                <p className="text-[9px] font-black text-gray-500 mt-3 uppercase tracking-widest text-right">Node Stability: 98.4%</p>
                            </div>
                            
                            <div className="bg-[#151921] p-10 rounded-[3rem] border border-white/5 flex items-center justify-center">
                                <div className="text-center">
                                    <FaGlobe className="text-rose-600 text-7xl mx-auto mb-6 animate-pulse" />
                                    <h4 className="text-xl font-black uppercase tracking-[0.3em]">Live Ecosystem</h4>
                                    <p className="text-gray-500 text-xs mt-2 font-bold uppercase">Real-time Node Monitoring Enabled</p>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default Admin;