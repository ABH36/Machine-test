import { useState, useEffect } from 'react';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import Loader from '../components/Loader';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaSearch, FaShoppingCart, FaStore, FaRegSadTear } from 'react-icons/fa';

const Products = () => {
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [cart, setCart] = useState([]);
    const [loading, setLoading] = useState(true);
    const [checkoutLoading, setCheckoutLoading] = useState(false);
    
    // Search & Filter State
    const [searchTerm, setSearchTerm] = useState('');
    const [activeCategory, setActiveCategory] = useState('All');
    
    const navigate = useNavigate();
    const categories = ['All', 'Electronics', 'Fashion', 'Home', 'General'];

    useEffect(() => {
        fetchProducts();
    }, []);

    // Filter Logic
    useEffect(() => {
        let result = products;
        if (activeCategory !== 'All') {
            result = result.filter(p => p.category === activeCategory);
        }
        if (searchTerm) {
            result = result.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
        }
        setFilteredProducts(result);
    }, [searchTerm, activeCategory, products]);

    const fetchProducts = async () => {
        try {
            const { data } = await api.get('/products');
            setProducts(data.data);
            setFilteredProducts(data.data);
        } catch (error) {
            toast.error('Failed to load products');
        } finally {
            setLoading(false);
        }
    };

    const addToCart = (product) => {
        const exists = cart.find(item => item._id === product._id);
        if (exists) {
            toast.info("Already in cart");
            return;
        }
        setCart([...cart, { ...product, qty: 1 }]);
        toast.success(`Added ${product.name}`);
    };

    const handleCheckout = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            toast.warn("Login required for checkout");
            navigate('/login');
            return;
        }

        if (cart.length === 0) return;
        if (cart.some(item => item.stock <= 0)) {
            toast.error("Remove out of stock items first");
            return;
        }

        setCheckoutLoading(true);
        const totalAmount = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);
        const orderItems = cart.map(item => ({
            product: item._id,
            name: item.name,
            qty: item.qty,
            price: item.price,
            vendor: item.vendor._id || item.vendor 
        }));

        try {
            await api.post('/orders', { orderItems, totalAmount });
            toast.success("Order Placed Successfully!");
            setCart([]); 
            fetchProducts();
        } catch (error) {
            toast.error(error.response?.data?.message || "Checkout failed");
        } finally {
            setCheckoutLoading(false);
        }
    };

    return (
        <div className="bg-gray-50 min-h-screen">
            <Navbar />
            
            <div className="container mx-auto p-4 lg:p-6">
                
                {/* Search & Category Filter Section */}
                <div className="mb-8 space-y-4">
                    <div className="relative max-w-2xl mx-auto">
                        <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input 
                            type="text"
                            placeholder="Search premium products..."
                            className="w-full pl-12 pr-4 py-4 rounded-2xl border-none shadow-sm focus:ring-2 focus:ring-blue-500 outline-none text-lg"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    
                    <div className="flex flex-wrap justify-center gap-2">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className={`px-6 py-2 rounded-full font-bold transition-all ${
                                    activeCategory === cat 
                                    ? 'bg-blue-600 text-white shadow-lg' 
                                    : 'bg-white text-gray-500 hover:bg-gray-100'
                                }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Modern Cart Summary (Floating) */}
                <AnimatePresence>
                    {cart.length > 0 && (
                        <motion.div 
                            initial={{ y: 100, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 100, opacity: 0 }}
                            className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-2xl bg-black/90 backdrop-blur-md text-white p-5 rounded-3xl shadow-2xl z-50 flex justify-between items-center border border-white/10"
                        >
                            <div className="flex items-center gap-4">
                                <div className="bg-blue-600 p-3 rounded-2xl">
                                    <FaShoppingCart className="text-xl" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Your Cart</p>
                                    <h3 className="text-xl font-black">${cart.reduce((acc, item) => acc + (item.price * item.qty), 0)}</h3>
                                </div>
                            </div>
                            <button 
                                onClick={handleCheckout}
                                disabled={checkoutLoading}
                                className={`px-8 py-3 rounded-2xl font-black uppercase tracking-tight transition-all ${
                                    checkoutLoading 
                                    ? 'bg-gray-700 text-gray-400 cursor-not-allowed' 
                                    : 'bg-white text-black hover:bg-blue-500 hover:text-white'
                                }`}
                            >
                                {checkoutLoading ? 'Processing...' : 'Place Order'}
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Product Grid */}
                {loading ? <Loader /> : (
                    <>
                        {filteredProducts.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mb-24">
                                {filteredProducts.map((product) => (
                                    <motion.div 
                                        layout
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        key={product._id} 
                                        className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-gray-100 group"
                                    >
                                        <div className="h-60 bg-gray-100 relative overflow-hidden">
                                            {product.image ? (
                                                <img src={product.image} alt={product.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
                                            )}
                                            <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-black uppercase text-gray-600 shadow-sm">
                                                {product.category || 'General'}
                                            </div>
                                        </div>
                                        
                                        <div className="p-6">
                                            <div className="flex items-center gap-2 text-xs font-bold text-blue-600 mb-2 uppercase tracking-wide">
                                                <FaStore className="text-[10px]" />
                                                {product.vendor?.name || "Verified Store"}
                                            </div>
                                            <h2 className="text-xl font-bold text-gray-900 truncate mb-1">{product.name}</h2>
                                            <p className="text-gray-500 text-sm line-clamp-2 h-10 mb-4">{product.description}</p>
                                            
                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <p className="text-2xl font-black text-gray-900">${product.price}</p>
                                                    <p className={`text-[10px] font-bold uppercase mt-1 ${product.stock < 5 ? 'text-red-500' : 'text-green-500'}`}>
                                                        {product.stock > 0 ? `Stock: ${product.stock}` : 'Sold Out'}
                                                    </p>
                                                </div>
                                                <button 
                                                    onClick={() => addToCart(product)}
                                                    disabled={product.stock <= 0}
                                                    className={`p-4 rounded-2xl transition-all shadow-lg active:scale-95 ${
                                                        product.stock > 0 
                                                        ? 'bg-black text-white hover:bg-blue-600' 
                                                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                                    }`}
                                                >
                                                    <FaShoppingCart />
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-20">
                                <FaRegSadTear className="mx-auto text-6xl text-gray-200 mb-4" />
                                <h3 className="text-xl font-bold text-gray-400">No products found matching your search.</h3>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default Products;