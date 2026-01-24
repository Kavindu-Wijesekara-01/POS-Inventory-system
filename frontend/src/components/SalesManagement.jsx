import { useState, useEffect } from 'react';
import axios from '../api/axios';
import { Trash2, Printer, Eye, Search, X, Calendar, DollarSign, TrendingUp, TrendingDown, ShoppingBag } from 'lucide-react';

const SalesManagement = () => {
    // --- STATES ---
    const [orders, setOrders] = useState([]); 
    const [filteredOrders, setFilteredOrders] = useState([]); 
    const [loading, setLoading] = useState(true);
    
    // Filters
    const today = new Date().toISOString().split('T')[0];
    const [startDate, setStartDate] = useState(today);
    const [endDate, setEndDate] = useState(today);
    const [searchQuery, setSearchQuery] = useState('');

    // Totals
    const [totals, setTotals] = useState({ revenue: 0, discount: 0, count: 0 });

    // Print & Settings
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [shopSettings, setShopSettings] = useState(null);

    // --- INITIAL LOAD ---
    useEffect(() => {
        fetchOrders();
        fetchSettings();
    }, []);

    // --- DATA FETCHING ---
    const fetchOrders = async () => {
        try {
            const res = await axios.get('/orders');
            setOrders(res.data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching orders");
            setLoading(false);
        }
    };

    const fetchSettings = async () => {
        try {
            const res = await axios.get('/settings');
            setShopSettings(res.data);
        } catch (error) {
            console.error("Error loading settings");
        }
    };

    // --- FILTER & CALCULATE LOGIC ---
    useEffect(() => {
        if (!orders.length) return;

        const result = orders.filter(order => {
            if (!order.date) return false;
            const orderDate = new Date(order.date).toISOString().split('T')[0];
            const inDateRange = orderDate >= startDate && orderDate <= endDate;
            
            const invoiceNo = order.invoiceNo ? order.invoiceNo.toLowerCase() : "";
            
            let customerName = "";
            if (order.customer) {
                if (typeof order.customer === 'object') {
                    customerName = order.customer.name ? order.customer.name.toLowerCase() : "";
                } else {
                    customerName = order.customer.toString().toLowerCase();
                }
            }

            const query = searchQuery.toLowerCase();
            const matchesSearch = invoiceNo.includes(query) || customerName.includes(query);

            return inDateRange && matchesSearch;
        });

        setFilteredOrders(result);

        const revenue = result.reduce((acc, order) => acc + (order.grandTotal || 0), 0);
        const discount = result.reduce((acc, order) => acc + (order.discount || 0), 0);
        
        setTotals({
            revenue,
            discount,
            count: result.length
        });

    }, [orders, startDate, endDate, searchQuery]);

    // --- ACTIONS ---
    const handleDelete = async (id) => {
        if(!window.confirm("Are you sure? This will delete the record permanently.")) return;
        try {
            await axios.delete(`/orders/${id}`);
            alert("Order Deleted!");
            fetchOrders(); 
        } catch (err) {
            alert("Error deleting order");
        }
    };

    const handlePrint = () => {
        window.print();
    };

    // Helper to safely render Name
    const renderName = (data) => {
        if (!data) return "Unknown";
        if (typeof data === 'object') return data.name || "Unknown";
        return data.toString();
    };

    return (
        <div className="p-6 h-screen flex flex-col bg-gray-50 overflow-hidden font-sans">
            
            {/* --- IMPROVED PRINT STYLES --- */}
            <style>
                {`
                    @media print {
                        /* 1. Hide Everything Else */
                        body * {
                            visibility: hidden;
                        }

                        /* 2. Show Only Receipt */
                        #admin-printable-receipt, #admin-printable-receipt * {
                            visibility: visible !important;
                        }

                        /* 3. Position Receipt Correctly */
                        #admin-printable-receipt {
                            position: fixed;
                            left: 0;
                            top: 0;
                            width: 100%; /* Use full width or specific mm */
                            max-width: 80mm; /* Keep standard receipt width */
                            margin: 0;
                            padding: 10px;
                            background: white;
                            color: black;
                            z-index: 9999;
                            
                            /* IMPORTANT: Allow full height expansion */
                            height: auto !important;
                            overflow: visible !important;
                        }

                        /* 4. Hide Print/Close Buttons in Print Mode */
                        .no-print {
                            display: none !important;
                        }
                    }
                `}
            </style>

            <div className="flex justify-between items-center mb-6 shrink-0">
                <h2 className="text-2xl font-bold text-gray-800">Sales Management</h2>
            </div>

            {/* --- SUMMARY CARDS --- */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6 shrink-0">
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Total Revenue</p>
                        <h3 className="text-2xl font-extrabold text-gray-800 mt-1">Rs. {totals.revenue.toLocaleString()}</h3>
                    </div>
                    <div className="bg-green-100 p-3 rounded-full text-green-600"><DollarSign size={24} /></div>
                </div>
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Discounts Given</p>
                        <h3 className="text-2xl font-extrabold text-red-500 mt-1">Rs. {totals.discount.toLocaleString()}</h3>
                    </div>
                    <div className="bg-red-100 p-3 rounded-full text-red-600"><TrendingDown size={24} /></div>
                </div>
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Total Orders</p>
                        <h3 className="text-2xl font-extrabold text-blue-600 mt-1">{totals.count}</h3>
                    </div>
                    <div className="bg-blue-100 p-3 rounded-full text-blue-600"><ShoppingBag size={24} /></div>
                </div>
            </div>

            {/* --- FILTERS --- */}
            <div className="bg-white p-4 rounded-xl shadow-sm mb-4 border border-gray-200 flex flex-wrap items-end gap-4 shrink-0">
                <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">From Date</label>
                    <input type="date" className="border p-2 rounded-lg text-sm bg-gray-50" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">To Date</label>
                    <input type="date" className="border p-2 rounded-lg text-sm bg-gray-50" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                </div>
                
                <div className="flex-1 relative">
                    <label className="block text-xs font-bold text-gray-500 mb-1">Search Invoice</label>
                    <Search className="absolute left-3 top-8 text-gray-400 w-4 h-4" />
                    <input 
                        type="text" 
                        placeholder="Invoice No..." 
                        className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm outline-none focus:border-blue-500 bg-gray-50 focus:bg-white"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* --- TABLE --- */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden flex-1 border border-gray-200 flex flex-col">
                <div className="overflow-y-auto flex-1">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-100 text-gray-600 uppercase text-xs font-bold sticky top-0 z-10 shadow-sm">
                            <tr>
                                <th className="p-4">Date</th>
                                <th className="p-4">Invoice No</th>
                                <th className="p-4">Staff</th>
                                <th className="p-4">Payment</th>
                                <th className="p-4 text-right">Amount</th>
                                <th className="p-4 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredOrders.map((order) => (
                                <tr key={order._id} className="hover:bg-blue-50 transition">
                                    <td className="p-4 text-sm text-gray-500">
                                        <div className="flex items-center gap-2">
                                            <Calendar size={14}/> {new Date(order.date).toLocaleDateString()}
                                        </div>
                                        <span className="text-xs ml-6 text-gray-400">{new Date(order.date).toLocaleTimeString()}</span>
                                    </td>
                                    <td className="p-4 font-mono text-sm font-bold text-blue-600">{order.invoiceNo || "-"}</td>
                                    
                                    <td className="p-4 text-sm font-medium text-gray-700">
                                        {renderName(order.staff)}
                                    </td>

                                    <td className="p-4 text-sm">
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${order.paymentMethod === 'Card' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'}`}>
                                            {order.paymentMethod}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right font-bold text-gray-800">Rs. {(order.grandTotal || 0).toFixed(2)}</td>
                                    <td className="p-4 flex justify-center gap-2">
                                        <button onClick={() => setSelectedOrder(order)} className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition" title="View & Print">
                                            <Eye size={18} />
                                        </button>
                                        <button onClick={() => handleDelete(order._id)} className="p-2 text-red-500 hover:bg-red-100 rounded-lg transition" title="Delete">
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {filteredOrders.length === 0 && (
                                <tr><td colSpan="6" className="p-8 text-center text-gray-500">No sales found for this period.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* --- RECEIPT MODAL (Fixed Scroll & Print) --- */}
            {selectedOrder && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm p-4 no-print-overlay">
                    {/* Modal Container: Added flex-col to fix scrolling */}
                    <div className="bg-white rounded-2xl shadow-2xl w-[400px] max-h-[90vh] flex flex-col animate-fade-in overflow-hidden">
                        
                        {/* Header */}
                        <div className="p-4 border-b flex justify-between items-center bg-gray-50 shrink-0">
                            <h3 className="font-bold text-gray-700">Receipt Preview</h3>
                            <button onClick={() => setSelectedOrder(null)} className="text-gray-400 hover:text-red-500"><X /></button>
                        </div>

                        {/* Scrollable Content Area */}
                        <div className="p-6 overflow-y-auto bg-gray-200 flex justify-center flex-1">
                            
                            {/* Receipt Itself - This ID is used for Printing */}
                            <div id="admin-printable-receipt" className="bg-white p-4 w-[80mm] shadow-md text-xs font-mono h-fit">
                                <div className="text-center mb-4 border-b border-black pb-2">
                                    <h1 className="text-xl font-bold uppercase mb-1">{shopSettings?.shopName || "POS SYSTEM"}</h1>
                                    <p className="leading-tight">{shopSettings?.address}</p>
                                    <p className="mt-1 font-bold">Tel: {shopSettings?.phone}</p>
                                </div>
                                
                                <div className="border-b border-dashed border-black pb-2 mb-2">
                                    <p>Date: {selectedOrder.date ? new Date(selectedOrder.date).toLocaleString() : "N/A"}</p>
                                    <p>Invoice: {selectedOrder.invoiceNo || "N/A"}</p>
                                    <p>Cashier: {renderName(selectedOrder.staff)}</p>
                                    {selectedOrder.customer && (
                                        <p>Customer: {renderName(selectedOrder.customer)}</p>
                                    )}
                                </div>

                                <table className="w-full text-left mb-2">
                                    <thead>
                                        <tr className="border-b border-black">
                                            <th className="py-1">Item</th>
                                            <th className="py-1 text-right">Qty</th>
                                            <th className="py-1 text-right">Price</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(selectedOrder.items || []).map((item, index) => (
                                            <tr key={index}>
                                                <td className="py-1 break-words pr-1">{item.name}</td>
                                                <td className="py-1 text-right align-top">{item.qty}</td>
                                                <td className="py-1 text-right align-top">{(item.price * item.qty).toFixed(2)}</td>
                                            </tr> 
                                        ))}
                                    </tbody>
                                </table>

                                <div className="border-t border-dashed border-black pt-2 space-y-1 text-right">
                                    <div className="flex justify-between"><span>Subtotal:</span><span>{(selectedOrder.subTotal || 0).toFixed(2)}</span></div>
                                    {selectedOrder.discount > 0 && (
                                        <div className="flex justify-between font-bold"><span>Discount:</span><span>-{selectedOrder.discount.toFixed(2)}</span></div>
                                    )}
                                    <div className="flex justify-between text-lg font-bold border-t border-black border-b py-1 my-1">
                                        <span>TOTAL:</span><span>{(selectedOrder.grandTotal || 0).toFixed(2)}</span>
                                    </div>
                                    <div className="text-[10px] text-center mt-2 italic">*** REPRINT ***</div>
                                </div>

                                <div className="text-center mt-4 pt-2">
                                    <p className="font-bold">{shopSettings?.footerMessage}</p>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-4 border-t bg-gray-50 flex gap-3 shrink-0">
                            <button onClick={handlePrint} className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-bold hover:bg-blue-700 flex items-center justify-center gap-2">
                                <Printer size={20} /> Print
                            </button>
                            <button onClick={() => handleDelete(selectedOrder._id)} className="px-4 border border-red-200 text-red-500 rounded-lg hover:bg-red-50">
                                <Trash2 size={20} />
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default SalesManagement;