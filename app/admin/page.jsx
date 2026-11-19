'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PageLoader } from '@/components/ui';

export default function AdminPage() {
  const router = useRouter();

  useEffect(() => {
    // Vendors go to their dashboard; everyone else goes to login
    try {
      const userData = JSON.parse(localStorage.getItem('user') || 'null');
      router.replace(userData?.role === 'admin' ? '/admin/dashboard' : '/login');
    } catch {
      router.replace('/login');
    }
  }, [router]);

  return <PageLoader label="Redirecting…" />;
}
