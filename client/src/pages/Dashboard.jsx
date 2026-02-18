import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import Loader from '../components/Loader';
import { FaShoppingCart, FaHeart, FaChevronRight, FaClock, FaCheckDouble } from 'react-icons/fa';

const Dashboard = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const { data } = await api.get('/orders/my');
            setOrders(data.data);
        } catch (error) {
            console.error("Fetch error:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-[#f8f9fa] min-h-screen pb-20">
            <Navbar />
            <div className="container mx-auto p-4 lg:p-10">
                
                {/* Header Card */}
                <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100 mb-10 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div>
                        <h1 className="text-5xl font-black text-gray-900 tracking-tighter mb-2 italic">
                            HELLO, {user?.name?.split(' ')[0].toUpperCase()}!
                        </h1>
                        <p className="text-gray-400 font-bold uppercase text-[10px] tracking-[0.3em]">Account Level: {user?.role}</p>
                    </div>
                    <div className="flex gap-4">
                        <Link to="/wishlist" className="bg-white border-2 border-gray-100 p-4 rounded-2xl text-rose-500 hover:bg-rose-50 transition-all shadow-sm">
                            <FaHeart size={20} />
                        </Link>
                        <Link to="/products" className="bg-black text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-800 transition-all shadow-xl flex items-center gap-3">
                            <FaShoppingCart /> New Purchase
                        </Link>
                    </div>
                </div>

                {/* Tracking Header */}
                <div className="flex justify-between items-end mb-8 px-2">
                    <div>
                        <h2 className="text-3xl font-black text-gray-900 tracking-tighter uppercase italic">Purchase Registry</h2>
                        <div className="h-1 w-20 bg-blue-600 mt-2 rounded-full"></div>
                    </div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Status: Active</p>
                </div>
                
                {loading ? (
                    <Loader />
                ) : orders.length === 0 ? (
                    <div className="bg-white p-32 rounded-[3rem] text-center border-4 border-dashed border-gray-100">
                        <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <FaShoppingCart className="text-gray-200" size={30} />
                        </div>
                        <p className="text-gray-400 font-black uppercase tracking-[0.2em] text-sm italic">No Transaction Records Found</p>
                        <Link to="/products" className="text-blue-600 font-black mt-6 inline-flex items-center gap-2 hover:gap-4 transition-all uppercase text-xs tracking-widest">
                            Explore Marketplace <FaChevronRight />
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {orders.map((order) => (
                            <div key={order._id} className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-500 group">
                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                                    
                                    {/* Order Meta */}
                                    <div className="lg:col-span-3">
                                        <p className="text-blue-600 font-black text-xs font-mono mb-1 tracking-tighter">#{order._id.toUpperCase()}</p>
                                        <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">
                                            {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                        </p>
                                        <h4 className="text-3xl font-black text-gray-900 mt-4">${order.totalAmount}</h4>
                                    </div>

                                    {/* Items List */}
                                    <div className="lg:col-span-5 border-l border-gray-100 pl-8">
                                        <h5 className="text-[9px] font-black text-gray-300 uppercase tracking-[0.2em] mb-3">Itemized SKU</h5>
                                        <div className="space-y-2">
                                            {order.items.map((item, index) => (
                                                <div key={index} className="flex justify-between items-center">
                                                    <span className="text-sm font-bold text-gray-700 truncate mr-4">{item.name}</span>
                                                    <span className="text-[10px] font-black bg-gray-100 px-2 py-1 rounded-md text-gray-400">×{item.qty}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Order Stepper / Status */}
                                    <div className="lg:col-span-4 px-4">
                                        <div className="flex items-center gap-2 mb-3">
                                            <div className={`h-2 flex-1 rounded-full ${order.status === 'Pending' || order.status === 'Approved' ? 'bg-blue-500' : 'bg-gray-100'}`}></div>
                                            <div className={`h-2 flex-1 rounded-full ${order.status === 'Approved' ? 'bg-emerald-500' : 'bg-gray-100'}`}></div>
                                            <div className="h-2 flex-1 rounded-full bg-gray-100"></div>
                                        </div>
                                        <div className="flex justify-between items-center bg-gray-50 p-4 rounded-2xl border border-gray-100">
                                            <div className="flex items-center gap-3">
                                                {order.status === 'Pending' ? <FaClock className="text-amber-500" /> : <FaCheckDouble className="text-emerald-500" />}
                                                <span className={`text-[10px] font-black uppercase tracking-widest ${
                                                    order.status === 'Pending' ? 'text-amber-600' : 'text-emerald-600'
                                                }`}>
                                                    {order.status}
                                                </span>
                                            </div>
                                            {order.status === 'Pending' && (
                                                <span className="text-[8px] font-black text-gray-400 animate-pulse uppercase tracking-tighter">
                                                    Authorizing...
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;