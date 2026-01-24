import { useState, useEffect } from 'react';
import axios from '../api/axios';
import { LogOut, Search, Trash2, Plus, Minus, Coffee, UserCheck, UserPlus, X, User, DollarSign, AlertCircle, CheckCircle, HelpCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const POSPage = () => {
    const navigate = useNavigate();
    
    // --- DATA STATES ---
    const [categories, setCategories] = useState([]);
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [cart, setCart] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [staffName, setStaffName] = useState('Staff');
    const [todaySales, setTodaySales] = useState(0);

    // --- LOYALTY STATES ---
    const [loyaltyPhone, setLoyaltyPhone] = useState('');
    const [loyaltyMember, setLoyaltyMember] = useState(null);
    const [showLoyaltyModal, setShowLoyaltyModal] = useState(false);
    const [viewMode, setViewMode] = useState('check');
    const [regName, setRegName] = useState('');
    const [regEmail, setRegEmail] = useState('');
    const [regPhone, setRegPhone] = useState('');

    // --- POPUP STATES (NEW) ---
    const [notification, setNotification] = useState({ show: false, message: '', type: 'info' }); // type: success, error, info
    const [confirmation, setConfirmation] = useState({ show: false, message: '', onConfirm: null });

    // --- LOAD DATA ---
    useEffect(() => {
        const fetchData = async () => {
            try {
                const userInfo = JSON.parse(localStorage.getItem('userInfo'));
                if (userInfo) setStaffName(userInfo.name || userInfo.username);

                const catRes = await axios.get('/inventory/categories');
                const prodRes = await axios.get('/inventory/products');
                const analyticsRes = await axios.get('/orders/analytics');
                
                const today = new Date().toISOString().split('T')[0];
                const todayData = analyticsRes.data.dailySales.find(d => d._id === today);
                setTodaySales(todayData ? todayData.total : 0);

                setCategories(catRes.data);
                setProducts(prodRes.data);
                setFilteredProducts(prodRes.data);
                setLoading(false);
            } catch (error) {
                console.error("Error loading data:", error);
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        let result = products;
        if (selectedCategory !== 'All') result = result.filter(p => p.category?._id === selectedCategory || p.category === selectedCategory);
        if (searchQuery) result = result.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
        setFilteredProducts(result);
    }, [selectedCategory, searchQuery, products]);

    // --- HELPER FUNCTIONS FOR POPUPS ---
    const showToast = (message, type = 'error') => {
        setNotification({ show: true, message, type });
        // තත්පර 3කින් ඉබේ නැතිවෙලා යන්න (Error එකක් නෙවෙයි නම්)
        if(type === 'success') {
            setTimeout(() => setNotification({ show: false, message: '', type: 'info' }), 2000);
        }
    };

    const triggerConfirm = (message, onConfirmAction) => {
        setConfirmation({ show: true, message, onConfirm: () => {
            onConfirmAction();
            setConfirmation({ show: false, message: '', onConfirm: null });
        }});
    };

    // --- CART FUNCTIONS ---
    const addToCart = (product) => {
        const existingItem = cart.find(item => item._id === product._id);
        if (existingItem) {
            setCart(cart.map(item => item._id === product._id ? { ...item, qty: item.qty + 1 } : item));
        } else {
            setCart([...cart, { ...product, qty: 1 }]);
        }
    };

    const removeFromCart = (id) => setCart(cart.filter(item => item._id !== id));
    
    const increaseQty = (id) => setCart(cart.map(item => item._id === id ? { ...item, qty: item.qty + 1 } : item));
    
    const decreaseQty = (id) => setCart(cart.map(item => {
        if (item._id === id) return item.qty > 1 ? { ...item, qty: item.qty - 1 } : item;
        return item;
    }));

    // --- LOYALTY FUNCTIONS ---
    const checkLoyalty = async () => {
        if (!loyaltyPhone) return showToast("Please enter a phone number!", "error");
        
        try {
            const res = await axios.post('/loyalty/check', { phone: loyaltyPhone });
            if (res.data.found) {
                setLoyaltyMember(res.data.member);
                setShowLoyaltyModal(false);
                setLoyaltyPhone('');
                showToast(`Welcome back, ${res.data.member.name}!`, "success");
            } else {
                setLoyaltyMember(null);
                // Confirm Dialog එක පාවිච්චි කිරීම
                triggerConfirm("Member not found! Register new customer?", () => {
                    setRegPhone(loyaltyPhone);
                    setViewMode('register');
                });
            }
        } catch (error) {
            showToast("Error checking loyalty system", "error");
        }
    };

    const registerMember = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('/loyalty/add', { name: regName, email: regEmail, phone: regPhone });
            showToast("Member Registered Successfully!", "success");
            setLoyaltyMember(res.data);
            setShowLoyaltyModal(false);
            setViewMode('check');
            setRegName(''); setRegEmail(''); setRegPhone(''); setLoyaltyPhone('');
        } catch (error) {
            showToast(error.response?.data?.message || "Registration Failed", "error");
        }
    };

    const removeLoyalty = (e) => {
        e.stopPropagation();
        setLoyaltyMember(null);
        showToast("Loyalty member removed", "info");
    };

    // --- TOTAL ---
    const subTotal = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);
    const discount = loyaltyMember ? subTotal * 0.10 : 0;
    const finalTotal = subTotal - discount;

    const handleLogout = () => {
        triggerConfirm("Are you sure you want to logout?", () => {
            localStorage.removeItem('userInfo');
            navigate('/login');
        });
    };

    const handlePlaceOrder = () => {
        if (cart.length === 0) return showToast("Cart is empty! Add items first.", "error");
        
        navigate('/payment', { 
            state: { 
                cartItems: cart, 
                subTotal: subTotal, 
                loyaltyDiscount: discount, 
                loyaltyMember: loyaltyMember,
                staffName: staffName
            } 
        });
    };

    if (loading) return <div className="flex h-screen items-center justify-center font-bold text-gray-500">Loading POS...</div>;

    return (
        <div className="flex h-screen bg-gray-200 p-4 font-sans gap-4 overflow-hidden relative">
            
            {/* ================= CUSTOM NOTIFICATION POPUP (Toast) ================= */}
            {notification.show && (
                <div className={`absolute top-6 left-1/2 transform -translate-x-1/2 z-[100] flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl animate-bounce-in border-2 ${
                    notification.type === 'success' ? 'bg-white border-green-500 text-green-700' : 
                    notification.type === 'error' ? 'bg-white border-red-500 text-red-600' : 'bg-white border-blue-500 text-blue-700'
                }`}>
                    {notification.type === 'success' && <CheckCircle size={24} />}
                    {notification.type === 'error' && <AlertCircle size={24} />}
                    {notification.type === 'info' && <AlertCircle size={24} />}
                    
                    <div>
                        <h4 className="font-bold text-sm">{notification.type === 'error' ? 'Oops!' : notification.type === 'success' ? 'Success' : 'Notice'}</h4>
                        <p className="font-medium text-sm">{notification.message}</p>
                    </div>
                    
                    <button onClick={() => setNotification({ ...notification, show: false })} className="ml-4 hover:bg-gray-100 p-1 rounded-full"><X size={16} /></button>
                </div>
            )}

            {/* ================= CUSTOM CONFIRMATION MODAL ================= */}
            {confirmation.show && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-[100] backdrop-blur-sm">
                    <div className="bg-white p-6 rounded-2xl shadow-2xl w-80 text-center transform scale-100 transition-all">
                        <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <HelpCircle size={32} className="text-blue-600" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-800 mb-2">Confirmation</h3>
                        <p className="text-gray-500 text-sm mb-6">{confirmation.message}</p>
                        
                        <div className="flex gap-3">
                            <button 
                                onClick={() => setConfirmation({ ...confirmation, show: false })} 
                                className="flex-1 py-2.5 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={confirmation.onConfirm} 
                                className="flex-1 py-2.5 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 transition shadow-lg"
                            >
                                Yes, Proceed
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ================= LOYALTY MODAL ================= */}
            {showLoyaltyModal && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm">
                    <div className="bg-white p-6 rounded-xl shadow-2xl w-96 transform transition-all">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-gray-800">
                                {viewMode === 'check' ? 'Customer Loyalty' : 'New Member Registration'}
                            </h2>
                            <button onClick={() => {setShowLoyaltyModal(false); setViewMode('check')}} className="text-gray-400 hover:text-red-500"><X /></button>
                        </div>

                        {viewMode === 'check' ? (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                                    <input 
                                        type="text" 
                                        autoFocus
                                        className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                                        placeholder="07XXXXXXXX"
                                        value={loyaltyPhone}
                                        onChange={(e) => setLoyaltyPhone(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && checkLoyalty()}
                                    />
                                </div>
                                <div className="flex gap-3 pt-2">
                                    <button onClick={checkLoyalty} className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-bold shadow-md active:scale-95 transition flex justify-center items-center gap-2">
                                        <UserCheck size={20} /> Check
                                    </button>
                                    <button onClick={() => {setRegPhone(loyaltyPhone); setViewMode('register')}} className="flex-1 bg-green-500 text-white py-3 rounded-lg font-bold shadow-md active:scale-95 transition flex justify-center items-center gap-2">
                                        <UserPlus size={20} /> New
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <form onSubmit={registerMember} className="space-y-3">
                                <input type="text" placeholder="Name" className="w-full border p-3 rounded-lg" value={regName} onChange={e => setRegName(e.target.value)} required />
                                <input type="email" placeholder="Email" className="w-full border p-3 rounded-lg" value={regEmail} onChange={e => setRegEmail(e.target.value)} required />
                                <input type="text" placeholder="Phone" className="w-full border p-3 rounded-lg" value={regPhone} onChange={e => setRegPhone(e.target.value)} required />
                                <div className="flex gap-3 pt-2">
                                    <button type="button" onClick={() => setViewMode('check')} className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-bold">Back</button>
                                    <button type="submit" className="flex-1 bg-green-600 text-white py-3 rounded-lg font-bold">Register</button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}

            {/* --- LEFT SIDE: MENU (65%) --- */}
            <div className="w-2/3 flex flex-col bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="p-4 bg-white shadow-sm flex justify-between items-center z-10">
                    <h1 className="text-2xl font-extrabold text-gray-800 flex items-center gap-2"><Coffee className="text-orange-500" size={28} /> POS</h1>
                    
                    <div className="flex items-center gap-4 w-2/3 justify-end">
                        <div className="hidden lg:flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-full border border-gray-200 shadow-sm">
                            
                            <div className="flex flex-col leading-none">
                                <span className="text-[9px] text-gray-600 font-bold uppercase">Today's Sales</span>
                                <span className="font-semibold text-[12px] text-gray-800">Rs. {todaySales.toLocaleString()}</span>
                            </div>
                        </div>

                        <div className="relative w-1/2">
                            <Search className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
                            <input type="text" placeholder="Search items..." className="w-full pl-10 pr-4 py-2.5 text-sm border rounded-full bg-gray-100 focus:bg-white focus:ring-2 focus:ring-orange-500 outline-none transition" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                        </div>
                    </div>
                </div>
                
                <div className="px-4 py-3 bg-white overflow-x-auto whitespace-nowrap scrollbar-hide border-b">
                    <button onClick={() => setSelectedCategory('All')} className={`px-5 py-2 rounded-full mr-2 text-sm font-bold shadow-sm transition ${selectedCategory === 'All' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>All</button>
                    {categories.map(cat => (
                        <button key={cat._id} onClick={() => setSelectedCategory(cat._id)} className={`px-5 py-2 rounded-full mr-2 text-sm font-bold shadow-sm transition ${selectedCategory === cat._id ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{cat.name}</button>
                    ))}
                </div>

                <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pb-20">
                        {filteredProducts.map(product => (
                            <div key={product._id} onClick={() => addToCart(product)} className="relative rounded-xl shadow-sm overflow-hidden cursor-pointer group h-44 bg-white hover:shadow-xl transition-all active:scale-95 border border-gray-100">
                                <img src={product.image} alt={product.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-3 pt-8 text-white">
                                    <h3 className="font-bold text-sm truncate">{product.name}</h3>
                                    <p className="font-bold text-sm text-orange-300">Rs. {product.price}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* --- RIGHT SIDE: CART (35%) --- */}
            <div className="w-1/3 bg-white flex flex-col shadow-2xl z-20 h-full rounded-2xl overflow-hidden border border-gray-200">
                
                <div className="p-4 border-b bg-white flex justify-between items-center shadow-sm h-20 shrink-0 gap-2">
                    <div className="flex items-center gap-3">
                        <div className="bg-orange-100 p-2 rounded-full text-orange-600 border border-orange-200"><User size={20} /></div>
                        <div className="leading-tight">
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Cashier</p>
                            <p className="font-bold text-gray-800 text-base">{staffName}</p>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <button 
                            onClick={() => setShowLoyaltyModal(true)} 
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold shadow-sm active:scale-95 transition ${
                                loyaltyMember 
                                ? 'bg-green-100 text-green-700 border border-green-300' 
                                : 'bg-blue-600 text-white'
                            }`}
                        >
                            {loyaltyMember ? (
                                <>
                                    <UserCheck size={18} />
                                    <span className="max-w-[80px] truncate">{loyaltyMember.name}</span>
                                    <div onClick={removeLoyalty} className="p-1 bg-white/50 rounded-full ml-1 hover:bg-red-500 hover:text-white transition"><X size={12} /></div>
                                </>
                            ) : (
                                <>
                                    <UserPlus size={18} />
                                    <span>Check Loyalty</span>
                                </>
                            )}
                        </button>

                        <button onClick={handleLogout} className="bg-red-50 border border-red-200 text-red-600 p-2 rounded-lg shadow-sm active:scale-95 transition hover:bg-red-100">
                            <LogOut size={20} />
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-gray-50">
                    {cart.map(item => (
                        <div key={item._id} className="flex items-center p-3 bg-white rounded-xl border border-gray-200 shadow-sm">
                            <div className="w-1/3 min-w-0 pr-2">
                                <h4 className="font-bold text-gray-800 text-sm truncate">{item.name}</h4>
                                <p className="text-xs text-gray-500">RS {item.price}</p>
                            </div>
                            
                            <div className="flex items-center bg-gray-100 rounded-lg mr-4 border border-gray-200">
                                <button onClick={() => decreaseQty(item._id)} className="p-2 text-gray-600 active:bg-gray-200 rounded-l-lg"><Minus size={14}/></button>
                                <span className="px-3 font-bold text-sm min-w-[30px] text-center bg-white h-full flex items-center">{item.qty}</span>
                                <button onClick={() => increaseQty(item._id)} className="p-2 text-gray-600 active:bg-gray-200 rounded-r-lg"><Plus size={14}/></button>
                            </div>
                            
                            <div className="flex-1 text-center font-bold text-gray-700 text-sm">
                                {(item.price * item.qty).toFixed(0)}
                            </div>

                            <button onClick={() => removeFromCart(item._id)} className="ml-2 p-2 text-red-500 bg-red-50 rounded-lg active:scale-95 border border-red-100">
                                <Trash2 size={16} />
                            </button>
                        </div>
                    ))}
                    {cart.length === 0 && <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-3 opacity-60"><Coffee size={64} /><p className="font-bold">Cart is empty</p></div>}
                </div>

                <div className="p-5 bg-white border-t shrink-0 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
                    <div className="space-y-2 mb-4 text-sm font-medium">
                        <div className="flex justify-between text-gray-600">
                            <span>Subtotal</span>
                            <span>{subTotal.toFixed(2)}</span>
                        </div>
                        {loyaltyMember && (
                            <div className="flex justify-between text-green-600 font-bold bg-green-50 p-2 rounded-lg border border-green-100">
                                <span>Loyalty Discount (10%)</span>
                                <span>- {discount.toFixed(2)}</span>
                            </div>
                        )}
                    </div>
                    
                    <div className="flex justify-between items-center mb-5 text-2xl pt-2 border-t border-gray-100">
                        <span className="font-extrabold text-gray-800">Total</span>
                        <span className="font-extrabold text-orange-600">Rs. {finalTotal.toFixed(2)}</span>
                    </div>
                    
                    <button onClick={handlePlaceOrder} disabled={cart.length === 0} className={`w-full py-4 rounded-xl text-white font-extrabold text-lg shadow-lg transition active:scale-95 flex items-center justify-center gap-2 ${cart.length === 0 ? 'bg-gray-300 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}>
                         CHARGE
                    </button>
                </div>
            </div>

        </div>
    );
};

export default POSPage;