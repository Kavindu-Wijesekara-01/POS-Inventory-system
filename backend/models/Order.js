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
  discount: { type: Number, default: 0 }, // මුළු Discount එක (Loyalty + Special)
  grandTotal: { type: Number, required: true },
  paymentMethod: { type: String, required: true }, // Cash or Card
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Loyalty', default: null }, // Loyalty Member හිටියොත්
  staff: { type: String, required: true }, // Sale එක කරපු Cashier
  date: { type: Date, default: Date.now } // Order Time
});

module.exports = mongoose.model('Order', orderSchema);