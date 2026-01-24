import { useState, useEffect } from 'react';
import axios from '../api/axios';
import { Trash2, User, Shield } from 'lucide-react'; // Icons

const StaffManagement = () => {
    const [staffList, setStaffList] = useState([]);
    
    // Form States
    const [name, setName] = useState('');
    const [staffId, setStaffId] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('user'); // Default role is 'user'

    useEffect(() => {
        fetchStaff();
    }, []);

    const fetchStaff = async () => {
        try {
            const res = await axios.get('/staff');
            setStaffList(res.data);
        } catch (error) {
            console.error("Error fetching staff", error);
        }
    };

    const handleAddStaff = async (e) => {
        e.preventDefault();
        try {
            // role එකත් යවනවා Backend එකට
            await axios.post('/auth/register', { name, staffId, username, password, role });
            alert(role === 'admin' ? 'New Admin Added!' : 'Staff Member Added!');
            
            // Reset Form
            setName(''); setStaffId(''); setUsername(''); setPassword(''); setRole('user');
            fetchStaff(); 
        } catch (err) {
            alert(err.response?.data?.message || 'Error adding user');
        }
    };

    const handleDelete = async (id) => {
        if(!window.confirm("Are you sure? This action cannot be undone.")) return;
        try {
            await axios.delete(`/staff/${id}`);
            fetchStaff();
        } catch (err) { alert('Error deleting user'); }
    };

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">User Management (Staff & Admins)</h2>

            {/* Form */}
            <div className="bg-white p-6 rounded-xl shadow-md mb-8 border border-gray-200">
                <h3 className="text-lg font-bold mb-4 text-gray-700">Register New User</h3>
                <form onSubmit={handleAddStaff} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    <div className="md:col-span-2">
                        <label className="block text-sm font-bold text-gray-700 mb-1">Select Role</label>
                        <select 
                            className="w-full border-2 p-2 rounded-lg bg-gray-50 focus:border-blue-500 outline-none"
                            value={role} 
                            onChange={(e) => setRole(e.target.value)}
                        >
                            <option value="user">Staff (Cashier)</option>
                            <option value="admin">Admin (Full Access)</option>
                        </select>
                    </div>

                    <input type="text" placeholder="Full Name" className="border p-3 rounded-lg" value={name} onChange={(e) => setName(e.target.value)} required />
                    <input type="text" placeholder="Staff ID (e.g., STF001)" className="border p-3 rounded-lg" value={staffId} onChange={(e) => setStaffId(e.target.value)} required />
                    <input type="text" placeholder="Username" className="border p-3 rounded-lg" value={username} onChange={(e) => setUsername(e.target.value)} required />
                    <input type="password" placeholder="Password" className="border p-3 rounded-lg" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    
                    <button type="submit" className={`md:col-span-2 text-white py-3 rounded-lg font-bold transition shadow-md ${role === 'admin' ? 'bg-purple-600 hover:bg-purple-700' : 'bg-blue-600 hover:bg-blue-700'}`}>
                        {role === 'admin' ? '+ Register New Admin' : '+ Register Staff Member'}
                    </button>
                </form>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-100 text-gray-600 uppercase text-xs font-bold">
                        <tr>
                            <th className="p-4">Role</th>
                            <th className="p-4">Staff ID</th>
                            <th className="p-4">Name</th>
                            <th className="p-4">Username</th>
                            <th className="p-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {staffList.map((staff) => (
                            <tr key={staff._id} className="border-b hover:bg-gray-50 transition">
                                <td className="p-4">
                                    {staff.role === 'admin' ? (
                                        <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-bold flex w-fit items-center gap-1">
                                            <Shield size={12}/> Admin
                                        </span>
                                    ) : (
                                        <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold flex w-fit items-center gap-1">
                                            <User size={12}/> Staff
                                        </span>
                                    )}
                                </td>
                                <td className="p-4 font-mono text-sm text-gray-500">{staff.staffId || '-'}</td>
                                <td className="p-4 font-bold text-gray-700">{staff.name}</td>
                                <td className="p-4 text-gray-600">{staff.username}</td>
                                <td className="p-4 text-right">
                                    <button onClick={() => handleDelete(staff._id)} className="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 p-2 rounded-lg transition">
                                        <Trash2 size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {staffList.length === 0 && <p className="p-6 text-center text-gray-500">No users found.</p>}
            </div>
        </div>
    );
};

export default StaffManagement;