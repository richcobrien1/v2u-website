import { useEffect, useState } from 'react';

export default function AdminDashboard() {
  const [message, setMessage] = useState('Checking auth...');

  useEffect(() => {
    async function check() {
      const res = await fetch('/api/subscriber-access/?customerId=admin-check', { cache: 'no-store' });
      // This is a lightweight check; real admin pages should call a protected API
      if (res.ok) {
        setMessage('Welcome to the admin dashboard');
      } else {
        setMessage('Not authorized');
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
        <div className="mt-6">
          <p className="text-sm text-gray-300">Use the admin-onboard API to manage admin accounts.</p>
        </div>
      </div>
    </div>
  );
}
