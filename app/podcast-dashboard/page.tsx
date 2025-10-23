// components/Header.tsx

'use client';

import React from 'react';

interface HeaderProps {
  user: {
    id: string;
    name: string;
    email: string;
    subscription: 'free' | 'premium';
    avatar: string;
  };
}

export default function Header({ user }: HeaderProps) {
  return (
    <header className="flex items-center justify-between p-4 bg-black/20 backdrop-blur-md rounded-lg">
      {/* Left side: branding */}
      <div className="flex items-center gap-3">
        <span className="text-xl font-bold">AI‑Now</span>
      </div>

      {/* Right side: user profile */}
      <div className="flex items-center gap-3">
        <span className="text-2xl">{user.avatar}</span>
        <div className="flex flex-col">
          <span className="font-semibold">{user.name}</span>
          <span className="text-xs opacity-70">{user.subscription}</span>
        </div>
      </div>
    </header>
  );
}
