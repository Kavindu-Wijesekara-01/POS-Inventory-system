import { useState, useEffect } from 'react';
import axios from '../api/axios';

const CategoryManagement = () => {
    const [categories, setCategories] = useState([]);
    const [catName, setCatName] = useState('');
    const [catImage, setCatImage] = useState('');
    const [editingCatId, setEditingCatId] = useState(null);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const res = await axios.get('/inventory/categories');
            setCategories(res.data);
        } catch (error) { console.error("Error fetching categories", error); }
    };

    const handleSaveCategory = async (e) => {
        e.preventDefault();
        try {
            if (editingCatId) {
                await axios.put(`/inventory/categories/${editingCatId}`, { name: catName, image: catImage });
                alert('Category Updated!');
                setEditingCatId(null);
            } else {
                await axios.post('/inventory/categories', { name: catName, image: catImage });
                alert('Category Added!');
            }
            setCatName(''); setCatImage('');
            fetchCategories();
        } catch (err) { alert('Error saving category'); }
    };

    const handleEditCategory = (cat) => {
        setCatName(cat.name);
        setCatImage(cat.image);
        setEditingCatId(cat._id);
        window.scrollTo(0, 0);
    };

    const handleDeleteCategory = async (id) => {
        if(!window.confirm("Are you sure?")) return;
        try {
            await axios.delete(`/inventory/categories/${id}`);
            fetchCategories();
        } catch (err) { alert('Error deleting category'); }
    };

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Category Management</h2>
            
            {/* Form */}
            <div className="bg-white p-6 rounded shadow mb-6">
                <h3 className="text-lg font-semibold mb-4">{editingCatId ? 'Edit Category' : 'Add New Category'}</h3>
                <form onSubmit={handleSaveCategory} className="flex flex-col md:flex-row gap-4">
                    <input type="text" placeholder="Category Name" className="border p-2 flex-1 rounded" 
                        value={catName} onChange={(e) => setCatName(e.target.value)} required />
                    
                    <input type="text" placeholder="Image URL" className="border p-2 flex-1 rounded" 
                        value={catImage} onChange={(e) => setCatImage(e.target.value)} required />
                    
                    <button type="submit" className={`px-6 py-2 rounded text-white font-bold ${editingCatId ? 'bg-orange-500' : 'bg-green-600 hover:bg-green-700'}`}>
                        {editingCatId ? 'Update' : 'Add'}
                    </button>
                    
                    {editingCatId && <button type="button" onClick={() => {setEditingCatId(null); setCatName(''); setCatImage('')}} className="bg-gray-500 text-white px-4 rounded">Cancel</button>}
                </form>
            </div>

            {/* List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map((cat) => (
                    <div key={cat._id} className="bg-white p-4 rounded shadow flex justify-between items-center border hover:border-blue-500 transition">
                        <div className="flex items-center gap-3">
                            <img src={cat.image} alt="" className="w-12 h-12 object-cover rounded bg-gray-100" />
                            <span className="font-bold text-gray-700">{cat.name}</span>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => handleEditCategory(cat)} className="text-blue-500 hover:text-blue-700 font-medium">Edit</button>
                            <button onClick={() => handleDeleteCategory(cat._id)} className="text-red-500 hover:text-red-700 font-medium">Delete</button>
                        </div>
                    </div>
                ))}
                {categories.length === 0 && <p className="text-gray-500 col-span-full text-center">No categories found.</p>}
            </div>
        </div>
    );
};

export default CategoryManagement;