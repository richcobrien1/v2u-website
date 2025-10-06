"use client";


import { saveToken } from '@/components/AdminClient';
import { useState } from 'react';

export default function AdminLogin() {
  const [adminId, setAdminId] = useState('');
  const [secret, setSecret] = useState('');
  const [message, setMessage] = useState('');
  const [showOnboard, setShowOnboard] = useState(false);
  const [onboardToken, setOnboardToken] = useState('');
  const [onboardSecret, setOnboardSecret] = useState('');
  const [onboardMsg, setOnboardMsg] = useState('');

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
        // If invalid admin credentials, offer onboard option
        if ((data.error || '').toLowerCase().includes('invalid')) {
          setShowOnboard(true);
        }
      }
    } catch (error) {
      console.error('Admin login error', error);
      setMessage('Login error');
    }
  }

  async function handleOnboard(e: React.FormEvent) {
    e.preventDefault();
    setOnboardMsg('Creating admin...');
    try {
      const res = await fetch('/api/admin-onboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: onboardToken,
          adminId,
          secret: onboardSecret,
          action: 'create',
        })
      });
      const data = await res.json() as { success?: boolean; error?: string };
      if (data.success) {
        setOnboardMsg('Admin created! You can now log in.');
        setShowOnboard(false);
        setMessage('Admin created! Please log in.');
        setSecret('');
        setOnboardSecret('');
        setOnboardToken('');
      } else {
        setOnboardMsg(data.error || 'Failed to create admin');
      }
    } catch {
      setOnboardMsg('Onboard error');
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
      {!showOnboard ? (
        <form onSubmit={handleSubmit} className="bg-gray-800 p-8 rounded-lg w-96">
          <h2 className="text-2xl mb-4">Admin Login</h2>
          <label className="block mb-2">Admin ID</label>
          <input value={adminId} onChange={e => setAdminId(e.target.value)} className="w-full mb-4 p-2 rounded bg-gray-700" />
          <label className="block mb-2">Secret</label>
          <input value={secret} onChange={e => setSecret(e.target.value)} className="w-full mb-4 p-2 rounded bg-gray-700" type="password" />
          <button className="w-full bg-yellow-500 text-black py-2 rounded">Sign In</button>
          <p className="mt-4 text-sm text-gray-300">{message}</p>
          {message.toLowerCase().includes('invalid') && (
            <button type="button" className="mt-2 underline text-blue-400" onClick={() => setShowOnboard(true)}>
              Create Admin (Onboard)
            </button>
          )}
        </form>
      ) : (
        <form onSubmit={handleOnboard} className="bg-gray-800 p-8 rounded-lg w-96">
          <h2 className="text-2xl mb-4">Create Admin (Onboard)</h2>
          <label className="block mb-2">Admin ID</label>
          <input value={adminId} onChange={e => setAdminId(e.target.value)} className="w-full mb-4 p-2 rounded bg-gray-700" />
          <label className="block mb-2">New Secret</label>
          <input value={onboardSecret} onChange={e => setOnboardSecret(e.target.value)} className="w-full mb-4 p-2 rounded bg-gray-700" type="password" />
          <label className="block mb-2">Onboarding Token</label>
          <input value={onboardToken} onChange={e => setOnboardToken(e.target.value)} className="w-full mb-4 p-2 rounded bg-gray-700" />
          <button className="w-full bg-green-500 text-black py-2 rounded">Create Admin</button>
          <p className="mt-4 text-sm text-gray-300">{onboardMsg}</p>
          <button type="button" className="mt-2 underline text-blue-400" onClick={() => { setShowOnboard(false); setOnboardMsg(''); }}>
            Back to Login
          </button>
        </form>
      )}
    </div>
  );
}
