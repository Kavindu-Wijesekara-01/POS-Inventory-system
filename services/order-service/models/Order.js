const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  invoiceNo: { 
    type: String, 
    required: true 
  },
  items: [
    {
      name: { type: String, required: true },
      price: { type: Number, required: true },
      qty: { type: Number, required: true }
    }
  ],
  subTotal: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  grandTotal: { type: Number, required: true },
  paymentMethod: { type: String, required: true },
  // Microservice Architecture: Loyalty Service එක වෙනම run වෙන නිසා
  // Customer ID එක String එකක් විදියට store කරනවා (denormalization)
  // cross-service populate() වැඩ කරන්නේ නැති නිසා customerName එකත් store කරනවා
  customer: { type: String, default: null },
  customerName: { type: String, default: null },
  staff: { type: String, required: true },
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', orderSchema);
