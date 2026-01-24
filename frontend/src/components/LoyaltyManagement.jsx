import { useState, useEffect } from 'react';
import axios from '../api/axios';

const LoyaltyManagement = () => {
    const [members, setMembers] = useState([]);
    
    // Form States
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [editingId, setEditingId] = useState(null);

    useEffect(() => {
        fetchMembers();
    }, []);

    const fetchMembers = async () => {
        try {
            const res = await axios.get('/loyalty');
            setMembers(res.data);
        } catch (error) { console.error("Error fetching members", error); }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            const payload = { name, phone, email };
            
            if (editingId) {
                // Update
                await axios.put(`/loyalty/${editingId}`, payload);
                alert('Member Updated!');
                setEditingId(null);
            } else {
                // Create New (Admin එකෙනුත් Add කරන්න පුළුවන් වෙන්න)
                await axios.post('/loyalty/add', payload);
                alert('Member Added!');
            }
            
            // Reset & Refresh
            setName(''); setPhone(''); setEmail('');
            fetchMembers();
        } catch (err) { 
            alert(err.response?.data?.message || 'Error saving member'); 
        }
    };

    const handleEdit = (member) => {
        setName(member.name);
        setPhone(member.phone);
        setEmail(member.email);
        setEditingId(member._id);
        window.scrollTo(0, 0);
    };

    const handleDelete = async (id) => {
        if(!window.confirm("Are you sure? This action cannot be undone.")) return;
        try {
            await axios.delete(`/loyalty/${id}`);
            fetchMembers();
        } catch (err) { alert('Error deleting member'); }
    };

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Loyalty Members Management</h2>

            {/* Form Area */}
            <div className="bg-white p-6 rounded shadow mb-8">
                <h3 className="text-lg font-semibold mb-4 text-gray-700">{editingId ? 'Edit Member' : 'Add New Member'}</h3>
                <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input 
                        type="text" placeholder="Customer Name" 
                        className="border p-2 rounded" 
                        value={name} onChange={(e) => setName(e.target.value)} required 
                    />
                    <input 
                        type="text" placeholder="Phone Number" 
                        className="border p-2 rounded" 
                        value={phone} onChange={(e) => setPhone(e.target.value)} required 
                    />
                    <input 
                        type="email" placeholder="Email Address" 
                        className="border p-2 rounded" 
                        value={email} onChange={(e) => setEmail(e.target.value)} required 
                    />
                    
                    <div className="md:col-span-3 flex gap-2">
                        <button type="submit" className={`px-6 py-2 rounded text-white font-bold transition ${editingId ? 'bg-orange-500 hover:bg-orange-600' : 'bg-blue-600 hover:bg-blue-700'}`}>
                            {editingId ? 'Update Member' : 'Add Member'}
                        </button>
                        {editingId && (
                            <button type="button" onClick={() => {setEditingId(null); setName(''); setPhone(''); setEmail('')}} className="px-6 py-2 rounded bg-gray-500 text-white font-bold hover:bg-gray-600">
                                Cancel
                            </button>
                        )}
                    </div>
                </form>
            </div>

            {/* Members Table */}
            <div className="bg-white rounded shadow overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-800 text-white">
                        <tr>
                            <th className="p-3 border-b border-gray-700">Name</th>
                            <th className="p-3 border-b border-gray-700">Phone</th>
                            <th className="p-3 border-b border-gray-700">Email</th>
                            <th className="p-3 border-b border-gray-700">Joined Date</th>
                            <th className="p-3 border-b border-gray-700 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {members.map((member) => (
                            <tr key={member._id} className="border-b hover:bg-gray-50 transition">
                                <td className="p-3 font-medium text-gray-800">{member.name}</td>
                                <td className="p-3 text-gray-600">{member.phone}</td>
                                <td className="p-3 text-gray-600">{member.email}</td>
                                <td className="p-3 text-gray-500 text-sm">
                                    {new Date(member.joinedAt).toLocaleDateString()}
                                </td>
                                <td className="p-3 text-center space-x-4">
                                    <button onClick={() => handleEdit(member)} className="text-blue-600 hover:text-blue-800 font-semibold text-sm">Edit</button>
                                    <button onClick={() => handleDelete(member._id)} className="text-red-500 hover:text-red-700 font-semibold text-sm">Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {members.length === 0 && (
                    <div className="p-8 text-center text-gray-400">
                        No loyalty members found.
                    </div>
                )}
            </div>
        </div>
    );
};

export default LoyaltyManagement;