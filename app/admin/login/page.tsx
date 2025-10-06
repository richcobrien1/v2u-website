"use client";


import { saveToken } from '@/components/AdminClient';
import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function AdminLogin() {
  const [adminId, setAdminId] = useState('');
  const [secret, setSecret] = useState('');
  const [message, setMessage] = useState('');
  // onboard UI moved to protected page; no local state needed

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
      // Try to extract token from Set-Cookie header (server sets v2u_admin_token)
      const cookie = res.headers.get('set-cookie');
      let token = '';
      if (cookie) {
        const match = cookie.match(/v2u_admin_token=([^;]+)/);
        if (match) token = match[1];
      }
      if (data.success) {
        // Save token for adminFetch
        if (token) saveToken(token);
        setMessage('Login successful. Redirecting...');
        window.location.href = '/admin/dashboard';
      } else {
        setMessage(data.error || 'Login failed');
        // If invalid admin credentials, offer onboard option (link shown in UI)
      }
    } catch (error) {
      console.error('Admin login error', error);
      setMessage('Login error');
    }
  }

  // Onboard flow moved to a protected admin-only page (/admin/onboard)

  return (
    <main className="w-full min-h-screen bg-[var(--site-bg)] text-[var(--site-fg)]">
      <Header loggedIn={false} firstName="" avatar="" />

      <div className="flex items-start justify-center px-4 md:px-4 pt-24 pb-8">
        <div className="rounded-xl bg-[#212121ff] text-white p-8 w-96 shadow-lg">
          <form onSubmit={handleSubmit}>
            <h2 className="text-2xl font-semibold mb-4">Admin Login</h2>
            <label className="block mb-2 text-sm">Admin ID</label>
            <input value={adminId} onChange={e => setAdminId(e.target.value)} className="w-full mb-4 p-3 rounded bg-gray-700 text-white border border-gray-600 focus:border-blue-400 focus:outline-none" />
            <label className="block mb-2 text-sm">Secret</label>
            <input value={secret} onChange={e => setSecret(e.target.value)} className="w-full mb-4 p-3 rounded bg-gray-700 text-white border border-gray-600 focus:border-blue-400 focus:outline-none" type="password" />
            <button className="w-full bg-yellow-500 text-black py-3 rounded font-semibold hover:bg-yellow-400 transition-colors">Sign In</button>
            <p className="mt-4 text-sm text-gray-300">{message}</p>
            {message.toLowerCase().includes('invalid') && (
              <a href="/admin/onboard" className="mt-2 underline text-blue-400 block hover:text-blue-300">Create Admin (Onboard)</a>
            )}
          </form>
        </div>
      </div>

      <Footer />
    </main>
  );
}
