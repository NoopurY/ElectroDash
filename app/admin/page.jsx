'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in
    const user = localStorage.getItem('user');
    
    if (user) {
      const userData = JSON.parse(user);
      
      // Check if user is admin/vendor
      if (userData.role === 'admin') {
        // Redirect to admin dashboard
        router.push('/admin/dashboard');
      } else {
        // Not an admin, redirect to login
        alert('You need to be logged in as a vendor to access this page');
        router.push('/login');
      }
    } else {
      // Not logged in, redirect to login
      router.push('/login');
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-cyan-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5A8DEE] mx-auto"></div>
        <p className="mt-4 text-gray-600">Redirecting...</p>
      </div>
    </div>
  );
}
