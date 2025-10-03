'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useVideoPlayer } from '@/hooks/useVideoPlayer';
import VideoPlayerModal from '@/components/VideoPlayer/VideoPlayerModal';

interface VideoPlayerContextType {
  openPlayer: (episode: { id: string; title: string; description?: string; videoUrl?: string; audioUrl?: string; thumbnail?: string; }, viewMode?: 'popup' | 'slideIn' | 'sidebar' | 'theater' | 'fullscreen') => void;
  closePlayer: () => void;
  changeViewMode: (mode: 'popup' | 'slideIn' | 'sidebar' | 'theater' | 'fullscreen') => void;
  minimizePlayer: () => void;
  maximizePlayer: () => void;
}

const VideoPlayerContext = createContext<VideoPlayerContextType | undefined>(undefined);

export function VideoPlayerProvider({ children }: { children: ReactNode }) {
  const {
    playerState,
    openPlayer,
    closePlayer,
    changeViewMode,
    minimizePlayer,
    maximizePlayer
  } = useVideoPlayer();

  const contextValue = {
    openPlayer,
    closePlayer,
    changeViewMode,
    minimizePlayer,
    maximizePlayer
  };

  return (
    <VideoPlayerContext.Provider value={contextValue}>
      {children}
      
      {/* Global Video Player Modal */}
      {playerState.isOpen && playerState.episode && (
        <VideoPlayerModal
          isOpen={playerState.isOpen}
          onClose={closePlayer}
          videoUrl={playerState.episode.videoUrl || playerState.episode.audioUrl || ''}
          title={playerState.episode.title}
          description={playerState.episode.description}
          viewMode={playerState.viewMode}
          onViewModeChange={changeViewMode}
        />
      )}
    </VideoPlayerContext.Provider>
  );
}

export function useVideoPlayerContext() {
  const context = useContext(VideoPlayerContext);
  if (context === undefined) {
    throw new Error('useVideoPlayerContext must be used within a VideoPlayerProvider');
  }
  return context;
}