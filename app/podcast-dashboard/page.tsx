'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import EpisodeCard from '@/components/EpisodeCard';
import { VideoPlayerProvider } from '@/components/VideoPlayer/VideoPlayerProvider';

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
  videoUrl?: string;
  isNew?: boolean;
  r2Key?: string;
  fileSize?: number;
}

type FilterType = 'all' | 'free' | 'premium' | 'new';

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
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  
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
            videoUrl: '/api/r2/public/daily/landscape/2025/10/02/october-2-2025-ai-now---practical-ai-advanced-robotics---deep-dive-with-alex-and-jessica-216b7799.mp4',
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

  // Calculate stats
  const totalEpisodes = episodes.length;
  const premiumEpisodes = episodes.filter(ep => ep.isPremium).length;
  const freeEpisodes = totalEpisodes - premiumEpisodes; // used in stats panel below
  const newEpisodes = episodes.filter(ep => ep.isNew).length;

  // Filter episodes based on active filter
  const filteredEpisodes = episodes.filter(episode => {
    switch (activeFilter) {
      case 'free':
        return !episode.isPremium;
      case 'premium':
        return episode.isPremium;
      case 'new':
        return episode.isNew;
      default:
        return true;
    }
  });

  return (
    <VideoPlayerProvider>
  <main className="w-full h-auto pt-[48px] bg-[var(--site-bg)] text-[var(--site-fg)]">
        <Header loggedIn={true} firstName={user.name.split(' ')[0]} avatar={user.avatar} />

        <div className="px-4 md:px-4 space-y-4">
          {/* Epic Full-Height Hero Section with V2U Premium Background */}
          <div 
            className="relative min-h-[800px] rounded-xl overflow-hidden mt-4 mb-4"
            style={{
              backgroundImage: 'url(/v2u-premium.jpg)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat'
            }}
          >
            {/* Dramatic gradient overlay - much darker for excellent contrast */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/70 to-black/95"></div>
            
            {/* Content over background */}
            <div className="relative z-10">
              {/* Dashboard Header - now over the background with more top margin */}
              <div className="p-4 mb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="text-4xl">{user.avatar}</div>
                    <div>
                      <h1 className="text-3xl font-bold text-white drop-shadow-lg">Welcome back, {user.name.split(' ')[0]}!</h1>
                      <p className="text-white/90 drop-shadow-md">Your Personal AI-Now Podcast Dashboard</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium drop-shadow-lg ${
                      user.subscription === 'premium' 
                        ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-black' 
                        : 'bg-gray-600 text-white'
                    }`}>
                      {user.subscription === 'premium' ? '👑 Premium' : '🆓 Free'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Filter Buttons - Epic Stats as Clickable Panels */}
              <div className="px-4 mb-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Your Stats Button */}
                  <button
                    onClick={() => setActiveFilter('all')}
                    className={`group relative overflow-hidden rounded-xl p-6 transition-all duration-300 hover:scale-105 hover:shadow-2xl backdrop-blur-sm cursor-pointer ${
                      activeFilter === 'all' 
                        ? 'bg-blue-600/80 ring-4 ring-blue-400/50' 
                        : 'bg-white/10 hover:bg-white/20 border border-white/20'
                    }`}
                  >
                    <div className="text-left">
                      <h3 className="text-lg font-semibold mb-2 flex items-center gap-2 text-white">
                        📊 Your Stats
                        {activeFilter === 'all' && <span className="text-xs bg-white/20 px-2 py-1 rounded-full">ACTIVE</span>}
                      </h3>
                      <p className="text-3xl font-bold text-white">{totalEpisodes}</p>
                      <p className="text-sm text-white/80">Episodes Available — {freeEpisodes} Free</p>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400/0 to-blue-400/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </button>

                  {/* Premium Content Button */}
                  <button
                    onClick={() => setActiveFilter('premium')}
                    className={`group relative overflow-hidden rounded-xl p-6 transition-all duration-300 hover:scale-105 hover:shadow-2xl backdrop-blur-sm cursor-pointer ${
                      activeFilter === 'premium' 
                        ? 'bg-purple-600/80 ring-4 ring-purple-400/50' 
                        : 'bg-white/10 hover:bg-white/20 border border-white/20'
                    }`}
                  >
                    <div className="text-left">
                      <h3 className="text-lg font-semibold mb-2 flex items-center gap-2 text-white">
                        🔒 Premium Content
                        {activeFilter === 'premium' && <span className="text-xs bg-white/20 px-2 py-1 rounded-full">ACTIVE</span>}
                      </h3>
                      <p className="text-3xl font-bold text-white">{premiumEpisodes}</p>
                      <p className="text-sm text-white/80">Exclusive Episodes</p>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-400/0 to-purple-400/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </button>

                  {/* New This Week Button */}
                  <button
                    onClick={() => setActiveFilter('new')}
                    className={`group relative overflow-hidden rounded-xl p-6 transition-all duration-300 hover:scale-105 hover:shadow-2xl backdrop-blur-sm cursor-pointer ${
                      activeFilter === 'new' 
                        ? 'bg-green-600/80 ring-4 ring-green-400/50' 
                        : 'bg-white/10 hover:bg-white/20 border border-white/20'
                    }`}
                  >
                    <div className="text-left">
                      <h3 className="text-lg font-semibold mb-2 flex items-center gap-2 text-white">
                        🆕 New This Week
                        {activeFilter === 'new' && <span className="text-xs bg-white/20 px-2 py-1 rounded-full">ACTIVE</span>}
                      </h3>
                      <p className="text-3xl font-bold text-white">{newEpisodes}</p>
                      <p className="text-sm text-white/80">Fresh Content</p>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-r from-green-400/0 to-green-400/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </button>
                </div>
              </div>

              {/* Filter Indicator */}
              <div className="px-4 mb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <h2 className="text-xl font-semibold text-white drop-shadow-md">
                      {activeFilter === 'all' && `All Episodes (${filteredEpisodes.length})`}
                      {activeFilter === 'premium' && `Premium Episodes (${filteredEpisodes.length})`}
                      {activeFilter === 'new' && `New Episodes (${filteredEpisodes.length})`}
                      {activeFilter === 'free' && `Free Episodes (${filteredEpisodes.length})`}
                    </h2>
                    {activeFilter !== 'all' && (
                      <button
                        onClick={() => setActiveFilter('all')}
                        className="text-sm bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 text-white px-3 py-1 rounded-full transition-colors"
                      >
                        Clear Filter
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    {loading ? (
                      <span className="text-blue-400">🔄 Loading...</span>
                    ) : usingMockData ? (
                      <span className="text-orange-400">⚠️ Demo Data</span>
                    ) : (
                      <span className="text-green-400">✅ Live R2 Data</span>
                    )}
                    {error && (
                      <span className="text-red-400 text-xs">({error})</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Episodes Content */}
              <div className="px-4 pb-4">
                {loading ? (
                  <div className="flex items-center justify-center min-h-[400px]">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto mb-4"></div>
                      <p className="text-white/80">Loading episodes...</p>
                    </div>
                  </div>
                ) : filteredEpisodes.length === 0 ? (
                  <div className="flex items-center justify-center min-h-[400px]">
                    <div className="text-center">
                      <div className="text-6xl mb-4">🎧</div>
                      <h3 className="text-xl font-semibold mb-2 text-white">No Episodes Found</h3>
                      <p className="text-white/80 mb-4">
                        {activeFilter === 'premium' && 'No premium episodes available yet.'}
                        {activeFilter === 'new' && 'No new episodes this week.'}
                        {activeFilter === 'free' && 'No free episodes available.'}
                        {activeFilter === 'all' && 'No episodes available.'}
                      </p>
                      {activeFilter !== 'all' && (
                        <button
                          onClick={() => setActiveFilter('all')}
                          className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors"
                        >
                          View All Episodes
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredEpisodes.map((episode) => (
                      <div key={episode.id} className="group hover:scale-105 transition-transform duration-300">
                        <EpisodeCard
                          episode={episode}
                          userSubscription={user.subscription}
                          viewMode="popup"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <Footer />
      </main>
    </VideoPlayerProvider>
  );
}