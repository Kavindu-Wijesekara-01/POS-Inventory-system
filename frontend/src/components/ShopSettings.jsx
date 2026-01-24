import { useState, useEffect } from 'react';
import axios from '../api/axios';
import { Save, Store } from 'lucide-react';

const ShopSettings = () => {
    const [formData, setFormData] = useState({
        shopName: '',
        address: '',
        phone: '',
        email: '',
        currency: 'Rs.',
        taxRate: 0,
        footerMessage: ''
    });
    const [loading, setLoading] = useState(false);

    // Load Settings
    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await axios.get('/settings');
            if(res.data) setFormData(res.data);
        } catch (error) {
            console.error("Error fetching settings");
        }
    };

    // Save Settings
    const handleSave = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axios.put('/settings', formData);
            alert("Settings Updated Successfully!");
        } catch (error) {
            alert("Error updating settings");
        }
        setLoading(false);
    };

    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-2">
                <Store size={28} className="text-blue-600"/> Shop Configuration
            </h2>

            <div className="bg-white p-8 rounded-xl shadow-lg max-w-4xl">
                <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* Shop Name */}
                    <div className="md:col-span-2">
                        <label className="block text-sm font-bold text-gray-700 mb-1">Shop / Restaurant Name</label>
                        <input type="text" className="w-full border-2 p-3 rounded-lg focus:border-blue-500 outline-none" 
                            value={formData.shopName} onChange={(e) => setFormData({...formData, shopName: e.target.value})} required />
                    </div>

                    {/* Contact Info */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Phone Number</label>
                        <input type="text" className="w-full border p-3 rounded-lg" 
                            value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Email (Optional)</label>
                        <input type="email" className="w-full border p-3 rounded-lg" 
                            value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
                    </div>

                    {/* Address */}
                    <div className="md:col-span-2">
                        <label className="block text-sm font-bold text-gray-700 mb-1">Address (For Receipt)</label>
                        <textarea className="w-full border p-3 rounded-lg h-24" 
                            value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})}></textarea>
                    </div>

                    {/* Receipt Footer */}
                    <div className="md:col-span-2">
                        <label className="block text-sm font-bold text-gray-700 mb-1">Receipt Footer Message</label>
                        <input type="text" className="w-full border p-3 rounded-lg" placeholder="Thank you come again!"
                            value={formData.footerMessage} onChange={(e) => setFormData({...formData, footerMessage: e.target.value})} />
                    </div>

                    <div className="md:col-span-2 pt-4">
                        <button type="submit" disabled={loading} className="flex items-center gap-2 bg-blue-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-blue-700 transition shadow-md">
                            <Save size={20} /> {loading ? "Saving..." : "Save Settings"}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
};

export default ShopSettings;