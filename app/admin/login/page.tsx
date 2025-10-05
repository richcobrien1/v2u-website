"use client";
import { useState } from 'react';

export default function AdminLogin() {
  const [adminId, setAdminId] = useState('');
  const [secret, setSecret] = useState('');
  const [message, setMessage] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage('Logging in...');
    try {
      const res = await fetch('/api/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminId, secret })
      });
      const data = await res.json() as { success?: boolean; error?: string };
      if (data.success) {
        setMessage('Login successful. Redirecting...');
        window.location.href = '/admin/dashboard';
      } else {
        setMessage(data.error || 'Login failed');
      }
    } catch (error) {
      // Log the error for debugging; using the variable avoids the unused-vars lint warning
      // and keeps build output informative in case of unexpected failures.
      console.error('Admin login error', error);
      setMessage('Login error');
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
      <form onSubmit={handleSubmit} className="bg-gray-800 p-8 rounded-lg w-96">
        <h2 className="text-2xl mb-4">Admin Login</h2>
        <label className="block mb-2">Admin ID</label>
        <input value={adminId} onChange={e => setAdminId(e.target.value)} className="w-full mb-4 p-2 rounded bg-gray-700" />
        <label className="block mb-2">Secret</label>
        <input value={secret} onChange={e => setSecret(e.target.value)} className="w-full mb-4 p-2 rounded bg-gray-700" />
        <button className="w-full bg-yellow-500 text-black py-2 rounded">Sign In</button>
        <p className="mt-4 text-sm text-gray-300">{message}</p>
      </form>
    </div>
  );
}
