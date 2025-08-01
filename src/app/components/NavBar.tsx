'use client';

import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { FaSearch, FaShoppingCart } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import { useCart } from '../context/cartcontext'; // ✅ Import your Cart context

const Navbar: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [userId, setUserId] = useState<string | null>(null); // ✅ Store user ID
  const [searchTerm, setSearchTerm] = useState('');
  const { cartItems, fetchCart } = useCart(); // ✅ Access cart context
  const router = useRouter();

  // ✅ Check auth status and set user ID
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/auth/checkToken');
        const data = await res.json();

        if (data?.isLoggedIn) {
          setIsLoggedIn(true);
          setUserId(data.userId); // Make sure your /checkToken API returns `userId`
        } else {
          setIsLoggedIn(false);
        }
      } catch (error: any) {
        console.error('Auth error:', error.message);
      }
    };

    fetchData();
  }, []);

  // ✅ Load cart once userId is available
  useEffect(() => {
    if (userId) {
      fetchCart();
    }
  }, [userId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    router.push(value.trim() ? `/?search=${encodeURIComponent(value.trim())}` : '/');
  };

  // ✅ Calculate total quantity
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <nav className="flex justify-between items-center px-8 py-6 bg-white dark:bg-black shadow-input border-b dark:border-white/[0.2] border-black/[0.1] rounded-xl mb-6">
      {/* Left: Navigation */}
      <div className="flex gap-6 items-center text-black dark:text-white text-lg font-semibold">
        <Link href="/" className="hover:underline">Home</Link>

        <div className="relative group">
          <span className="hover:underline cursor-pointer">Category</span>
          <div className="absolute left-0 top-full bg-white dark:bg-gray-900 shadow-lg mt-0 rounded-md z-50 min-w-[120px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
            <Link href={{ pathname: "/", query: { category: "men" } }} className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700">Men</Link>
            <Link href={{ pathname: "/", query: { category: "woman" } }} className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700">Women</Link>
          </div>
        </div>
      </div>

      {/* Middle: Search */}
      <div className="flex-grow max-w-md mx-6 relative">
        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={handleChange}
          className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black dark:bg-gray-800 dark:text-white"
        />
        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
      </div>

<div className="flex items-center gap-5">
  {/* ✅ Cart with item count */}
  <Link href="/cart" className="relative flex items-center text-black dark:text-white">
    <FaShoppingCart size={24} />
    {totalItems > 0 && (
      <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
        {totalItems}
      </span>
    )}
  </Link>

  {/* ✅ Login / Logout */}
  {isLoggedIn ? (
    <Link href="/logout" className="text-black dark:text-white hover:opacity-80 transition">
      {/* Logout Icon */}
      <svg
        width="26"
        height="26"
        fill="currentColor"
        viewBox="0 0 16 16"
        className="cursor-pointer"
      >
        <path d="M10.5 3a.5.5 0 0 0 0 1h2.793L9.146 8.146a.5.5 0 0 0 .708.708L14 4.707V7.5a.5.5 0 0 0 1 0v-4A.5.5 0 0 0 14.5 3h-4z" />
        <path d="M4.5 3A1.5 1.5 0 0 0 3 4.5v7A1.5 1.5 0 0 0 4.5 13h6a1.5 1.5 0 0 0 1.5-1.5V10a.5.5 0 0 0-1 0v1.5a.5.5 0 0 1-.5.5h-6a.5.5 0 0 1-.5-.5v-7a.5.5 0 0 1 .5-.5h6a.5.5 0 0 1 .5.5V6a.5.5 0 0 0 1 0V4.5A1.5 1.5 0 0 0 10.5 3h-6z" />
      </svg>
    </Link>
  ) : (
    <Link href="/login" className="text-black dark:text-white hover:opacity-80 transition">
      {/* Login Icon */}
      <svg
        width="26"
        height="26"
        fill="currentColor"
        viewBox="0 0 16 16"
        className="cursor-pointer"
      >
        <path d="M3.5 3A1.5 1.5 0 0 0 2 4.5v7A1.5 1.5 0 0 0 3.5 13h6a1.5 1.5 0 0 0 1.5-1.5V10a.5.5 0 0 0-1 0v1.5a.5.5 0 0 1-.5.5h-6a.5.5 0 0 1-.5-.5v-7a.5.5 0 0 1 .5-.5h6a.5.5 0 0 1 .5.5V6a.5.5 0 0 0 1 0V4.5A1.5 1.5 0 0 0 9.5 3h-6z" />
        <path d="M13.354 7.646a.5.5 0 0 0-.708.708L14.293 10H9.5a.5.5 0 0 0 0 1h4.793l-1.647 1.646a.5.5 0 0 0 .708.708l2.5-2.5a.5.5 0 0 0 0-.708l-2.5-2.5z" />
      </svg>
    </Link>
  )}

  {/* ✅ Profile Icon */}
  <Link href="/user" className="text-black dark:text-white hover:opacity-80 transition">
    <svg
      width="26"
      height="26"
      fill="currentColor"
      viewBox="0 0 16 16"
      className="cursor-pointer"
    >
      <path d="M3 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1H3z" />
      <path
        fillRule="evenodd"
        d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"
      />
    </svg>
  </Link>
</div>


    </nav>
  );
};

export default Navbar;
