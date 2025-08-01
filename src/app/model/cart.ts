// models/Cart.ts
import mongoose, { Schema, model, models } from "mongoose";

const cartItemSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, required: true, ref: "User" },
  productId: { type: Schema.Types.ObjectId, required: true, ref: "Product" },
  variantId: { type: Schema.Types.ObjectId, required: true },
  size: { type: String, required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  name: { type: String, required: true },
  image: { type: String, required: true },
});

const CartSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, required: true, ref: "User", unique: true },
  items: [cartItemSchema],
}, { timestamps: true });

export default models.Cart || model("Cart", CartSchema);
