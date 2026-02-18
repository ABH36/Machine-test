import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    FaSignOutAlt, FaStore, FaShieldAlt, 
    FaHeart, FaBars, FaTimes, FaThLarge, FaClipboardList 
} from 'react-icons/fa';

const Navbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const token = localStorage.getItem('token');
    
    let user = null;
    try {
        const storedUser = localStorage.getItem('user');
        user = storedUser ? JSON.parse(storedUser) : null;
    } catch (error) {
        console.error("Auth sync error");
        localStorage.clear();
    }

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        toast.info("Session Closed");
        navigate('/login');
    };

    const isActive = (path) => location.pathname === path;

    const getLinkStyle = (path) => `
        px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300
        ${isActive(path) 
            ? 'bg-black text-white shadow-lg scale-105' 
            : 'text-gray-500 hover:text-black hover:bg-gray-100'}
    `;

    return (
        <nav className="sticky top-0 z-[100] bg-white/80 backdrop-blur-xl border-b border-gray-100 shadow-sm px-4 lg:px-10 py-4">
            <div className="container mx-auto flex justify-between items-center">
                
                {/* --- LOGO --- */}
                <Link to="/" className="flex items-center gap-2 group">
                    <div className="bg-black text-white p-2 rounded-xl group-hover:rotate-12 transition-transform duration-500">
                        <FaThLarge />
                    </div>
                    <span className="text-2xl font-black text-gray-900 tracking-tighter italic uppercase text-nowrap">
                        Market<span className="text-blue-600">Pro</span>
                    </span>
                </Link>

                {/* --- DESKTOP NAV --- */}
                <div className="hidden lg:flex items-center gap-2">
                    <Link to="/products" className={getLinkStyle('/products')}>Store</Link>
                    
                    {token && user ? (
                        <>
                            {/* --- BUYER ONLY LINKS --- */}
                            {user.role === 'user' && (
                                <>
                                    <Link to="/dashboard" className={getLinkStyle('/dashboard')}>
                                        {/* FIXED: FaClipboardList instead of FaLayout */}
                                        <span className="flex items-center gap-2"><FaClipboardList /> My Orders</span>
                                    </Link>
                                    <Link to="/wishlist" className={`${getLinkStyle('/wishlist')} flex items-center gap-2 text-rose-500`}>
                                        <FaHeart /> Vault
                                    </Link>
                                </>
                            )}

                            {/* --- VENDOR ONLY LINK --- */}
                            {user.role === 'vendor' && (
                                <Link to="/vendor" className="ml-4 bg-purple-50 text-purple-700 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] border border-purple-100 hover:bg-purple-600 hover:text-white transition-all shadow-sm flex items-center gap-2">
                                    <FaStore /> Vendor Studio
                                </Link>
                            )}

                            {/* --- ADMIN ONLY LINK --- */}
                            {user.role === 'admin' && (
                                <Link to="/admin" className="ml-4 bg-rose-50 text-rose-700 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] border border-rose-100 hover:bg-rose-600 hover:text-white transition-all shadow-sm flex items-center gap-2">
                                    <FaShieldAlt /> Admin Console
                                </Link>
                            )}

                            <div className="h-8 w-[1px] bg-gray-200 mx-4"></div>

                            {/* Profile & Logout */}
                            <div className="flex items-center gap-4 bg-gray-50 pl-4 pr-2 py-1.5 rounded-2xl border border-gray-100">
                                <div className="text-right">
                                    <p className="text-[10px] font-black text-gray-400 uppercase leading-none">{user.role}</p>
                                    <p className="text-xs font-black text-gray-900 uppercase tracking-tighter">{user.name?.split(' ')[0]}</p>
                                </div>
                                <button 
                                    onClick={handleLogout}
                                    className="bg-white p-2.5 rounded-xl text-gray-400 hover:text-rose-500 shadow-sm hover:shadow transition-all border border-gray-100"
                                    title="Sign Out"
                                >
                                    <FaSignOutAlt />
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="flex items-center gap-4 ml-6">
                            <Link to="/login" className="text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-black transition">Login</Link>
                            <Link to="/signup" className="bg-black text-white px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:bg-blue-600 transition-all active:scale-95">Join Now</Link>
                        </div>
                    )}
                </div>

                {/* --- MOBILE TOGGLE --- */}
                <button 
                    className="lg:hidden p-3 rounded-2xl bg-gray-50 text-gray-900 border border-gray-100"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                    {isMenuOpen ? <FaTimes /> : <FaBars />}
                </button>
            </div>

            {/* --- MOBILE MENU --- */}
            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="lg:hidden bg-white border-t border-gray-100 mt-4 overflow-hidden"
                    >
                        <div className="flex flex-col gap-2 py-6">
                            <Link onClick={() => setIsMenuOpen(false)} to="/products" className="p-4 font-black uppercase text-xs">Store</Link>
                            
                            {token && user ? (
                                <>
                                    {user.role === 'user' && (
                                        <>
                                            <Link onClick={() => setIsMenuOpen(false)} to="/dashboard" className="p-4 font-black uppercase text-xs text-blue-600">My Orders</Link>
                                            <Link onClick={() => setIsMenuOpen(false)} to="/wishlist" className="p-4 font-black uppercase text-xs text-rose-500">The Vault</Link>
                                        </>
                                    )}
                                    {user.role === 'vendor' && <Link onClick={() => setIsMenuOpen(false)} to="/vendor" className="p-4 font-black uppercase text-xs text-purple-600">Vendor Studio</Link>}
                                    {user.role === 'admin' && <Link onClick={() => setIsMenuOpen(false)} to="/admin" className="p-4 font-black uppercase text-xs text-rose-600">Admin Console</Link>}
                                    
                                    <button 
                                        onClick={() => { handleLogout(); setIsMenuOpen(false); }}
                                        className="m-4 bg-rose-50 text-rose-600 p-4 rounded-2xl font-black uppercase text-xs tracking-widest"
                                    >
                                        Logout Account
                                    </button>
                                </>
                            ) : (
                                <div className="grid grid-cols-2 gap-4 p-4">
                                    <Link onClick={() => setIsMenuOpen(false)} to="/login" className="bg-gray-100 text-center p-4 rounded-2xl font-black uppercase text-xs">Login</Link>
                                    <Link onClick={() => setIsMenuOpen(false)} to="/signup" className="bg-black text-white text-center p-4 rounded-2xl font-black uppercase text-xs">Join</Link>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};

export default Navbar;