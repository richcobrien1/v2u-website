'use client';

import { ReactNode } from 'react';

interface PremiumLayoutProps {
  children: ReactNode;
  backgroundImage?: string;
  backgroundOpacity?: number;
  className?: string;
}

export default function PremiumLayout({
  children,
  backgroundImage = '/background2.jpg', // Default premium background
  backgroundOpacity = 0.1, // Subtle elegance
  className = ''
}: PremiumLayoutProps) {
  return (
    <div className={`relative min-h-screen ${className}`}>
      {/* Premium Background */}
      <div 
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'top center',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'fixed',
          opacity: backgroundOpacity
        }}
      />
      
      {/* Elegant Overlay */}
      <div className="fixed inset-0 z-0 bg-gradient-to-b from-black/5 via-transparent to-black/10" />
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}