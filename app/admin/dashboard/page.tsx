"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { adminFetch } from '@/components/AdminClient'
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function AdminDashboard() {
  const [message, setMessage] = useState('Checking auth...');
  const [identity, setIdentity] = useState<{ adminId?: string; role?: string; iat?: number; exp?: number } | null>(null);
  type IntegrationCheck = { ok?: boolean; error?: string; note?: string }
  type Integrations = { kv?: IntegrationCheck; r2?: IntegrationCheck; resend?: IntegrationCheck }
  const [integrations, setIntegrations] = useState<Integrations | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function check() {
      try {
  const who = await adminFetch('/api/admin-whoami', { cache: 'no-store' })
        if (who.ok) {
          const data = await who.json() as { success?: boolean; identity?: { adminId?: string; role?: string; iat?: number; exp?: number } };
          if (data.identity) {
            setIdentity(data.identity);
            setMessage('Welcome to the admin dashboard');
            // fetch integrations status
            try {
              type ApiResp = { kv?: IntegrationCheck; r2?: IntegrationCheck; resend?: IntegrationCheck }
              const res = await adminFetch('/api/admin/integrations')
              if (res.ok) {
                const j = (await res.json()) as ApiResp
                setIntegrations(j)
              }
            } catch { /* ignore */ }
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
  }, [router]);

  async function handleLogout() {
    await fetch('/api/admin-logout', { method: 'POST' });
    window.location.href = '/admin/login';
  }

  return (
    <main className="min-h-screen bg-[var(--site-bg)] text-[var(--site-fg)]">
      <Header loggedIn={true} firstName="Welcome" avatar="🟡" isAdmin={true} />

      <div className="p-8 pt-24">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl">Admin Dashboard</h1>
            <button onClick={handleLogout} className="bg-red-600 px-4 py-2 rounded">Logout</button>
          </div>

          <div className="rounded-xl bg-[#212121ff] text-white p-6">{message}</div>
          {integrations && (
            <div className="mt-6 grid grid-cols-3 gap-4">
              <div className="rounded-xl p-4 bg-[#212121ff] text-white">
                <h4 className="font-semibold">KV</h4>
                <div className="text-sm mt-2">{integrations.kv?.ok ? 'Connected' : `Error: ${integrations.kv?.error || integrations.kv?.note || 'unknown'}`}</div>
              </div>
              <div className="rounded-xl p-4 bg-[#212121ff] text-white">
                <h4 className="font-semibold">R2</h4>
                <div className="text-sm mt-2">{integrations.r2?.ok ? 'Connected' : `Error: ${integrations.r2?.error || 'not configured'}`}</div>
              </div>
              <div className="rounded-xl p-4 bg-[#dfdfdfff] text-black">
                <h4 className="font-semibold">Resend</h4>
                <div className="text-sm mt-2">{integrations.resend?.ok ? 'Connected' : `Error: ${integrations.resend?.error || 'not configured'}`}</div>
              </div>
            </div>
          )}
          <div className="mt-6 flex gap-6">
            <div className="w-1/3 rounded-xl bg-[#212121ff] text-white p-4">
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

            <div className="w-2/3 rounded-xl bg-[#dfdfdfff] text-black p-4">
              <p className="text-sm text-gray-700">Use the admin-onboard API to manage admin accounts.</p>
              <div className="mt-4">
                <a href="/admin/email-template" className="inline-block bg-blue-600 px-4 py-2 rounded text-white">Email Template Editor</a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
