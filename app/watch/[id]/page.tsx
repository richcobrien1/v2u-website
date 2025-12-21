'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { X, Maximize2, Minimize2, Film, Monitor, Volume2, VolumeX } from 'lucide-react';

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
}

interface DeviceInfo {
  type: 'mobile' | 'tablet' | 'desktop';
  orientation: 'portrait' | 'landscape';
  width: number;
  height: number;
}

export default function WatchPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const episodeId = params.id as string;
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const [episode, setEpisode] = useState<EpisodeData | null>(null);
  const [device, setDevice] = useState<DeviceInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [viewMode, setViewMode] = useState<'normal' | 'theater' | 'fullscreen'>('normal');
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  
  // Track where they came from
  const source = searchParams.get('source') || 'direct';
  const platform = searchParams.get('platform') || 'unknown';

  // Detect device
  useEffect(() => {
    const detectDevice = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const isPortrait = height > width;
      
      let type: 'mobile' | 'tablet' | 'desktop';
      if (width < 768) type = 'mobile';
      else if (width < 1024) type = 'tablet';
      else type = 'desktop';
      
      setDevice({
        type,
        orientation: isPortrait ? 'portrait' : 'landscape',
        width,
        height
      });
    };
    
    detectDevice();
    window.addEventListener('resize', detectDevice);
    return () => window.removeEventListener('resize', detectDevice);
  }, []);

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
            device: device?.type || 'unknown',
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
    if (!episode || !device) return;
    
    // Choose best video variant for device
    if (device.type === 'mobile' && device.orientation === 'portrait') {
      setVideoUrl(episode.videos.portrait);
    } else if (device.type === 'mobile') {
      setVideoUrl(episode.videos.square);
    } else {
      setVideoUrl(episode.videos.landscape);
    }
  }, [episode, device]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!episode) return;

      switch (e.key.toLowerCase()) {
        case 'f':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 't':
          e.preventDefault();
          setViewMode(prev => prev === 'theater' ? 'normal' : 'theater');
          break;
        case 'm':
          e.preventDefault();
          toggleMute();
          break;
        case ' ':
          e.preventDefault();
          togglePlayPause();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [episode]);

  // Auto-hide controls
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    const handleMouseMove = () => {
      setShowControls(true);
      clearTimeout(timeout);
      timeout = setTimeout(() => setShowControls(false), 3000);
    };

    if (viewMode !== 'normal') {
      document.addEventListener('mousemove', handleMouseMove);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        clearTimeout(timeout);
      };
    }
  }, [viewMode]);

  const toggleFullscreen = () => {
    if (viewMode === 'fullscreen') {
      document.exitFullscreen?.();
      setViewMode('normal');
    } else {
      document.documentElement.requestFullscreen?.();
      setViewMode('fullscreen');
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
    }
  };

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
      } else {
        videoRef.current.pause();
      }
    }
  };

  const handleShare = async (platform: string) => {
    const shareUrl = `https://v2u.us/watch/${episodeId}?source=share&platform=${platform}`;
    const text = `Check out: ${episode?.title}`;
    
    const shareUrls: Record<string, string> = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
      threads: `https://www.threads.net/intent/post?text=${encodeURIComponent(text + ' ' + shareUrl)}`,
    };
    
    if (shareUrls[platform]) {
      window.open(shareUrls[platform], '_blank', 'width=600,height=400');
    }
  };

  const handleCopyLink = () => {
    const shareUrl = `https://v2u.us/watch/${episodeId}`;
    navigator.clipboard.writeText(shareUrl);
    alert('Link copied to clipboard!');
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
    <div className={`min-h-screen bg-black text-white ${viewMode === 'fullscreen' ? 'fixed inset-0' : ''}`}>
      {/* Player Section - Centered with proper aspect ratio */}
      <div className={`relative w-full bg-black ${
        viewMode === 'theater' ? 'min-h-screen flex items-center' : ''
      } ${viewMode === 'fullscreen' ? 'h-screen' : ''}`}>
        <div className={`${viewMode === 'normal' ? 'max-w-7xl mx-auto' : 'w-full'}`}>
          <div className={`relative ${
            viewMode === 'fullscreen' ? 'h-screen' : 
            viewMode === 'theater' ? 'aspect-video' :
            device?.type === 'mobile' ? 'aspect-[9/16]' : 'aspect-video'
          }`}>
            {/* Video Player */}
            <video
              ref={videoRef}
              key={videoUrl}
              className="w-full h-full object-contain bg-black"
              controls
              autoPlay
              playsInline
              poster={episode.thumbnail}
            >
              <source src={videoUrl} type="video/mp4" />
              Your browser does not support video playback.
            </video>
            
            {/* Title Overlay - Top */}
            <div className={`absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-black/90 via-black/50 to-transparent p-6 transition-opacity duration-300 ${
              showControls || viewMode === 'normal' ? 'opacity-100' : 'opacity-0'
            }`}>
              <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-white mb-2 drop-shadow-lg">
                {episode.title}
              </h1>
              <p className="text-sm md:text-base text-gray-300 drop-shadow-lg">
                {episode.series} • {new Date(episode.publishedAt).toLocaleDateString()} • {Math.floor(episode.duration / 60)} min
              </p>
            </div>

            {/* View Mode Controls - Top Right */}
            <div className={`absolute top-4 right-4 z-30 flex items-center gap-2 transition-opacity duration-300 ${
              showControls || viewMode === 'normal' ? 'opacity-100' : 'opacity-0'
            }`}>
              {/* Device Badge */}
              <div className="bg-black/80 backdrop-blur-sm px-3 py-1.5 rounded-lg text-xs font-medium">
                {device?.type === 'mobile' && device?.orientation === 'portrait' && '📱 Mobile'}
                {device?.type === 'mobile' && device?.orientation === 'landscape' && '📱 Landscape'}
                {device?.type === 'tablet' && '📱 Tablet'}
                {device?.type === 'desktop' && '🖥️ Desktop'}
              </div>

              {/* View Mode Buttons */}
              <div className="flex gap-1 bg-black/80 backdrop-blur-sm rounded-lg p-1">
                <button
                  onClick={toggleMute}
                  className="p-2 hover:bg-white/10 rounded transition-colors"
                  title={`${isMuted ? 'Unmute' : 'Mute'} (M)`}
                >
                  {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </button>
                <button
                  onClick={() => setViewMode(prev => prev === 'theater' ? 'normal' : 'theater')}
                  className={`p-2 hover:bg-white/10 rounded transition-colors ${
                    viewMode === 'theater' ? 'bg-purple-600' : ''
                  }`}
                  title="Theater Mode (T)"
                >
                  <Film className="w-5 h-5" />
                </button>
                <button
                  onClick={toggleFullscreen}
                  className={`p-2 hover:bg-white/10 rounded transition-colors ${
                    viewMode === 'fullscreen' ? 'bg-purple-600' : ''
                  }`}
                  title="Fullscreen (F)"
                >
                  {viewMode === 'fullscreen' ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Keyboard Shortcuts Hint */}
            {viewMode !== 'normal' && (
              <div className={`absolute bottom-20 left-1/2 -translate-x-1/2 z-20 transition-opacity duration-300 ${
                showControls ? 'opacity-100' : 'opacity-0'
              }`}>
                <div className="bg-black/80 backdrop-blur-sm px-4 py-2 rounded-full text-xs text-gray-300">
                  <kbd className="bg-white/20 px-2 py-0.5 rounded mx-1">Space</kbd> Play/Pause
                  <kbd className="bg-white/20 px-2 py-0.5 rounded mx-1">F</kbd> Fullscreen
                  <kbd className="bg-white/20 px-2 py-0.5 rounded mx-1">T</kbd> Theater
                  <kbd className="bg-white/20 px-2 py-0.5 rounded mx-1">M</kbd> Mute
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Episode Info - Hidden in theater/fullscreen modes */}
      {viewMode === 'normal' && (
        <div className="max-w-6xl mx-auto px-4 py-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{episode.title}</h1>
        
        <div className="flex flex-wrap gap-4 items-center mb-6 text-sm text-gray-400">
          <span className="flex items-center gap-2">
            📅 {new Date(episode.publishedAt).toLocaleDateString()}
          </span>
          <span className="flex items-center gap-2">
            ⏱️ {Math.floor(episode.duration / 60)} min
          </span>
          <span className="flex items-center gap-2">
            📺 {episode.series}
          </span>
        </div>

        <p className="text-gray-300 mb-8 leading-relaxed">{episode.description}</p>

        {/* Share Buttons */}
        <div className="border-t border-gray-800 pt-6">
          <h3 className="text-lg font-semibold mb-4">Share this episode</h3>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => handleShare('twitter')}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg transition flex items-center gap-2"
            >
              🐦 Twitter/X
            </button>
            <button
              onClick={() => handleShare('facebook')}
              className="px-4 py-2 bg-blue-700 hover:bg-blue-800 rounded-lg transition flex items-center gap-2"
            >
              📘 Facebook
            </button>
            <button
              onClick={() => handleShare('linkedin')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition flex items-center gap-2"
            >
              💼 LinkedIn
            </button>
            <button
              onClick={() => handleShare('threads')}
              className="px-4 py-2 bg-black border border-gray-700 hover:bg-gray-900 rounded-lg transition flex items-center gap-2"
            >
              🧵 Threads
            </button>
            <button
              onClick={handleCopyLink}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition flex items-center gap-2"
            >
              🔗 Copy Link
            </button>
          </div>
        </div>

        {/* Subscribe CTA */}
        <div className="mt-8 p-6 bg-gradient-to-r from-purple-900/30 to-blue-900/30 rounded-xl border border-purple-500/20">
          <h3 className="text-2xl font-bold mb-2">Never miss an episode</h3>
          <p className="text-gray-400 mb-4">Get notified when new AI-Now episodes are released</p>
          <a
            href="/subscribe"
            className="inline-block px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg transition font-semibold"
          >
            Subscribe Now
          </a>
        </div>

        {/* Platform indicator for analytics */}
        {(source !== 'direct' || platform !== 'unknown') && (
          <div className="mt-4 text-xs text-gray-600">
            Came from: {platform} via {source}
          </div>
        )}
        </div>
      )}
    </div>
  );
}
