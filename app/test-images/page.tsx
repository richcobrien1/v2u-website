"use client";

import Image from 'next/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function TestImages() {
  return (
    <main className="min-h-screen bg-[var(--site-bg)] text-[var(--site-fg)]">
      <Header loggedIn={true} firstName="Welcome" avatar="🟡" />

      <div className="p-8 space-y-4 pt-24">
        <h1 className="text-2xl font-bold">Thumbnail Test Page</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border p-4">
            <h2 className="font-semibold mb-2">v2u-ai-now.jpg</h2>
            <Image 
              src="/v2u-ai-now.jpg" 
              alt="AI Now Thumbnail"
              width={640}
              height={360}
              className="w-full h-48 object-cover border"
            />
          </div>
          
          <div className="border p-4">
            <h2 className="font-semibold mb-2">v2u-ai-now-educate.jpg</h2>
            <Image 
              src="/v2u-ai-now-educate.jpg" 
              alt="AI Now Educate Thumbnail"
              width={640}
              height={360}
              className="w-full h-48 object-cover border"
            />
          </div>
          
          <div className="border p-4">
            <h2 className="font-semibold mb-2">v2u.png</h2>
            <Image 
              src="/v2u.png" 
              alt="V2U Brand Thumbnail"
              width={640}
              height={360}
              className="w-full h-48 object-cover border"
            />
          </div>
        </div>
        
        <div className="mt-8 p-4 bg-gray-100">
          <h2 className="font-semibold mb-2">Direct Links:</h2>
          <div className="space-y-2">
            <div><a href="/v2u-ai-now.jpg" target="_blank" className="text-blue-600 underline">v2u-ai-now.jpg</a></div>
            <div><a href="/v2u-ai-now-educate.jpg" target="_blank" className="text-blue-600 underline">v2u-ai-now-educate.jpg</a></div>
            <div><a href="/v2u.png" target="_blank" className="text-blue-600 underline">v2u.png</a></div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}