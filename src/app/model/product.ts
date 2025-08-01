import mongoose, { Document, Schema } from "mongoose";
import slugify from "slugify";

// Interfaces
interface ISize {
  size: string;
  stock: number;
}

interface IVariant {
  color: string;
  price: number;
  stock: number;
  image: string;
  sizes: ISize[];
}
interface discountType{

  type: String,
  enum: ["flat", "percent", "percentage"], // add "percentage"
  default: "flat",

}

export interface IProduct extends Document {
  name: string;
  description?: string;
  price: number;
  countInStock: number;
  category?: string;
  isActive: boolean;
  isFeatured: boolean;
  variants: IVariant[];
  gender: "male" | "female" | "unisex";
  discount: number;
  discountType: "flat" | "percent" | "percentage";
  image: string;
  slug?: string;
  tags: string[];
  finalPrice?: number; // virtual
  
  createdAt?: string;  // ✅ add this
  updatedAt?: string;
}

// Size Schema
const sizeSchema = new Schema<ISize>({
  size: { type: String, required: true, trim: true },
  stock: { type: Number, required: true },
});

// Variant Schema
const variantSchema = new Schema<IVariant>({
  color: { type: String, required: true, trim: true },
  price: { type: Number, required: true },
  stock: { type: Number, required: true },
  image: { type: String, required: true }, // image URL preferred
  sizes: { type: [sizeSchema], default: [] },
});

// Prevent duplicate sizes in a variant
variantSchema.pre("validate", function (next) {
  const seen = new Set<string>();
  for (const size of this.sizes) {
    if (seen.has(size.size)) {
      return next(new Error("Duplicate size entries are not allowed in a variant."));
    }
    seen.add(size.size);
  }
  next();
});

// Product Schema
const productSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    price: { type: Number, required: true }, // auto-calculated
    countInStock: { type: Number, default: 0 }, // auto-calculated
    category: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
    variants: { type: [variantSchema], required: true },
    gender: {
      type: String,
      enum: ["male", "female", "unisex"],
      required: true,
    },
    discount: {
      type: Number,
      default: 0,
      validate: {
        validator: function (this: IProduct, v: number) {
          if (this.discountType === "flat") return v <= this.price;
          if (this.discountType === "percent"|| this.discountType === "percentage") return v <= 100;
          return true;
        },
        message: "Invalid discount value.",
      },
    },
    discountType: {
      type: String,
      enum: ["flat", "percent","percentage",'fixed'],
      default: "flat",
    },
    image: { type: String, required: true }, // main image
    slug: { type: String },
    tags: { type: [String], default: [] },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);
productSchema.pre("validate", function (next) {
  if (this.discountType === "percentage") {
    this.discountType = "percent";
  }
  next();
});

// Auto-generate slug
productSchema.pre("validate", function (next) {
  if (!this.slug && this.name) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  next();
});

// Auto-set price & stock
productSchema.pre("save", function (next) {
  if (this.variants?.length > 0) {
    const prices = this.variants.map((v) => v.price);
    this.price = Math.min(...prices);

    this.countInStock = this.variants.reduce((total, variant) => {
      if (variant.sizes?.length > 0) {
        return total + variant.sizes.reduce((sum, size) => sum + size.stock, 0);
      }
      return total + variant.stock;
    }, 0);
  }
  next();
});

// Virtual: final price after discount
productSchema.virtual("finalPrice").get(function (this: IProduct) {
  const discountType = this.discountType === "percentage" ? "percent" : this.discountType;

  if (discountType === "percent") {
    return this.price - (this.price * this.discount) / 100;
  }
  return this.price - this.discount;
});

// Indexes
productSchema.index({ slug: 1 }, { unique: true, collation: { locale: "en", strength: 2 } });
productSchema.index({ category: 1 });
productSchema.index({ isActive: 1 });
productSchema.index({ isFeatured: 1 });

const Product = mongoose.models.Product || mongoose.model<IProduct>("Product", productSchema);
export default Product;
export interface ProductData {
  _id: string;
  name: string;
  description?: string;
  price: number;
  countInStock: number;
  category?: string;
  isActive: boolean;
  isFeatured: boolean;
  variants: {
     _id: string; 
    color: string;
    price: number;
    stock: number;
    image: string;
    sizes: { size: string; stock: number }[];
  }[];
  gender: "male" | "female" | "unisex";
  discount: number;
  discountType: "flat" | "percent" | "percentage" | "fixed";
  image: string;
  slug?: string;
  tags: string[];
  finalPrice?: number;
  createdAt?: string;
  updatedAt?: string;
}
