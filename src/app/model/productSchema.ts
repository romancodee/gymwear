// models/ProductSchema.ts
import mongoose from 'mongoose';

const SizeSchema = new mongoose.Schema({
  size: { type: String, required: true },
  stock: { type: Number, required: true }
});

const VariantSchema = new mongoose.Schema({
    _id: { type: mongoose.Schema.Types.ObjectId, auto: false },
  color: { type: String, required: true },
  price: { type: Number, required: true },
  totalStock: { type: Number, required: true },
  sizes: [SizeSchema],
  images: [String], // URLs or paths to stored images
});

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  gender: String,
  category: String,
  tags: [String],
  variants: [VariantSchema],
  slug: {
  type: String,
  unique: true,
  required: true
},

  isActive: { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.models.Product || mongoose.model('Product', ProductSchema);
