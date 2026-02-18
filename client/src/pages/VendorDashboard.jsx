import { useState, useEffect } from 'react';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import Loader from '../components/Loader';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    FaBoxOpen, FaDollarSign, FaExclamationTriangle, FaCloudUploadAlt, 
    FaEdit, FaTrash, FaPlus, FaTag, FaClipboardList, 
    FaDownload, FaUser, FaCheckCircle, FaHourglassHalf, FaLink 
} from 'react-icons/fa';

const VendorDashboard = () => {
    // --- States ---
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('inventory');
    
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);
    const [uploading, setUploading] = useState(false);
    
    const [form, setForm] = useState({ 
        name: '', 
        description: '', 
        price: '', 
        stock: '', 
        image: '',
        category: 'General' 
    });

    const [stats, setStats] = useState({
        totalProducts: 0,
        totalValue: 0,
        lowStock: 0,
        revenue: 0,
        pendingOrders: 0
    });

    // --- Lifecycle ---
    useEffect(() => {
        fetchAllData();
    }, []);

    // --- Data Fetching ---
    const fetchAllData = async () => {
        setLoading(true);
        try {
            const [prodRes, orderRes] = await Promise.all([
                api.get('/products/vendor/all'),
                api.get('/orders/vendor')
            ]);
            
            setProducts(prodRes.data.data);
            setOrders(orderRes.data.data);
            calculateStats(prodRes.data.data, orderRes.data.data);
        } catch (error) {
            toast.error('Business data synchronization failed');
        } finally {
            setLoading(false);
        }
    };

    const calculateStats = (pData, oData) => {
        const totalValue = pData.reduce((acc, item) => acc + (Number(item.price) * Number(item.stock)), 0);
        // Revenue sirf Approved orders se calculate hogi
        const revenue = oData
            .filter(o => o.status === 'Approved')
            .reduce((acc, order) => acc + Number(order.totalAmount), 0);
        
        const pendingCount = oData.filter(o => o.status === 'Pending').length;
        
        setStats({
            totalProducts: pData.length,
            totalValue,
            lowStock: pData.filter(item => item.stock < 5).length,
            revenue,
            pendingOrders: pendingCount
        });
    };

    // --- Actions ---
    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) return toast.error("File exceeds 5MB limit");

        setUploading(true);
        const formData = new FormData();
        formData.append("image", file);

        try {
            const { data } = await api.post('/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            if (data.success) {
                setForm(prev => ({ ...prev, image: data.url }));
                toast.success("Gallery Image Ready!");
            }
        } catch (error) {
            toast.warning("Gallery upload error. Use Manual URL instead.");
        } finally {
            setUploading(false);
        }
    };

    const handleStatusUpdate = async (orderId, newStatus) => {
        try {
            await api.put(`/orders/${orderId}/status`, { status: newStatus });
            toast.success(`Order set to ${newStatus}`);
            fetchAllData();
        } catch (error) {
            toast.error("Status update failed");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.name || !form.price) return toast.error("Missing required fields");

        try {
            if (isEditing) {
                await api.put(`/products/${editId}`, form);
                toast.success('Inventory Updated');
            } else {
                await api.post('/products', form);
                toast.success('Product Successfully Listed');
            }
            // Reset
            setIsEditing(false);
            setEditId(null);
            setForm({ name: '', description: '', price: '', stock: '', image: '', category: 'General' });
            fetchAllData();
        } catch (error) {
            toast.error('Database submission error');
        }
    };

    const handleEdit = (p) => {
        setForm({
            name: p.name,
            description: p.description,
            price: p.price,
            stock: p.stock,
            image: p.image,
            category: p.category || 'General'
        });
        setEditId(p._id);
        setIsEditing(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Permanently remove this item from listing?")) return;
        try {
            await api.delete(`/products/${id}`);
            toast.success("Item Removed");
            fetchAllData();
        } catch (error) {
            toast.error("Deletion failed");
        }
    };

    const exportToCSV = () => {
        const rows = products.map(p => `${p.name},${p.category},${p.price},${p.stock},"${p.description}"\n`);
        const blob = new Blob(["Name,Category,Price,Stock,Description\n", ...rows], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `SellerInventory_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
    };

    return (
        <div className="bg-gray-50 min-h-screen pb-20">
            <Navbar />
            <div className="container mx-auto p-4 lg:p-10">
                
                {/* --- Dynamic Header --- */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
                    <motion.div initial={{ x: -30, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
                        <h1 className="text-6xl font-black text-gray-900 tracking-tighter italic">SELLER STUDIO</h1>
                        <p className="text-gray-400 font-bold tracking-[0.2em] uppercase text-xs mt-2">Global Marketplace Portal</p>
                    </motion.div>
                    <button 
                        onClick={exportToCSV}
                        className="flex items-center gap-3 bg-white border-2 border-black px-8 py-4 rounded-2xl font-black uppercase text-sm hover:bg-black hover:text-white transition-all shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none"
                    >
                        <FaDownload /> Download Inventory Report
                    </button>
                </div>

                {/* --- Business Analytics --- */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    <StatCard icon={<FaDollarSign />} title="Confirmed Revenue" value={`$${stats.revenue}`} color="bg-emerald-600" />
                    <StatCard icon={<FaHourglassHalf />} title="Approval Queue" value={stats.pendingOrders} color="bg-amber-500" />
                    <StatCard icon={<FaBoxOpen />} title="Active SKU" value={stats.totalProducts} color="bg-blue-600" />
                    <StatCard icon={<FaExclamationTriangle />} title="Low Inventory" value={stats.lowStock} color="bg-rose-600" />
                </div>

                {/* --- Tab Navigation --- */}
                <div className="flex gap-4 mb-10 bg-black/5 p-2 rounded-3xl w-fit backdrop-blur-sm border border-black/5">
                    <button 
                        onClick={() => setActiveTab('inventory')}
                        className={`px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${activeTab === 'inventory' ? 'bg-white shadow-xl text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        Product Manager
                    </button>
                    <button 
                        onClick={() => setActiveTab('orders')}
                        className={`px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'orders' ? 'bg-white shadow-xl text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        Sales Feed {stats.pendingOrders > 0 && <span className="bg-rose-500 text-white w-5 h-5 flex items-center justify-center rounded-full text-[10px] animate-pulse">{stats.pendingOrders}</span>}
                    </button>
                </div>

                {loading ? <Loader /> : (
                    <AnimatePresence mode="wait">
                        {activeTab === 'inventory' ? (
                            <motion.div key="inventory_view" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                                
                                {/* LEFT: Management Form */}
                                <div className="lg:col-span-1">
                                    <div className="bg-white rounded-[2.5rem] shadow-2xl p-8 border border-gray-100 sticky top-24">
                                        <h2 className="text-2xl font-black mb-8 flex items-center gap-3">
                                            <div className={`p-3 rounded-2xl ${isEditing ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-600'}`}>
                                                {isEditing ? <FaEdit /> : <FaPlus />}
                                            </div>
                                            {isEditing ? 'UPDATE LISTING' : 'NEW LISTING'}
                                        </h2>
                                        
                                        <form onSubmit={handleSubmit} className="space-y-5">
                                            {/* Image Studio */}
                                            <div className="space-y-3">
                                                <div className="group relative border-4 border-dashed border-gray-100 rounded-[2rem] p-6 text-center hover:bg-blue-50/50 hover:border-blue-200 transition-all cursor-pointer overflow-hidden">
                                                    <input type="file" onChange={handleImageUpload} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                                                    {uploading ? (
                                                        <div className="py-6 animate-pulse text-blue-600 font-black">SYNCING TO CLOUD...</div>
                                                    ) : form.image ? (
                                                        <img src={form.image} className="h-44 w-full object-cover rounded-2xl shadow-lg" alt="Preview" />
                                                    ) : (
                                                        <div className="py-6">
                                                            <FaCloudUploadAlt className="mx-auto text-5xl text-gray-200 group-hover:text-blue-400 transition" />
                                                            <p className="text-gray-400 text-[10px] font-black uppercase mt-3 tracking-widest">Select Product Asset</p>
                                                        </div>
                                                    )}
                                                </div>
                                                {/* FIXED: URL Fallback Input */}
                                                <div className="flex items-center gap-2 bg-gray-50 px-4 py-3 rounded-2xl border border-gray-100">
                                                    <FaLink className="text-gray-300 text-xs" />
                                                    <input 
                                                        className="bg-transparent border-none w-full outline-none text-[10px] font-mono text-gray-500" 
                                                        placeholder="MANUAL IMAGE URL (OPTIONAL)" 
                                                        value={form.image} 
                                                        onChange={e => setForm({...form, image: e.target.value})} 
                                                    />
                                                </div>
                                            </div>

                                            <input className="w-full bg-gray-50 p-5 rounded-2xl outline-none font-bold border-2 border-transparent focus:border-blue-500 focus:bg-white transition-all shadow-inner" placeholder="Official Product Name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
                                            
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-1">
                                                    <label className="text-[10px] font-black text-gray-400 ml-2 uppercase">Price ($)</label>
                                                    <input className="w-full bg-gray-50 p-5 rounded-2xl outline-none font-black text-blue-600 border-2 border-transparent focus:border-blue-500 shadow-inner" type="number" value={form.price} onChange={e => setForm({...form, price: e.target.value})} />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-[10px] font-black text-gray-400 ml-2 uppercase">Quantity</label>
                                                    <input className="w-full bg-gray-50 p-5 rounded-2xl outline-none font-black text-gray-800 border-2 border-transparent focus:border-blue-500 shadow-inner" type="number" value={form.stock} onChange={e => setForm({...form, stock: e.target.value})} />
                                                </div>
                                            </div>

                                            <div className="space-y-1">
                                                <label className="text-[10px] font-black text-gray-400 ml-2 uppercase">Vertical/Category</label>
                                                <select className="w-full bg-gray-50 p-5 rounded-2xl outline-none font-bold text-gray-700 border-2 border-transparent focus:border-blue-500 appearance-none shadow-inner" value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
                                                    <option value="General">General Marketplace</option>
                                                    <option value="Electronics">Electronics & Tech</option>
                                                    <option value="Fashion">Apparel & Fashion</option>
                                                    <option value="Home">Interior & Home</option>
                                                </select>
                                            </div>

                                            <textarea className="w-full bg-gray-50 p-5 rounded-2xl outline-none h-28 font-bold text-sm shadow-inner border-2 border-transparent focus:border-blue-500" placeholder="Technical specifications & features..." value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
                                            
                                            <button className="w-full bg-gray-900 text-white p-5 rounded-2xl font-black shadow-2xl hover:bg-black transition-all transform active:scale-95 tracking-widest uppercase text-xs">
                                                {isEditing ? 'COMMIT UPDATES' : 'PUBLISH LISTING'}
                                            </button>
                                        </form>
                                    </div>
                                </div>

                                {/* RIGHT: Product Catalog */}
                                <div className="lg:col-span-2 space-y-6">
                                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.3em] mb-4">Active Catalog ({products.length})</h3>
                                    {products.map(p => (
                                        <div key={p._id} className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-8 items-center hover:shadow-2xl transition-all group">
                                            <div className="relative">
                                                <img src={p.image || "https://via.placeholder.com/150"} className="w-32 h-32 object-cover rounded-[1.5rem] shadow-lg group-hover:scale-105 transition-transform duration-500" alt={p.name} />
                                                {p.stock <= 0 && <div className="absolute inset-0 bg-rose-600/80 backdrop-blur-sm rounded-[1.5rem] flex items-center justify-center text-white text-[10px] font-black uppercase">OOS</div>}
                                            </div>
                                            
                                            <div className="flex-1 text-center sm:text-left">
                                                <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest bg-blue-50 px-2 py-1 rounded-md">{p.category}</span>
                                                <h3 className="font-black text-2xl text-gray-900 mt-2 tracking-tight">{p.name}</h3>
                                                <p className="text-blue-600 font-black text-xl mt-1">${p.price}</p>
                                                
                                                <div className="flex justify-center sm:justify-start gap-4 mt-5">
                                                    <button onClick={() => handleEdit(p)} className="text-gray-400 hover:text-blue-600 font-black text-[10px] uppercase tracking-widest flex items-center gap-2 transition-colors"><FaEdit /> Edit</button>
                                                    <button onClick={() => handleDelete(p._id)} className="text-gray-400 hover:text-rose-600 font-black text-[10px] uppercase tracking-widest flex items-center gap-2 transition-colors"><FaTrash /> Delete</button>
                                                </div>
                                            </div>
                                            
                                            <div className={`px-8 py-5 rounded-[1.5rem] border-2 ${p.stock < 5 ? 'bg-rose-50 border-rose-100 text-rose-600' : 'bg-emerald-50 border-emerald-100 text-emerald-600'} text-center min-w-[120px]`}>
                                                <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Unit Count</p>
                                                <p className="text-3xl font-black">{p.stock}</p>
                                            </div>
                                        </div>
                                    ))}
                                    {products.length === 0 && <div className="p-20 text-center text-gray-300 font-black uppercase italic tracking-widest border-4 border-dashed border-gray-100 rounded-[3rem]">No Inventory Assets Found</div>}
                                </div>
                            </motion.div>
                        ) : (
                            /* --- SALES FEED TAB (Orders) --- */
                            <motion.div key="orders_view" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-gray-100">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-gray-900 text-white text-[10px] font-black uppercase tracking-[0.2em]">
                                                <th className="p-8">Customer Profiling</th>
                                                <th className="p-8 text-center">SKU Details</th>
                                                <th className="p-8">Lifecycle Status</th>
                                                <th className="p-8 text-right">Approval Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {orders.map(order => (
                                                <tr key={order._id} className="hover:bg-blue-50/30 transition-colors">
                                                    <td className="p-8">
                                                        <div className="flex items-center gap-5">
                                                            <div className="bg-blue-100 p-4 rounded-2xl text-blue-600 shadow-inner"><FaUser /></div>
                                                            <div>
                                                                <p className="font-black text-gray-900 uppercase text-xs tracking-tight">{order.customer?.name}</p>
                                                                <p className="text-[10px] font-bold text-gray-400">{order.customer?.email}</p>
                                                                <p className="text-[9px] font-mono mt-1 text-blue-500">ID: #{order._id.slice(-6).toUpperCase()}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="p-8 text-center">
                                                        <div className="space-y-1">
                                                            {order.items.map((item, i) => (
                                                                <p key={i} className="text-xs font-black text-gray-700">{item.name} <span className="text-gray-400">× {item.qty}</span></p>
                                                            ))}
                                                            <p className="text-2xl font-black text-gray-900 mt-2">${order.totalAmount}</p>
                                                        </div>
                                                    </td>
                                                    <td className="p-8">
                                                        <span className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-tighter shadow-sm border ${order.status === 'Pending' ? 'bg-amber-100 text-amber-600 border-amber-200' : 'bg-emerald-100 text-emerald-600 border-emerald-200'}`}>
                                                            {order.status}
                                                        </span>
                                                    </td>
                                                    <td className="p-8 text-right">
                                                        {order.status === 'Pending' ? (
                                                            <button 
                                                                onClick={() => handleStatusUpdate(order._id, 'Approved')}
                                                                className="bg-emerald-600 text-white px-8 py-3 rounded-2xl font-black text-xs hover:bg-emerald-700 shadow-[0px_4px_15px_rgba(16,185,129,0.4)] active:scale-95 transition-all uppercase tracking-widest"
                                                            >
                                                                Authorize Order
                                                            </button>
                                                        ) : (
                                                            <div className="flex items-center justify-end gap-2 text-emerald-600 font-black text-xs uppercase tracking-widest">
                                                                <FaCheckCircle className="text-lg" /> Fully Authorized
                                                            </div>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                {orders.length === 0 && <div className="p-32 text-center text-gray-300 font-black uppercase tracking-[0.4em] text-sm">Awaiting First Market Transaction</div>}
                            </motion.div>
                        )}
                    </AnimatePresence>
                )}
            </div>
        </div>
    );
};

// --- StatCard Helper Component ---
const StatCard = ({ icon, title, value, color }) => (
    <motion.div 
        whileHover={{ y: -10, scale: 1.02 }} 
        className={`${color} p-10 rounded-[2.5rem] shadow-2xl text-white relative overflow-hidden group transition-all duration-500`}
    >
        <div className="relative z-10">
            <p className="text-white/60 text-[10px] font-black uppercase tracking-[0.2em] mb-2">{title}</p>
            <h3 className="text-5xl font-black tracking-tighter">{value}</h3>
        </div>
        <div className="absolute top-1/2 -right-8 -translate-y-1/2 text-[10rem] text-white/10 rotate-12 group-hover:rotate-0 transition-transform duration-700">{icon}</div>
    </motion.div>
);

export default VendorDashboard;