'use client';
import React, { createContext, useContext, useState, ReactNode } from 'react';

export type CartItem = {
  _id?: string;
  userId: string;
  productId: string;
  variantId: string;
  size: string;
  quantity: number;
  price: number;
  name :string,
  image: string;
  product?: {
    name?: string;
  };
};

interface CartContextType {
  cartItems: CartItem[];
   selectedItems: CartItem[]; 
  setSelectedItems: (items: CartItem[]) => void;
  clearSelectedItems: () => void; 
  fetchCart: () => Promise<void>;

  addToCart: (item: CartItem) => Promise<void>;
  updateQuantity: (item: CartItem) => Promise<void>;
  removeItem: (item: CartItem) => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [selectedItems, setSelectedItemsState] = useState<CartItem[]>([]); 

  const fetchCart = async () => {
    const res = await fetch('/api/cart');
    const data = await res.json();
    setCartItems(data.cart?.items || []);
  };

  const addToCart = async (item: CartItem) => {
    await fetch('/api/cart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item),
    });
    fetchCart();
  };

  const updateQuantity = async (item: CartItem) => {
  if (!item._id) {
    console.error('Missing _id in cart item:', item);
    return;
  }

  await fetch('/api/cart', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(item),
  });

  fetchCart(); // Re-fetch the cart
};
  const setSelectedItems = (items: CartItem[]) => {
    setSelectedItemsState(items);
  };
 const clearSelectedItems = () => {
    setSelectedItemsState([]);
  };
  const removeItem = async (item: CartItem) => {
    await fetch('/api/cart', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item),
    });
    fetchCart();
  };

  return (
    <CartContext.Provider
        value={{
        cartItems,
        selectedItems,     // ✅
        setSelectedItems,  // ✅
        clearSelectedItems,// ✅
        fetchCart,
        addToCart,
        updateQuantity,
        removeItem,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
