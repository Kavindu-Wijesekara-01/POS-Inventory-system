import { useState } from 'react';
import axios from '../api/axios';
import { useNavigate } from 'react-router-dom';
import { Coffee, User, Lock, ArrowRight, Loader2 } from 'lucide-react'; // අයිකන්ස් එකතු කළා

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false); // Loading state එකක් දැම්මා
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true); // Button eka disable wenawa

        try {
            const response = await axios.post('/auth/login', { username, password });
            
            localStorage.setItem('userInfo', JSON.stringify(response.data));

            // Admin ද User ද කියලා බලලා අදාල තැනට යවනවා
            if(response.data.role === 'admin'){
                navigate('/admin-dashboard');
            } else {
                navigate('/pos');
            }

        } catch (err) {
            setError('Invalid Username or Password');
            setLoading(false);
        }
    };

    return (
        // Background එක Dark Gradient එකක් කළා Professional පෙනුමක් ගන්න 
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 font-sans p-4">
            
            <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-fade-in">
                
                {/* --- HEADER SECTION --- */}
                <div className="bg-gray-50 p-8 text-center border-b border-gray-100">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-orange-100 text-orange-600 mb-4 shadow-sm">
                        <Coffee size={32} />
                    </div>
                    <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">Restaurant POS</h1>
                    <p className="text-gray-500 text-sm mt-2 font-medium">Welcome back! Please sign in.</p>
                </div>

                {/* --- FORM SECTION --- */}
                <div className="p-8 pt-6">
                    {error && (
                        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded mb-6 text-sm font-medium flex items-center animate-pulse">
                            <span className="mr-2">⚠️</span> {error}
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-5">
                        
                        {/* Username Input */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1.5 ml-1">Username</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                    <User size={20} />
                                </div>
                                <input 
                                    type="text" 
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-gray-50 focus:bg-white"
                                    placeholder="Enter username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        {/* Password Input */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1.5 ml-1">Password</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                    <Lock size={20} />
                                </div>
                                <input 
                                    type="password" 
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-gray-50 focus:bg-white"
                                    placeholder="Enter password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button 
                            type="submit" 
                            disabled={loading}
                            className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-4 rounded-xl transition duration-200 shadow-lg flex items-center justify-center gap-2 transform active:scale-95 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="animate-spin" size={20} /> Signing In...
                                </>
                            ) : (
                                <>
                                    Sign In <ArrowRight size={20} />
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* --- FOOTER --- */}
                <div className="bg-gray-50 p-4 text-center border-t border-gray-100">
                    <p className="text-xs text-gray-400 font-medium">
                        System Developed by <span className="text-blue-600 font-bold">Kavindu Wijesekara</span>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;