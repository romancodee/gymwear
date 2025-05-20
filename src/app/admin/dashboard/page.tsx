"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const Dashboard = () => {
    const pathname = usePathname();
    console.log(pathname)
  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      {/* <aside className="fixed top-0 left-0 z-40 h-full bg-black text-white w-20 sm:w-26 md:w-24 lg:w-44">
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
    </aside> */}

      {/* Dashboard Content */}
      <div className="flex-grow ml-20 sm:ml-26 md:ml-24 lg:ml-44 p-6">
        <h1 className="text-3xl font-semibold mb-6">Dashboard</h1>
        <p className="text-lg text-gray-700">
          Welcome to your dashboard. Add your content and widgets here.
        </p>

        {/* Add more dashboard content below */}
        <div className="mt-4">
          <p className="text-md text-gray-500">Your activity and statistics will go here.</p>
          {/* Example card layout */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
            <div className="bg-white p-4 shadow-md rounded-lg">
              <h3 className="text-xl font-semibold">Widget 1</h3>
              <p className="text-gray-600">This is a sample widget.</p>
            </div>
            <div className="bg-white p-4 shadow-md rounded-lg">
              <h3 className="text-xl font-semibold">Widget 2</h3>
              <p className="text-gray-600">This is another widget example.</p>
            </div>
            <div className="bg-white p-4 shadow-md rounded-lg">
              <h3 className="text-xl font-semibold">Widget 3</h3>
              <p className="text-gray-600">This is a third widget example.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
