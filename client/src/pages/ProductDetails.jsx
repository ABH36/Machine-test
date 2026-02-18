import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import Loader from '../components/Loader';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    FaStore, FaShieldAlt, FaBox, FaArrowLeft, FaBolt, 
    FaHeart, FaRegHeart, FaStar, FaTruck, FaUndo 
} from 'react-icons/fa';

const ProductDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    
    // States
    const [product, setProduct] = useState(null);
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [orderLoading, setOrderLoading] = useState(false);
    const [isWishlisted, setIsWishlisted] = useState(false);

    useEffect(() => {
        const fetchProductData = async () => {
            setLoading(true);
            try {
                // 1. Current Product Fetch
                const { data } = await api.get(`/products/${id}`);
                const currentProd = data.data;
                setProduct(currentProd);

                // 2. Wishlist Check (Local Storage)
                const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
                setIsWishlisted(wishlist.some(item => item._id === id));

                // 3. Smart Related Products (Same Category)
                const allProds = await api.get('/products');
                const filtered = allProds.data.data.filter(
                    p => p.category === currentProd.category && p._id !== id
                );
                setRelatedProducts(filtered.slice(0, 4));

            } catch (error) {
                toast.error("Product not found");
                navigate('/products');
            } finally {
                setLoading(false);
            }
        };
        fetchProductData();
        window.scrollTo(0, 0); // Scroll to top on load
    }, [id, navigate]);

    // Wishlist Toggle Logic
    const toggleWishlist = () => {
        let wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
        if (isWishlisted) {
            wishlist = wishlist.filter(item => item._id !== id);
            toast.info("Removed from Wishlist");
        } else {
            wishlist.push(product);
            toast.success("Added to Wishlist!");
        }
        localStorage.setItem('wishlist', JSON.stringify(wishlist));
        setIsWishlisted(!isWishlisted);
    };

    const handleBuyNow = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            toast.warn("Please login to initiate purchase");
            return navigate('/login');
        }

        setOrderLoading(true);
        try {
            const orderPayload = {
                orderItems: [{
                    product: product._id,
                    name: product.name,
                    qty: 1,
                    price: product.price,
                    vendor: product.vendor._id || product.vendor 
                }],
                totalAmount: product.price
            };

            await api.post('/orders', orderPayload);
            toast.success("Request Sent! Awaiting Vendor Authorization.");
            navigate('/dashboard');
        } catch (error) {
            toast.error(error.response?.data?.message || "Order request failed");
        } finally {
            setOrderLoading(false);
        }
    };

    if (loading) return <Loader />;

    return (
        <div className="bg-[#fcfcfc] min-h-screen pb-20">
            <Navbar />
            <div className="container mx-auto p-4 lg:p-10">
                
                {/* Top Nav Actions */}
                <div className="flex justify-between items-center mb-10">
                    <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-400 hover:text-black transition font-black uppercase text-[10px] tracking-widest">
                        <FaArrowLeft /> Global Marketplace
                    </button>
                    <div className="flex gap-4">
                         <button onClick={toggleWishlist} className={`p-4 rounded-full shadow-xl transition-all active:scale-90 ${isWishlisted ? 'bg-rose-50 text-rose-500' : 'bg-white text-gray-300'}`}>
                            {isWishlisted ? <FaHeart size={20} /> : <FaRegHeart size={20} />}
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
                    
                    {/* LEFT: Premium Image Gallery Section */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        className="lg:col-span-7 space-y-6"
                    >
                        <div className="rounded-[3rem] overflow-hidden shadow-2xl bg-white border border-gray-100 group relative">
                            <img src={product.image || "https://via.placeholder.com/800"} alt={product.name} className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105" />
                            <div className="absolute top-6 left-6 bg-black/80 backdrop-blur-md text-white px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em]">
                                {product.category}
                            </div>
                        </div>

                        {/* Trust Badges */}
                        <div className="grid grid-cols-3 gap-4">
                            <div className="bg-white p-6 rounded-[2rem] text-center border border-gray-100 shadow-sm">
                                <FaTruck className="mx-auto text-blue-500 mb-2" size={20} />
                                <p className="text-[10px] font-black uppercase text-gray-400">Fast Shipping</p>
                            </div>
                            <div className="bg-white p-6 rounded-[2rem] text-center border border-gray-100 shadow-sm">
                                <FaShieldAlt className="mx-auto text-emerald-500 mb-2" size={20} />
                                <p className="text-[10px] font-black uppercase text-gray-400">Secure Trade</p>
                            </div>
                            <div className="bg-white p-6 rounded-[2rem] text-center border border-gray-100 shadow-sm">
                                <FaUndo className="mx-auto text-orange-500 mb-2" size={20} />
                                <p className="text-[10px] font-black uppercase text-gray-400">Easy Returns</p>
                            </div>
                        </div>
                    </motion.div>

                    {/* RIGHT: Product Meta & Purchase Section */}
                    <motion.div 
                        initial={{ opacity: 0, x: 30 }} 
                        animate={{ opacity: 1, x: 0 }} 
                        className="lg:col-span-5 space-y-8 sticky top-24"
                    >
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-amber-500">
                                {[...Array(5)].map((_, i) => <FaStar key={i} size={14} />)}
                                <span className="text-gray-400 text-xs font-black ml-2 uppercase tracking-tighter">4.8 (Global Rating)</span>
                            </div>
                            <h1 className="text-6xl font-black text-gray-900 leading-[1.1] tracking-tighter italic">{product.name}</h1>
                        </div>

                        <div className="flex items-center gap-5 p-6 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm">
                            <div className="bg-blue-50 p-4 rounded-2xl text-blue-600 shadow-inner"><FaStore size={24} /></div>
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Verified Merchant</p>
                                <p className="font-black text-xl text-gray-900 uppercase italic">{product.vendor?.name || "Marketplace Partner"}</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Technical Description</h3>
                            <p className="text-gray-500 leading-relaxed text-lg font-medium">{product.description}</p>
                        </div>

                        <div className="flex items-end gap-3 pt-4">
                            <span className="text-7xl font-black text-gray-900 tracking-tighter">${product.price}</span>
                            <span className="text-gray-400 font-black text-lg mb-2 tracking-widest uppercase">USD</span>
                        </div>

                        {/* Order Progress Indicator */}
                        <div className={`p-6 rounded-[2rem] border-2 flex items-center gap-4 ${product.stock > 0 ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100'}`}>
                            <div className={`w-3 h-3 rounded-full animate-ping ${product.stock > 0 ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
                            <p className={`text-xs font-black uppercase tracking-widest ${product.stock > 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                                {product.stock > 0 ? `Ready for Dispatch: ${product.stock} Units` : 'Out of Stock / Restocking Soon'}
                            </p>
                        </div>

                        <div className="pt-6">
                            <button 
                                onClick={handleBuyNow}
                                disabled={orderLoading || product.stock <= 0}
                                className="group w-full bg-gray-900 text-white h-24 rounded-[2rem] font-black text-2xl flex items-center justify-center gap-4 hover:bg-black transition-all shadow-[0px_20px_40px_rgba(0,0,0,0.2)] active:scale-95 disabled:bg-gray-200 disabled:shadow-none relative overflow-hidden"
                            >
                                <AnimatePresence mode="wait">
                                    {orderLoading ? (
                                        <motion.span key="loader" initial={{ y: 20 }} animate={{ y: 0 }} exit={{ y: -20 }}>TRANSMITTING...</motion.span>
                                    ) : (
                                        <motion.div key="text" initial={{ y: 20 }} animate={{ y: 0 }} className="flex items-center gap-4">
                                            <FaBolt className="text-yellow-400 group-hover:scale-125 transition-transform" /> 
                                            INITIATE ORDER
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </button>
                            <p className="text-center text-[9px] font-black text-gray-400 mt-4 uppercase tracking-[0.2em]">Zero-Risk Buyer Protection Policy Enabled</p>
                        </div>
                    </motion.div>
                </div>

                {/* Section: Related Products (Smart Cross-selling) */}
                <div className="mt-32 border-t border-gray-100 pt-20">
                    <div className="flex justify-between items-end mb-12">
                        <div>
                            <h3 className="text-xs font-black text-blue-500 uppercase tracking-[0.4em] mb-2">Smart Suggestions</h3>
                            <h2 className="text-4xl font-black text-gray-900 tracking-tighter italic">YOU MIGHT ALSO LIKE</h2>
                        </div>
                        <button onClick={() => navigate('/products')} className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b-2 border-gray-200 hover:border-black transition-all pb-1">View All</button>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {relatedProducts.length > 0 ? relatedProducts.map(rp => (
                            <motion.div 
                                key={rp._id} 
                                whileHover={{ y: -10 }}
                                onClick={() => navigate(`/product/${rp._id}`)}
                                className="group cursor-pointer space-y-4"
                            >
                                <div className="aspect-square rounded-[2rem] overflow-hidden bg-white border border-gray-100 shadow-sm group-hover:shadow-xl transition-all duration-500">
                                    <img src={rp.image || "https://via.placeholder.com/300"} className="w-full h-full object-cover group-hover:scale-110 transition duration-700" alt={rp.name} />
                                </div>
                                <div className="px-2">
                                    <h4 className="font-black text-gray-900 truncate uppercase text-sm tracking-tight">{rp.name}</h4>
                                    <p className="text-blue-600 font-black text-lg">${rp.price}</p>
                                </div>
                            </motion.div>
                        )) : (
                            <div className="col-span-full py-10 text-center text-gray-300 font-black uppercase tracking-[0.2em] italic">Scanning marketplace for similar assets...</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetails;