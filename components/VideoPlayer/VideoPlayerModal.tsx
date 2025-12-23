'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import { X, Square, Film, PictureInPicture2, Monitor, Play, Pause, Maximize } from 'lucide-react';

export type ViewMode = 'popup' | 'slideIn' | 'sidebar' | 'theater' | 'fullscreen';

interface VideoPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrl: string;
  title: string;
  description?: string;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  isMobilePortrait?: boolean;
}

export default function VideoPlayerModal({
  isOpen,
  onClose,
  videoUrl,
  title,
  description,
  viewMode,
  onViewModeChange,
  isMobilePortrait = false
}: VideoPlayerModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [position, setPosition] = useState({ x: 20, y: 20 });
  const [size, setSize] = useState({ width: 400, height: 225 });
  const [isResizing, setIsResizing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);

  // Video event handlers
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleTimeUpdate = () => setCurrentTime(video.currentTime);
    const handleDurationChange = () => setDuration(video.duration);

    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('durationchange', handleDurationChange);

    return () => {
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('durationchange', handleDurationChange);
    };
  }, []);

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Update video source when videoUrl changes
  useEffect(() => {
    if (videoRef.current && videoUrl) {
      const video = videoRef.current;
      const wasPlaying = !video.paused;
      const currentTime = video.currentTime;
      
      // Update source
      video.src = videoUrl;
      
      // Try to restore playback position and state
      video.currentTime = currentTime;
      if (wasPlaying) {
        video.play().catch(() => {
          // Autoplay may be blocked, ignore error
        });
      }
      
      console.log('[VideoPlayer] Video source updated:', videoUrl);
    }
  }, [videoUrl]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key.toLowerCase()) {
        case 'escape':
          if (viewMode === 'fullscreen') {
            onViewModeChange('popup');
          } else {
            onClose();
          }
          break;
        case 'f':
          e.preventDefault();
          onViewModeChange(viewMode === 'fullscreen' ? 'popup' : 'fullscreen');
          break;
        case 't':
          e.preventDefault();
          onViewModeChange(viewMode === 'theater' ? 'popup' : 'theater');
          break;
        case 'p':
          e.preventDefault();
          onViewModeChange(viewMode === 'slideIn' ? 'popup' : 'slideIn');
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, viewMode, onViewModeChange, onClose]);

  // Mouse drag handlers for slideIn mode
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (viewMode !== 'slideIn') return;
    
    setIsDragging(true);
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    }
  }, [viewMode]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || viewMode !== 'slideIn') return;
    
    setPosition({
      x: Math.max(0, Math.min(window.innerWidth - size.width, e.clientX - dragOffset.x)),
      y: Math.max(0, Math.min(window.innerHeight - size.height, e.clientY - dragOffset.y))
    });
  }, [isDragging, viewMode, dragOffset, size]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setIsResizing(false);
  }, []);

  // Resize handlers for slideIn mode
  const handleResizeStart = useCallback((e: React.MouseEvent) => {
    if (viewMode !== 'slideIn') return;
    e.stopPropagation();
    setIsResizing(true);
  }, [viewMode]);

  const handleResize = useCallback((e: MouseEvent) => {
    if (!isResizing || viewMode !== 'slideIn') return;
    
    const newWidth = Math.max(300, Math.min(800, e.clientX - position.x));
    const newHeight = Math.max(169, Math.min(450, e.clientY - position.y));
    
    setSize({
      width: newWidth,
      height: newHeight
    });
  }, [isResizing, viewMode, position]);

  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleResize);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleResize);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isResizing, handleResize, handleMouseUp]);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  if (!isOpen) return null;

  // View mode specific styling
  const getContainerStyles = () => {
    // Log the mobile portrait state
    console.log('[VideoPlayer] isMobilePortrait:', isMobilePortrait);
    
    switch (viewMode) {
      case 'fullscreen':
        return {
          container: "fixed inset-0 z-50 bg-black",
          content: "w-full h-full relative overflow-hidden",
          // Video with min-width/min-height to ensure it covers entire container
          video: "absolute inset-0 min-w-full min-h-full w-auto h-auto object-cover",
          hasOverlay: false
        };
      
      case 'theater':
        return {
          container: "fixed inset-0 z-50 flex items-center justify-center",
          content: "relative bg-black w-[90vw] h-[90vh] h-[90dvh] max-w-none max-h-none overflow-hidden",
          // Video with min-width/min-height to ensure it covers entire container
          video: "absolute inset-0 min-w-full min-h-full w-auto h-auto object-cover",
          hasOverlay: true
        };
      
      case 'slideIn':
        return {
          container: "fixed z-50 bg-black rounded-lg shadow-2xl border border-gray-600",
          content: "relative w-full h-full overflow-hidden",
          // Video absolutely positioned to fill entire container
          video: "absolute inset-0 w-full h-full object-cover",
          hasOverlay: false
        };
      
      default: // popup
        return {
          container: "fixed inset-0 z-50 flex items-center justify-center",
          content: "relative bg-black rounded-lg overflow-hidden max-w-4xl w-full mx-4 aspect-video",
          // Video absolutely positioned to fill entire container
          video: "absolute inset-0 w-full h-full object-cover",
          hasOverlay: true
        };
    }
  };

  const styles = getContainerStyles();

  // Position for slideIn mode
  const containerStyle = viewMode === 'slideIn' 
    ? {
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${size.width}px`,
        height: `${size.height}px`
      }
    : {};

  return (
    <>
      {/* Backdrop overlay for popup and theater modes */}
      {styles.hasOverlay && (
        <div 
          className="fixed inset-0 bg-black/75 z-40"
          onClick={onClose}
        />
      )}
      
      <div 
        ref={containerRef}
        className={styles.container}
        style={containerStyle}
        onMouseDown={handleMouseDown}
      >
        <div className={styles.content}>
          {/* Controls Bar */}
          <div className={`absolute top-0 left-0 right-0 z-[60] pointer-events-auto ${
            viewMode === 'slideIn' ? 'cursor-move' : ''
          } ${
            // Mobile: transparent background, Desktop: gradient
            'bg-black/0 sm:bg-gradient-to-b sm:from-black/90 sm:to-transparent'
          }`}>
          <div className="p-2 sm:p-4">
          <div className="flex items-center justify-between">
            {/* Title */}
            <div className="flex-1 min-w-0">
              <h3 className="text-white font-semibold text-sm sm:text-lg truncate drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">{title}</h3>
              {description && (
                <p className="text-gray-300 text-xs sm:text-sm mt-1 line-clamp-2 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">{description}</p>
              )}
            </div>

            {/* View Mode Controls */}
            <div className="flex items-center gap-1 sm:gap-2 ml-2 sm:ml-4">
              {/* Mobile: Show only fullscreen and close */}
              <button
                onClick={() => onViewModeChange('fullscreen')}
                className={`sm:hidden p-2 rounded-md transition-colors drop-shadow-lg ${
                  viewMode === 'fullscreen' ? 'bg-blue-600/80' : 'hover:bg-white/10'
                }`}
                title="Fullscreen (F)"
              >
                <Monitor className="w-5 h-5 text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]" />
              </button>
              
              {/* View Mode Buttons (Desktop) */}
              <div className="hidden sm:flex gap-1">
                <button
                  onClick={() => onViewModeChange('popup')}
                  className={`p-1.5 rounded transition-colors ${
                    viewMode === 'popup' ? 'bg-blue-600/80' : 'hover:bg-white/10'
                  }`}
                  title="Popup (P)"
                >
                  <Square className="w-4 h-4 text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]" />
                </button>
                <button
                  onClick={() => onViewModeChange('slideIn')}
                  className={`p-1.5 rounded transition-colors ${
                    viewMode === 'slideIn' ? 'bg-blue-600/80' : 'hover:bg-white/10'
                  }`}
                  title="Picture-in-Picture (P)"
                >
                  <PictureInPicture2 className="w-4 h-4 text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]" />
                </button>
                <button
                  onClick={() => onViewModeChange('theater')}
                  className={`p-1.5 rounded transition-colors ${
                    viewMode === 'theater' ? 'bg-blue-600/80' : 'hover:bg-white/10'
                  }`}
                  title="Theater Mode (T)"
                >
                  <Film className="w-4 h-4 text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]" />
                </button>
                <button
                  onClick={() => onViewModeChange('fullscreen')}
                  className={`p-1.5 rounded transition-colors ${
                    viewMode === 'fullscreen' ? 'bg-blue-600/80' : 'hover:bg-white/10'
                  }`}
                  title="Fullscreen (F)"
                >
                  <Monitor className="w-4 h-4 text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]" />
                </button>
              </div>

              {/* Close Button */}
              <button
                onClick={onClose}
                className="p-1.5 hover:bg-white/10 rounded transition-colors"
                title="Close (Esc)"
              >
                <X className="w-4 h-4 text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]" />
              </button>
            </div>
          </div>
          </div>
        </div>

        {/* Video */}
        <video
          ref={videoRef}
          src={videoUrl}
          className={`${styles.video} z-0`}
          autoPlay
          playsInline
          webkit-playsinline="true"
          x5-playsinline="true"
        />

        {/* Custom Media Controls Bar */}
        <div className="absolute bottom-0 left-0 right-0 z-[60] bg-black/0 pointer-events-auto">
          <div className="p-3 sm:p-4">
            {/* Progress Bar */}
            <input
              type="range"
              min="0"
              max={duration || 0}
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-1 mb-3 rounded-lg appearance-none cursor-pointer accent-blue-500"
              style={{
                background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(currentTime / duration) * 100}%, rgba(75, 85, 99, 0.5) ${(currentTime / duration) * 100}%, rgba(75, 85, 99, 0.5) 100%)`
              }}
            />
            
            {/* Controls */}
            <div className="flex items-center justify-between gap-2">
            {/* Left: Play/Pause */}
            <button
              onClick={togglePlayPause}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 sm:w-6 sm:h-6 text-white fill-white" />
              ) : (
                <Play className="w-5 h-5 sm:w-6 sm:h-6 text-white fill-white" />
              )}
            </button>

            {/* Center: Time */}
            <div className="flex-1 text-center text-xs sm:text-sm text-white/90 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>

            {/* Right: Fullscreen */}
            <button
              onClick={() => onViewModeChange(viewMode === 'fullscreen' ? 'popup' : 'fullscreen')}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
              title="Fullscreen"
            >
              <Maximize className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </button>
          </div>
          </div>
        </div>

        {/* Resize Handle for slideIn mode */}
        {viewMode === 'slideIn' && (
          <div 
            className="absolute bottom-0 right-0 w-4 h-4 bg-gray-600 cursor-se-resize hover:bg-gray-500 transition-colors"
            onMouseDown={handleResizeStart}
          />
        )}
      </div>
    </div>    </>  );
}
