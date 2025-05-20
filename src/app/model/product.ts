const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: String,
  slug: { type: String, unique: true },
  description: String,
  price: Number,
  category: String,
  sizes: [String],
  countInStock: Number,
  image: String,
  link: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.models.Product || mongoose.model('Product', ProductSchema);
