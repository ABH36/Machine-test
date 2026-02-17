import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const NotFound = () => {
    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-100 text-center px-4">
            <motion.h1 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-9xl font-bold text-gray-300"
            >
                404
            </motion.h1>
            <h2 className="text-3xl font-bold text-gray-800 mt-4">Page Not Found</h2>
            <p className="text-gray-600 mt-2 mb-8">The page you are looking for doesn't exist or has been moved.</p>
            <Link 
                to="/" 
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
            >
                Go Back Home
            </Link>
        </div>
    );
};
export default NotFound;