'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import { X, Square, Film, PictureInPicture2, Monitor } from 'lucide-react';

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
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [position, setPosition] = useState({ x: 20, y: 20 });
  const [size, setSize] = useState({ width: 400, height: 225 });
  const [isResizing, setIsResizing] = useState(false);

  // Keep audio playing when tab is in background or window is minimized
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Prevent browser from pausing when page visibility changes
    const handleVisibilityChange = () => {
      if (document.hidden && video && !video.paused) {
        // Keep playing even when tab is hidden
        video.play().catch(() => {
          // Ignore play() promise rejection if user hasn't interacted yet
        });
      }
    };

    // Set up Media Session API for background playback
    if ('mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: title,
        artist: 'V2U Podcast',
        artwork: [
          { src: '/v2u_avatar.png', sizes: '96x96', type: 'image/png' },
          { src: '/v2u_avatar.png', sizes: '128x128', type: 'image/png' },
          { src: '/v2u_avatar.png', sizes: '192x192', type: 'image/png' },
          { src: '/v2u_avatar.png', sizes: '256x256', type: 'image/png' },
        ],
      });

      navigator.mediaSession.setActionHandler('play', () => {
        video.play();
      });

      navigator.mediaSession.setActionHandler('pause', () => {
        video.pause();
      });
    }

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [title]);

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
    switch (viewMode) {
      case 'fullscreen':
        return {
          container: "fixed inset-0 z-50 bg-black",
          content: "w-full h-full",
          video: "w-full h-full"
        };
      
      case 'theater':
        return {
          container: "fixed inset-0 z-50 bg-black/90 flex items-center justify-center",
          content: "relative bg-black w-[90vw] h-[90vh] max-w-none max-h-none",
          video: "w-full h-full"
        };
      
      case 'slideIn':
        return {
          container: "fixed z-50 bg-black rounded-lg shadow-2xl border border-gray-600",
          content: "relative",
          video: "w-full h-full"
        };
      
      default: // popup
        return {
          container: "fixed inset-0 z-50 flex items-center justify-center bg-black/75",
          content: "relative bg-black rounded-lg overflow-hidden max-w-4xl w-full mx-4",
          video: "w-full aspect-video"
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
    <div 
      ref={containerRef}
      className={styles.container}
      style={containerStyle}
      onMouseDown={handleMouseDown}
    >
      <div className={styles.content}>
        {/* Controls Bar */}
        <div className={`absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-black/80 to-transparent p-4 ${
          viewMode === 'slideIn' ? 'cursor-move' : ''
        }`}>
          <div className="flex items-center justify-between">
            {/* Title */}
            <div className="flex-1 min-w-0">
              <h3 className="text-white font-semibold text-sm sm:text-lg truncate">{title}</h3>
              {description && viewMode !== 'slideIn' && (
                <p className="text-gray-300 text-xs sm:text-sm mt-1 truncate">{description}</p>
              )}
            </div>

            {/* View Mode Controls */}
            <div className="flex items-center gap-2 ml-4">
              {/* View Mode Buttons */}
              <div className="hidden sm:flex gap-1">
                <button
                  onClick={() => onViewModeChange('popup')}
                  className={`p-1.5 rounded transition-colors ${
                    viewMode === 'popup' ? 'bg-blue-600' : 'bg-black/50 hover:bg-black/70'
                  }`}
                  title="Popup (P)"
                >
                  <Square className="w-4 h-4 text-white" />
                </button>
                <button
                  onClick={() => onViewModeChange('slideIn')}
                  className={`p-1.5 rounded transition-colors ${
                    viewMode === 'slideIn' ? 'bg-blue-600' : 'bg-black/50 hover:bg-black/70'
                  }`}
                  title="Picture-in-Picture (P)"
                >
                  <PictureInPicture2 className="w-4 h-4 text-white" />
                </button>
                <button
                  onClick={() => onViewModeChange('theater')}
                  className={`p-1.5 rounded transition-colors ${
                    viewMode === 'theater' ? 'bg-blue-600' : 'bg-black/50 hover:bg-black/70'
                  }`}
                  title="Theater Mode (T)"
                >
                  <Film className="w-4 h-4 text-white" />
                </button>
                <button
                  onClick={() => onViewModeChange('fullscreen')}
                  className={`p-1.5 rounded transition-colors ${
                    viewMode === 'fullscreen' ? 'bg-blue-600' : 'bg-black/50 hover:bg-black/70'
                  }`}
                  title="Fullscreen (F)"
                >
                  <Monitor className="w-4 h-4 text-white" />
                </button>
              </div>

              {/* Close Button */}
              <button
                onClick={onClose}
                className="p-1.5 bg-black/50 rounded hover:bg-black/70 transition-colors"
                title="Close (Esc)"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>
        </div>

        {/* Video */}
        <video
          ref={videoRef}
          src={videoUrl}
          className={styles.video}
          controls
          autoPlay
        />

        {/* Resize Handle for slideIn mode */}
        {viewMode === 'slideIn' && (
          <div 
            className="absolute bottom-0 right-0 w-4 h-4 bg-gray-600 cursor-se-resize hover:bg-gray-500 transition-colors"
            onMouseDown={handleResizeStart}
          />
        )}
      </div>

      {/* Keyboard Shortcuts Help */}
      {viewMode === 'fullscreen' && (
        <div className="absolute bottom-4 left-4 text-white/70 text-sm">
          <div>Press <kbd className="bg-white/20 px-1 rounded">F</kbd> for fullscreen, <kbd className="bg-white/20 px-1 rounded">T</kbd> for theater, <kbd className="bg-white/20 px-1 rounded">P</kbd> for PiP, <kbd className="bg-white/20 px-1 rounded">Esc</kbd> to close</div>
        </div>
      )}
    </div>
  );
}
