const mongoose = require('mongoose');

const loyaltySchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true, unique: true }, // Phone එකෙන් තමයි Check කරන්නේ
  joinedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Loyalty', loyaltySchema);