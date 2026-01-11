'use client'

export const dynamic = 'force-dynamic';

import Image from 'next/image';
import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function TestThumbnailPage() {
  const [imgError, setImgError] = useState<string | null>(null);
  const [nextError, setNextError] = useState<string | null>(null);

  return (
    <main className="min-h-screen bg-(--site-bg) text-(--site-fg)">
      <Header />

      <div className="p-8 pt-24">
        <h1 className="text-2xl font-bold mb-4">Thumbnail Test</h1>

        <div className="space-y-8">
          {/* Test with regular img tag converted to Next Image */}
          <div>
            <h2 className="text-lg font-semibold mb-2">Optimized Image (next/image):</h2>
            <Image
              src="/v2u-ai-now.jpg"
              alt="Test thumbnail"
              width={256}
              height={144}
              className="object-cover border w-64 h-36"
              onError={(e) => {
                console.error('Optimized Image error:', e);
                setImgError('Failed to load');
              }}
              onLoad={() => {
                console.log('Optimized Image loaded successfully');
                setImgError(null);
              }}
            />
            {imgError && <p className="text-red-500 mt-2">{imgError}</p>}
          </div>

          {/* Test with Next.js Image component */}
          <div>
            <h2 className="text-lg font-semibold mb-2">Next.js Image component:</h2>
            <Image
              src="/v2u-ai-now.jpg"
              alt="Test thumbnail"
              width={256}
              height={144}
              className="object-cover border"
              onError={(e) => {
                console.error('Next.js Image error:', e);
                setNextError('Failed to load');
              }}
              onLoad={() => {
                console.log('Next.js Image loaded successfully');
                setNextError(null);
              }}
            />
            {nextError && <p className="text-red-500 mt-2">{nextError}</p>}
          </div>

          {/* Direct URL test */}
          <div>
            <h2 className="text-lg font-semibold mb-2">Direct URL test:</h2>
            <a
              href="/v2u-ai-now.jpg"
              target="_blank"
              className="text-blue-500 underline"
            >
              Click to test direct URL access
            </a>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}