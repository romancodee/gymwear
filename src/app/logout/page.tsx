"use client"
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const Page = () => {
    const router = useRouter();
  const logout = async () => {
    try {
      const res = await fetch('/api/auth/logout', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) {
        throw new Error(`Logout failed: ${res.status} ${res.statusText}`);
      }

      // Optionally, you can redirect or update UI here after logout
      console.log('Logged out successfully');
      router.push('/')
    } catch (err: any) {
      console.error('Logout error:', err);
    }
  };

  useEffect(() => {
    logout();
  }, []);

  return <div>Logging out...</div>;
};

export default Page;
