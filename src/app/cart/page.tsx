'use client';

import { useEffect, useState } from 'react';
import { useCart, CartItem } from '../context/cartcontext';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import cart from '../model/cart';
const CartPage: React.FC = () => {

  const { cartItems, selectedItems, setSelectedItems, updateQuantity, removeItem, fetchCart } = useCart();

  const router = useRouter();
const [selectedCartItems, setSelectedCartItems] = useState<CartItem[]>([]); 
  useEffect(() => {
    fetchCart(); // ✅ Fetch from localStorage or DB
  }, []);

  useEffect(()=>{
    setSelectedItems(cartItems)
  },[cartItems])
const toggleSelectedItem = (item: CartItem) => {
  const isSelected = selectedItems.find(i => i._id === item._id && i.size === item.size);
  if (isSelected) {
    setSelectedItems(selectedItems.filter(i => i._id !== item._id || i.size !== item.size));
  } else {
    setSelectedItems([...selectedItems, item]);
  }
};


  const handlecheckout=()=>{
       if (selectedItems.length === 0) {
      alert("Please select at least one item to checkout.");
      return;
    }
   
    router.push('/checkout');

  }

   const total = selectedItems.reduce((sum, item) => {
    const price = item.price || 0;
    return sum + item.quantity * price;
  }, 0);

  return (
    <div className="p-6 max-w-4xl mx-auto"> {/* ✅ Updated Style */}
      <h1 className="text-2xl font-bold mb-6">Your Shopping Cart</h1> 
      {cartItems.length === 0 ? (
        <p className="text-gray-500">Your cart is empty.</p>
      ) : (
        cartItems.map((item: CartItem, index: number) => (
          <div
            key={`${item._id}-${item.size}`} 
              className="flex flex-col sm:flex-row sm:items-center justify-between border rounded-md p-4 shadow-sm gap-4 bg-white" // ✅ Better layou

         
          >
             {/* Selection checkbox */}
  <div className="flex items-center gap-4 w-full sm:w-auto">
            <input

  type="checkbox"
  checked={!!selectedItems.find(i => i._id === item._id && i.size === item.size)}
  onChange={() => toggleSelectedItem(item)}
//  className="flex items-center gap-4 w-full sm:w-auto"
/>
            {/* Image and Info */}
            {/* <div className="flex gap-4 items-center"> */}
             <Image
  src={typeof item.image === 'string' ? item.image : '/placeholder.png'}
  alt={item.product?.name || 'Product Image'}
  width={80}
  height={80}
  className="rounded object-cover"
/>
              <div>
                <p className="font-medium">{item.product?.name || 'Unnamed Product'}</p>
                <p className="text-sm text-gray-600">Size: {item.size} | Qty: {item.quantity}</p>
                <p className="text-sm text-gray-600">Price: Rs. {item.price?.toLocaleString()}</p>
              </div>
            </div>

            {/* Actions */}
            <div  className="flex items-center space-x-2 w-full sm:w-auto justify-end">
           {/* <div className="flex items-center border rounded overflow-hidden mx-60"> */}
              <button
                className="px-2 py-1 border"
                onClick={() =>
                  updateQuantity({ ...item, quantity: item.quantity + 1 })
                }
              >
                +
              </button>

              <button
                className="px-2 py-1 border"
                onClick={() =>
                  updateQuantity({ ...item, quantity: Math.max(item.quantity - 1, 1) })
                }
              >
                -
              </button>
                </div>
              <button
                className="px-2 py-1 bg-red-500 text-white"
                onClick={() => removeItem(item)}
              >
                Remove
              </button>
            {/* </div> */}
          </div>
        ))
      )}
      {/* Total */}
      <div className="mt-6 font-semibold text-lg">
        Total: Rs. {total.toLocaleString()}
      </div>
      <div className='mt-4'>
        <button
        onClick={handlecheckout}
        className='bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition'
        disabled={cartItems.length==0}
        >
          Check Out
        </button>
      </div>
    </div>
  );
};

export default CartPage;
