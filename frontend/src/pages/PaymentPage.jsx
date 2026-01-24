import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CreditCard, Banknote, ArrowLeft, CheckCircle, ShieldAlert, X, Printer, Home } from 'lucide-react';
import axios from '../api/axios';

const PaymentPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    
    // POS Page එකෙන් එන Data
    const { cartItems, subTotal, loyaltyDiscount, loyaltyMember, staffName } = location.state || {};

    // --- STATES ---
    const [paymentMethod, setPaymentMethod] = useState('Cash');
    const [amountTendered, setAmountTendered] = useState('');
    const [manualDiscount, setManualDiscount] = useState(0);
    const [appliedDiscountPercent, setAppliedDiscountPercent] = useState(null);
    
    // Shop Settings State (අලුතෙන් එකතු කළ කොටස)
    const [shopSettings, setShopSettings] = useState(null);
    
    // UI States
    const [showDiscountModal, setShowDiscountModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    
    // Discount Logic
    const [discountPin, setDiscountPin] = useState('');
    const [discountPercentInput, setDiscountPercentInput] = useState('');
    const [pinError, setPinError] = useState('');

    // Order Data for Receipt
    const [lastOrderData, setLastOrderData] = useState(null);

    const MANAGER_SECRET_KEY = "9999"; 

    // --- CALCULATIONS ---
    const totalDiscount = (loyaltyDiscount || 0) + manualDiscount;
    const grandTotal = (subTotal || 0) - totalDiscount;
    const changeAmount = amountTendered ? parseFloat(amountTendered) - grandTotal : 0;

    useEffect(() => {
        if (!location.state) navigate('/pos');

        // Shop Settings Load කිරීම (රිසිට් එක සඳහා)
        const fetchSettings = async () => {
            try {
                const res = await axios.get('/settings');
                setShopSettings(res.data);
            } catch (error) {
                console.error("Error loading settings", error);
            }
        };
        fetchSettings();

    }, [location, navigate]);

    // --- HANDLERS ---
    const handleApplyManualDiscount = () => {
        if (discountPin !== MANAGER_SECRET_KEY) {
            setPinError("Invalid Manager PIN!");
            return;
        }
        
        const percent = parseFloat(discountPercentInput);
        if (!percent || percent <= 0 || percent > 100) {
            setPinError("Invalid Percentage!");
            return;
        }

        const amountAfterLoyalty = subTotal - (loyaltyDiscount || 0);
        const discountAmount = (amountAfterLoyalty * percent) / 100;

        setManualDiscount(discountAmount);
        setAppliedDiscountPercent(percent);
        setShowDiscountModal(false);
        setDiscountPin('');
        setDiscountPercentInput('');
        setPinError('');
    };

    const handleCompletePayment = async () => {
        if (paymentMethod === 'Cash' && parseFloat(amountTendered) < grandTotal.toFixed(2)) {
             return alert("Insufficient Cash Amount!");
        }

        const orderData = {
            items: cartItems.map(item => ({
                name: item.name,
                price: item.price,
                qty: item.qty
            })),
            subTotal,
            discount: totalDiscount, 
            grandTotal,
            paymentMethod,
            customer: loyaltyMember ? loyaltyMember._id : null,
            staff: staffName,
            date: new Date(),
            change: changeAmount,
            tendered: amountTendered,
            invoiceNo: "INV-" + Math.floor(100000 + Math.random() * 900000)
        };

        try {
            await axios.post('/orders', orderData);
            setLastOrderData(orderData);
            setShowSuccessModal(true);
        } catch (error) {
            console.error(error);
            alert("Payment Failed! Check console.");
        }
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="flex h-screen bg-gray-100 p-4 font-sans overflow-hidden">
            
            {/* --- PRINT STYLES --- */}
            <style>
                {`
                    @media print {
                        @page {
                            size: auto;
                            margin: 0;
                        }
                        body * { visibility: hidden; }
                        
                        #printable-receipt {
                            visibility: visible !important;
                            display: block !important;
                            position: absolute;
                            left: 0;
                            top: 0;
                            width: 79mm; /* 80mm Printer Compatible */
                            background: white;
                            color: black;
                            margin: 0;
                            padding: 2mm;
                            font-size: 12px;
                        }
                        
                        #printable-receipt * { 
                            visibility: visible !important; 
                        }
                        
                        .no-print { display: none !important; }
                    }
                `}
            </style>

            {/* ================= SUCCESS MODAL ================= */}
            {showSuccessModal && (
                <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-[100] backdrop-blur-sm no-print">
                    <div className="bg-white p-8 rounded-2xl shadow-2xl w-96 text-center transform transition-all scale-100">
                        <div className="flex justify-center mb-4">
                            <div className="bg-green-100 p-4 rounded-full">
                                <CheckCircle size={48} className="text-green-600" />
                            </div>
                        </div>
                        <h2 className="text-2xl font-extrabold text-gray-800 mb-2">Payment Successful!</h2>
                        <p className="text-gray-500 mb-6">Change: <span className="font-bold text-gray-800">Rs. {changeAmount.toFixed(2)}</span></p>
                        
                        <div className="flex flex-col gap-3">
                            <button 
                                onClick={handlePrint} 
                                className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition flex items-center justify-center gap-2"
                            >
                                <Printer size={20} /> Print Receipt
                            </button>
                            <button 
                                onClick={() => navigate('/pos')} 
                                className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-200 transition flex items-center justify-center gap-2"
                            >
                                <Home size={20} /> New Order
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ================= PRINTABLE RECEIPT (Dynamic Data) ================= */}
            {lastOrderData && (
                <div id="printable-receipt" className="hidden p-4 bg-white max-w-[80mm] mx-auto font-mono text-xs">
                    
                    {/* Header - From Shop Settings */}
                    <div className="text-center mb-4 border-b border-black pb-2">
                        <h1 className="text-xl font-bold uppercase mb-1">
                            {shopSettings?.shopName || "RESTAURANT POS"}
                        </h1>
                        <p className="whitespace-pre-line leading-tight">
                            {shopSettings?.address || "No Address Configured"}
                        </p>
                        <p className="mt-1 font-bold">Tel: {shopSettings?.phone || "000-0000000"}</p>
                    </div>
                    
                    <div className="border-b border-dashed border-black pb-2 mb-2">
                        <p>Date: {new Date().toLocaleString()}</p>
                        <p>Invoice: {lastOrderData.invoiceNo}</p>
                        <p>Cashier: {staffName}</p>
                        {loyaltyMember && <p>Customer: {loyaltyMember.name}</p>}
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
                            {lastOrderData.items.map((item, index) => (
                                <tr key={index}>
                                    <td className="py-1">{item.name}</td>
                                    <td className="py-1 text-right">{item.qty}</td>
                                    <td className="py-1 text-right">{(item.price * item.qty).toFixed(2)}</td>
                                </tr> 
                            ))}
                        </tbody>
                    </table>

                    <div className="border-t border-dashed border-black pt-2 space-y-1 text-right">
                        <div className="flex justify-between"><span>Subtotal:</span><span>{lastOrderData.subTotal.toFixed(2)}</span></div>
                        
                        {lastOrderData.discount > 0 && (
                            <div className="flex justify-between font-bold"><span>Discount:</span><span>-{lastOrderData.discount.toFixed(2)}</span></div>
                        )}
                        
                        <div className="flex justify-between text-lg font-bold border-t border-black border-b py-1 my-1">
                            <span>TOTAL:</span><span>{lastOrderData.grandTotal.toFixed(2)}</span>
                        </div>

                        {paymentMethod === 'Cash' && (
                            <>
                                <div className="flex justify-between"><span>Cash:</span><span>{parseFloat(amountTendered).toFixed(2)}</span></div>
                                <div className="flex justify-between"><span>Change:</span><span>{changeAmount.toFixed(2)}</span></div>
                            </>
                        )}
                        {paymentMethod === 'Card' && <div className="text-center italic mt-1 font-bold">*** PAID BY CARD ***</div>}
                    </div>

                    {/* Footer - From Shop Settings */}
                    <div className="text-center mt-4 pt-2">
                        <p className="font-bold">{shopSettings?.footerMessage || "THANK YOU COME AGAIN!"}</p>
                        <p className="text-[10px] mt-1">Software by DK Creations</p>
                    </div>
                </div>
            )}

            {/* ================= DISCOUNT MODAL ================= */}
            {showDiscountModal && (
                <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm no-print">
                    <div className="bg-white p-6 rounded-xl shadow-2xl w-80">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-bold text-red-600 flex items-center gap-2"><ShieldAlert size={20} /> Manager Override</h2>
                            <button onClick={() => setShowDiscountModal(false)}><X size={20} /></button>
                        </div>
                        <div className="space-y-3">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Percentage (%)</label>
                                <input type="number" placeholder="10" className="w-full border p-2 rounded" value={discountPercentInput} onChange={(e) => setDiscountPercentInput(e.target.value)} autoFocus />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Secret Key</label>
                                <input type="password" placeholder="PIN" className="w-full border p-2 rounded" value={discountPin} onChange={(e) => setDiscountPin(e.target.value)} />
                                {pinError && <p className="text-red-600 text-xs font-bold">{pinError}</p>}
                            </div>
                            <button onClick={handleApplyManualDiscount} className="w-full bg-red-600 text-white py-2 rounded font-bold">Authorize</button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- LEFT SIDE: ORDER SUMMARY --- */}
            <div className="w-5/12 pr-4 flex flex-col h-full no-print">
                <button onClick={() => navigate('/pos')} className="flex items-center text-gray-500 hover:text-gray-800 mb-2 w-fit text-sm">
                    <ArrowLeft size={16} className="mr-1" /> Back to POS
                </button>
                
                <div className="bg-white rounded-xl shadow-md flex-1 p-4 flex flex-col overflow-hidden">
                    <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Order Summary</h2>
                    <div className="flex-1 overflow-y-auto mb-4 pr-2 scrollbar-thin">
                        {cartItems?.map((item) => (
                            <div key={item._id} className="flex justify-between items-center py-2 border-b border-dashed text-sm">
                                <div><p className="font-bold text-gray-700">{item.name}</p><p className="text-xs text-gray-400">{item.qty} x {item.price}</p></div>
                                <p className="font-bold text-gray-800">{(item.qty * item.price).toFixed(2)}</p>
                            </div>
                        ))}
                    </div>
                    <div className="space-y-2 text-gray-600 text-sm">
                        <div className="flex justify-between"><span>Subtotal</span><span>{subTotal?.toFixed(2)}</span></div>
                        {loyaltyDiscount > 0 && <div className="flex justify-between text-blue-600 font-medium bg-blue-50 p-1.5 rounded"><span>Loyalty (10%)</span><span>- {loyaltyDiscount.toFixed(2)}</span></div>}
                        {manualDiscount > 0 && <div className="flex justify-between text-red-600 font-bold bg-red-50 p-1.5 rounded"><span>Special ({appliedDiscountPercent}%)</span><span>- {manualDiscount.toFixed(2)}</span></div>}
                        <div className="flex justify-between text-2xl font-extrabold text-gray-900 border-t pt-3 mt-2"><span>Total Due</span><span>Rs. {grandTotal.toFixed(2)}</span></div>
                    </div>
                    <button onClick={() => setShowDiscountModal(true)} className="mt-4 text-red-500 text-xs font-bold hover:text-red-700 hover:underline text-left w-fit">+ Add Special Discount</button>
                </div>
            </div>

            {/* --- RIGHT SIDE: PAYMENT CONTROLS --- */}
            <div className="w-7/12 pl-2 flex flex-col h-full no-print">
                <div className="bg-white rounded-xl shadow-md flex-1 p-5 flex flex-col justify-between overflow-hidden">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Payment Method</h2>
                        <div className="grid grid-cols-2 gap-3 mb-6">
                            <button onClick={() => setPaymentMethod('Cash')} className={`p-4 rounded-lg border-2 flex flex-col items-center gap-2 transition ${paymentMethod === 'Cash' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}><Banknote size={32} /><span className="font-bold">CASH</span></button>
                            <button onClick={() => setPaymentMethod('Card')} className={`p-4 rounded-lg border-2 flex flex-col items-center gap-2 transition ${paymentMethod === 'Card' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}><CreditCard size={32} /><span className="font-bold">CARD</span></button>
                        </div>
                        {paymentMethod === 'Cash' && (
                            <div className="bg-gray-50 p-5 rounded-xl border">
                                <label className="block text-gray-700 font-bold mb-2">Cash Tendered</label>
                                <div className="relative"><span className="absolute left-4 top-3 text-gray-500 font-bold text-lg">Rs.</span><input type="number" className="w-full pl-12 p-3 text-xl font-bold rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none" placeholder="0.00" value={amountTendered} onChange={(e) => setAmountTendered(e.target.value)} autoFocus /></div>
                                <div className="mt-4 flex justify-between items-center bg-white p-3 rounded-lg border shadow-sm"><span className="text-gray-500 font-bold text-sm">Change Due</span><span className={`text-xl font-bold ${changeAmount < 0 ? 'text-red-500' : 'text-green-600'}`}>Rs. {changeAmount < 0 ? '0.00' : changeAmount.toFixed(2)}</span></div>
                            </div>
                        )}
                        {paymentMethod === 'Card' && <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 flex items-center justify-center text-blue-800"><p className="font-semibold">Swipe/Insert Card on Terminal</p></div>}
                    </div>
                    <button onClick={handleCompletePayment} className="w-full bg-green-600 text-white py-4 rounded-xl font-bold text-lg shadow-md hover:bg-green-700 transition active:scale-95 flex items-center justify-center gap-2"><CheckCircle size={24} /> COMPLETE PAYMENT</button>
                </div>
            </div>

        </div>
    );
};

export default PaymentPage;