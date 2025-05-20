import React from 'react';
import Link from 'next/link';

const Page = ({children}:{children:React.ReactNode}) => {
  return (
    <div className="min-h-screen ml-20 flex bg-gray-100">
      {/* Sidebar Placeholder */}
     

        {/* Content placeholder */}
        <main className="pt-24 px-8">
          <h1 className="text-2xl font-semibold text-black">Welcome to the Product Management Page</h1>
          <p className="text-gray-700 mt-2">Choose an action from the navbar above.</p>
        </main>
      </div>
  
  );
};

export default Page;
