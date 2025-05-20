"use client"
import React from 'react'
import Link from 'next/link'

import { usePathname } from 'next/navigation';
const page = () => {
    const pathname=usePathname()
  return (
    <div>
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
          className={`hover:bg-gray-700 p-2 rounded ${pathname === "/admin" ? "bg-gray-700" : ""}`}
        >
          User Management
        </Link>
        <Link
          href="/admin/product"
          className={`hover:bg-gray-700 p-2 rounded ${pathname === "/admin" ? "bg-gray-700" : ""}`}
        >
          Products
        </Link>
      </div>
    </aside>
    </div>
  )
}

export default page