"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
  const [message, setMessage] = useState('Checking auth...');
  const [identity, setIdentity] = useState<{ adminId?: string; role?: string; iat?: number; exp?: number } | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function check() {
      try {
        const who = await fetch('/api/admin-whoami', { cache: 'no-store' });
        if (who.ok) {
          const data = await who.json() as { success?: boolean; identity?: { adminId?: string; role?: string; iat?: number; exp?: number } };
          if (data.identity) {
            setIdentity(data.identity);
            setMessage('Welcome to the admin dashboard');
          } else {
            // No identity in payload - redirect to login
            router.push('/admin/login');
          }
        } else {
          // Unauthorized - redirect to login
          router.push('/admin/login');
        }
      } catch (err) {
        console.error('Whoami fetch failed', err);
        router.push('/admin/login');
      }
    }
    check();
  }, []);

  async function handleLogout() {
    await fetch('/api/admin-logout', { method: 'POST' });
    window.location.href = '/admin/login';
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl">Admin Dashboard</h1>
          <button onClick={handleLogout} className="bg-red-600 px-4 py-2 rounded">Logout</button>
        </div>

        <div className="bg-gray-800 p-6 rounded">{message}</div>
        <div className="mt-6 flex gap-6">
          <div className="w-1/3 bg-gray-800 p-4 rounded">
            <h3 className="text-lg font-semibold mb-2">Identity</h3>
            {identity ? (
              <div className="text-sm text-gray-300">
                <p><strong>Admin ID:</strong> {identity.adminId}</p>
                <p><strong>Role:</strong> {identity.role}</p>
                <p><strong>Issued:</strong> {identity.iat ? new Date(identity.iat * 1000).toLocaleString() : '—'}</p>
                <p><strong>Expires:</strong> {identity.exp ? new Date(identity.exp * 1000).toLocaleString() : '—'}</p>
              </div>
            ) : (
              <p className="text-sm text-gray-400">Not signed in</p>
            )}
          </div>

          <div className="w-2/3">
            <p className="text-sm text-gray-300">Use the admin-onboard API to manage admin accounts.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
