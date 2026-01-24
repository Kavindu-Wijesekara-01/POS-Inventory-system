import { NavLink, Outlet, useNavigate } from 'react-router-dom';
// මෙන්න මෙතන Settings අයිකන් එක Import කරන්න ඕන
import { Users, Grid, ShoppingBag, UserCheck, BarChart2, PieChart, LogOut, Settings } from 'lucide-react';

const AdminDashboard = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        if(window.confirm("Are you sure you want to logout?")) {
            localStorage.removeItem('userInfo');
            navigate('/login');
        }
    };

    // Active Button Style
    const activeStyle = "flex items-center gap-3 px-4 py-3 rounded-lg bg-blue-600 text-white shadow-md transition-all font-medium";
    
    // Inactive Button Style
    const inactiveStyle = "flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-all";

    return (
        <div className="flex h-screen bg-gray-100 font-sans">
            
            {/* --- SIDEBAR --- */}
            <div className="w-64 bg-gray-900 text-white flex flex-col shadow-2xl z-10">
                <div className="p-6 text-center border-b border-gray-800">
                    <h1 className="text-2xl font-extrabold tracking-wide text-white">Admin Panel</h1>
                    <p className="text-xs text-blue-400 mt-1 uppercase tracking-wider font-bold">Restaurant POS</p>
                </div>
                
                <nav className="flex-1 p-4 space-y-2 mt-2 overflow-y-auto">
                    {/* Manage Staff */}
                    <NavLink to="/admin-dashboard/staff" className={({ isActive }) => isActive ? activeStyle : inactiveStyle}>
                        <Users size={20} /> Manage Staff
                    </NavLink>

                    {/* Categories */}
                    <NavLink to="/admin-dashboard/categories" className={({ isActive }) => isActive ? activeStyle : inactiveStyle}>
                        <Grid size={20} /> Categories
                    </NavLink>

                    {/* Products */}
                    <NavLink to="/admin-dashboard/products" className={({ isActive }) => isActive ? activeStyle : inactiveStyle}>
                        <ShoppingBag size={20} /> Products
                    </NavLink>

                    {/* Loyalty Members */}
                    <NavLink to="/admin-dashboard/loyalty" className={({ isActive }) => isActive ? activeStyle : inactiveStyle}>
                        <UserCheck size={20} /> Loyalty Members
                    </NavLink>

                    <div className="border-t border-gray-800 my-4 pt-4">
                        <p className="px-4 text-xs font-bold text-gray-500 uppercase mb-2">Reports & Settings</p>
                        
                        {/* Sales Reports */}
                        <NavLink to="/admin-dashboard/sales" className={({ isActive }) => isActive ? "flex items-center gap-3 px-4 py-3 rounded-lg bg-green-600 text-white shadow-md font-medium" : inactiveStyle}>
                            <BarChart2 size={20} /> Sales Reports
                        </NavLink>

                        {/* Advanced Analytics */}
                        <NavLink to="/admin-dashboard/analytics" className={({ isActive }) => isActive ? "flex items-center gap-3 px-4 py-3 rounded-lg bg-purple-600 text-white shadow-md font-medium" : inactiveStyle}>
                            <PieChart size={20} /> Analytics & AI
                        </NavLink>

                        {/* Shop Settings (New) */}
                        <NavLink to="/admin-dashboard/settings" className={({ isActive }) => isActive ? activeStyle : inactiveStyle}>
                            <Settings size={20} /> Shop Settings
                        </NavLink>
                    </div>
                </nav>

                <div className="p-4 border-t border-gray-800 bg-gray-900">
                    <button 
                        onClick={handleLogout} 
                        className="flex items-center justify-center gap-2 w-full bg-red-600 hover:bg-red-700 py-3 rounded-lg transition text-white font-bold shadow-lg"
                    >
                        <LogOut size={18} /> Logout
                    </button>
                </div>
            </div>

            {/* --- MAIN CONTENT AREA --- */}
            <div className="flex-1 overflow-auto bg-gray-100">
                <Outlet />
            </div>
        </div>
    );
};

export default AdminDashboard;