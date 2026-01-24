const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  image: { type: String, required: true } // Image URL එක
});

module.exports = mongoose.model('Category', categorySchema);