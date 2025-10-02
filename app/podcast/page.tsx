'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface Episode {
  id: string;
  title: string;
  description: string;
  duration: string;
  publishDate: string;
  isPremium: boolean;
  audioUrl?: string;
  thumbnailUrl?: string;
}

// Mock data - replace with your actual data source
const mockEpisodes: Episode[] = [
  {
    id: 'ep-001',
    title: 'Welcome to V2U Podcast',
    description: 'Introduction to our podcast and what you can expect.',
    duration: '15:30',
    publishDate: '2025-09-15',
    isPremium: false,
    audioUrl: 'public/episodes/ep-001.mp3',
    thumbnailUrl: '/v2u_avatar.png'
  },
  {
    id: 'ep-002',
    title: 'Premium Content Strategy',
    description: 'Deep dive into creating valuable premium content for subscribers.',
    duration: '32:45',
    publishDate: '2025-09-22',
    isPremium: true,
    audioUrl: 'premium/episodes/ep-002.mp3',
    thumbnailUrl: '/v2u_avatar.png'
  },
  {
    id: 'ep-003',
    title: 'Building Your Brand',
    description: 'Essential tips for building a strong personal or business brand.',
    duration: '28:15',
    publishDate: '2025-09-29',
    isPremium: false,
    audioUrl: 'public/episodes/ep-003.mp3',
    thumbnailUrl: '/v2u_avatar.png'
  },
  {
    id: 'ep-004',
    title: 'Advanced Marketing Techniques',
    description: 'Advanced strategies for marketing your products and services.',
    duration: '41:20',
    publishDate: '2025-10-01',
    isPremium: true,
    audioUrl: 'premium/episodes/ep-004.mp3',
    thumbnailUrl: '/v2u_avatar.png'
  }
];

export default function PodcastPage() {
  const [userToken, setUserToken] = useState<string | null>(null);
  const [showSubscribeModal, setShowSubscribeModal] = useState(false);

  useEffect(() => {
    // Check for stored user token (from successful subscription)
    const token = localStorage.getItem('v2u-auth-token');
    setUserToken(token);
  }, []);

  const publicEpisodes = mockEpisodes.filter(ep => !ep.isPremium);
  const premiumEpisodes = mockEpisodes.filter(ep => ep.isPremium);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="max-w-6xl mx-auto px-4 py-8">
        
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">
            V2U Podcast
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Transforming ideas into action. Join us for insights on business, 
            technology, and personal growth.
          </p>
        </div>

        {/* Subscription Status */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">
                {userToken ? '🎉 Premium Subscriber' : '👋 Free Listener'}
              </h3>
              <p className="text-gray-300">
                {userToken 
                  ? 'You have access to all premium content!' 
                  : 'Subscribe to unlock exclusive premium episodes'
                }
              </p>
            </div>
            {!userToken && (
              <button
                onClick={() => setShowSubscribeModal(true)}
                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all"
              >
                Subscribe Now
              </button>
            )}
          </div>
        </div>

        {/* Free Episodes */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-white mb-6">
            🎧 Free Episodes
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {publicEpisodes.map((episode) => (
              <EpisodeCard 
                key={episode.id} 
                episode={episode} 
                hasAccess={true}
                userToken={userToken}
              />
            ))}
          </div>
        </section>

        {/* Premium Episodes */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-white">
              ⭐ Premium Episodes
            </h2>
            {!userToken && (
              <div className="text-yellow-400 text-sm">
                🔒 Subscription Required
              </div>
            )}
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {premiumEpisodes.map((episode) => (
              <EpisodeCard 
                key={episode.id} 
                episode={episode} 
                hasAccess={!!userToken}
                userToken={userToken}
              />
            ))}
          </div>
        </section>

        {/* Subscribe Modal */}
        {showSubscribeModal && (
          <SubscribeModal onClose={() => setShowSubscribeModal(false)} />
        )}
      </div>
    </div>
  );
}

function EpisodeCard({ 
  episode, 
  hasAccess, 
  userToken 
}: { 
  episode: Episode; 
  hasAccess: boolean;
  userToken: string | null;
}) {
  const [loading, setLoading] = useState(false);

  const handlePlay = async () => {
    if (!hasAccess) {
      alert('Premium subscription required for this episode!');
      return;
    }

    if (episode.isPremium && userToken) {
      setLoading(true);
      try {
        // Get secure access URL from our R2 API
        const response = await fetch(`/api/r2/private/${episode.audioUrl}`, {
          headers: {
            'Authorization': `Bearer ${userToken}`
          }
        });

        if (response.ok) {
          const data = await response.json() as { url: string; success: boolean };
          // In a real app, you'd use the secure URL to play the audio
          console.log('Secure audio URL:', data.url);
          alert('Premium episode access granted! (Check console for secure URL)');
        } else {
          alert('Access denied - please check your subscription');
        }
      } catch (err) {
        console.error('Premium content access error:', err);
        alert('Error accessing premium content');
      } finally {
        setLoading(false);
      }
    } else {
      // Public episode - direct play
      alert(`Playing: ${episode.title}`);
    }
  };

  return (
    <div className={`bg-white/10 backdrop-blur-lg rounded-xl p-6 ${!hasAccess ? 'opacity-75' : ''}`}>
      <div className="flex items-start space-x-4">
        <Image 
          src={episode.thumbnailUrl || '/v2u_avatar.png'} 
          alt={episode.title}
          width={64}
          height={64}
          className="w-16 h-16 rounded-lg object-cover"
        />
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <h3 className="text-lg font-semibold text-white">
              {episode.title}
            </h3>
            {episode.isPremium && (
              <span className="bg-yellow-500 text-black px-2 py-1 rounded text-xs font-bold">
                PREMIUM
              </span>
            )}
          </div>
          <p className="text-gray-300 text-sm mb-3">
            {episode.description}
          </p>
          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-400">
              {episode.duration} • {episode.publishDate}
            </div>
            <button
              onClick={handlePlay}
              disabled={loading}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                hasAccess 
                  ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                  : 'bg-gray-600 text-gray-300 cursor-not-allowed'
              }`}
            >
              {loading ? '⏳' : hasAccess ? '▶️ Play' : '🔒 Subscribe'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SubscribeModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-8 max-w-md mx-4">
        <h3 className="text-2xl font-bold text-gray-800 mb-4">
          Subscribe to V2U Premium
        </h3>
        <p className="text-gray-600 mb-6">
          Get access to exclusive premium episodes, early releases, and bonus content.
        </p>
        <div className="space-y-4">
          <Link
            href="/subscribe"
            className="block w-full bg-blue-600 text-white text-center py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Subscribe Now - $9.99/month
          </Link>
          <button
            onClick={onClose}
            className="w-full bg-gray-200 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors"
          >
            Maybe Later
          </button>
        </div>
      </div>
    </div>
  );
}