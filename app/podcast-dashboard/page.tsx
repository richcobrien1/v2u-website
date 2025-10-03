'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Section from '@/components/Section';
import CTAButton from '@/components/CTAButton';
import Image from 'next/image';
import Link from 'next/link';

// Mock user authentication - in production this would come from your auth system
interface User {
  id: string;
  name: string;
  email: string;
  subscription: 'free' | 'premium';
  avatar: string;
}

interface Episode {
  id: string;
  title: string;
  description: string;
  duration: string;
  publishDate: string;
  thumbnail: string;
  category: 'ai-now' | 'ai-now-educate' | 'ai-now-commercial' | 'ai-now-conceptual' | 'ai-now-reviews';
  isPremium: boolean;
  audioUrl?: string;
  isNew?: boolean;
  r2Key?: string;
  fileSize?: number;
}

const mockUser: User = {
  id: 'user-123',
  name: 'Alex Johnson',
  email: 'alex@example.com',
  subscription: 'premium',
  avatar: '🎧'
};

export default function PodcastDashboard() {
  const [user] = useState<User>(mockUser);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usingMockData, setUsingMockData] = useState(false);
  
  // Load episodes from R2 on component mount
  useEffect(() => {
    async function loadEpisodes() {
      try {
        setLoading(true);
        const response = await fetch('/api/episodes');
        const data = await response.json() as {
          success?: boolean;
          episodes?: Episode[];
          message?: string;
          usingMockData?: boolean;
        };
        
        if (data.success && data.episodes) {
          setEpisodes(data.episodes);
          setUsingMockData(false);
          console.log(`📺 Loaded ${data.episodes.length} episodes from R2`);
        } else {
          setError(data.message || 'Failed to load episodes');
          setUsingMockData(data.usingMockData || false);
          // Fallback to the known working episode
          setEpisodes([{
            id: 'fallback-1',
            title: 'AI-Now Daily: October 2nd - Practical AI & Advanced Robotics',
            description: 'Deep dive into practical AI applications and cutting-edge robotics with Alex and Jessica.',
            duration: '45:32',
            publishDate: '2025-10-02',
            thumbnail: '/Ai-Now-Educate-YouTube.jpg',
            category: 'ai-now',
            audioUrl: '/api/r2/public/daily/landscape/2025/10/02/october-2-2025-ai-now---practical-ai-advanced-robotics---deep-dive-with-alex-and-jessica-216b7799.mp4',
            isPremium: false,
            isNew: true
          }]);
        }
      } catch (err) {
        console.error('Error loading episodes:', err);
        setError('Failed to connect to episode API');
        setUsingMockData(true);
        // Use fallback episode
        setEpisodes([{
          id: 'fallback-1',
          title: 'AI-Now Daily: October 2nd - Practical AI & Advanced Robotics',
          description: 'Deep dive into practical AI applications and cutting-edge robotics with Alex and Jessica.',
          duration: '45:32',
          publishDate: '2025-10-02',
          thumbnail: '/Ai-Now-Educate-YouTube.jpg',
          category: 'ai-now',
          audioUrl: '/api/r2/public/daily/landscape/2025/10/02/october-2-2025-ai-now---practical-ai-advanced-robotics---deep-dive-with-alex-and-jessica-216b7799.mp4',
          isPremium: false,
          isNew: true
        }]);
      } finally {
        setLoading(false);
      }
    }
    
    loadEpisodes();
  }, []);
  const [filter, setFilter] = useState<'all' | 'free' | 'premium'>('all');
  const [currentAudio, setCurrentAudio] = useState<string | null>(null);

  const TEAL_LIGHT = '#0F8378FF';
  const TEAL_SEAM = '#015451FF';
  const MATTE_BLACK = '#212121ff';
  const MATTE_WHITE = '#dfdfdfff';

  const filteredEpisodes = episodes.filter(episode => {
    if (filter === 'free') return !episode.isPremium;
    if (filter === 'premium') return episode.isPremium;
    return true;
  });

  const categoryNames = {
    'ai-now': 'AI-Now',
    'ai-now-educate': 'AI-Now-Educate',
    'ai-now-commercial': 'AI-Now-Commercial',
    'ai-now-conceptual': 'AI-Now-Conceptual',
    'ai-now-reviews': 'AI-Now-Reviews'
  };

  const playEpisode = async (episode: Episode) => {
    if (episode.isPremium && user.subscription !== 'premium') {
      alert('This is premium content. Please upgrade your subscription to access.');
      return;
    }

    if (episode.audioUrl) {
      // In a real app, you'd get a JWT token from your auth system
      const token = 'test-token-1234567890';
      
      try {
        const response = await fetch(episode.audioUrl, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log('Episode access granted:', data);
          setCurrentAudio(episode.id);
          // Here you would typically start audio playback
          alert(`Now playing: ${episode.title}`);
        } else {
          alert('Unable to access episode. Please try again.');
        }
      } catch (error) {
        console.error('Error accessing episode:', error);
        alert('Error accessing episode. Please check your connection.');
      }
    } else {
      alert(`Playing: ${episode.title}`);
      setCurrentAudio(episode.id);
    }
  };

  return (
    <main className="w-full h-auto pt-[48px] bg-[var(--site-bg)] text-[var(--site-fg)]">
      <Header loggedIn={true} firstName={user.name.split(' ')[0]} avatar={user.avatar} />

      <div className="px-4 md:px-4 space-y-4">
        {/* Dashboard Header */}
        <div className="rounded-xl bg-[#212121ff] p-6 mb-4">
          <Section
            variant="dark"
            title={
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="text-4xl">{user.avatar}</div>
                  <div>
                    <h1 className="text-3xl font-bold">Welcome back, {user.name.split(' ')[0]}!</h1>
                    <p className="text-white/80">Your Personal AI-Now Podcast Dashboard</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    user.subscription === 'premium' 
                      ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-black' 
                      : 'bg-gray-600 text-white'
                  }`}>
                    {user.subscription === 'premium' ? '👑 Premium' : '🆓 Free'}
                  </div>
                </div>
              </div>
            }
            background={{ from: TEAL_LIGHT, to: MATTE_BLACK }}
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              <div className="bg-white/10 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-2">📊 Your Stats</h3>
                <p className="text-2xl font-bold">{episodes.length}</p>
                <p className="text-sm text-white/80">Episodes Available</p>
              </div>
              <div className="bg-white/10 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-2">🎧 Premium Content</h3>
                <p className="text-2xl font-bold">{episodes.filter(e => e.isPremium).length}</p>
                <p className="text-sm text-white/80">Exclusive Episodes</p>
              </div>
              <div className="bg-white/10 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-2">🆕 New This Week</h3>
                <p className="text-2xl font-bold">{episodes.filter(e => e.isNew).length}</p>
                <p className="text-sm text-white/80">Fresh Content</p>
              </div>
            </div>
          </Section>
        </div>

        {/* Filter Controls */}
        <div className="rounded-xl bg-[#dfdfdf] text-black p-6">
          <Section
            variant="light"
            title={
              <div className="flex items-center justify-between">
                <span>Browse Episodes</span>
                <div className="flex items-center gap-2 text-sm">
                  {loading ? (
                    <span className="text-v2uBlue">🔄 Loading...</span>
                  ) : usingMockData ? (
                    <span className="text-orange-600">⚠️ Demo Data</span>
                  ) : (
                    <span className="text-green-600">✅ Live R2 Data</span>
                  )}
                  {error && (
                    <span className="text-red-600 text-xs">({error})</span>
                  )}
                </div>
              </div>
            }
            background={{ from: TEAL_SEAM, to: MATTE_WHITE }}
          >
            <div className="flex flex-wrap gap-4 mb-6">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === 'all' 
                    ? 'bg-v2uBlue text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                All Episodes ({episodes.length})
              </button>
              <button
                onClick={() => setFilter('free')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === 'free' 
                    ? 'bg-v2uBlue text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                🆓 Free ({episodes.filter(e => !e.isPremium).length})
              </button>
              <button
                onClick={() => setFilter('premium')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === 'premium' 
                    ? 'bg-v2uPurple text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                👑 Premium ({episodes.filter(e => e.isPremium).length})
              </button>
            </div>
          </Section>
        </div>

        {/* Episodes Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredEpisodes.map((episode) => (
            <div key={episode.id} className="rounded-xl bg-[#dfdfdf] overflow-hidden hover:transform hover:scale-[1.02] transition-all duration-200">
              <div className="relative">
                <Image
                  src={episode.thumbnail}
                  alt={episode.title}
                  width={400}
                  height={200}
                  className="w-full h-48 object-cover"
                />
                {episode.isNew && (
                  <div className="absolute top-2 left-2 bg-v2uGlow text-black px-2 py-1 rounded text-xs font-bold">
                    NEW
                  </div>
                )}
                {episode.isPremium && (
                  <div className="absolute top-2 right-2 bg-v2uPurple text-white px-2 py-1 rounded text-xs font-bold">
                    👑 PREMIUM
                  </div>
                )}
                {currentAudio === episode.id && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <div className="text-white text-6xl animate-pulse">🎵</div>
                  </div>
                )}
              </div>
              
              <div className="p-6">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs bg-teal-100 text-teal-800 px-2 py-1 rounded">
                    {categoryNames[episode.category]}
                  </span>
                  <span className="text-xs text-gray-500">{episode.duration}</span>
                  <span className="text-xs text-gray-500">{episode.publishDate}</span>
                </div>
                
                <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                  {episode.title}
                </h3>
                
                <p className="text-gray-600 mb-4 line-clamp-2">
                  {episode.description}
                </p>
                
                <div className="flex gap-3">
                  <button
                    onClick={() => playEpisode(episode)}
                    className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                      episode.isPremium && user.subscription !== 'premium'
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : currentAudio === episode.id
                        ? 'bg-red-500 text-white'
                        : 'bg-teal-600 text-white hover:bg-teal-700'
                    }`}
                    disabled={episode.isPremium && user.subscription !== 'premium'}
                  >
                    {currentAudio === episode.id ? '⏸️ Playing' : '▶️ Play'}
                  </button>
                  
                  {episode.isPremium && user.subscription !== 'premium' && (
                    <CTAButton
                      label="Upgrade"
                      href="/subscribe"
                      variant="light"
                      iconRight="👑"
                    />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Upgrade CTA for Free Users */}
        {user.subscription !== 'premium' && (
          <div className="rounded-xl bg-gradient-to-r from-yellow-400 to-yellow-600 p-6 text-black">
            <Section
              variant="light"
              title="🚀 Unlock Premium Content"
              body="Get access to exclusive AI-Now-Educate, AI-Now-Commercial, AI-Now-Reviews, and AI-Now-Conceptual episodes. Advanced insights, detailed tutorials, and expert analysis await!"
            >
              <div className="flex flex-wrap gap-4 mt-6">
                <CTAButton
                  label="Upgrade to Premium"
                  href="/subscribe"
                  variant="light"
                  iconRight="👑"
                />
                <div className="flex items-center gap-4 text-sm">
                  <span>✅ Exclusive Episodes</span>
                  <span>✅ Early Access</span>
                  <span>✅ Ad-Free Experience</span>
                  <span>✅ Download for Offline</span>
                </div>
              </div>
            </Section>
          </div>
        )}

        {/* Quick Access Panel */}
        <div className="rounded-xl bg-[#212121ff] p-6">
          <Section
            variant="dark"
            title="Quick Access"
            background={{ from: TEAL_SEAM, to: MATTE_BLACK }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link href="/podcast" className="bg-white/10 p-4 rounded-lg hover:bg-white/20 transition-colors">
                <div className="text-2xl mb-2">🎙️</div>
                <h3 className="font-semibold">All Shows</h3>
                <p className="text-sm text-white/80">Browse all podcasts</p>
              </Link>
              
              <Link href="/r2-test" className="bg-white/10 p-4 rounded-lg hover:bg-white/20 transition-colors">
                <div className="text-2xl mb-2">🔧</div>
                <h3 className="font-semibold">R2 Test</h3>
                <p className="text-sm text-white/80">Test secure access</p>
              </Link>
              
              <Link href="/subscribe" className="bg-white/10 p-4 rounded-lg hover:bg-white/20 transition-colors">
                <div className="text-2xl mb-2">👑</div>
                <h3 className="font-semibold">Premium</h3>
                <p className="text-sm text-white/80">Upgrade subscription</p>
              </Link>
              
              <Link href="/" className="bg-white/10 p-4 rounded-lg hover:bg-white/20 transition-colors">
                <div className="text-2xl mb-2">🏠</div>
                <h3 className="font-semibold">Home</h3>
                <p className="text-sm text-white/80">Back to main site</p>
              </Link>
            </div>
          </Section>
        </div>
      </div>

      <Footer />
    </main>
  );
}