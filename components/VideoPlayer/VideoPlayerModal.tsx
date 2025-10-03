'use client';

import { useState, useRef, useEffect } from 'react';
import { X, Maximize2, Volume2, VolumeX, Play, Pause, SkipBack, SkipForward } from 'lucide-react';

export type ViewMode = 'popup' | 'slideIn' | 'sidebar' | 'theater' | 'fullscreen';

interface VideoPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrl: string;
  title: string;
  description?: string;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

export default function VideoPlayerModal({
  isOpen,
  onClose,
  videoUrl,
  title,
  description,
  viewMode,
  onViewModeChange
}: VideoPlayerModalProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Auto-hide controls in fullscreen
  useEffect(() => {
    if (viewMode === 'fullscreen') {
      const timer = setTimeout(() => setShowControls(false), 3000);
      return () => clearTimeout(timer);
    } else {
      setShowControls(true);
    }
  }, [viewMode, isPlaying]);

  // Handle video events
  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Get container classes based on view mode
  const getContainerClasses = () => {
    switch (viewMode) {
      case 'popup':
        return 'fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75';
      case 'slideIn':
        return 'fixed bottom-4 right-4 z-50 w-96 h-64 bg-black rounded-lg overflow-hidden shadow-2xl';
      case 'sidebar':
        return 'fixed right-0 top-0 z-50 w-80 h-full bg-black shadow-2xl';
      case 'theater':
        return 'fixed inset-x-0 top-0 z-50 h-screen bg-black';
      case 'fullscreen':
        return 'fixed inset-0 z-50 bg-black';
      default:
        return 'fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75';
    }
  };

  // Get video container classes
  const getVideoClasses = () => {
    switch (viewMode) {
      case 'popup':
        return 'w-full max-w-4xl h-auto aspect-video';
      case 'slideIn':
        return 'w-full h-full object-cover';
      case 'sidebar':
        return 'w-full h-64 object-cover';
      case 'theater':
        return 'w-full h-full object-contain';
      case 'fullscreen':
        return 'w-full h-full object-contain';
      default:
        return 'w-full h-auto';
    }
  };

  if (!isOpen) return null;

  return (
    <div className={getContainerClasses()}>
      {/* Video Container */}
      <div className={`relative ${viewMode === 'popup' ? 'bg-black rounded-lg overflow-hidden' : ''}`}>
        {/* Video Element */}
        <video
          ref={videoRef}
          src={videoUrl}
          className={getVideoClasses()}
          onLoadedMetadata={() => {
            if (videoRef.current) {
              setDuration(videoRef.current.duration);
            }
          }}
          onTimeUpdate={() => {
            if (videoRef.current) {
              setCurrentTime(videoRef.current.currentTime);
            }
          }}
          onEnded={() => setIsPlaying(false)}
          onClick={handlePlayPause}
        />

        {/* Controls Overlay */}
        {showControls && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30">
            {/* Top Controls */}
            <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
              <div className="text-white">
                <h3 className="font-semibold text-lg">{title}</h3>
                {description && viewMode !== 'slideIn' && (
                  <p className="text-sm text-gray-300 mt-1">{description}</p>
                )}
              </div>
              
              {/* View Mode Controls */}
              <div className="flex items-center space-x-2">
                {/* View Mode Buttons */}
                <div className="flex bg-black/50 rounded-lg p-1">
                  <button
                    onClick={() => onViewModeChange('popup')}
                    className={`p-2 rounded ${viewMode === 'popup' ? 'bg-white/20' : 'hover:bg-white/10'}`}
                    title="Popup View"
                  >
                    <div className="w-4 h-4 border-2 border-white rounded"></div>
                  </button>
                  <button
                    onClick={() => onViewModeChange('slideIn')}
                    className={`p-2 rounded ${viewMode === 'slideIn' ? 'bg-white/20' : 'hover:bg-white/10'}`}
                    title="Picture-in-Picture"
                  >
                    <div className="w-4 h-3 border-2 border-white rounded mr-1"></div>
                  </button>
                  <button
                    onClick={() => onViewModeChange('sidebar')}
                    className={`p-2 rounded ${viewMode === 'sidebar' ? 'bg-white/20' : 'hover:bg-white/10'}`}
                    title="Sidebar View"
                  >
                    <div className="w-4 h-4 border-2 border-white rounded border-l-4"></div>
                  </button>
                  <button
                    onClick={() => onViewModeChange('theater')}
                    className={`p-2 rounded ${viewMode === 'theater' ? 'bg-white/20' : 'hover:bg-white/10'}`}
                    title="Theater Mode"
                  >
                    <Maximize2 className="w-4 h-4 text-white" />
                  </button>
                  <button
                    onClick={() => onViewModeChange('fullscreen')}
                    className={`p-2 rounded ${viewMode === 'fullscreen' ? 'bg-white/20' : 'hover:bg-white/10'}`}
                    title="Fullscreen"
                  >
                    <div className="w-4 h-4 border-2 border-white"></div>
                  </button>
                </div>

                {/* Close Button */}
                <button
                  onClick={onClose}
                  className="p-2 bg-black/50 rounded-lg hover:bg-black/70 transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>

            {/* Bottom Controls */}
            <div className="absolute bottom-4 left-4 right-4">
              {/* Progress Bar */}
              <div className="mb-4">
                <input
                  type="range"
                  min="0"
                  max={duration}
                  value={currentTime}
                  onChange={handleSeek}
                  className="w-full h-1 bg-white/30 rounded-lg appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(currentTime / duration) * 100}%, rgba(255,255,255,0.3) ${(currentTime / duration) * 100}%, rgba(255,255,255,0.3) 100%)`
                  }}
                />
                <div className="flex justify-between text-xs text-white/80 mt-1">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              {/* Playback Controls */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => {
                      if (videoRef.current) {
                        videoRef.current.currentTime = Math.max(0, currentTime - 10);
                      }
                    }}
                    className="p-2 bg-black/50 rounded-lg hover:bg-black/70 transition-colors"
                  >
                    <SkipBack className="w-5 h-5 text-white" />
                  </button>
                  
                  <button
                    onClick={handlePlayPause}
                    className="p-3 bg-blue-600 rounded-full hover:bg-blue-700 transition-colors"
                  >
                    {isPlaying ? (
                      <Pause className="w-6 h-6 text-white" />
                    ) : (
                      <Play className="w-6 h-6 text-white ml-1" />
                    )}
                  </button>

                  <button
                    onClick={() => {
                      if (videoRef.current) {
                        videoRef.current.currentTime = Math.min(duration, currentTime + 10);
                      }
                    }}
                    className="p-2 bg-black/50 rounded-lg hover:bg-black/70 transition-colors"
                  >
                    <SkipForward className="w-5 h-5 text-white" />
                  </button>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleMute}
                    className="p-2 bg-black/50 rounded-lg hover:bg-black/70 transition-colors"
                  >
                    {isMuted ? (
                      <VolumeX className="w-5 h-5 text-white" />
                    ) : (
                      <Volume2 className="w-5 h-5 text-white" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Sidebar Content */}
        {viewMode === 'sidebar' && (
          <div className="p-4 text-white bg-gray-900">
            <h3 className="font-semibold mb-2">{title}</h3>
            {description && (
              <p className="text-sm text-gray-300 mb-4">{description}</p>
            )}
            
            {/* Episode Info */}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Duration:</span>
                <span>{formatTime(duration)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Current:</span>
                <span>{formatTime(currentTime)}</span>
              </div>
            </div>

            {/* Related Episodes (placeholder) */}
            <div className="mt-6">
              <h4 className="font-medium mb-3 text-gray-200">Up Next</h4>
              <div className="space-y-2">
                <div className="p-2 bg-gray-800 rounded cursor-pointer hover:bg-gray-700">
                  <div className="text-sm font-medium">Next Episode</div>
                  <div className="text-xs text-gray-400">Coming soon...</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}