'use client';

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import VideoPlayerModal, { ViewMode } from '@/components/VideoPlayer/VideoPlayerModal';
import { Calendar, Clock, Tv, Play, Facebook, Linkedin, Link as LinkIcon } from 'lucide-react';

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
  const episodeId = params.id as string;
  
  const [episode, setEpisode] = useState<EpisodeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [viewMode, setViewMode] = useState<ViewMode>('popup');
  const [isPlayerOpen, setIsPlayerOpen] = useState(true);
  const [deviceInfo, setDeviceInfo] = useState({ width: 0, height: 0, isPortrait: false });
  
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

  // Detect device and orientation changes
  useEffect(() => {
    const updateDeviceInfo = () => {
      // Use clientWidth for accurate responsive detection
      const width = document.documentElement.clientWidth;
      const height = document.documentElement.clientHeight;
      const isPortrait = height > width;
      const isMobile = width < 768;
      const isTablet = width >= 768 && width < 1024;
      const isSquare = Math.abs(width - height) < 100; // Within 100px of being square
      
      setDeviceInfo({ width, height, isPortrait });
      
      // Auto-switch to fullscreen on mobile portrait
      if (isMobile && isPortrait && viewMode !== 'fullscreen') {
        console.log('[Player] Auto-switching to fullscreen for mobile portrait');
        setViewMode('fullscreen');
      }
      
      console.log('[Player] Device update:', { 
        width, 
        height, 
        isPortrait,
        isMobile,
        isTablet,
        isSquare,
        source: 'clientWidth'
      });
    };

    // Initial check with a small delay to ensure DOM is ready
    setTimeout(updateDeviceInfo, 100);

    // Listen for resize
    window.addEventListener('resize', updateDeviceInfo);

    return () => {
      window.removeEventListener('resize', updateDeviceInfo);
    };
  }, [viewMode]);

  // Set appropriate video based on device and episode
  useEffect(() => {
    if (!episode || deviceInfo.width === 0) return;
    
    const { width, isPortrait } = deviceInfo;
    
    // Choose best video variant for device
    let selectedVideo: string;
    if (width < 768 && isPortrait) {
      selectedVideo = episode.videos.portrait;
      console.log('[Player] Selected portrait video for mobile portrait mode');
    } else if (width < 768) {
      selectedVideo = episode.videos.square;
      console.log('[Player] Selected square video for mobile landscape mode');
    } else {
      selectedVideo = episode.videos.landscape;
      console.log('[Player] Selected landscape video for desktop');
    }
    
    setVideoUrl(selectedVideo);
    setVideoUrl(selectedVideo);
    
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
  }, [episode, episodeId, deviceInfo]);

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
        key={videoUrl} // Force re-render when video URL changes (for orientation changes)
        isOpen={isPlayerOpen}
        onClose={handleClose}
        videoUrl={videoUrl}
        title={episode.title}
        description={episode.description}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        isMobilePortrait={deviceInfo.width < 768 && deviceInfo.width > 0 && deviceInfo.isPortrait}
      />
      
      {/* Episode Info Page - Shown when player is closed OR in PIP/theater mode */}
      {(!isPlayerOpen || viewMode === 'slideIn' || viewMode === 'theater') && (
        <div className={`max-w-6xl mx-auto px-4 py-16 ${viewMode === 'theater' ? 'relative z-30' : ''}`}>
          {/* Hero Section with Thumbnail */}
          <div className="mb-12">
            <div className="relative aspect-video rounded-xl overflow-hidden mb-6 group cursor-pointer" onClick={handleOpenPlayer}>
              <Image
                src={episode.thumbnail}
                alt={episode.title}
                fill
                className="object-cover"
                sizes="100vw"
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
                  className="px-4 py-2 bg-black hover:bg-gray-900 rounded-lg transition flex items-center justify-center gap-2 text-white min-w-[120px]"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                  X
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
                  href="https://www.instagram.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => {
                    navigator.clipboard.writeText(`https://v2u.us/watch/${episodeId}`);
                    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
                    if (isMobile) {
                      e.preventDefault();
                      window.location.href = 'instagram://';
                      setTimeout(() => {
                        window.open('https://www.instagram.com/', '_blank');
                      }, 500);
                    }
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 hover:from-purple-700 hover:via-pink-700 hover:to-orange-600 rounded-lg transition flex items-center gap-2 text-white"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                  Instagram
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
                  className="px-4 py-2 bg-black hover:bg-gray-900 rounded-lg transition flex items-center justify-center gap-2 text-white min-w-[120px]"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                  X
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
                  href="https://www.instagram.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => {
                    navigator.clipboard.writeText(`https://v2u.us/watch/${episodeId}`);
                    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
                    if (isMobile) {
                      e.preventDefault();
                      window.location.href = 'instagram://';
                      setTimeout(() => {
                        window.open('https://www.instagram.com/', '_blank');
                      }, 500);
                    }
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 hover:from-purple-700 hover:via-pink-700 hover:to-orange-600 rounded-lg transition flex items-center gap-2 text-white"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                  Instagram
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
