import React from 'react';
import Link from 'next/link';

const Page = ({children}:{children:React.ReactNode}) => {
  return (
    <div className="min-h-screen ml-20 flex bg-gray-100">
      {/* Sidebar Placeholder */}
      <aside className="w-20 bg-transparent"></aside>

      {/* Main Content */}
      <div className="flex-1">
        {/* Transparent Navbar */}
       <nav className="fixed ml-20 top-0 left-20 right-0 bg-transparent text-black p-4 flex items-center justify-between z-50">

          <div className="text-xl font-bold">Product Panel</div>
          <div className="space-x-4">
            <Link
              href="/admin/product/addproduct"
              className="hover:bg-white hover:text-black transition px-4 py-2 rounded"
            >
              Add Product
            </Link>
            <Link
              href="/admin/product/edit"
              className="hover:bg-white hover:text-black transition px-4 py-2 rounded"
            >
              Edit Product
            </Link>
            <Link
              href="/admin/product/delete"
              className="hover:bg-white hover:text-black transition px-4 py-2 rounded"
            >
              Delete Product
            </Link>
          </div>
        </nav>

        {/* Content placeholder */}
        <main className="pt-4 px-0">
         {children}
        </main>
      </div>
    </div>
  );
};

export default Page;
