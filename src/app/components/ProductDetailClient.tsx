'use client';

import Image from 'next/image';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ProductData } from '../model/productType';
import { useCart } from '../context/cartcontext';
import { getUserId } from '../lib/getUserId';

export default function ProductDetailClient({ product }: { product: ProductData }) {
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const { addToCart } = useCart();
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const router = useRouter();
 const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const selectedVariant = product.variants[selectedVariantIndex];
  const currentStock = selectedVariant.sizes.find((s) => s.size === selectedSize)?.stock || 0;
  const disableActions = !selectedSize || quantity > currentStock;

   const allImages = product.variants
    .flatMap((variant) => variant.images)
    .filter((img) => img && img.trim() !== '');

const handleAddToCart = async () => {
  const userId = await getUserId();
  if (!userId) {
    alert('You must be logged in to add items to the cart');
    router.push('/login');
    return;
  }

  if (!selectedColor || !selectedSize) {
    alert('Please select color and size');
    return;
  }

  const selectedVariant = product.variants[selectedVariantIndex];
  console.log("👉 selectedVariant:", selectedVariant);
  if (!selectedVariant) {
    alert("Variant not found");
    return;
  }

  const selectedSizeObject = selectedVariant.sizes.find((s) => s.size === selectedSize);
  if (!selectedSizeObject) {
    alert('Selected size not available in this variant');
    return;
  }

  if (quantity > selectedSizeObject.stock) {
    alert(`Only ${selectedSizeObject.stock} items available in selected size`);
    return;
  }

  const cartItem = {
    userId,
    productId: product._id,
    variantId: selectedVariant._id,
    size: selectedSize,
    quantity,
    name: product.name,
    price: selectedVariant.price,
    image: selectedVariant.images?.[selectedImageIndex] || selectedVariant.images?.[0], 
  };

  console.log("🛒 CartItem to add:", cartItem);
  addToCart(cartItem);
  router.push('/cart');
};

  const handleBuyNow = () => {
    if (!selectedSize) {
      alert('Please select a size.');
      return;
    }

    if (quantity > currentStock) {
      alert(`Only ${currentStock} items available`);
      return;
    }

    const checkoutItem = {
      productId: product._id,
      name: product.name,
       image: selectedVariant.images?.[0], 
      color: selectedVariant.color,
      size: selectedSize,
      quantity,
      price: selectedVariant.price,
      variantIndex: selectedVariantIndex,
    };

    localStorage.setItem('checkoutItem', JSON.stringify(checkoutItem));
    router.push('/checkout');
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Left: Images */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex md:flex-col gap-2">
            {selectedVariant.images
  .filter((img) => img && img.trim() !== '')
  .map((img, idx) => (
    <Image
      key={idx}
      src={img}
      alt={`Thumbnail ${idx}`}
      width={80}
      height={80}
      onClick={() => setSelectedImageIndex(idx)}
      className={`cursor-pointer border rounded object-cover ${
        selectedImageIndex === idx ? 'ring-2 ring-black' : ''
      }`}
    />
))}
          </div>
          <div className="flex-1">
           {selectedVariant.images[selectedImageIndex] ? (
  <Image
    src={selectedVariant.images[selectedImageIndex]}
    alt={product.name}
    width={500 }
    height={500}
    className="rounded-lg object-cover w-full"
  />
) : (
  <div className="w-full h-[600px] bg-gray-200 flex items-center justify-center rounded-lg">
    <span className="text-gray-500">No image available</span>
  </div>
)}
          </div>
        </div>

        {/* Right: Info */}
        <div className="space-y-5">
          <h1 className="text-2xl font-bold">{product.name}</h1>
          <h2 className="text-lg text-gray-700">{product.description}</h2>
          <p className="text-lg font-semibold">Rs. {selectedVariant.price.toLocaleString()}</p>
          <p className="text-sm text-gray-500">Tax included. Shipping calculated at checkout.</p>

          {/* Colors */}
          <div>
            <p className="text-sm font-semibold">Available Colors:</p>
            <div className="flex gap-2 mt-2">
              {product.variants.map((variant, idx) => (
                <div key={idx} className="flex flex-col items-center">
                {variant.images?.[0] ? (
  <Image
    src={variant.images[0]}
    alt={variant.color}
    width={50}
    height={50}
    className={`rounded border cursor-pointer ${
      selectedVariantIndex === idx ? 'ring-2 ring-black' : ''
    }`}
    onClick={() => {
      setSelectedVariantIndex(idx);
        setSelectedColor(variant.color); 
      setSelectedImageIndex(0);
      setSelectedSize(null);
    }}
  />
) : (
  <div className="w-[50px] h-[50px] bg-gray-200 flex items-center justify-center rounded">
    <span className="text-xs text-gray-500">No Img</span>
  </div>
)}

                  <span className="text-xs">{variant.color}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Sizes */}
          <div>
            <p className="text-sm font-semibold mt-4">Sizes:</p>
            <div className="flex gap-3 mt-2">
              {selectedVariant.sizes.map((opt) => (
                <button
                  key={opt.size}
                  onClick={() => opt.stock > 0 && setSelectedSize(opt.size)}
                  disabled={opt.stock === 0}
                  className={`px-4 py-2 border rounded ${
                    opt.stock === 0
                      ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
                      : selectedSize === opt.size
                      ? 'bg-black text-white'
                      : 'hover:bg-black hover:text-white'
                  }`}
                >
                  {opt.size}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity */}
          <div className="flex items-center gap-4 mt-4">
            <label htmlFor="qty" className="text-sm font-semibold">
              Quantity
            </label>
            <input
              id="qty"
              type="number"
              min="1"
              max={currentStock} // ✅ UPDATED: max set to available stock
              value={quantity}
              onChange={(e) => {
                const val = Number(e.target.value);
                if (val > currentStock) {
                  alert(`Only ${currentStock} items available`);
                  return;
                }
                setQuantity(val);
              }}
              className="w-16 border px-2 py-1 rounded"
            />
            {/* ✅ Optional: show stock */}
            {selectedSize && (
              <span className="text-sm text-gray-600">
                {currentStock} in stock
              </span>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 mt-6">
            <button
              onClick={handleAddToCart}
              disabled={disableActions} // ✅ UPDATED
              className={`bg-black text-white py-3 px-6 uppercase tracking-wide transition 
                ${disableActions ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'}`}
            >
              Add to Cart
            </button>
            <button
              onClick={handleBuyNow}
              disabled={disableActions} // ✅ UPDATED
              className={`border border-black text-black py-3 px-6 uppercase tracking-wide transition 
                ${disableActions ? 'opacity-50 cursor-not-allowed' : 'hover:bg-black hover:text-white'}`}
            >
              Buy it Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
