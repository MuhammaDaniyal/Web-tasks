'use client';

import { useRouter } from 'next/navigation';
import { logoutUser } from '../actions/auth';
import { useState } from 'react';

export default function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    await logoutUser();
    router.push('/login');
  };

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors"
    >
      {loading ? 'Logging out...' : 'Logout'}
    </button>
  );
}
