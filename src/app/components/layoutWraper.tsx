'use client';

import { usePathname } from 'next/navigation';
import Navbar from './NavBar';

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // ✅ Define where to show the Navbar
  const showNavbar =
    pathname === '/' ||
    pathname.startsWith('/product') ||
    pathname.startsWith('/category')||
     pathname.startsWith('/cart')||
          pathname.startsWith('/user');

  return (
    <>
      {showNavbar && <Navbar />}
      {children}
    </>
  );
}
