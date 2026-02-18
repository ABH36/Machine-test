import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
// FIXED: FaHeartBroken (not FaHeartBreak)
import { FaTrash, FaArrowLeft, FaShoppingCart, FaHeartBroken, FaBoxOpen } from 'react-icons/fa';

const Wishlist = () => {
    const [wishlist, setWishlist] = useState([]);
    const navigate = useNavigate();

    // Load wishlist from local storage
    useEffect(() => {
        const storedWishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
        setWishlist(storedWishlist);
    }, []);

    // Remove single item
    const removeFromWishlist = (id) => {
        const updatedWishlist = wishlist.filter(item => item._id !== id);
        setWishlist(updatedWishlist);
        localStorage.setItem('wishlist', JSON.stringify(updatedWishlist));
        toast.error("Item removed from Vault");
    };

    // Clear entire wishlist
    const clearAll = () => {
        if (window.confirm("Are you sure you want to clear your entire wishlist?")) {
            setWishlist([]);
            localStorage.setItem('wishlist', JSON.stringify([]));
            toast.info("Wishlist Cleared");
        }
    };

    return (
        <div className="bg-[#fafafa] min-h-screen pb-20">
            <Navbar />
            
            <div className="container mx-auto p-4 lg:p-10">
                
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
                    <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
                        <button 
                            onClick={() => navigate('/products')}
                            className="flex items-center gap-2 text-gray-400 hover:text-black transition font-black uppercase text-[10px] tracking-[0.3em] mb-4"
                        >
                            <FaArrowLeft /> Return to Market
                        </button>
                        <h1 className="text-6xl font-black text-gray-900 tracking-tighter italic uppercase">The Vault</h1>
                        <p className="text-gray-400 font-bold text-sm mt-2 tracking-widest uppercase">Saved Assets & Curated Picks</p>
                    </motion.div>

                    {wishlist.length > 0 && (
                        <button 
                            onClick={clearAll}
                            className="text-[10px] font-black text-rose-500 uppercase tracking-widest border-b-2 border-rose-100 hover:border-rose-500 transition-all pb-1"
                        >
                            Clear Entire Vault
                        </button>
                    )}
                </div>

                {/* Wishlist Grid */}
                <AnimatePresence mode='popLayout'>
                    {wishlist.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                            {wishlist.map((item) => (
                                <motion.div 
                                    layout
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
                                    key={item._id}
                                    className="bg-white rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border border-gray-100 group"
                                >
                                    {/* Image Area */}
                                    <div 
                                        className="h-72 bg-gray-50 relative overflow-hidden cursor-pointer"
                                        onClick={() => navigate(`/product/${item._id}`)}
                                    >
                                        <img 
                                            src={item.image || "https://via.placeholder.com/400"} 
                                            alt={item.name} 
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                                        />
                                        <div className="absolute top-4 right-4">
                                            <button 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    removeFromWishlist(item._id);
                                                }}
                                                className="bg-white/90 backdrop-blur-md p-3 rounded-2xl text-gray-300 hover:text-rose-500 shadow-xl transition-colors"
                                            >
                                                <FaTrash size={14} />
                                            </button>
                                        </div>
                                        <div className="absolute bottom-4 left-4 bg-black/80 backdrop-blur-md text-white px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">
                                            {item.category}
                                        </div>
                                    </div>

                                    {/* Content Area */}
                                    <div className="p-6">
                                        <h3 className="font-black text-gray-900 text-lg truncate uppercase tracking-tight mb-1">
                                            {item.name}
                                        </h3>
                                        <div className="flex justify-between items-center mt-4">
                                            <div>
                                                <p className="text-2xl font-black text-gray-900">${item.price}</p>
                                                <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">In Stock</p>
                                            </div>
                                            <button 
                                                onClick={() => navigate(`/product/${item._id}`)}
                                                className="bg-gray-900 text-white p-4 rounded-2xl hover:bg-blue-600 transition-all shadow-lg active:scale-90"
                                            >
                                                <FaShoppingCart size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        /* Empty State */
                        <motion.div 
                            initial={{ opacity: 0 }} 
                            animate={{ opacity: 1 }} 
                            className="bg-white p-32 rounded-[3rem] border-4 border-dashed border-gray-100 text-center"
                        >
                            <div className="bg-gray-50 w-24 h-24 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-inner">
                                {/* FIXED: FaHeartBroken */}
                                <FaHeartBroken className="text-gray-200" size={40} />
                            </div>
                            <h2 className="text-3xl font-black text-gray-900 tracking-tighter italic uppercase mb-2">Vault is Empty</h2>
                            <p className="text-gray-400 font-bold uppercase text-[10px] tracking-[0.3em] mb-8">You haven't secured any assets yet</p>
                            <Link 
                                to="/products" 
                                className="inline-flex items-center gap-3 bg-black text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-800 transition-all shadow-2xl active:scale-95"
                            >
                                <FaBoxOpen /> Explore Collection
                            </Link>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default Wishlist;