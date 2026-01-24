const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema({
  shopName: { type: String, required: true, default: "My POS Shop" },
  address: { type: String, default: "No 123, City, Country" },
  phone: { type: String, default: "011-0000000" },
  email: { type: String, default: "contact@shop.com" },
  currency: { type: String, default: "Rs." },
  taxRate: { type: Number, default: 0 },
  footerMessage: { type: String, default: "Thank you come again!" }
});

module.exports = mongoose.model('Setting', settingSchema);