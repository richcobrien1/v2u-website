'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Head from 'next/head';
import VideoPlayerModal, { ViewMode } from '@/components/VideoPlayer/VideoPlayerModal';
import { Calendar, Clock, Tv, Play, Twitter, Facebook, Linkedin, Link as LinkIcon } from 'lucide-react';

interface EpisodeData {
  id: string;
  title: string;
  description: string;
  publishedAt: string;
  thumbnail: string;
  videos: {
    landscape: string;
    portrait: string;
    square: string;
  };
  duration: number;
  series: string;
  tags?: string[];
}

export default function WatchPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const episodeId = params.id as string;
  
  const [episode, setEpisode] = useState<EpisodeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [viewMode, setViewMode] = useState<ViewMode>('popup');
  const [isPlayerOpen, setIsPlayerOpen] = useState(true);
  
  // Track where they came from
  const source = searchParams.get('source') || 'direct';
  const platform = searchParams.get('platform') || 'unknown';

  // Load episode data
  useEffect(() => {
    if (!episodeId) return;
    
    const loadEpisode = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('[Player] Loading episode:', episodeId);
        
        // Fetch episode metadata from R2 or API
        const response = await fetch(`/api/episodes/${episodeId}`);
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({})) as { error?: string };
          console.error('[Player] API error:', errorData);
          throw new Error(errorData.error || 'Episode not found');
        }
        
        const data = await response.json();
        console.log('[Player] Episode loaded:', data);
        setEpisode(data as EpisodeData);
        
        // Track view (don't block on this)
        fetch('/api/analytics/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            episodeId,
            source,
            platform,
            timestamp: new Date().toISOString()
          })
        }).catch(err => console.warn('[Player] Analytics tracking failed:', err));
        
      } catch (err) {
        console.error('[Player] Load error:', err);
        setError(err instanceof Error ? err.message : 'Failed to load episode');
      } finally {
        setLoading(false);
      }
    };
    
    loadEpisode();
  }, [episodeId, source, platform]);

  // Set appropriate video based on device
  useEffect(() => {
    if (!episode) return;
    
    const width = window.innerWidth;
    const height = window.innerHeight;
    const isPortrait = height > width;
    
    // Choose best video variant for device
    if (width < 768 && isPortrait) {
      setVideoUrl(episode.videos.portrait);
    } else if (width < 768) {
      setVideoUrl(episode.videos.square);
    } else {
      setVideoUrl(episode.videos.landscape);
    }

    // Update page metadata
    document.title = `${episode.title} | AI-Now`;
    
    // Update meta tags
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', episode.description);
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = episode.description;
      document.head.appendChild(meta);
    }

    // Update OG tags for social sharing
    const updateMetaTag = (property: string, content: string) => {
      let tag = document.querySelector(`meta[property="${property}"]`);
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute('property', property);
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', content);
    };

    updateMetaTag('og:title', episode.title);
    updateMetaTag('og:description', episode.description);
    updateMetaTag('og:image', episode.thumbnail);
    updateMetaTag('og:type', 'video.episode');
    updateMetaTag('og:url', `https://v2u.us/watch/${episodeId}`);
    
    // Twitter Card tags
    const updateTwitterTag = (name: string, content: string) => {
      let tag = document.querySelector(`meta[name="${name}"]`);
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute('name', name);
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', content);
    };

    updateTwitterTag('twitter:card', 'player');
    updateTwitterTag('twitter:title', episode.title);
    updateTwitterTag('twitter:description', episode.description);
    updateTwitterTag('twitter:image', episode.thumbnail);
    updateTwitterTag('twitter:player', `https://v2u.us/watch/${episodeId}`);

    // Add keywords/tags if available
    if (episode.tags && episode.tags.length > 0) {
      updateTwitterTag('keywords', episode.tags.join(', '));
    }
  }, [episode, episodeId]);

  const handleClose = () => {
    setIsPlayerOpen(false);
  };

  const handleOpenPlayer = () => {
    setIsPlayerOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-white">Loading episode...</p>
        </div>
      </div>
    );
  }

  if (error || !episode) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Episode Not Found</h1>
          <p className="text-gray-400 mb-8">{error || 'This episode does not exist'}</p>
          <Link 
            href="/"
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition inline-block"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-gray-900">
      {/* Use the VideoPlayerModal component */}
      <VideoPlayerModal
        isOpen={isPlayerOpen}
        onClose={handleClose}
        videoUrl={videoUrl}
        title={episode.title}
        description={episode.description}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />
      
      {/* Episode Info Page - Shown when player is closed */}
      {!isPlayerOpen && (
        <div className="max-w-6xl mx-auto px-4 py-16">
          {/* Hero Section with Thumbnail */}
          <div className="mb-12">
            <div className="relative aspect-video rounded-xl overflow-hidden mb-6 group cursor-pointer" onClick={handleOpenPlayer}>
              <img 
                src={episode.thumbnail} 
                alt={episode.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/60 transition flex items-center justify-center">
                <button className="w-20 h-20 rounded-full bg-purple-600 group-hover:bg-purple-700 flex items-center justify-center transition transform group-hover:scale-110">
                  <Play className="w-10 h-10 text-white ml-1" fill="currentColor" />
                </button>
              </div>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">{episode.title}</h1>
            <p className="text-lg text-gray-300 mb-6">{episode.description}</p>
            
            <div className="flex flex-wrap gap-4 items-center text-sm text-gray-400">
              <span className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {new Date(episode.publishedAt).toLocaleDateString()}
              </span>
              <span className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                {Math.floor(episode.duration / 60)} min
              </span>
              <span className="flex items-center gap-2">
                <Tv className="w-4 h-4" />
                {episode.series}
              </span>
            </div>
          </div>

          <div className="bg-gray-900/50 rounded-lg p-6 backdrop-blur-sm">
            {/* Share Buttons */}
            <div className="border-b border-gray-800 pb-6 mb-6">
              <h3 className="text-lg font-semibold mb-4 text-white">Share this episode</h3>
              <div className="flex flex-wrap gap-3">
                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(episode.title)}&url=${encodeURIComponent(`https://v2u.us/watch/${episodeId}?source=share&platform=twitter`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg transition flex items-center gap-2 text-white"
                >
                  <Twitter className="w-4 h-4" />
                  Twitter/X
                </a>
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`https://v2u.us/watch/${episodeId}?source=share&platform=facebook`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-blue-700 hover:bg-blue-800 rounded-lg transition flex items-center gap-2 text-white"
                >
                  <Facebook className="w-4 h-4" />
                  Facebook
                </a>
                <a
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(`https://v2u.us/watch/${episodeId}?source=share&platform=linkedin`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition flex items-center gap-2 text-white"
                >
                  <Linkedin className="w-4 h-4" />
                  LinkedIn
                </a>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(`https://v2u.us/watch/${episodeId}`);
                    alert('Link copied to clipboard!');
                  }}
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition flex items-center gap-2 text-white"
                >
                  <LinkIcon className="w-4 h-4" />
                  Copy Link
                </button>
              </div>
            </div>

            {/* Subscribe CTA */}
            <div className="p-6 bg-gradient-to-r from-purple-900/30 to-blue-900/30 rounded-xl border border-purple-500/20">
              <h3 className="text-2xl font-bold mb-2 text-white">Never miss an episode</h3>
              <p className="text-gray-400 mb-4">Get notified when new AI-Now episodes are released</p>
              <a
                href="/subscribe"
                className="inline-block px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg transition font-semibold text-white"
              >
                Subscribe Now
              </a>
            </div>
          </div>
        </div>
      )}
      
      {/* Episode Info Below Player - Only shown when player is open in popup mode */}
      {isPlayerOpen && viewMode === 'popup' && (
        <div className="max-w-6xl mx-auto px-4 pb-16 pt-[600px]">
          <div className="bg-gray-900/50 rounded-lg p-6 backdrop-blur-sm">
            <div className="flex flex-wrap gap-4 items-center mb-6 text-sm text-gray-400">
              <span className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {new Date(episode.publishedAt).toLocaleDateString()}
              </span>
              <span className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                {Math.floor(episode.duration / 60)} min
              </span>
              <span className="flex items-center gap-2">
                <Tv className="w-4 h-4" />
                {episode.series}
              </span>
            </div>

            {/* Share Buttons */}
            <div className="border-t border-gray-800 pt-6 mt-6">
              <h3 className="text-lg font-semibold mb-4 text-white">Share this episode</h3>
              <div className="flex flex-wrap gap-3">
                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(episode.title)}&url=${encodeURIComponent(`https://v2u.us/watch/${episodeId}?source=share&platform=twitter`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg transition flex items-center gap-2 text-white"
                >
                  <Twitter className="w-4 h-4" />
                  Twitter/X
                </a>
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`https://v2u.us/watch/${episodeId}?source=share&platform=facebook`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-blue-700 hover:bg-blue-800 rounded-lg transition flex items-center gap-2 text-white"
                >
                  <Facebook className="w-4 h-4" />
                  Facebook
                </a>
                <a
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(`https://v2u.us/watch/${episodeId}?source=share&platform=linkedin`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition flex items-center gap-2 text-white"
                >
                  <Linkedin className="w-4 h-4" />
                  LinkedIn
                </a>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(`https://v2u.us/watch/${episodeId}`);
                    alert('Link copied to clipboard!');
                  }}
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition flex items-center gap-2 text-white"
                >
                  <LinkIcon className="w-4 h-4" />
                  Copy Link
                </button>
              </div>
            </div>

            {/* Subscribe CTA */}
            <div className="mt-8 p-6 bg-gradient-to-r from-purple-900/30 to-blue-900/30 rounded-xl border border-purple-500/20">
              <h3 className="text-2xl font-bold mb-2 text-white">Never miss an episode</h3>
              <p className="text-gray-400 mb-4">Get notified when new AI-Now episodes are released</p>
              <a
                href="/subscribe"
                className="inline-block px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg transition font-semibold text-white"
              >
                Subscribe Now
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
