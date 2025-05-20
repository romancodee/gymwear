"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const Layout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="fixed top-0 left-0 z-40 h-full bg-black text-white w-20 sm:w-26 md:w-24 lg:w-44">
        <div className="flex flex-col p-4 space-y-2">
          <Link
            href="/admin/dashboard"
            className={`hover:bg-gray-700 p-2 rounded ${pathname === "/admin/dashboard" ? "bg-gray-700" : ""}`}
          >
            Dashboard
          </Link>
          <Link
            href="/admin/usermanagment"
            className={`hover:bg-gray-700 p-2 rounded ${pathname === "/admin/usermanagment" ? "bg-gray-700" : ""}`}
          >
            User Management
          </Link>
          <Link
            href="/admin/product"
            className={`hover:bg-gray-700 p-2 rounded ${pathname === "/admin/product" ? "bg-gray-700" : ""}`}
          >
            Products
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 overflow-auto">
        {children}
      </main>
    </div>
  );
};

export default Layout;
