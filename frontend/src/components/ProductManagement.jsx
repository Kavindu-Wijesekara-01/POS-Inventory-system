import { useState, useEffect } from 'react';
import axios from '../api/axios';

const ProductManagement = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]); // Dropdown එකට Category ලිස්ට් එක ඕන නිසා
    
    // Form States
    const [prodName, setProdName] = useState('');
    const [prodPrice, setProdPrice] = useState('');
    const [prodImage, setProdImage] = useState('');
    const [prodCategory, setProdCategory] = useState('');
    const [editingProdId, setEditingProdId] = useState(null);

    useEffect(() => {
        fetchProducts();
        fetchCategories();
    }, []);

    const fetchProducts = async () => {
        try {
            const res = await axios.get('/inventory/products');
            setProducts(res.data);
        } catch (error) { console.error("Error fetching products", error); }
    };

    const fetchCategories = async () => {
        try {
            const res = await axios.get('/inventory/categories');
            setCategories(res.data);
        } catch (error) { console.error("Error fetching categories", error); }
    };

    const handleSaveProduct = async (e) => {
        e.preventDefault();
        
        if (!prodCategory) {
            alert("Please select a Category!");
            return;
        }

        try {
            const payload = { name: prodName, price: prodPrice, category: prodCategory, image: prodImage };
            
            if (editingProdId) {
                await axios.put(`/inventory/products/${editingProdId}`, payload);
                alert('Product Updated!');
                setEditingProdId(null);
            } else {
                await axios.post('/inventory/products', payload);
                alert('Product Added!');
            }
            // Reset Form
            setProdName(''); setProdPrice(''); setProdImage(''); 
            // Category එක අයින් කරන්නේ නෑ, එක දිගට add කරන්න ලේසි වෙන්න
            fetchProducts();
        } catch (err) { alert('Error saving product'); }
    };

    const handleEditProduct = (prod) => {
        setProdName(prod.name);
        setProdPrice(prod.price);
        setProdImage(prod.image);
        // Category එකක් නැත්නම් හිස් අගයක් දානවා (Error එන එක නවත්තන්න)
        setProdCategory(prod.category?._id || prod.category || "");
        setEditingProdId(prod._id);
        window.scrollTo(0, 0);
    };

    const handleDeleteProduct = async (id) => {
        if(!window.confirm("Are you sure?")) return;
        try {
            await axios.delete(`/inventory/products/${id}`);
            fetchProducts();
        } catch (err) { alert('Error deleting product'); }
    };

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Product Management</h2>

            {/* Form */}
            <div className="bg-white p-6 rounded shadow mb-6">
                <h3 className="text-lg font-semibold mb-4">{editingProdId ? 'Edit Product' : 'Add New Product'}</h3>
                <form onSubmit={handleSaveProduct} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input type="text" placeholder="Product Name" className="border p-2 rounded" 
                            value={prodName} onChange={(e) => setProdName(e.target.value)} required />
                        
                        <input type="number" placeholder="Price (LKR)" className="border p-2 rounded" 
                            value={prodPrice} onChange={(e) => setProdPrice(e.target.value)} required />
                        
                        <input type="text" placeholder="Image URL" className="border p-2 rounded" 
                            value={prodImage} onChange={(e) => setProdImage(e.target.value)} required />
                        
                        <select className="border p-2 rounded bg-white" 
                            value={prodCategory} onChange={(e) => setProdCategory(e.target.value)} required>
                            <option value="">Select Category</option>
                            {categories.map((cat) => (
                                <option key={cat._id} value={cat._id}>{cat.name}</option>
                            ))}
                        </select>
                    </div>
                    
                    <div className="flex gap-2">
                        <button type="submit" className={`flex-1 py-2 rounded text-white font-bold ${editingProdId ? 'bg-orange-500' : 'bg-blue-600 hover:bg-blue-700'}`}>
                            {editingProdId ? 'Update Product' : 'Add Product'}
                        </button>
                        {editingProdId && <button type="button" onClick={() => {setEditingProdId(null); setProdName(''); setProdPrice(''); setProdImage('')}} className="flex-1 bg-gray-500 text-white rounded">Cancel</button>}
                    </div>
                </form>
            </div>

            {/* List Table */}
            <div className="bg-white rounded shadow overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-200">
                        <tr>
                            <th className="p-3 border-b">Image</th>
                            <th className="p-3 border-b">Name</th>
                            <th className="p-3 border-b">Price</th>
                            <th className="p-3 border-b">Category</th>
                            <th className="p-3 border-b">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map((prod) => (
                            <tr key={prod._id} className="border-b hover:bg-gray-50">
                                <td className="p-3"><img src={prod.image} alt="" className="w-10 h-10 object-cover rounded bg-gray-100" /></td>
                                <td className="p-3 font-medium">{prod.name}</td>
                                <td className="p-3">Rs. {prod.price}</td>
                                <td className="p-3">
                                    <span className="bg-gray-100 text-gray-800 text-xs font-semibold px-2 py-1 rounded">
                                        {prod.category?.name || 'N/A'}
                                    </span>
                                </td>
                                <td className="p-3 space-x-3">
                                    <button onClick={() => handleEditProduct(prod)} className="text-blue-500 hover:text-blue-700 font-medium">Edit</button>
                                    <button onClick={() => handleDeleteProduct(prod._id)} className="text-red-500 hover:text-red-700 font-medium">Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {products.length === 0 && <p className="p-4 text-center text-gray-500">No products found.</p>}
            </div>
        </div>
    );
};

export default ProductManagement;